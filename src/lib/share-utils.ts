/**
 * Web Share API utility with clipboard fallback chain.
 *
 * Priority:
 *   1. navigator.share  (native sheet — mobile/modern desktop)
 *   2. navigator.clipboard.writeText  (Clipboard API — secure contexts)
 *   3. document.execCommand('copy')   (legacy fallback — Firefox, insecure ctx)
 *
 * @returns true if the url was shared or copied successfully
 */
export async function shareUrl(params: {
  title: string;
  text: string;
  url: string;
}): Promise<boolean> {
  const { title, text, url } = params;

  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return true;
    } catch (err) {
      // AbortError = user dismissed the sheet — not a failure
      if ((err as { name?: string })?.name === "AbortError") return false;
      console.error("[share] navigator.share failed:", err);
      // fall through to clipboard
    }
  }

  return copyToClipboard(url);
}

/**
 * Copy text to clipboard with execCommand fallback.
 * @returns true if copy succeeded
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (clipErr) {
      console.error("[share] clipboard.writeText failed:", clipErr);
    }
  }

  // execCommand fallback (deprecated but still works in many environments)
  const el = document.createElement("textarea");
  el.value = text;
  el.style.position = "fixed";
  el.style.opacity = "0";
  document.body.appendChild(el);
  el.select();
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch (execErr) {
    console.error("[share] execCommand copy failed:", execErr);
  }
  document.body.removeChild(el);
  return copied;
}
