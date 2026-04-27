import { timingSafeEqual } from "crypto";

/**
 * Shared cron authentication helper.
 * Extracted from individual cron route handlers to ensure consistent
 * fail-closed security behavior across all cron endpoints.
 *
 * Usage:
 *   const authError = verifyCron(req);
 *   if (authError) return authError;
 */

/**
 * Verifies the request carries a valid CRON_SECRET.
 * Accepts either:
 *   - Authorization: Bearer <secret>
 *   - x-cron-secret: <secret>
 *
 * Fail-closed rules:
 *   - production + no CRON_SECRET env var -> 401 (never allow)
 *   - development + no CRON_SECRET env var -> pass through (local dev convenience)
 *   - CRON_SECRET set + header mismatch -> 401
 *   - CRON_SECRET set + header matches -> null (pass)
 *
 * @returns Response with 401 if unauthorized, null if authorized.
 */
export function verifyCron(req: Request): Response | null {
  const secret = process.env.CRON_SECRET;

  // production fail-closed: secret not configured -> reject
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      return new Response("Unauthorized", { status: 401 });
    }
    // development without secret: allow (local convenience)
    return null;
  }

  const auth = req.headers.get("authorization") ?? "";
  const cronHeader = req.headers.get("x-cron-secret") ?? "";

  // Use timing-safe comparison to prevent timing attacks.
  // Compare buffer byte lengths (not JS string code-unit lengths) to avoid
  // a crash if the secret ever contains multi-byte UTF-8 characters.
  const secretBuf = Buffer.from(secret, "utf-8");
  const bearerPrefix = "Bearer ";
  const authValue = auth.startsWith(bearerPrefix)
    ? auth.slice(bearerPrefix.length)
    : "";
  const authBuf = Buffer.from(authValue, "utf-8");
  const authMatch =
    authBuf.length === secretBuf.length &&
    authBuf.length > 0 &&
    timingSafeEqual(authBuf, secretBuf);
  const cronBuf = Buffer.from(cronHeader, "utf-8");
  const headerMatch =
    cronBuf.length === secretBuf.length &&
    cronBuf.length > 0 &&
    timingSafeEqual(cronBuf, secretBuf);

  if (!authMatch && !headerMatch) {
    return new Response("Unauthorized", { status: 401 });
  }

  return null; // authorized
}
