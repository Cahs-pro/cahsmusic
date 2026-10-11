/**
 * api/jamendo.js — Music Universe · Vercel Serverless
 * GET /api/jamendo?q=...&tag=...&offset=0&limit=20
 *   q     — sərbəst axtarış (mahnı, sənətçi, janr)         (istəyə bağlı)
 *   tag   — janr: world, folk, pop, rock, electronic, ...   (istəyə bağlı)
 *   heç biri yoxdursa → bu həftənin populyar treklərı
 * → { ok:true, tracks:[{id,title,artist,album,duration,image,audio,link,license}], hasMore }
 *
 * Jamendo API v3.0 /tracks üçün proksi. client_id yalnız serverdə qalır:
 * Vercel → Settings → Environment Variables → JAMENDO_CLIENT_ID
 *
 * Jamendo istifadə şərtlərinə görə:
 *  • yalnız qeyri-kommersiya istifadəsi pulsuzdur (reklam / ödəniş olmamalıdır)
 *  • musiqi KEŞLƏNMİR və oflayn təklif olunmur — yalnız qısa müddətli metadata keşi var
 *  • hər trekdə müəllif, Jamendo və Jamendo səhifəsinə keçid göstərilməlidir
 */
const TAGS = ["world", "folk", "pop", "rock", "electronic", "hiphop", "jazz", "classical",
              "lounge", "relaxation", "soundtrack", "songwriter", "metal"];

const JM_HOST = /^https:\/\/([a-z0-9-]+\.)*jamendo\.com\//i;
const CC_URL  = /^https?:\/\/creativecommons\.org\/licenses\/[a-z-]+\/[0-9.]+\/?/i;

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const clip  = (s, n) => String(s == null ? "" : s).slice(0, n);

// Sorğu bizim öz saytımızdan gəlirmi? (dl.js ilə eyni qayda)
function sameSite(req) {
  const site = req.headers["sec-fetch-site"];
  if (site) return site === "same-origin" || site === "same-site" || site === "none";
  const ref = req.headers.origin || req.headers.referer;
  if (!ref) return true;
  try { return new URL(ref).host === req.headers.host; } catch (_) { return false; }
}

// Jamendo cavabını yalnız lazım olan və yoxlanmış sahələrə endir
function mapTrack(t) {
  const id = String(t && t.id != null ? t.id : "");
  if (!/^\d{1,12}$/.test(id)) return null;
  const audio = String(t.audio || "");
  if (!JM_HOST.test(audio)) return null;                     // axın linki yoxdur / etibarsızdır
  const image = String(t.image || t.album_image || "");
  const link  = String(t.shareurl || "");
  const lic   = String(t.license_ccurl || "");
  return {
    id,
    title:    clip(t.name, 160) || "—",
    artist:   clip(t.artist_name, 100) || "—",
    album:    clip(t.album_name, 100),
    duration: Math.max(0, Math.min(36000, parseInt(t.duration, 10) || 0)),
    image:    JM_HOST.test(image) ? image : "",
    audio,
    link:     JM_HOST.test(link) ? link : "https://www.jamendo.com/track/" + id,
    license:  CC_URL.test(lic) ? lic : ""
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") { res.status(405).json({ error: "GET only" }); return; }

  if (!sameSite(req)) {
    res.setHeader("Cache-Control", "no-store");
    res.status(403).json({ error: "Bu sorğu yalnız Music Universe saytından qəbul olunur" });
    return;
  }

  const clientId = process.env.JAMENDO_CLIENT_ID;
  if (!clientId) { res.status(500).json({ error: "JAMENDO_CLIENT_ID təyin edilməyib" }); return; }

  const q      = clip(req.query.q, 60).trim();
  const tag    = clip(req.query.tag, 20).trim().toLowerCase();
  const offset = clamp(parseInt(req.query.offset, 10) || 0, 0, 1000);
  const limit  = clamp(parseInt(req.query.limit, 10) || 20, 1, 30);

  const p = new URLSearchParams({
    client_id: clientId, format: "json", limit: String(limit), offset: String(offset),
    audioformat: "mp32", imagesize: "500", type: "single albumtrack"
  });
  if (q) {
    p.set("search", q);                                      // uyğunluq sırası
  } else if (TAGS.includes(tag)) {
    p.set("tags", tag); p.set("order", "popularity_month"); p.set("groupby", "artist_id");
  } else {
    p.set("order", "popularity_week"); p.set("groupby", "artist_id");
  }

  try {
    const r = await fetch("https://api.jamendo.com/v3.0/tracks/?" + p.toString(), { signal: AbortSignal.timeout(9000) });
    if (!r.ok) throw new Error("Jamendo " + r.status);
    const j = await r.json();
    if (!j || !j.headers || j.headers.status !== "success") {
      throw new Error(clip(j && j.headers && j.headers.error_message, 120) || "Jamendo xətası");
    }
    const results = Array.isArray(j.results) ? j.results : [];
    const tracks = results.map(mapTrack).filter(Boolean);

    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300");   // yalnız metadata, qısa müddət
    res.status(200).json({ ok: true, tracks, hasMore: results.length >= limit });
  } catch (err) {
    console.error("[jamendo] xəta:", err.message);
    res.setHeader("Cache-Control", "no-store");
    res.status(502).json({ error: "Jamendo cavab vermədi" });
  }
};