/**
 * GET /api/cron/cleanup-welfare-dates
 * Deletes stale welfare_dates/{servId} documents to prevent unbounded DB growth.
 *
 * State machine: cron_state/cleanup_welfare_dates tracks run history.
 *
 * Schedule via Cloud Scheduler (Firebase App Hosting환경):
 *   gcloud scheduler jobs create http cleanup-welfare-dates-weekly \
 *     --schedule="0 19 * * 0" --time-zone="UTC" --location=asia-east1 \
 *     --uri="https://benefitbell-web--ai-project-ce41f.asia-east1.hosted.app/api/cron/cleanup-welfare-dates" \
 *     --http-method=GET \
 *     --headers="Authorization=Bearer $CRON_SECRET"
 */
import { NextResponse } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { verifyCron } from "@/lib/cron-auth";

export const dynamic = "force-dynamic";

interface CleanupState {
  lastRunAt: FirebaseFirestore.FieldValue | FirebaseFirestore.Timestamp;
  totalDeleted: number;
  lastDeletedCount: number;
}

// PP-005: Bearer 검사를 메서드 가드보다 먼저 수행하기 위해 POST/GET 모두 동일 핸들러로 라우팅
async function handleCron(req: Request) {
  const authError = verifyCron(req);
  if (authError) return authError;

  const { searchParams } = new URL(req.url);

  const maxAgeDays = Math.min(
    Math.max(30, parseInt(searchParams.get("maxAgeDays") ?? "365", 10)),
    3650,
  );
  const batchSize = Math.min(
    Math.max(1, parseInt(searchParams.get("batchSize") ?? "500", 10)),
    5000,
  );

  const db = getAdminFirestore();
  const startTime = Date.now();

  try {
    const threshold = Timestamp.fromMillis(Date.now() - maxAgeDays * 86400000);

    // 1. Query stale documents
    const datesCol = db.collection("welfare_dates");
    const staleSnap = await datesCol
      .where("fetchedAt", "<", threshold)
      .limit(batchSize)
      .get();

    // 2. Filter defensively — skip docs with missing fetchedAt
    const toDelete = staleSnap.docs.filter((doc) => {
      const data = doc.data();
      return data.fetchedAt !== undefined && data.fetchedAt !== null;
    });

    const deleted = toDelete.length;

    // 3. Batch delete (chunk at 500 ops per commit — Firestore limit)
    const BATCH_LIMIT = 500;
    for (let b = 0; b < toDelete.length; b += BATCH_LIMIT) {
      const chunk = toDelete.slice(b, b + BATCH_LIMIT);
      const batch = db.batch();
      chunk.forEach((doc) => {
        batch.delete(doc.ref);
      });
      try {
        await batch.commit();
      } catch (batchErr) {
        console.error(
          `[cleanup-welfare-dates] Batch delete failed for ${chunk.length} items:`,
          batchErr,
        );
        throw batchErr;
      }
    }

    // 4. Update cron_state
    const stateRef = db.collection("cron_state").doc("cleanup_welfare_dates");
    const stateSnap = await stateRef.get();
    const prevState: Partial<CleanupState> = stateSnap.exists
      ? (stateSnap.data() as Partial<CleanupState>)
      : {};

    const prevTotal =
      typeof prevState.totalDeleted === "number" ? prevState.totalDeleted : 0;

    await stateRef.set(
      {
        lastRunAt: FieldValue.serverTimestamp(),
        totalDeleted: prevTotal + deleted,
        lastDeletedCount: deleted,
      } satisfies CleanupState,
      { merge: true },
    );

    const elapsed = Date.now() - startTime;
    console.info(
      `[cleanup-welfare-dates] deleted=${deleted} threshold=${threshold.toDate().toISOString()} maxAgeDays=${maxAgeDays} batchSize=${batchSize} elapsed=${elapsed}ms`,
    );

    return NextResponse.json({
      deleted,
      threshold: threshold.toDate().toISOString(),
      maxAgeDays,
      batchSize,
      elapsed,
      hasMore: deleted === batchSize,
    });
  } catch (err) {
    console.error("[cleanup-welfare-dates] Fatal error:", err);
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

// PP-005: GET/POST 모두 동일 핸들러로 라우팅 (Bearer 검사 메서드 가드보다 우선)
export const GET = handleCron;
export const POST = handleCron;
