/**
 * Shortens a URL using /api/shorten or direct is.gd API
 * Produces ultra-short ~19-character links like https://is.gd/xxx
 */
export async function shortenUrl(longUrl) {
  if (!longUrl || longUrl.length < 35) return longUrl;

  // 1. Try serverless /api/shorten endpoint (supports is.gd + tinyurl fallback)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch('/api/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: longUrl }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.shortUrl && data.shortUrl.startsWith('http') && data.shortUrl !== longUrl) {
        return data.shortUrl;
      }
    }
  } catch (e) {
    // Continue to direct client-side fallback
  }

  // 2. Direct client-side is.gd (Access-Control-Allow-Origin: *)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(
      `https://is.gd/create.php?format=json&url=${encodeURIComponent(longUrl)}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.shorturl) {
        return data.shorturl;
      }
    }
  } catch (e) {
    console.warn('Direct is.gd shortening failed:', e);
  }

  return longUrl;
}
