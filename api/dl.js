/**
 * api/dl.js — Music Universe · Vercel Serverless
 * GET /api/dl?v=VIDEO_ID
 * → RapidAPI youtube-mp36-dən MP3 link alır, JSON cavab verir
 * Client özü həmin linkdən endirir (stream yox, redirect)
 */

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  if (req.method !== "GET")    { res.status(405).json({ error: "GET only" }); return; }

  const videoId = (req.query.v || "").trim();
  if (!videoId || !/^[a-zA-Z0-9_-]{6,15}$/.test(videoId)) {
    res.status(400).json({ error: "Yanlış video ID" });
    return;
  }

  const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
  if (!RAPIDAPI_KEY) {
    res.status(500).json({ error: "RAPIDAPI_KEY təyin edilməyib" });
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
    res.status(200).json({ ok: true, link, title });

  } catch (err) {
    console.error("[dl] xəta:", err.message);
    res.status(500).json({ error: err.message });
  }
};
