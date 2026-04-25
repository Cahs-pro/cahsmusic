/**
 * api/dl.js — Music Universe · Vercel Serverless Function
 * GET /api/dl?v=VIDEO_ID
 *
 * Axın: Vercel → RapidAPI youtube-mp36 → MP3 → client
 * API key Vercel Environment Variable-da saxlanır (RAPIDAPI_KEY)
 */

export default async function handler(req, res) {
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
    // RapidAPI youtube-mp36 — MP3 link al
    let link = null;
    let title = videoId;

    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) await new Promise(r => setTimeout(r, 3000));

      const apiRes = await fetch(
        `https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`,
        {
          headers: {
            "X-RapidAPI-Key":  RAPIDAPI_KEY,
            "X-RapidAPI-Host": "youtube-mp36.p.rapidapi.com",
          },
          signal: AbortSignal.timeout(25000),
        }
      );

      if (!apiRes.ok) throw new Error(`RapidAPI HTTP ${apiRes.status}`);

      const data = await apiRes.json();
      console.log(`[dl] attempt ${attempt + 1}:`, data.status);

      if (data.status === "ok" && data.link) {
        link  = data.link;
        title = data.title || videoId;
        break;
      }
      if (data.status === "fail") throw new Error(data.msg || "RapidAPI fail");
      // status === "processing" → növbəti cəhdə keç
    }

    if (!link) throw new Error("MP3 link alınmadı (timeout)");

    // MP3 URL-dən stream al → client-ə ötür
    const mp3 = await fetch(link, { signal: AbortSignal.timeout(55000) });
    if (!mp3.ok) throw new Error(`MP3 fetch ${mp3.status}`);

    const safeTitle = title.replace(/[^\w\s\-]/g, "").trim().slice(0, 80) || videoId;

    res.setHeader("Content-Type",        "audio/mpeg");
    res.setHeader("Content-Disposition", `attachment; filename="${safeTitle}.mp3"`);
    res.setHeader("Cache-Control",       "no-store");
    const cl = mp3.headers.get("content-length");
    if (cl) res.setHeader("Content-Length", cl);

    const reader = mp3.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }
    res.end();

  } catch (err) {
    console.error("[dl] xəta:", err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: "Server xətası", detail: err.message });
    } else {
      res.end();
    }
  }
}
