export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'failed';

/** Uses the native share sheet when available, otherwise copies the link to the clipboard. */
export async function shareLink(data: {
  title: string;
  text: string;
  url: string;
}): Promise<ShareResult> {
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share(data);
      return 'shared';
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return 'cancelled';
      }
      // Fall through to the clipboard, e.g. when sharing is blocked by permissions policy.
    }
  }
  try {
    await navigator.clipboard.writeText(data.url);
    return 'copied';
  } catch {
    return 'failed';
  }
}
