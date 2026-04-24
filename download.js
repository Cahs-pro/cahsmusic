/**
 * /api/download?v=VIDEO_ID
 *
 * Vercel Serverless Function — Node.js 18+
 * yt-dlp ilə YouTube audio-nu birbaşa HTTP stream kimi client-ə göndərir.
 * Client JS blob-u tutub IndexedDB-yə yazır — fayl sisteminə heç nə düşmür.
 */

const ytDlpExec = require("yt-dlp-exec");
const { spawn }  = require("child_process");

const MAX_DURATION_SEC = 720; // 12 dəqiqə

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }

  const videoId = (req.query.v || "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 20);
  if (!videoId || videoId.length < 5)
    return res.status(400).json({ error: "Yanlış video ID" });

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  /* 1. Metadata */
  let meta;
  try {
    meta = await ytDlpExec(videoUrl, {
      dumpSingleJson: true, noPlaylist: true, quiet: true,
    });
  } catch (err) {
    return res.status(502).json({ error: "Video tapılmadı: " + (err.message || "") });
  }

  if (meta.duration && meta.duration > MAX_DURATION_SEC)
    return res.status(403).json({ error: `Mahnı çox uzundur (${Math.round(meta.duration/60)} dəq).` });

  const title  = (meta.title    || videoId).replace(/[^\w\s\-]/g,"").slice(0,80);
  const artist = (meta.uploader || "YouTube").replace(/[^\w\s\-]/g,"").slice(0,80);
  const thumb  = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

  /* 2. Headers */
  res.setHeader("Content-Type",  "audio/webm");
  res.setHeader("X-Song-Title",  encodeURIComponent(title));
  res.setHeader("X-Song-Artist", encodeURIComponent(artist));
  res.setHeader("X-Song-Thumb",  encodeURIComponent(thumb));
  res.setHeader("Cache-Control", "public, max-age=86400");

  /* 3. Stream */
  const binPath = require.resolve("yt-dlp-exec/yt-dlp");
  const args = [
    "--no-playlist",
    "-f", "bestaudio[ext=webm]/bestaudio[ext=m4a]/bestaudio",
    "--audio-quality", "5",
    "-o", "-",
    "--quiet", "--no-warnings", "--no-check-certificate",
    videoUrl,
  ];

  let proc;
  try { proc = spawn(binPath, args, { stdio: ["ignore","pipe","pipe"] }); }
  catch (e) { return res.status(500).json({ error: "yt-dlp işə düşmədi" }); }

  req.on("close", () => { try { proc.kill("SIGTERM"); } catch(_){} });
  proc.stderr.on("data", d => { const s=d.toString(); if(s.includes("ERROR")) console.error("[yt-dlp]",s.trim()); });
  proc.on("error", e => { if(!res.headersSent) res.status(500).json({error:"Stream xətası"}); else res.end(); });
  proc.on("close", () => { if(!res.writableEnded) res.end(); });
  proc.stdout.pipe(res);
};