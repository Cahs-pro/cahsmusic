/**
 * api/yt-meta.js — Music Universe · Vercel Serverless
 * GET /api/yt-meta?ids=ID1,ID2,...   (ən çox 20 ID)
 * → { "ID1": { "title": "...", "author": "..." }, ... }
 *
 * Mənbə:
 *  1) YT_API_KEY təyin olunubsa — YouTube Data API v3 (bir sorğu ilə 20 video)
 *  2) Yoxdursa (və ya tapılmayanlar üçün) — YouTube oEmbed (açar tələb etmir)
 * Cavab brauzerdə yox, serverdə alınır və Vercel CDN-də 1 gün saxlanır.
 */
const ID = /^[A-Za-z0-9_-]{11}$/;
const TIMEOUT = 6000;

async function viaDataApi(ids, key, out) {
  const url = "https://www.googleapis.com/youtube/v3/videos?part=snippet" +
    "&fields=items(id,snippet(title,channelTitle))" +
    "&id=" + ids.join(",") + "&key=" + encodeURIComponent(key);
  const r = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT) });
  if (!r.ok) return;
  const j = await r.json();
  (j.items || []).forEach(it => {
    if (it && it.id && it.snippet && it.snippet.title) {
      out[it.id] = { title: String(it.snippet.title), author: String(it.snippet.channelTitle || "") };
    }
  });
}

async function viaOembed(id, out) {
  try {
    const u = "https://www.youtube.com/oembed?format=json&url=" +
      encodeURIComponent("https://www.youtube.com/watch?v=" + id);
    const r = await fetch(u, { signal: AbortSignal.timeout(TIMEOUT) });
    if (!r.ok) return;
    const j = await r.json();
    if (j && j.title) out[id] = { title: String(j.title), author: String(j.author_name || "") };
  } catch (_) { /* bu video üçün ad tapılmadı */ }
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") { res.status(405).json({ error: "GET only" }); return; }

  const ids = [...new Set(String(req.query.ids || "").split(",").map(s => s.trim()).filter(s => ID.test(s)))].slice(0, 20);
  if (!ids.length) { res.status(400).json({ error: "Yanlış video ID" }); return; }

  const out = {};
  const key = process.env.YT_API_KEY;
  if (key) { try { await viaDataApi(ids, key, out); } catch (_) {} }
  await Promise.all(ids.filter(i => !out[i]).map(i => viaOembed(i, out)));

  res.setHeader("Cache-Control", Object.keys(out).length
    ? "public, s-maxage=86400, stale-while-revalidate=604800"
    : "no-store");
  res.status(200).json(out);
};