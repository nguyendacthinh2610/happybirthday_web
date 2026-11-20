/**
 * Permanent cloud image hosting service
 * Uploads user photos via /api/upload (Vercel Serverless Function)
 * or fallback direct API, converting base64 data into ultra-short direct URLs (~30 chars).
 * Preserves 100% original crystal-clear resolution.
 */
export async function uploadToFreeCloud(fileOrBase64) {
  try {
    let base64Data = '';

    if (typeof fileOrBase64 === 'string') {
      base64Data = fileOrBase64;
    } else if (fileOrBase64 instanceof File || fileOrBase64 instanceof Blob) {
      base64Data = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result || '');
        reader.onerror = () => resolve('');
        reader.readAsDataURL(fileOrBase64);
      });
    }

    if (!base64Data || base64Data.length < 20) return null;

    // 1. Try Vercel Serverless /api/upload endpoint (Same origin = zero CORS issues)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 14000);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Data }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.url) {
          return data.url;
        }
      }
    } catch (apiErr) {
      console.warn('/api/upload request error, trying direct fallback...', apiErr);
    }

    // 2. Direct upload fallback
    const rawClean = base64Data.replace(/^data:image\/[a-z0-9-+.]+;base64,/, '');
    const formData = new FormData();
    formData.append('key', '6d207e02198a847aa98d0a2a901485a5');
    formData.append('action', 'upload');
    formData.append('source', rawClean);
    formData.append('format', 'json');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const directRes = await fetch('https://freeimage.host/api/1/upload', {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (directRes.ok) {
      const data = await directRes.json();
      if (data && data.image && data.image.url) {
        return data.image.url;
      }
    }
  } catch (err) {
    console.warn('Free cloud image upload error:', err);
  }
  return null;
}
