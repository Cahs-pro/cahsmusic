/**
 * api/dl.js — Music Universe · Vercel Serverless
 * GET /api/dl?v=VIDEO_ID
 * → RapidAPI youtube-mp36-dən MP3 link alır, JSON cavab verir
 * Client özü həmin linkdən endirir (stream yox, redirect)
 *
 * KVOTA QORUMASI:
 *  1) Uğurlu cavab keşlənir (brauzer 10 dəq, Vercel CDN 30 dəq) — eyni mahnı təkrar xərc yaratmır.
 *  2) Başqa saytdan gələn sorğular rədd edilir (Sec-Fetch-Site / Origin / Referer).
 *  3) ID düz 11 simvol olmalıdır və RapidAPI-yə getməzdən əvvəl pulsuz oEmbed ilə
 *     videonun mövcudluğu yoxlanır — uydurma ID-lər kvotanı yeməsin.
 * Link tez ölürsə, CACHE_BROWSER / CACHE_CDN rəqəmlərini azalt.
 */
const CACHE_BROWSER = 600;   // saniyə
const CACHE_CDN     = 1800;  // saniyə

// Sorğu bizim öz saytımızdan gəlirmi? (Brauzer Sec-Fetch-Site göndərir; köhnə brauzerlərdə Origin/Referer-ə baxırıq)
function sameSite(req) {
  const site = req.headers["sec-fetch-site"];
  if (site) return site === "same-origin" || site === "same-site" || site === "none";
  const ref = req.headers.origin || req.headers.referer;
  if (!ref) return true;                              // başlıq yoxdur (çox köhnə brauzer) — keç
  try { return new URL(ref).host === req.headers.host; } catch (_) { return false; }
}

// YouTube-da belə video varmı? Yalnız "tapılmadı" (404/400) rədd edilir; şəbəkə xətasında keçirik.
async function videoExists(id) {
  try {
    const r = await fetch(
      "https://www.youtube.com/oembed?format=json&url=" + encodeURIComponent("https://www.youtube.com/watch?v=" + id),
      { signal: AbortSignal.timeout(4000) }
    );
    return r.status !== 404 && r.status !== 400;
  } catch (_) { return true; }
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") { res.status(405).json({ error: "GET only" }); return; }

  if (!sameSite(req)) {
    res.setHeader("Cache-Control", "no-store");
    res.status(403).json({ error: "Bu sorğu yalnız Music Universe saytından qəbul olunur" });
    return;
  }

  const videoId = (req.query.v || "").trim();
  if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
    res.status(400).json({ error: "Yanlış video ID" });
    return;
  }

  const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
  if (!RAPIDAPI_KEY) {
    res.status(500).json({ error: "RAPIDAPI_KEY təyin edilməyib" });
    return;
  }

  if (!(await videoExists(videoId))) {
    res.setHeader("Cache-Control", "no-store");
    res.status(404).json({ error: "Video tapılmadı" });
    return;
  }

  try {
    let link  = null;
    let title = videoId;

    // Max 5 cəhd, hər biri 4 saniyə fasilə ilə
    for (let i = 0; i < 5; i++) {
      if (i > 0) await new Promise(r => setTimeout(r, 4000));

      const r = await fetch(
        `https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`,
        {
          headers: {
            "X-RapidAPI-Key":  RAPIDAPI_KEY,
            "X-RapidAPI-Host": "youtube-mp36.p.rapidapi.com",
          },
          signal: AbortSignal.timeout(20000),
        }
      );

      const data = await r.json();
      console.log(`[dl] cəhd ${i+1}: status=${data.status} link=${!!data.link}`);

      if (data.status === "ok" && data.link) {
        link  = data.link;
        title = data.title || videoId;
        break;
      }
      if (data.status === "fail") {
        throw new Error(data.msg || "video əlçatmaz");
      }
      // "processing" → davam et
    }

    if (!link) throw new Error("MP3 hazırlanmadı, yenidən cəhd edin");

    // Linki JSON kimi qaytar — client özü endirir
    res.setHeader("Cache-Control", `public, max-age=${CACHE_BROWSER}, s-maxage=${CACHE_CDN}`);
    res.status(200).json({ ok: true, link, title });

  } catch (err) {
    console.error("[dl] xəta:", err.message);
    res.setHeader("Cache-Control", "no-store");      // xəta heç vaxt keşlənmir
    res.status(500).json({ error: err.message });
  }
};