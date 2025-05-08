/**
 * Asynchronously copies the provided text to the user's clipboard using the modern
 * `navigator.clipboard` API. If the modern API is not available, it attempts
 * to use the deprecated `document.execCommand('copy')` as a fallback.
 *
 * @param text The string to be copied to the clipboard.
 * @returns A Promise that resolves to `true` if the copy operation was successful,
 * or `false` if it failed (e.g., due to browser limitations or user denial of permissions).
 */
export async function clipboardCopy(text: string): Promise<boolean> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      return fallbackCopyToClipboard(text);
    }
  } else {
    // Fallback for browsers that do not support the modern Clipboard API.
    return fallbackCopyToClipboard(text);
  }
}

/**
 * Attempts to copy text to the clipboard using the deprecated `document.execCommand('copy')` method.
 * This method is less reliable and may require user interaction or specific browser permissions.
 *
 * @param text The string to be copied to the clipboard.
 * @returns `true` if the copy command was successful, `false` otherwise.
 */
function fallbackCopyToClipboard(text: string): boolean {
  try {
    const span = document.createElement('span');
    span.textContent = text;
    span.style.whiteSpace = 'pre';
    span.style.userSelect = 'all';
    document.body.appendChild(span);
    const selection = window.getSelection();
    const range = window.document.createRange();
    selection?.removeAllRanges();
    range.selectNode(span);
    selection?.addRange(range);
    const successful = window.document.execCommand('copy');
    selection?.removeAllRanges();
    document.body.removeChild(span);
    return successful;
  } catch (err) {
    console.error('Failed to copy text using document.execCommand:', err);
    return false;
  }
}
