/**
 * api/lyrics.js — Music Universe · Vercel Serverless
 * GET /api/lyrics?track=AD&artist=IFAÇI[&dur=SANİYƏ]
 * → { found: true,  title, artist, lyrics: "...", synced: "..." | null }
 * → { found: false }                                   (tapılmadı)
 *
 * Mənbə: LRCLIB (https://lrclib.net) — pulsuz, açar tələb etmir.
 * Cavab Vercel CDN-də 1 gün saxlanır.
 */
const TIMEOUT = 7000;
const UA = "MusicUniverse/5.2 (https://cahsmusic.vercel.app)";
const clip = (s, n) => String(s == null ? "" : s).slice(0, n);

async function lrcGet(track, artist, dur) {
  const u = "https://lrclib.net/api/get?track_name=" + encodeURIComponent(track) +
    "&artist_name=" + encodeURIComponent(artist) +
    (dur ? "&duration=" + Math.round(dur) : "");
  const r = await fetch(u, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(TIMEOUT) });
  if (!r.ok) return null;
  const j = await r.json();
  if (!j || (!j.plainLyrics && !j.syncedLyrics)) return null;
  return j;
}

async function lrcSearch(q) {
  const r = await fetch("https://lrclib.net/api/search?q=" + encodeURIComponent(q),
    { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(TIMEOUT) });
  if (!r.ok) return null;
  const arr = await r.json();
  if (!Array.isArray(arr)) return null;
  return arr.find(x => x && (x.plainLyrics || x.syncedLyrics)) || null;
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") { res.status(405).json({ error: "GET only" }); return; }

  const track  = clip(req.query.track, 180).trim();
  const artist = clip(req.query.artist, 120).trim();
  const dur    = Number(req.query.dur) > 0 ? Number(req.query.dur) : 0;
  if (!track) { res.status(400).json({ error: "track parametri lazımdır" }); return; }

  let j = null;
  try {
    if (artist) j = await lrcGet(track, artist, dur);
    if (!j) j = await lrcSearch(artist ? artist + " " + track : track);
  } catch (_) { j = null; }

  if (!j) {
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({ found: false });
    return;
  }
  res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
  res.status(200).json({
    found: true,
    title:   clip(j.trackName || track, 200),
    artist:  clip(j.artistName || artist, 120),
    lyrics:  clip(j.plainLyrics || "", 30000),
    synced:  j.syncedLyrics ? clip(j.syncedLyrics, 40000) : null
  });
};
