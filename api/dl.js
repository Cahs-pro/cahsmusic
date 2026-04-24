/**
 * api/dl.js — Music Universe · Vercel Serverless Function
 *
 * GET /api/dl?v=VIDEO_ID
 *
 * youtubei.js (LuanRT/YouTube.js) — YouTube-un öz InnerTube API-si
 * Cobalt yoxdur. Proxy yoxdur. Xarici servis yoxdur.
 * Vercel serverinin özündən YouTube-a birbaşa sorğu.
 *
 * Node.js >= 18  |  youtubei.js ^17
 */

import { Innertube } from "youtubei.js";

// Instance cache — soyuq startdan sonra yenidən istifadə
let _yt = null;
async function getYT() {
  if (_yt) return _yt;
  _yt = await Innertube.create({
    retrieve_player: true,
    generate_session_locally: true,
  });
  return _yt;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  if (req.method !== "GET") { res.status(405).json({ error: "GET only" }); return; }

  const videoId = (req.query.v || "").trim();
  if (!videoId || !/^[a-zA-Z0-9_-]{6,15}$/.test(videoId)) {
    res.status(400).json({ error: "Yanlış video ID" });
    return;
  }

  try {
    const yt = await getYT();

    // Video məlumatlarını ANDROID client kimi al (daha az məhdudiyyət)
    const info = await yt.getBasicInfo(videoId, "ANDROID");
    const formats = info.streaming_data?.adaptive_formats || [];

    // Ən yüksək bitrate-li audio formatı seç
    const audioFormats = formats
      .filter(f => f.has_audio && !f.has_video)
      .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

    if (!audioFormats.length) {
      res.status(404).json({ error: "Audio stream tapılmadı" });
      return;
    }

    const best = audioFormats[0];
    const audioUrl = best.decipher(yt.session.player);
    const title = info.basic_info?.title || `audio_${videoId}`;
    const safeTitle = title.replace(/[^\w\s-]/g, "").trim().slice(0, 80) || videoId;
    const mime = best.mime_type || "audio/webm";
    const ext = mime.includes("mp4") ? "m4a" : "webm";

    // YouTube audio stream-i client-ə ötür
    const upstream = await fetch(audioUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36",
        "Referer": "https://www.youtube.com/",
        "Origin": "https://www.youtube.com",
      },
      signal: AbortSignal.timeout(55000),
    });

    if (!upstream.ok) {
      res.status(502).json({ error: `YouTube stream xətası: ${upstream.status}` });
      return;
    }

    res.setHeader("Content-Type", mime);
    res.setHeader("Content-Disposition", `attachment; filename="${safeTitle}.${ext}"`);
    res.setHeader("Cache-Control", "no-store");
    const cl = upstream.headers.get("content-length");
    if (cl) res.setHeader("Content-Length", cl);

    const reader = upstream.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }
    res.end();

  } catch (err) {
    console.error("[dl] xəta:", err.message);
    _yt = null; // sıfırla
    res.status(500).json({ error: "Server xətası", detail: err.message });
  }
}
