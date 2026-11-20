export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {}
    }

    const image = body?.image;
    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const cleanBase64 = image.replace(/^data:image\/[a-z0-9-+.]+;base64,/, '');

    // Provider 1: FreeImage.host (Permanent, crystal-clear HD CDN via iili.io)
    try {
      const formData = new FormData();
      formData.append('key', '6d207e02198a847aa98d0a2a901485a5');
      formData.append('action', 'upload');
      formData.append('source', cleanBase64);
      formData.append('format', 'json');

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 9000);
      const upstream = await fetch('https://freeimage.host/api/1/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://freeimage.host/',
          'Origin': 'https://freeimage.host',
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (upstream.ok) {
        const data = await upstream.json();
        if (data?.image?.url) {
          return res.status(200).json({ url: data.image.url });
        }
      }
    } catch (e) {
      console.warn('Freeimage upload failed, trying fallbacks...', e.message);
    }

    // Provider 2: Uguu.se (Fast CDN fallback)
    try {
      const buffer = Buffer.from(cleanBase64, 'base64');
      const fd = new FormData();
      fd.append('files[]', new Blob([buffer], { type: 'image/jpeg' }), `photo_${Date.now()}.jpg`);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000);
      const upstream = await fetch('https://uguu.se/upload.php', {
        method: 'POST',
        body: fd,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (upstream.ok) {
        const data = await upstream.json();
        if (data?.success && data?.files?.[0]?.url) {
          return res.status(200).json({ url: data.files[0].url });
        }
      }
    } catch (e) {
      console.warn('Uguu upload fallback error:', e.message);
    }

    return res.status(500).json({ error: 'All cloud upload providers failed' });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
