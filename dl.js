/**
 * api/dl.js  —  Music Universe · Vercel Serverless Function
 * 
 * Yol: GET /api/dl?v=VIDEO_ID
 * 
 * Nə edir:
 *  1. instances.cobalt.best API-dən CORS açıq, auth tələb etməyən,
 *     YouTube-u dəstəkləyən aktiv cobalt instancelarını götürür (cache: 5 dəq)
 *  2. Hər instance-a cobalt v10+ POST sorğusu göndərir
 *  3. Uğurlu cavabı birbaşa client-ə stream edir (Content-Disposition header ilə)
 *  4. Bütün instancelar uğursuz olarsa 502 qaytarır
 * 
 * ✅ CORS problemi yoxdur — eyni domain (cahsmusic.vercel.app/api/dl)
 * ✅ Cobalt bot-protection keçilir — server IP datacenter IP-dir amma
 *    instance-lar öz cookie/token-larını idarə edir
 * ✅ Vercel Free Planında işləyir (60s timeout, 1024MB RAM)
 */

// Cobalt instance cache — hər deploy-da yenilənir
let _instanceCache = null;
let _instanceCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 dəqiqə

/**
 * CORS açıq, auth olmayan, YouTube dəstəkli cobalt instancelarını gətirir.
 * instances.cobalt.best/api endpoint-ini istifadə edir.
 */
async function getCobaltInstances() {
  const now = Date.now();
  if (_instanceCache && now - _instanceCacheTime < CACHE_TTL) {
    return _instanceCache;
  }

  try {
    const r = await fetch("https://instances.cobalt.best/api", {
      headers: {
        // instances.cobalt.best default user-agentləri bloklayır
        "User-Agent": "music-universe/3.2 (+https://cahsmusic.vercel.app)",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) throw new Error(`instances API ${r.status}`);
    const list = await r.json();

    // Yalnız: online + CORS açıq + auth yoxdur + youtube dəstəkləyir
    const good = list.filter(i =>
      i.online &&
      i.info?.cors === true &&
      i.info?.auth === false &&
      i.services?.youtube === true
    );

    // Score-a görə sırala (ən yaxşısı əvvəl)
    good.sort((a, b) => (b.score || 0) - (a.score || 0));

    const urls = good.slice(0, 8).map(i => `${i.protocol}://${i.api}`);
    _instanceCache = urls.length ? urls : FALLBACK_INSTANCES;
    _instanceCacheTime = now;
    console.log(`[dl] ${urls.length} cobalt instance tapıldı`);
    return _instanceCache;
  } catch (err) {
    console.warn("[dl] Instance list xətası:", err.message);
    return FALLBACK_INSTANCES;
  }
}

// Sabit fallback — instance list əlçatmaz olduqda
const FALLBACK_INSTANCES = [
  "https://cobalt.synzr.space",
  "https://capi.oak.li",
  "https://cobalt.api.timelessnesses.me",
  "https://api.cobalt.tools",
];

/**
 * Cobalt instance-ına POST göndərir, audio URL qaytarır.
 */
async function fetchFromCobalt(baseUrl, videoId) {
  const r = await fetch(`${baseUrl}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      url: `https://www.youtube.com/watch?v=${videoId}`,
      downloadMode: "audio",
      audioFormat: "mp3",
      audioBitrate: "128",
      filenameStyle: "basic",
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`cobalt ${r.status}: ${txt.slice(0, 100)}`);
  }

  const j = await r.json();
  if (j.status === "error") throw new Error(j.error?.code || "cobalt error");

  // tunnel, redirect, picker
  if (j.url) return { url: j.url, filename: j.filename || `audio_${videoId}.mp3` };
  if (j.status === "picker" && j.picker?.length) {
    return { url: j.picker[0].url, filename: `audio_${videoId}.mp3` };
  }
  throw new Error("cobalt: audio URL tapılmadı");
}

/**
 * Audio URL-dən stream alıb client-ə ötürür.
 * Vercel functions ReadableStream-i dəstəkləyir (Edge Runtime deyil, Node runtime).
 */
async function streamAudio(audioUrl, filename, res) {
  const r = await fetch(audioUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; MusicUniverse/3.2)" },
    signal: AbortSignal.timeout(55000),
  });
  if (!r.ok) throw new Error(`audio fetch ${r.status}`);

  res.setHeader("Content-Type", r.headers.get("content-type") || "audio/mpeg");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  const cl = r.headers.get("content-length");
  if (cl) res.setHeader("Content-Length", cl);
  res.setHeader("Cache-Control", "no-store");

  // Pipe: fetch ReadableStream → Node response
  const reader = r.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(Buffer.from(value));
  }
  res.end();
}

// ─── Ana Handler ────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  // CORS headers — eyni origin olsa da ehtiyat üçün
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  if (req.method !== "GET") { res.status(405).json({ error: "GET only" }); return; }

  const videoId = (req.query.v || "").trim();
  if (!videoId || !/^[a-zA-Z0-9_-]{6,15}$/.test(videoId)) {
    res.status(400).json({ error: "Invalid video ID" });
    return;
  }

  const instances = await getCobaltInstances();
  let lastErr = null;

  for (const base of instances) {
    try {
      console.log(`[dl] Cəhd: ${base}`);
      const { url: audioUrl, filename } = await fetchFromCobalt(base, videoId);
      await streamAudio(audioUrl, filename, res);
      console.log(`[dl] Uğurlu: ${base}`);
      return;
    } catch (err) {
      console.warn(`[dl] ${base} uğursuz:`, err.message);
      lastErr = err;
    }
  }

  res.status(502).json({
    error: "all_instances_failed",
    message: lastErr?.message || "Bütün cobalt instancelar uğursuz oldu",
  });
}