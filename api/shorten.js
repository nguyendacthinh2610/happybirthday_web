export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {}
  }

  if (req.query?.check_env) {
    const keys = Object.keys(process.env).filter(k => !k.includes('SECRET') && !k.includes('KEY') && !k.includes('AUTH') && !k.includes('TOKEN'));
    const hasBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
    const hasKv = Boolean(process.env.KV_REST_API_URL);
    const hasStorage = Boolean(process.env.FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET);
    return res.status(200).json({ hasBlob, hasKv, hasStorage, keys: keys.slice(0, 10) });
  }

  const longUrl = req.query?.url || body?.url;
  if (!longUrl) {
    return res.status(400).json({ error: 'url is required' });
  }

  // 1. Try is.gd
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const isGdRes = await fetch(
      `https://is.gd/create.php?format=json&url=${encodeURIComponent(longUrl)}`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);
    if (isGdRes.ok) {
      const data = await isGdRes.json();
      if (data?.shorturl) {
        return res.status(200).json({ shortUrl: data.shorturl });
      }
    }
  } catch (e) {
    // continue to fallback
  }

  // 2. Try tinyurl
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const tinyRes = await fetch(
      `https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);
    if (tinyRes.ok) {
      const text = await tinyRes.text();
      if (text && text.startsWith('http')) {
        return res.status(200).json({ shortUrl: text.trim() });
      }
    }
  } catch (e) {
    // continue
  }

  return res.status(200).json({ shortUrl: longUrl });
}
