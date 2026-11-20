/**
 * Free permanent cloud image hosting service
 * Automatically converts base64 photos into clean ~30-character direct URLs
 * Keeps URLs ultra-short without requiring any user configuration
 */
export async function uploadToFreeCloud(fileOrBase64) {
  try {
    let base64Data = '';

    if (typeof fileOrBase64 === 'string') {
      base64Data = fileOrBase64.replace(/^data:image\/[a-z0-9-+.]+;base64,/, '');
    } else if (fileOrBase64 instanceof File || fileOrBase64 instanceof Blob) {
      base64Data = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const res = e.target?.result || '';
          resolve(res.replace(/^data:image\/[a-z0-9-+.]+;base64,/, ''));
        };
        reader.onerror = () => resolve('');
        reader.readAsDataURL(fileOrBase64);
      });
    }

    if (!base64Data || base64Data.length < 20) return null;

    const formData = new FormData();
    formData.append('key', '6d207e02198a847aa98d0a2a901485a5');
    formData.append('action', 'upload');
    formData.append('source', base64Data);
    formData.append('format', 'json');

    const res = await fetch('https://freeimage.host/api/1/upload', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.image && data.image.url) {
        return data.image.url;
      }
    }
  } catch (err) {
    console.warn('Free cloud image upload error:', err);
  }
  return null;
}
