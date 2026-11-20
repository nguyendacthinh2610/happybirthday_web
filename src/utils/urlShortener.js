/**
 * Shortens a URL using is.gd free public API (CORS enabled)
 * Falls back cleanly to original URL if offline or network error occurs
 */
export async function shortenUrl(longUrl) {
  if (!longUrl || longUrl.length < 50) return longUrl;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `https://is.gd/create.php?format=json&url=${encodeURIComponent(longUrl)}`,
      {
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.shorturl) {
        return data.shorturl;
      }
    }
  } catch (e) {
    console.warn('URL shortening fallback to long URL:', e);
  }

  return longUrl;
}
