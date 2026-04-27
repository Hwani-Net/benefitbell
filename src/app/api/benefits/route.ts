/**
 * GET /api/benefits — Fetch welfare benefits from all government data sources
 * Real government data only. No mock/fake data.
 * Sources: 중앙부처 + 지자체 + 보조금24 + 기업마당 + K-Startup + 민간복지
 *
 * ⚡ PERFORMANCE: In-memory cache with 1-hour TTL.
 * Without this, every request would call 6 external APIs (~14s).
 *
 * 📅 DATE ENRICHMENT: Merges applicationStart/End from Firestore welfare_dates
 * collection (populated by /api/cron/enrich-dates batch job).
 */
import { NextResponse } from "next/server";
import {
  fetchAllWelfareSources,
  transformListItemToBenefit,
  calculateDDay,
} from "@/lib/welfare-api";
import { getAdminFirestore } from "@/lib/firebase-admin";
import type { Benefit, BenefitCategory } from "@/data/benefits";

const VALID_CATEGORIES = new Set<string>([
  "basic-living",
  "near-poverty",
  "youth",
  "middle-aged",
  "senior",
  "housing",
  "medical",
  "education",
  "employment",
  "small-biz",
  "startup",
  "closure-restart",
  "debt-relief",
]);

// Force dynamic to use in-memory cache (ISR cache fails for >2MB responses)
export const dynamic = "force-dynamic";

// ─── In-memory cache ───
let cachedBenefits: Benefit[] = [];
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in ms
let fetchPromise: Promise<Benefit[]> | null = null; // prevent duplicate fetches

async function getCachedBenefits(): Promise<Benefit[]> {
  const now = Date.now();

  // Return cache if still fresh
  if (cachedBenefits.length > 0 && now - cacheTimestamp < CACHE_TTL) {
    return cachedBenefits;
  }

  // Prevent thundering herd — reuse in-flight promise
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    try {
      const start = Date.now();
      const apiItems = await fetchAllWelfareSources();
      const benefits = apiItems.map((item, i) =>
        transformListItemToBenefit(item, i),
      );

      // ── Merge Firestore date cache (welfare_dates collection) ──
      // Enrich benefits that lack applicationEnd with pre-fetched detail dates.
      try {
        const db = getAdminFirestore();
        const datesCol = db.collection("welfare_dates");

        // Collect servIds that still need dates
        const servIds = benefits.map((b) => b.id);

        // getAll() in chunks of 500 (Firestore limit per call)
        const CHUNK = 500;
        const dateMap = new Map<
          string,
          { applicationStart: string; applicationEnd: string }
        >();

        for (let i = 0; i < servIds.length; i += CHUNK) {
          const chunk = servIds.slice(i, i + CHUNK);
          const refs = chunk.map((id) => datesCol.doc(id));
          const snaps = await db.getAll(...refs);
          snaps.forEach((snap) => {
            if (snap.exists) {
              const d = snap.data() as {
                applicationStart?: string;
                applicationEnd?: string;
              };
              dateMap.set(snap.id, {
                applicationStart: d.applicationStart ?? "",
                applicationEnd: d.applicationEnd ?? "",
              });
            }
          });
        }

        // Prefer Firestore dates (freshest — from welfare detail API) over list API
        // cache. Firestore is updated by nightly cron, so it's authoritative when present.
        // (GPT-4.1 review CRITICAL-B: avoid serving stale list-API dates)
        let enriched = 0;
        for (const benefit of benefits) {
          const dates = dateMap.get(benefit.id);
          if (dates?.applicationEnd) {
            // Firestore has fresh data — prefer it
            if (benefit.applicationEnd !== dates.applicationEnd) {
              benefit.applicationEnd = dates.applicationEnd;
              benefit.dDay = calculateDDay(dates.applicationEnd);
              enriched++;
            }
            if (dates.applicationStart && !benefit.applicationStart) {
              benefit.applicationStart = dates.applicationStart;
            }
          }
        }

        if (enriched > 0) {
          console.info(
            `[/api/benefits] Enriched ${enriched} benefits with Firestore dates`,
          );
        }
      } catch (dbErr) {
        // Non-fatal: log and continue with API data as-is
        console.error("[/api/benefits] Firestore date merge failed:", dbErr);
      }

      cachedBenefits = benefits;
      cacheTimestamp = Date.now();
      console.info(
        `[/api/benefits] Cached ${benefits.length} benefits in ${Date.now() - start}ms`,
      );
      return benefits;
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const rawKeyword = searchParams.get("keyword") || "";
  const keyword = rawKeyword.slice(0, 100); // ReDoS / memory abuse 방지

  const serviceKey = process.env.DATA_GO_KR_SERVICE_KEY;

  if (!serviceKey || serviceKey === "placeholder") {
    return NextResponse.json(
      { success: false, error: "Service temporarily unavailable" },
      { status: 503 },
    );
  }

  try {
    let benefits = await getCachedBenefits();

    if (benefits.length === 0) {
      return NextResponse.json({
        success: false,
        data: [],
        source: "api_empty",
        message: "공공데이터 API에서 데이터를 가져오지 못했습니다.",
      });
    }

    // Apply filters
    if (category && category !== "all") {
      if (!VALID_CATEGORIES.has(category)) {
        return NextResponse.json(
          { success: false, error: "Invalid category parameter" },
          { status: 400 },
        );
      }
      benefits = benefits.filter(
        (b) => b.category === (category as BenefitCategory),
      );
    }
    if (keyword) {
      benefits = benefits.filter(
        (b) =>
          b.title.includes(keyword) ||
          b.ministry.includes(keyword) ||
          b.description.includes(keyword),
      );
    }

    return NextResponse.json({
      success: true,
      data: benefits,
      source: Date.now() - cacheTimestamp < CACHE_TTL ? "cache" : "api",
      totalCount: benefits.length,
    });
  } catch (error) {
    console.error("[/api/benefits] Fetch Error:", error);

    // Return stale cache if available (better than error)
    if (cachedBenefits.length > 0) {
      return NextResponse.json({
        success: true,
        data: cachedBenefits,
        source: "stale_cache",
        totalCount: cachedBenefits.length,
      });
    }

    return NextResponse.json(
      {
        success: false,
        data: [],
        source: "error",
        message: "API 호출 중 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}
