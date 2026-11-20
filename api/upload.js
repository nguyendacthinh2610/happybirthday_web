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
    const buffer = Buffer.from(cleanBase64, 'base64');
    const file = new File([buffer], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });

    // 1. Upload to Catbox (Permanent free high-speed image hosting)
    try {
      const fd = new FormData();
      fd.append('reqtype', 'fileupload');
      fd.append('fileToUpload', file);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 9000);
      const upstream = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        body: fd,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (upstream.ok) {
        const text = (await upstream.text()).trim();
        if (text.startsWith('http')) {
          return res.status(200).json({ url: text });
        }
      }
    } catch (catboxErr) {
      console.warn('Catbox upload error, trying litterbox...', catboxErr);
    }

    // 2. Fallback to Litterbox
    try {
      const fd2 = new FormData();
      fd2.append('reqtype', 'fileupload');
      fd2.append('time', '72h');
      fd2.append('fileToUpload', file);

      const controller2 = new AbortController();
      const timeout2 = setTimeout(() => controller2.abort(), 9000);
      const upstream2 = await fetch('https://litterbox.catbox.moe/resources/internals/api.php', {
        method: 'POST',
        body: fd2,
        signal: controller2.signal,
      });
      clearTimeout(timeout2);

      if (upstream2.ok) {
        const text2 = (await upstream2.text()).trim();
        if (text2.startsWith('http')) {
          return res.status(200).json({ url: text2 });
        }
      }
    } catch (litterErr) {
      console.warn('Litterbox upload error:', litterErr);
    }

    return res.status(500).json({ error: 'All cloud upload providers failed' });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
