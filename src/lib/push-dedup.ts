/**
 * Push Notification Deduplication
 *
 * Prevents duplicate push notifications using Firestore `sent_notifications`.
 * Key format: `{subDocId}_{benefitId}_{date}` — one notification per benefit per day per subscriber.
 */

import { getAdminFirestore } from './firebase-admin'

/** Check if a notification has already been sent. */
export async function alreadySent(
  subDocId: string,
  benefitId: string,
  date: string, // YYYY-MM-DD
): Promise<boolean> {
  try {
    const db = getAdminFirestore()
    const key = `${subDocId}_${benefitId}_${date}`
    const doc = await db.collection('sent_notifications').doc(key).get()
    return doc.exists
  } catch {
    return false // fail open — allow send if check fails
  }
}

/** Record that a notification was sent. TTL via `expires_at` (auto-cleanup via Firestore TTL policy). */
export async function markSent(
  subDocId: string,
  benefitId: string,
  date: string,
  meta?: Record<string, unknown>,
): Promise<void> {
  try {
    const db = getAdminFirestore()
    const key = `${subDocId}_${benefitId}_${date}`
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // expire after 30 days
    await db.collection('sent_notifications').doc(key).set({
      subDocId,
      benefitId,
      date,
      sent_at: new Date(),
      expires_at: expiresAt,
      ...meta,
    })
  } catch (err) {
    console.warn('[push-dedup] Failed to mark sent:', err)
  }
}

/** Batch check: returns set of already-sent benefitIds for a subscriber. */
export async function getSentBenefitIds(
  subDocId: string,
  date: string,
): Promise<Set<string>> {
  try {
    const db = getAdminFirestore()
    const snapshot = await db
      .collection('sent_notifications')
      .where('subDocId', '==', subDocId)
      .where('date', '==', date)
      .get()
    const ids = new Set<string>()
    snapshot.forEach(doc => ids.add(doc.data().benefitId))
    return ids
  } catch {
    return new Set()
  }
}
