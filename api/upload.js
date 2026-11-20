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
    const filename = `photo_${Date.now()}.jpg`;

    let err1 = null;
    let err2 = null;
    let err3 = null;

    // Provider 1: Catbox (Permanent free image hosting)
    try {
      const fd = new FormData();
      fd.append('reqtype', 'fileupload');
      fd.append('fileToUpload', new Blob([buffer], { type: 'image/jpeg' }), filename);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000);
      const upstream = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        body: fd,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (upstream.ok) {
        const text = (await upstream.text()).trim();
        if (text.startsWith('http')) {
          return res.status(200).json({ url: text });
        }
        err1 = text;
      } else {
        err1 = `Status ${upstream.status}: ${await upstream.text()}`;
      }
    } catch (e) {
      err1 = e.message;
      console.warn('Catbox upload fallback:', e.message);
    }

    // Provider 2: Tmpfiles (Instant high-speed direct file hosting)
    try {
      const fd = new FormData();
      fd.append('file', new Blob([buffer], { type: 'image/jpeg' }), filename);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000);
      const upstream = await fetch('https://tmpfiles.org/api/v1/upload', {
        method: 'POST',
        body: fd,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (upstream.ok) {
        const data = await upstream.json();
        if (data?.data?.url) {
          const directUrl = data.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
          return res.status(200).json({ url: directUrl });
        }
        err2 = JSON.stringify(data);
      } else {
        err2 = `Status ${upstream.status}`;
      }
    } catch (e) {
      err2 = e.message;
      console.warn('Tmpfiles upload fallback:', e.message);
    }

    // Provider 3: Litterbox
    try {
      const fd = new FormData();
      fd.append('reqtype', 'fileupload');
      fd.append('time', '72h');
      fd.append('fileToUpload', new Blob([buffer], { type: 'image/jpeg' }), filename);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000);
      const upstream = await fetch('https://litterbox.catbox.moe/resources/internals/api.php', {
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
        err3 = text;
      } else {
        err3 = `Status ${upstream.status}: ${await upstream.text()}`;
      }
    } catch (e) {
      err3 = e.message;
      console.warn('Litterbox upload fallback:', e.message);
    }

    return res.status(500).json({ error: 'All cloud upload providers failed', details: { catbox: err1, tmpfiles: err2, litter: err3 } });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
