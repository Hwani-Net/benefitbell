/**
 * POST /api/indexnow — Notify search engines (Naver, Bing) of new/updated pages
 * IndexNow protocol: https://www.indexnow.org/
 *
 * Usage: call this API after publishing new benefit data
 */
import { NextResponse } from "next/server";
import { verifyCron } from "@/lib/cron-auth";

const INDEXNOW_KEY = process.env.INDEXNOW_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://benefitbell.kr";

// IndexNow endpoints — Naver + Bing (Bing shares with others)
const ENDPOINTS = [
  "https://searchadvisor.naver.com/indexnow",
  "https://www.bing.com/indexnow",
];

export async function POST(request: Request) {
  const authError = verifyCron(request);
  if (authError) return authError;

  if (!INDEXNOW_KEY) {
    return NextResponse.json(
      { success: false, error: "INDEXNOW_KEY not configured" },
      { status: 500 },
    );
  }
  try {
    const body = await request.json().catch(() => null);
    const rawUrls: unknown[] = Array.isArray(body?.urls) ? body.urls : [];

    // Only allow URLs on this host (prevent external domain submission)
    const allowedHost = new URL(BASE_URL).host;
    const urls: string[] = rawUrls
      .filter((u): u is string => {
        if (typeof u !== "string") return false;
        let parsed: URL;
        try {
          parsed = new URL(u);
        } catch (urlErr) {
          console.error("[indexnow] skipping malformed URL:", u, urlErr);
          return false;
        }
        return parsed.host === allowedHost;
      })
      .slice(0, 10000);

    if (urls.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid URLs provided" },
        { status: 400 },
      );
    }

    const payload = {
      host: new URL(BASE_URL).host,
      key: INDEXNOW_KEY,
      keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: urls,
    };

    const results = await Promise.allSettled(
      ENDPOINTS.map((endpoint) =>
        fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify(payload),
        }),
      ),
    );

    const statuses = results.map((r, i) => ({
      endpoint: ENDPOINTS[i],
      status: r.status === "fulfilled" ? r.value.status : "failed",
      error: r.status === "rejected" ? String(r.reason) : undefined,
    }));

    return NextResponse.json({
      success: true,
      submitted: urls.length,
      statuses,
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: String(e) },
      { status: 500 },
    );
  }
}

/**
 * GET /api/indexnow?trigger=all — Submit all sitemap URLs at once
 */
export async function GET(request: Request) {
  const authError = verifyCron(request);
  if (authError) return authError;

  if (!INDEXNOW_KEY) {
    return NextResponse.json(
      { success: false, error: "INDEXNOW_KEY not configured" },
      { status: 500 },
    );
  }

  try {
    // Fetch current sitemap URLs
    const sitemapRes = await fetch(`${BASE_URL}/sitemap.xml`);
    const xml = await sitemapRes.text();
    const matches = xml.match(/<loc>(https?:\/\/[^<]+)<\/loc>/g) ?? [];
    const urls = matches
      .map((m) => m.replace(/<\/?loc>/g, "").trim())
      .filter(
        (u) =>
          !u.includes("/profile") &&
          !u.includes("/premium") &&
          !u.includes("/ai"),
      );

    if (urls.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No URLs found in sitemap",
      });
    }

    const payload = {
      host: new URL(BASE_URL).host,
      key: INDEXNOW_KEY,
      keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: urls,
    };

    const results = await Promise.allSettled(
      ENDPOINTS.map((endpoint) =>
        fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify(payload),
        }),
      ),
    );

    const statuses = results.map((r, i) => ({
      endpoint: ENDPOINTS[i],
      status: r.status === "fulfilled" ? r.value.status : "failed",
    }));

    return NextResponse.json({
      success: true,
      submitted: urls.length,
      statuses,
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: String(e) },
      { status: 500 },
    );
  }
}
