/**
 * GET /api/cron/enrich-dates
 * Batch-fetches welfare detail API to populate applicationStart/End dates
 * into Firestore welfare_dates/{servId} collection.
 *
 * State machine: cron_state/enrich_dates tracks progress across runs.
 *
 * Schedule via Cloud Scheduler (Firebase App Hosting환경):
 *   gcloud scheduler jobs create http enrich-dates-daily \
 *     --schedule="0 18 * * *" --time-zone="UTC" --location=asia-east1 \
 *     --uri="https://benefitbell-web--ai-project-ce41f.asia-east1.hosted.app/api/cron/enrich-dates?batchSize=200" \
 *     --http-method=GET \
 *     --headers="Authorization=Bearer $CRON_SECRET"
 */
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase-admin";
import {
  fetchAllWelfareSources,
  fetchWelfareDetail,
  normalizeDateStr,
} from "@/lib/welfare-api";

export const dynamic = "force-dynamic";

// How long (ms) before a previously-fetched record needs re-fetch (30 days)
const REFETCH_INTERVAL_MS = 30 * 24 * 60 * 60 * 1000;

// Max concurrency for detail API calls
const CONCURRENCY = 5;

/** Verify CRON_SECRET from Authorization header or x-cron-secret header */
function verifyCron(req: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true; // no secret configured = allow (dev mode)
  const authHeader = req.headers.get("authorization");
  if (authHeader === `Bearer ${cronSecret}`) return true;
  const xSecret = req.headers.get("x-cron-secret");
  if (xSecret === cronSecret) return true;
  return false;
}

interface CronState {
  lastIndex: number;
  totalProcessed: number;
  completedAt?: string;
}

interface WelfareDate {
  applicationStart: string;
  applicationEnd: string;
  fetchedAt: FirebaseFirestore.FieldValue | FirebaseFirestore.Timestamp;
}

/** Run tasks with bounded concurrency */
async function pLimit<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number,
): Promise<PromiseSettledResult<T>[]> {
  const results: PromiseSettledResult<T>[] = [];
  let idx = 0;

  async function worker() {
    while (idx < tasks.length) {
      const taskIdx = idx++;
      try {
        const value = await tasks[taskIdx]();
        results[taskIdx] = { status: "fulfilled", value };
      } catch (reason) {
        results[taskIdx] = { status: "rejected", reason };
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
  return results;
}

export async function GET(req: Request) {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const batchSize = Math.min(
    Math.max(1, parseInt(searchParams.get("batchSize") ?? "50", 10)),
    200,
  );

  const db = getAdminFirestore();
  const startTime = Date.now();

  try {
    // 1. Load cron state
    const stateRef = db.collection("cron_state").doc("enrich_dates");
    const stateSnap = await stateRef.get();
    const state: CronState = stateSnap.exists
      ? (stateSnap.data() as CronState)
      : { lastIndex: 0, totalProcessed: 0 };

    const { lastIndex, totalProcessed } = state;

    // 2. Fetch all servIds from all welfare sources
    const allItems = await fetchAllWelfareSources();
    const servIds = allItems.map((item) => item.servId);
    const total = servIds.length;

    if (total === 0) {
      return NextResponse.json({
        processed: 0,
        skipped: 0,
        total: 0,
        nextIndex: 0,
        elapsed: Date.now() - startTime,
        message: "No welfare sources found",
      });
    }

    // 3. Slice batchSize items from lastIndex (circular)
    const safeStart = lastIndex % total;
    const batch = servIds.slice(safeStart, safeStart + batchSize);

    // 4. Check which items already have fresh data (within 30 days)
    const now = Date.now();
    const datesCol = db.collection("welfare_dates");

    // Fetch existing date records for batch IDs in one go
    const existingSnaps = await Promise.all(
      batch.map((id) => datesCol.doc(id).get()),
    );

    const toFetch: string[] = [];
    const skipSet = new Set<string>();

    batch.forEach((servId, i) => {
      const snap = existingSnaps[i];
      if (snap.exists) {
        const data = snap.data() as Partial<WelfareDate>;
        // fetchedAt is a Timestamp — compare seconds
        if (
          data.fetchedAt &&
          typeof (data.fetchedAt as FirebaseFirestore.Timestamp).toMillis ===
            "function"
        ) {
          const fetchedMs = (
            data.fetchedAt as FirebaseFirestore.Timestamp
          ).toMillis();
          if (now - fetchedMs < REFETCH_INTERVAL_MS) {
            skipSet.add(servId);
            return;
          }
        }
      }
      toFetch.push(servId);
    });

    const skipped = skipSet.size;

    // 5. Fetch detail for non-skipped items with bounded concurrency
    let processed = 0;
    let errors = 0;

    if (toFetch.length > 0) {
      const tasks = toFetch.map((servId) => async () => {
        const detail = await fetchWelfareDetail(servId);
        if (!detail) return null;

        const applicationStart = normalizeDateStr(detail.applyBgnDt ?? "");
        const applicationEnd = normalizeDateStr(detail.applyEndDt ?? "");

        // 7. Write to Firestore welfare_dates/{servId}
        await datesCol.doc(servId).set(
          {
            applicationStart,
            applicationEnd,
            fetchedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
        return servId;
      });

      const results = await pLimit(tasks, CONCURRENCY);
      processed = results.filter(
        (r) => r.status === "fulfilled" && r.value !== null,
      ).length;
      errors = results.filter(
        (r) =>
          r.status === "rejected" ||
          (r.status === "fulfilled" && r.value === null),
      ).length;
    }

    // 8. Update cron_state
    const nextIndex =
      safeStart + batchSize >= total ? 0 : safeStart + batchSize;
    const newTotalProcessed = totalProcessed + processed;

    await stateRef.set(
      {
        lastIndex: nextIndex,
        totalProcessed: newTotalProcessed,
        ...(nextIndex === 0 ? { completedAt: new Date().toISOString() } : {}),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    const elapsed = Date.now() - startTime;
    console.log(
      `[enrich-dates] processed=${processed} skipped=${skipped} errors=${errors} nextIndex=${nextIndex} total=${total} elapsed=${elapsed}ms`,
    );

    return NextResponse.json({
      processed,
      skipped,
      errors,
      total,
      nextIndex,
      batchSize,
      elapsed,
      cycleComplete: nextIndex === 0,
    });
  } catch (err) {
    console.error("[enrich-dates] Fatal error:", err);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: err instanceof Error ? err.message : String(err),
        elapsed: Date.now() - startTime,
      },
      { status: 500 },
    );
  }
}
