/**
 * Universal clipboard utility with automatic fallback for all browser contexts
 * Handles HTTP / insecure origin, iframes, mobile devices and browser permission gates.
 */
export async function copyTextToClipboard(text) {
  if (!text) return false;

  // Attempt 1: Modern navigator.clipboard API (requires secure context)
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('navigator.clipboard.writeText rejected, attempting fallback:', err);
    }
  }

  // Attempt 2: Classic document.execCommand('copy') via textarea
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    // Avoid scrolling to bottom
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.setAttribute('readonly', '');

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, text.length);

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    if (successful) return true;
  } catch (err) {
    console.warn('execCommand copy failed:', err);
  }

  return false;
}

