/**
 * Getting the finished picture out of the page.
 *
 * 1. Web Share API with a file: opens Android's share sheet, so WhatsApp →
 *    My Status is one tap. Works on a normal https site (e.g. GitHub Pages).
 * 2. Download link: saves the PNG to the phone.
 * 3. Inside a sandboxed frame (e.g. a claude.ai artifact) both are blocked;
 *    the optional `downloads` capability is used if the host offers it,
 *    otherwise the user is asked to press and hold the picture.
 */

const inFrame = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();

let hostDownloads = null;
if (window.claude?.use) {
  window.claude.use('downloads').then((d) => (hostDownloads = d)).catch(() => {});
}

/** @returns {Promise<'shared'|'cancelled'|'saved'|'hold'>} */
export async function shareImage(blob, filename) {
  try {
    const file = new File([blob], filename, { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file] });
      return 'shared';
    }
  } catch (e) {
    if (e?.name === 'AbortError') return 'cancelled';
  }
  return saveImage(blob, filename);
}

/** @returns {Promise<'saved'|'cancelled'|'hold'>} */
export async function saveImage(blob, filename) {
  if (hostDownloads) {
    try {
      await hostDownloads.save({ filename, data: blob });
      return 'saved';
    } catch (e) {
      if (e?.code === 'declined') return 'cancelled';
    }
  }
  if (inFrame) return 'hold';

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return 'saved';
}
