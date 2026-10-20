/**
 * api/related.js — Music Universe · Vercel Serverless (Radio / ağıllı mix)
 * GET /api/related?v=VIDEO_ID
 * → { ids: ["...", ...] }   (oxşar videolar, ən çox 15)
 *
 * YouTube Data API-nin "relatedToVideoId" parametri artıq köhnəlib,
 * ona görə izləmə səhifəsi serverdə oxunub ytInitialData-dan
 * təxmini oxşar videolar çıxarılır. Cavab CDN-də 6 saat saxlanır.
 */
const VID = /^[A-Za-z0-9_-]{11}$/;
const TIMEOUT = 8000;

module.exports = async function handler(req, res) {
  if (req.method !== "GET") { res.status(405).json({ error: "GET only" }); return; }
  const v = String(req.query.v || "");
  if (!VID.test(v)) { res.status(400).json({ error: "Yanlış video ID" }); return; }

  try {
    const r = await fetch("https://www.youtube.com/watch?v=" + v + "&hl=az", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        "Accept-Language": "az,en;q=0.9"
      },
      signal: AbortSignal.timeout(TIMEOUT)
    });
    if (!r.ok) throw new Error("yt " + r.status);
    const html = await r.text();

    // Səhifədəki bütün videoId-ləri ardıcıllıqla yığ (təkrarsız)
    const seen = new Set([v]);
    const ids = [];
    const re = /"videoId"\s*:\s*"([A-Za-z0-9_-]{11})"/g;
    let m;
    while ((m = re.exec(html)) && ids.length < 40) {
      if (!seen.has(m[1])) { seen.add(m[1]); ids.push(m[1]); }
    }
    // İlk tapılanlar adətən cari video və əsas məzmundur — oxşarlar sonrakılardır
    const related = ids.slice(0, 15);

    res.setHeader("Cache-Control", related.length
      ? "public, s-maxage=21600, stale-while-revalidate=86400"
      : "no-store");
    res.status(200).json({ ids: related });
  } catch (e) {
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({ ids: [] });
  }
};
