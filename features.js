/* ═══════════════════════════════════════════════════════════
   Music Universe — əlavə xüsusiyyətlər (features.js)
   1) Tempo  2) Oflayn zolaq  3) İxrac/İdxal
   4) Paylaşma kartı  5) Xülasə  6) Mahnı adları + ⚙ düyməsi
   index.html-in ƏSAS skriptindən SONRA yüklənir.
═══════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ── Əsas skript hazırdırmı? ── */
  try {
    if (typeof S === "undefined" || typeof ldb === "undefined") return;
  } catch (e) {
    console.warn("[features] əsas skript hazır deyil:", e);
    return;
  }

  /* ══ KÖMƏKÇİLƏR ══ */
  const $ = id => document.getElementById(id);
  const say = (m, d) => { try { toast(m, d); } catch (_) { console.log(m); } };
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const VID = /^[A-Za-z0-9_-]{11}$/;
  const clip = (v, max) => String(v == null ? "" : v).slice(0, max);
  const thumbOf = v => { try { return TH(v); } catch (_) { return "https://img.youtube.com/vi/" + v + "/mqdefault.jpg"; } };

  /* ══ DİLLƏR ══ */
  const I18N = {
    az: {
      settingsBtn: "Parametrlər",
      tempo: "Tempo", tempoSub: "Mahnının sürəti (səs tonu dəyişmir)",
      offline: "📵 Oflayn rejim — yalnız endirilmiş mahnılar", offGo: "Endirilənlər ›",
      offEmpty: "Oflayn rejimdə göstəriləcək endirilmiş mahnı yoxdur. İnternet olanda ⬇ Endir ilə saxla.",
      online: "🌐 İnternet bərpa olundu",
      backup: "Ehtiyat nüsxə", backupSub: "Playlist, sevimlilər, tarix və parametrlər",
      exp: "⬆ İxrac", imp: "⬇ İdxal", exported: "✅ Nüsxə yükləndi",
      imported: "✅ İdxal olundu: {pl} playlist, {sg} mahnı, {lk} sevimli, {hs} tarix",
      badFile: "❌ Fayl düzgün deyil", importing: "⏳ İdxal edilir…",
      card: "Paylaşma kartı", cardSub: "Cari mahnı üçün şəkil kartı", noSong: "⚠ Əvvəlcə mahnı seçin",
      making: "⏳ Kart hazırlanır…", share: "Paylaş", save: "Yüklə", saved: "✅ Şəkil yükləndi",
      recap: "Xülasə", recapSub: "Ən çox dinlədiklərin kartı", recapTitle: "Ən çox dinlədiklərim",
      plays: "DİNLƏMƏ", mins: "DƏQİQƏ", noData: "Hələ kifayət qədər dinləmə yoxdur", open: "Aç"
    },
    en: {
      settingsBtn: "Settings",
      tempo: "Speed", tempoSub: "Playback speed (pitch stays the same)",
      offline: "📵 Offline mode — downloaded songs only", offGo: "Downloads ›",
      offEmpty: "No downloaded songs to show offline. Use ⬇ Download while online.",
      online: "🌐 Back online",
      backup: "Backup", backupSub: "Playlists, likes, history and settings",
      exp: "⬆ Export", imp: "⬇ Import", exported: "✅ Backup saved",
      imported: "✅ Imported: {pl} playlists, {sg} songs, {lk} likes, {hs} history",
      badFile: "❌ Invalid file", importing: "⏳ Importing…",
      card: "Share card", cardSub: "Image card for the current song", noSong: "⚠ Pick a song first",
      making: "⏳ Making the card…", share: "Share", save: "Save", saved: "✅ Image saved",
      recap: "Recap", recapSub: "Card of your most played songs", recapTitle: "My most played",
      plays: "PLAYS", mins: "MINUTES", noData: "Not enough listening data yet", open: "Open"
    },
    ru: {
      settingsBtn: "Настройки",
      tempo: "Скорость", tempoSub: "Скорость воспроизведения (тон не меняется)",
      offline: "📵 Офлайн — только загруженные песни", offGo: "Загрузки ›",
      offEmpty: "Нет загруженных песен для офлайна. Загрузите их при наличии интернета.",
      online: "🌐 Интернет восстановлен",
      backup: "Резервная копия", backupSub: "Плейлисты, лайки, история и настройки",
      exp: "⬆ Экспорт", imp: "⬇ Импорт", exported: "✅ Копия сохранена",
      imported: "✅ Импортировано: {pl} плейлистов, {sg} песен, {lk} лайков, {hs} истории",
      badFile: "❌ Неверный файл", importing: "⏳ Импорт…",
      card: "Карточка", cardSub: "Картинка для текущей песни", noSong: "⚠ Сначала выберите песню",
      making: "⏳ Создаю карточку…", share: "Поделиться", save: "Сохранить", saved: "✅ Картинка сохранена",
      recap: "Итоги", recapSub: "Карточка самых прослушиваемых", recapTitle: "Мои самые частые",
      plays: "ПРОСЛУШИВАНИЙ", mins: "МИНУТ", noData: "Пока недостаточно данных", open: "Открыть"
    }
  };
  const lang = () => { try { return I18N[LANG] ? LANG : "az"; } catch (_) { return "az"; } };
  const L = (k, p) => {
    let s = (I18N[lang()] || I18N.az)[k];
    if (s == null) s = I18N.az[k];
    if (s == null) s = k;
    if (p) Object.keys(p).forEach(n => { s = s.replace("{" + n + "}", p[n]); });
    return s;
  };

  /* ══ CSS ══ */
  const css = document.createElement("style");
  css.id = "mu-feat-css";
  css.textContent = `
.mu-btn{padding:7px 13px;border-radius:9px;background:var(--c3);color:var(--tx);font:700 .75rem var(--fb);border:1.5px solid var(--bd2);cursor:pointer;white-space:nowrap}
.mu-btn:hover{background:var(--c4)}
.mu-btn.mu-pri{background:var(--g);color:#000;border-color:var(--g)}
.mu-chips{display:flex;gap:6px;flex-wrap:wrap}
.mu-chip{padding:6px 11px;border-radius:999px;background:var(--c3);color:var(--t2);font:700 .73rem var(--fb);border:1.5px solid var(--bd2);cursor:pointer}
.mu-chip.on{background:var(--g);color:#000;border-color:var(--g)}
#mu-offbar{position:fixed;top:var(--nav);left:0;right:0;height:30px;z-index:890;display:none;align-items:center;justify-content:center;gap:10px;padding:0 10px;background:#f5a524;color:#1a1200;font:700 .72rem var(--fb);cursor:pointer;white-space:nowrap;overflow:hidden}
#mu-offbar span{overflow:hidden;text-overflow:ellipsis}
#mu-offbar b{flex-shrink:0;text-decoration:underline}
body.mu-off #main{padding-top:calc(var(--nav) + 46px)}
body.mu-off #npw{top:calc(var(--nav) + 38px)}
#mu-off-empty{display:none;text-align:center;padding:30px 18px;color:var(--t2);font-size:.85rem;line-height:1.7}
#mu-set-btn{display:none}
@media(min-width:900px){#mu-set-btn{display:flex}}
#m-mucard .mu-prev{width:100%;max-height:62vh;object-fit:contain;border-radius:14px;background:#000;display:block}
`;
  document.head.appendChild(css);

  /* ════════════════════════════════════════════
     1) TEMPO
  ════════════════════════════════════════════ */
  const RATES = [0.75, 1, 1.25, 1.5];
  let rate = parseFloat(localStorage.getItem("mu_rate"));
  if (!RATES.includes(rate)) rate = 1;
  const fmtRate = r => r + "x";

  function applyRate() {
    [S.offAudio, S.streamAudio].forEach(a => {
      if (!a) return;
      try { a.preservesPitch = true; a.mozPreservesPitch = true; a.webkitPreservesPitch = true; } catch (_) {}
      try { if (a.playbackRate !== rate) a.playbackRate = rate; } catch (_) {}
    });
    try {
      if (S.ytOk && S.ytp && S.ytp.setPlaybackRate) {
        const cur = S.ytp.getPlaybackRate ? S.ytp.getPlaybackRate() : 1;
        if (cur !== rate) S.ytp.setPlaybackRate(rate);
      }
    } catch (_) {}
  }

  function refreshTempoUI() {
    const b = $("b-bar-tempo"); if (b) { b.firstElementChild.textContent = fmtRate(rate); b.title = L("tempo") + ": " + fmtRate(rate); }
    const l = $("pem-tempo-lbl"); if (l) l.textContent = L("tempo") + ": " + fmtRate(rate);
    document.querySelectorAll(".mu-rate-chip").forEach(c => c.classList.toggle("on", parseFloat(c.dataset.r) === rate));
  }

  function setRate(r) {
    rate = r;
    try { localStorage.setItem("mu_rate", String(r)); } catch (_) {}
    applyRate(); refreshTempoUI();
  }
  function cycleRate() {
    setRate(RATES[(RATES.indexOf(rate) + 1) % RATES.length]);
    say("⏩ " + L("tempo") + ": " + fmtRate(rate), 1500);
  }

  // Yeni mahnı başlayanda (və ya pleyer vəziyyəti dəyişəndə) sürəti təkrar tətbiq et
  if (typeof window.setPUI === "function") {
    const _setPUI = window.setPUI;
    window.setPUI = function (st) {
      const r = _setPUI.apply(this, arguments);
      if (st === "play") applyRate();
      return r;
    };
  }

  function injectTempoUI() {
    const pacts = document.querySelector(".pacts");
    if (pacts && !$("b-bar-tempo")) {
      const b = document.createElement("button");
      b.className = "pbtn"; b.id = "b-bar-tempo";
      b.innerHTML = '<span style="font:800 .66rem var(--fh)">1x</span>';
      b.addEventListener("click", cycleRate);
      pacts.insertBefore(b, pacts.firstChild);
    }
    const rep = $("pem-rep");
    if (rep && !$("pem-tempo")) {
      const it = document.createElement("div");
      it.className = "pem-item"; it.id = "pem-tempo";
      it.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="13 19 22 12 13 5 13 19"/><polygon points="2 19 11 12 2 5 2 19"/></svg><span id="pem-tempo-lbl">Tempo</span>';
      it.addEventListener("click", cycleRate);          // menyu açıq qalır
      rep.insertAdjacentElement("afterend", it);
    }
    refreshTempoUI();
  }

  /* ════════════════════════════════════════════
     2) OFLAYN ZOLAQ
  ════════════════════════════════════════════ */
  function injectOfflineUI() {
    if ($("mu-offbar")) return;
    const bar = document.createElement("div");
    bar.id = "mu-offbar";
    bar.innerHTML = '<span id="mu-off-t"></span><b id="mu-off-go"></b>';
    bar.addEventListener("click", () => { try { switchPage("saved"); } catch (_) {} });
    document.body.appendChild(bar);

    const grid = $("mgrid");
    if (grid) {
      const em = document.createElement("div");
      em.id = "mu-off-empty";
      grid.parentNode.insertBefore(em, grid);
    }
    refreshOfflineText();
  }
  function refreshOfflineText() {
    const t = $("mu-off-t"), g = $("mu-off-go"), e = $("mu-off-empty");
    if (t) t.textContent = L("offline");
    if (g) g.textContent = L("offGo");
    if (e) e.textContent = L("offEmpty");
  }

  function isDownloaded(v) { return S.downloads.has(v) || S.offline.has(v); }

  function applyOfflineFilter() {
    const off = !navigator.onLine;
    document.body.classList.toggle("mu-off", off);
    const bar = $("mu-offbar"); if (bar) bar.style.display = off ? "flex" : "none";
    let visible = 0;
    document.querySelectorAll("#mgrid .card, #sgrid .card").forEach(c => {
      const ok = !off || isDownloaded(c.dataset.vid);
      c.style.display = ok ? "" : "none";
      if (ok) visible++;
    });
    const em = $("mu-off-empty");
    if (em) em.style.display = (off && visible === 0) ? "block" : "none";
  }

  let _offRaf = 0;
  const scheduleFilter = () => { cancelAnimationFrame(_offRaf); _offRaf = requestAnimationFrame(applyOfflineFilter); };

  function watchGrids() {
    ["mgrid", "sgrid"].forEach(id => {
      const el = $(id);
      if (el) new MutationObserver(scheduleFilter).observe(el, { childList: true });
    });
  }

  window.addEventListener("offline", () => { applyOfflineFilter(); });
  window.addEventListener("online", () => { applyOfflineFilter(); say(L("online"), 2200); });

  async function offlineStartup() {
    if (navigator.onLine) return;
    try {
      const n = await ldb.downloads.count();
      const active = document.querySelector(".page.on");
      if (n > 0 && active && active.id === "page-discover") switchPage("saved");
    } catch (_) {}
  }

  /* ════════════════════════════════════════════
     3) İXRAC / İDXAL
  ════════════════════════════════════════════ */
  function saveFile(name, blob) {
    const a = document.createElement("a");
    const url = URL.createObjectURL(blob);
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 2000);
  }

  async function exportBackup() {
    try {
      const [pls, plSongs, likes, hist] = await Promise.all([
        ldb.playlists.toArray(), ldb.pl_songs.toArray(), ldb.likes.toArray(), ldb.history.toArray()
      ]);
      const byPl = new Map();
      plSongs.sort((a, b) => (a.id || 0) - (b.id || 0)).forEach(s => {
        if (!byPl.has(s.playlistId)) byPl.set(s.playlistId, []);
        byPl.get(s.playlistId).push({ videoId: s.videoId, title: s.title, artist: s.artist, addedAt: s.addedAt || 0 });
      });
      const data = {
        app: "music-universe", version: 1, exportedAt: new Date().toISOString(),
        data: {
          playlists: pls.map(p => ({ name: p.name, createdAt: p.createdAt || 0, songs: byPl.get(p.id) || [] })),
          likes: likes.map(l => ({ videoId: l.videoId, title: l.title, artist: l.artist, likedAt: l.likedAt || 0 })),
          history: hist.map(h => ({ videoId: h.videoId, title: h.title, artist: h.artist, playedAt: h.playedAt || 0 }))
        },
        settings: {
          lang: localStorage.getItem("mu_lang") || "az",
          theme: localStorage.getItem("mu_theme") || "dark",
          crossfade: S.crossfade | 0,
          eq: S.eq, rate
        }
      };
      const day = new Date().toISOString().slice(0, 10);
      saveFile("music-universe-backup-" + day + ".json", new Blob([JSON.stringify(data, null, 1)], { type: "application/json" }));
      say(L("exported"));
    } catch (e) { console.warn("[export]", e); say("❌ " + e.message); }
  }

  const cleanSong = o => (o && typeof o === "object" && typeof o.videoId === "string" && VID.test(o.videoId))
    ? { videoId: o.videoId, title: clip(o.title, 200).trim() || o.videoId, artist: clip(o.artist, 120).trim(), thumb: thumbOf(o.videoId) }
    : null;
  const num = (v, d) => (Number.isFinite(Number(v)) && Number(v) > 0) ? Number(v) : d;

  async function importBackup(file) {
    if (!file) return;
    say(L("importing"), 2500);
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error("big");
      const j = JSON.parse(await file.text());
      if (!j || j.app !== "music-universe" || !j.data || typeof j.data !== "object") throw new Error("fmt");
      const d = j.data;
      const stat = { pl: 0, sg: 0, lk: 0, hs: 0 };

      await ldb.transaction("rw", ldb.playlists, ldb.pl_songs, ldb.likes, ldb.history, async () => {
        // Playlistlər (eyni adlıya əlavə olunur, təkrarlar atlanır)
        const existing = await ldb.playlists.toArray();
        for (const p of (Array.isArray(d.playlists) ? d.playlists.slice(0, 200) : [])) {
          const name = clip(p && p.name, 60).trim();
          if (!name) continue;
          let pl = existing.find(x => x.name === name), pid;
          if (pl) pid = pl.id;
          else {
            pid = await ldb.playlists.add({ name, createdAt: num(p.createdAt, Date.now()) });
            existing.push({ id: pid, name }); stat.pl++;
          }
          const have = new Set((await ldb.pl_songs.where("playlistId").equals(pid).toArray()).map(s => s.videoId));
          for (const raw of (Array.isArray(p.songs) ? p.songs.slice(0, 1000) : [])) {
            const s = cleanSong(raw);
            if (!s || have.has(s.videoId)) continue;
            await ldb.pl_songs.add({ playlistId: pid, videoId: s.videoId, title: s.title, artist: s.artist, thumb: s.thumb, addedAt: num(raw.addedAt, Date.now()) });
            have.add(s.videoId); stat.sg++;
          }
        }
        // Sevimlilər
        for (const raw of (Array.isArray(d.likes) ? d.likes.slice(0, 5000) : [])) {
          const s = cleanSong(raw);
          if (!s) continue;
          if (await ldb.likes.where("videoId").equals(s.videoId).count()) continue;
          await ldb.likes.add({ videoId: s.videoId, title: s.title, artist: s.artist, thumb: s.thumb, likedAt: num(raw.likedAt, Date.now()) });
          stat.lk++;
        }
        // Tarix (hər mahnı üçün ən yeni qeyd qalır, ümumi 50)
        for (const raw of (Array.isArray(d.history) ? d.history.slice(0, 500) : [])) {
          const s = cleanSong(raw);
          if (!s) continue;
          const at = num(raw.playedAt, Date.now());
          const cur = await ldb.history.where("videoId").equals(s.videoId).toArray();
          if (cur.some(r => (r.playedAt || 0) >= at)) continue;
          if (cur.length) await ldb.history.bulkDelete(cur.map(r => r.id));
          await ldb.history.add({ videoId: s.videoId, title: s.title, artist: s.artist, thumb: s.thumb, playedAt: at });
          stat.hs++;
        }
        const all = await ldb.history.orderBy("playedAt").toArray();
        if (all.length > 50) await ldb.history.bulkDelete(all.slice(0, all.length - 50).map(r => r.id));
      });

      // Parametrlər (yalnız icazə verilən dəyərlər)
      const st = j.settings && typeof j.settings === "object" ? j.settings : {};
      try {
        if (["az", "en", "ru"].includes(st.lang)) localStorage.setItem("mu_lang", st.lang);
        if (["dark", "light"].includes(st.theme)) localStorage.setItem("mu_theme", st.theme);
        if (Number.isInteger(st.crossfade) && st.crossfade >= 0 && st.crossfade <= 8) localStorage.setItem("mu_crossfade", String(st.crossfade));
        if (RATES.includes(st.rate)) localStorage.setItem("mu_rate", String(st.rate));
        if (st.eq && typeof st.eq === "object") {
          const e = {};
          ["bass", "mid", "treble"].forEach(k => { const n = Number(st.eq[k]); if (Number.isFinite(n)) e[k] = Math.max(-12, Math.min(12, Math.round(n))); });
          localStorage.setItem("mu_eq", JSON.stringify(e));
        }
      } catch (_) {}

      say(L("imported", stat), 4000);
      setTimeout(() => location.reload(), 1800);   // hər şeyi təzədən yükləyir
    } catch (e) {
      console.warn("[import]", e);
      say(L("badFile"));
    }
  }

  /* ════════════════════════════════════════════
     ŞƏKİL KARTLARI (4 + 5 üçün ortaq)
  ════════════════════════════════════════════ */
  const FONT = '"Poppins","Plus Jakarta Sans",system-ui,sans-serif';

  async function loadCover(videoId, small) {
    const names = small ? ["hqdefault"] : ["maxresdefault", "hqdefault"];
    for (const n of names) {
      try {
        const r = await fetch("https://i.ytimg.com/vi/" + videoId + "/" + n + ".jpg", { mode: "cors" });
        if (!r.ok) continue;
        const b = await r.blob();
        if (!/^image\//.test(b.type)) continue;
        return await createImageBitmap(b);
      } catch (_) {}
    }
    return null;
  }

  // Kvadrat mərkəz kəsimi (hqdefault-un qara zolaqları daxil olmaqla)
  function squareRect(img) {
    const w = img.width, h = img.height;
    const ratio = h / w;
    let sy = 0, sh = h;
    if (ratio > 0.7) { sy = Math.round(h * 0.125); sh = Math.round(h * 0.75); }  // 4:3 + qara zolaq
    const s = Math.min(w, sh);
    return { sx: Math.round((w - s) / 2), sy: sy + Math.round((sh - s) / 2), s };
  }

  function avgColor(img) {
    try {
      const c = document.createElement("canvas"); c.width = c.height = 8;
      const g = c.getContext("2d"); g.drawImage(img, 0, 0, 8, 8);
      const d = g.getImageData(0, 0, 8, 8).data;
      let r = 0, gr = 0, b = 0, n = 0;
      for (let i = 0; i < d.length; i += 4) { r += d[i]; gr += d[i + 1]; b += d[i + 2]; n++; }
      r /= n; gr /= n; b /= n;
      const lum = 0.2126 * r + 0.7152 * gr + 0.0722 * b;
      if (lum < 25) return [30, 215, 96];
      return [r, gr, b].map(v => Math.max(0, Math.min(255, Math.round(v))));
    } catch (_) { return [30, 215, 96]; }
  }

  function rr(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }

  function wrap(g, text, maxW, maxLines) {
    const words = String(text).split(/\s+/).filter(Boolean);
    const lines = []; let cur = "";
    const push = () => { if (cur) { lines.push(cur); cur = ""; } };
    for (const w of words) {
      let word = w;
      while (g.measureText(word).width > maxW) {            // çox uzun söz
        let k = word.length;
        while (k > 1 && g.measureText(word.slice(0, k)).width > maxW) k--;
        push(); lines.push(word.slice(0, k)); word = word.slice(k);
      }
      const test = cur ? cur + " " + word : word;
      if (g.measureText(test).width <= maxW) cur = test; else { push(); cur = word; }
    }
    push();
    if (lines.length > maxLines) {
      lines.length = maxLines;
      let last = lines[maxLines - 1];
      while (last.length > 1 && g.measureText(last + "…").width > maxW) last = last.slice(0, -1);
      lines[maxLines - 1] = last + "…";
    }
    return lines;
  }

  function oneLine(g, text, maxW) {
    let t = String(text);
    if (g.measureText(t).width <= maxW) return t;
    while (t.length > 1 && g.measureText(t + "…").width > maxW) t = t.slice(0, -1);
    return t + "…";
  }

  function drawBackground(g, W, H, cover, accent) {
    const [r, gr, b] = accent;
    const grad = g.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, `rgb(${Math.round(r * .55)},${Math.round(gr * .55)},${Math.round(b * .55)})`);
    grad.addColorStop(1, "#080c12");
    g.fillStyle = grad; g.fillRect(0, 0, W, H);
    if (cover) {
      const t = document.createElement("canvas"); t.width = 18; t.height = 32;
      const tg = t.getContext("2d"); const q = squareRect(cover);
      tg.drawImage(cover, q.sx, q.sy, q.s, q.s, 0, 0, 18, 32);
      g.save(); g.globalAlpha = 0.5; g.imageSmoothingEnabled = true; g.imageSmoothingQuality = "high";
      g.drawImage(t, 0, 0, W, H); g.restore();
    }
    const ov = g.createLinearGradient(0, 0, 0, H);
    ov.addColorStop(0, "rgba(8,12,18,.15)"); ov.addColorStop(.55, "rgba(8,12,18,.55)"); ov.addColorStop(1, "rgba(8,12,18,.92)");
    g.fillStyle = ov; g.fillRect(0, 0, W, H);
  }

  function drawBrand(g, W, H) {
    g.textAlign = "left"; g.textBaseline = "alphabetic";
    g.fillStyle = "#1ed760"; g.font = "800 46px " + FONT;
    g.fillText("♪ MUSIC UNIVERSE", 90, 150);
    g.textAlign = "center"; g.fillStyle = "rgba(255,255,255,.55)"; g.font = "600 34px " + FONT;
    g.fillText(location.host, W / 2, H - 100);
  }

  async function ensureFonts() {
    try {
      if (document.fonts && document.fonts.load) {
        await Promise.race([
          Promise.all([document.fonts.load("800 60px Poppins"), document.fonts.load("600 30px 'Plus Jakarta Sans'")]),
          sleep(900)
        ]);
      }
    } catch (_) {}
  }

  const toPng = cv => new Promise((res, rej) => cv.toBlob(b => b ? res(b) : rej(new Error("png")), "image/png"));

  function cleanTitle(t) { return stripNoise(t); }

  /* ── 4) Mahnı kartı ── */
  async function makeSongCard(song) {
    await ensureFonts();
    const W = 1080, H = 1920;
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const g = cv.getContext("2d");
    const cover = await loadCover(song.videoId, false);
    const accent = cover ? avgColor(cover) : [30, 215, 96];
    drawBackground(g, W, H, cover, accent);
    drawBrand(g, W, H);

    // Qapaq
    const S0 = 840, x0 = (W - S0) / 2, y0 = 300;
    g.save(); g.shadowColor = "rgba(0,0,0,.6)"; g.shadowBlur = 70; g.shadowOffsetY = 30;
    rr(g, x0, y0, S0, S0, 56); g.fillStyle = "#101826"; g.fill(); g.restore();
    g.save(); rr(g, x0, y0, S0, S0, 56); g.clip();
    if (cover) { const q = squareRect(cover); g.drawImage(cover, q.sx, q.sy, q.s, q.s, x0, y0, S0, S0); }
    else {
      g.fillStyle = "#141e2e"; g.fillRect(x0, y0, S0, S0);
      g.fillStyle = "rgba(255,255,255,.25)"; g.font = "800 360px " + FONT; g.textAlign = "center"; g.fillText("♪", W / 2, y0 + S0 / 2 + 130);
    }
    g.restore();

    // Dalğa zolaqları (videoId-dən sabit təsadüfi)
    let seed = 0; for (const ch of song.videoId) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
    const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    const bars = 36, bw = 12, gap = 11, tw = bars * bw + (bars - 1) * gap, bx = (W - tw) / 2, by = 1260;
    g.fillStyle = "rgba(30,215,96,.9)";
    for (let i = 0; i < bars; i++) {
      const h = 14 + Math.round(rnd() * 70);
      rr(g, bx + i * (bw + gap), by - h / 2, bw, h, 6); g.fill();
    }

    // Mətn
    g.textAlign = "center"; g.fillStyle = "#fff"; g.font = "800 66px " + FONT;
    const lines = wrap(g, cleanTitle(song.title) || song.title, 880, 3);
    let y = 1400; lines.forEach(l => { g.fillText(l, W / 2, y); y += 80; });
    g.fillStyle = "rgba(255,255,255,.72)"; g.font = "600 44px " + FONT;
    g.fillText(oneLine(g, song.artist || "", 880), W / 2, y + 22);
    return toPng(cv);
  }

  /* ── 5) Xülasə kartı ── */
  async function makeRecapCard(top, totals) {
    await ensureFonts();
    const W = 1080, H = 1920;
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const g = cv.getContext("2d");
    const covers = await Promise.all(top.map(t => loadCover(t.videoId, true)));
    const accent = covers[0] ? avgColor(covers[0]) : [30, 215, 96];
    drawBackground(g, W, H, covers[0], accent);
    drawBrand(g, W, H);

    g.textAlign = "left"; g.fillStyle = "#fff"; g.font = "800 80px " + FONT;
    const tl = wrap(g, L("recapTitle"), 900, 2);
    let y = 290; tl.forEach(l => { g.fillText(l, 90, y); y += 92; });

    // Rəqəmlər
    const yy = y + 50;
    [[totals.plays, L("plays"), 90], [totals.mins, L("mins"), 560]].forEach(([n, lb, x]) => {
      g.fillStyle = "#1ed760"; g.font = "800 120px " + FONT; g.fillText(String(n), x, yy + 100);
      g.fillStyle = "rgba(255,255,255,.6)"; g.font = "700 32px " + FONT; g.fillText(lb, x + 4, yy + 152);
    });

    // Top 5
    let ry = yy + 250;
    top.slice(0, 5).forEach((t, i) => {
      const rowH = 200, sz = 150, cx = 90;
      g.fillStyle = i === 0 ? "rgba(30,215,96,.16)" : "rgba(255,255,255,.06)";
      rr(g, 60, ry - 20, W - 120, rowH - 10, 34); g.fill();
      g.fillStyle = i === 0 ? "#1ed760" : "rgba(255,255,255,.55)"; g.font = "800 60px " + FONT; g.textAlign = "left";
      g.fillText(String(i + 1), cx, ry + 95);
      const ix = cx + 80;
      g.save(); rr(g, ix, ry, sz, sz, 28); g.clip();
      const c = covers[i];
      if (c) { const q = squareRect(c); g.drawImage(c, q.sx, q.sy, q.s, q.s, ix, ry, sz, sz); }
      else { g.fillStyle = "#141e2e"; g.fillRect(ix, ry, sz, sz); }
      g.restore();
      const tx = ix + sz + 34, mw = W - tx - 190;
      g.fillStyle = "#fff"; g.font = "800 40px " + FONT;
      g.fillText(oneLine(g, cleanTitle(t.title) || t.title, mw), tx, ry + 62);
      g.fillStyle = "rgba(255,255,255,.6)"; g.font = "600 30px " + FONT;
      g.fillText(oneLine(g, t.artist || "", mw), tx, ry + 112);
      g.textAlign = "right"; g.fillStyle = "#1ed760"; g.font = "800 44px " + FONT;
      g.fillText("×" + t.count, W - 100, ry + 92); g.textAlign = "left";
      ry += rowH;
    });
    return toPng(cv);
  }

  /* ── Önizləmə pəncərəsi (paylaş / yüklə) ── */
  let _cardUrl = null, _cardBlob = null, _cardName = "card.png", _cardText = "";

  function ensureCardModal() {
    if ($("m-mucard")) return;
    const m = document.createElement("div");
    m.className = "moverlay"; m.id = "m-mucard";
    m.innerHTML =
      '<div class="mbox" style="max-width:380px">' +
      '<button class="mcls" id="mu-card-x"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>' +
      '<div class="mtit" id="mu-card-t"></div>' +
      '<img class="mu-prev" id="mu-card-img" alt=""/>' +
      '<div style="display:flex;gap:8px;margin-top:14px">' +
      '<button class="mu-btn mu-pri" id="mu-card-share" style="flex:1"></button>' +
      '<button class="mu-btn" id="mu-card-save" style="flex:1"></button></div></div>';
    document.body.appendChild(m);
    const close = () => { m.classList.remove("open"); if (_cardUrl) { URL.revokeObjectURL(_cardUrl); _cardUrl = null; } };
    m.addEventListener("click", e => { if (e.target === m) close(); });
    $("mu-card-x").addEventListener("click", close);
    $("mu-card-save").addEventListener("click", () => { if (_cardBlob) { saveFile(_cardName, _cardBlob); say(L("saved"), 1800); } });
    $("mu-card-share").addEventListener("click", async () => {
      if (!_cardBlob) return;
      try {
        const file = new File([_cardBlob], _cardName, { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: "Music Universe", text: _cardText });
          return;
        }
      } catch (e) { if (e && e.name === "AbortError") return; }
      saveFile(_cardName, _cardBlob); say(L("saved"), 1800);      // yedək: şəkli yüklə
    });
  }

  function showCard(blob, name, title, text) {
    ensureCardModal();
    if (_cardUrl) URL.revokeObjectURL(_cardUrl);
    _cardBlob = blob; _cardName = name; _cardText = text;
    _cardUrl = URL.createObjectURL(blob);
    $("mu-card-img").src = _cardUrl;
    $("mu-card-t").textContent = title;
    $("mu-card-share").textContent = "↗ " + L("share");
    $("mu-card-save").textContent = "⬇ " + L("save");
    $("m-mucard").classList.add("open");
  }

  /* ── Mahnı kartının açılışı ── */
  function currentSong() {
    const s = S.list[S.idx]; if (!s) return null;
    const dt = ($("p-title") && $("p-title").textContent || "").trim();
    const da = ($("p-artist") && $("p-artist").textContent || "").trim();
    return {
      videoId: s.videoId,
      title: (dt && dt !== "—" && dt !== "Music Universe") ? dt : s.title,
      artist: (da && da !== "—" && !/Mahnı seçin/i.test(da)) ? da : s.artist
    };
  }

  async function openSongCard() {
    const song = currentSong();
    if (!song) { say(L("noSong")); return; }
    say(L("making"), 2500);
    try {
      const blob = await makeSongCard(song);
      let url = ""; try { url = buildShareUrl(song.videoId); } catch (_) {}
      showCard(blob, "music-universe-" + song.videoId + ".png", L("card"), (cleanTitle(song.title) || song.title) + (song.artist ? " — " + song.artist : "") + (url ? "\n" + url : ""));
    } catch (e) { console.warn("[card]", e); say("❌ " + e.message); }
  }

  /* ── Xülasənin açılışı ── */
  const featDb = (typeof Dexie !== "undefined") ? new Dexie("MUfeat") : null;
  if (featDb) featDb.version(1).stores({ plays: "videoId, count, lastPlayed" });

  async function trackPlay(song) {
    if (!featDb || !song || !VID.test(song.videoId || "")) return;
    await featDb.transaction("rw", featDb.plays, async () => {
      const r = await featDb.plays.get(song.videoId);
      await featDb.plays.put({
        videoId: song.videoId, title: clip(song.title, 200), artist: clip(song.artist, 120),
        count: (r ? r.count : 0) + 1, lastPlayed: Date.now()
      });
    });
  }

  // Mövcud tarixi (ən çox 50) bir dəfə başlanğıc kimi götür
  async function seedPlays() {
    if (!featDb || localStorage.getItem("mu_plays_seeded")) return;
    try {
      if (await featDb.plays.count() === 0) {
        const h = await ldb.history.toArray();
        await featDb.plays.bulkPut(h.filter(r => VID.test(r.videoId || "")).map(r => ({
          videoId: r.videoId, title: clip(r.title, 200), artist: clip(r.artist, 120), count: 1, lastPlayed: r.playedAt || Date.now()
        })));
      }
      localStorage.setItem("mu_plays_seeded", "1");
    } catch (_) {}
  }

  let _histP = Promise.resolve();
  if (typeof window.addToHistory === "function") {
    const _add = window.addToHistory;
    window.addToHistory = function (song) {
      try { trackPlay(song).catch(() => {}); } catch (_) {}
      _histP = Promise.resolve(_add.apply(this, arguments));
      return _histP;
    };
  }

  async function getTopData() {
    // 1) Bulud statistikası (giriş edibsə, bütün zamanlar)
    try {
      if (typeof FB !== "undefined" && FB && typeof fbD !== "undefined" && fbD && S.user && navigator.onLine) {
        const snap = await fbD.ref("stats/" + S.user.uid + "/songs").orderByChild("count").limitToLast(100).get();
        if (snap && snap.exists()) {
          const arr = [];
          snap.forEach(ch => { const v = ch.val() || {}; if (VID.test(ch.key)) arr.push({ videoId: ch.key, title: clip(v.title, 200), artist: clip(v.artist, 120), count: Math.max(1, v.count | 0) }); });
          if (arr.length) return arr;
        }
      }
    } catch (_) {}
    // 2) Yerli say
    if (featDb) {
      try {
        const rows = await featDb.plays.toArray();
        if (rows.length) return rows.map(r => ({ videoId: r.videoId, title: r.title, artist: r.artist, count: r.count }));
      } catch (_) {}
    }
    return [];
  }

  async function openRecap() {
    say(L("making"), 3000);
    try {
      const rows = (await getTopData()).sort((a, b) => b.count - a.count);
      if (!rows.length) { say(L("noData")); return; }
      const plays = rows.reduce((s, r) => s + r.count, 0);
      const mins = Math.round(plays * 3.5);                 // tətbiqin mövcud hesablaması ilə eyni
      const blob = await makeRecapCard(rows.slice(0, 5), { plays, mins });
      showCard(blob, "music-universe-recap.png", L("recap"), L("recapTitle") + " 🎧\n" + location.origin);
    } catch (e) { console.warn("[recap]", e); say("❌ " + e.message); }
  }

  /* ════════════════════════════════════════════
     6) MAHNI ADLARI — təmizləmə + API ilə tamamlama
  ════════════════════════════════════════════ */
  const NOISE_WORDS = "official|video|videoclip|music video|lyric video|lyrics?|audio|klip|clip|rəsmi|hd|hq|4k|8k|1080p|720p|mv|m\\/v|visuali[sz]er|full video|клип|официальн\\p{L}*|текст";
  const NOISE_RE = new RegExp("(?:^|[^\\p{L}\\p{N}])(?:" + NOISE_WORDS + ")(?=$|[^\\p{L}\\p{N}])", "iu");
  const NOISE_ALL = new RegExp(NOISE_RE.source, "giu");
  const isNoiseOnly = seg => !String(seg).replace(NOISE_ALL, " ").replace(/[^\p{L}\p{N}]/gu, "");
  const norm = x => String(x == null ? "" : x).toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

  // "(Official Video)", "[HD]", "- Official Audio", "| Lyrics" kimi artıqları silir
  function stripNoise(t) {
    t = String(t == null ? "" : t);
    t = t.replace(/[\(\[【][^\)\]】]*[\)\]】]/g, m => NOISE_RE.test(m) ? "" : m);
    t = t.replace(/\s+/g, " ").trim();
    for (let i = 0; i < 4; i++) {
      const m = t.match(/^(.*\S)\s+[-–—|]\s+([^-–—|]*)$/);
      if (m && isNoiseOnly(m[2])) t = m[1]; else break;
    }
    return t.replace(/[\s\-–—|:]+$/, "").replace(/\s{2,}/g, " ").trim();
  }

  // "EdSheeranVEVO" → "Ed Sheeran", "Adele - Topic" → "Adele", "YouTube" → ""
  function cleanChannel(c) {
    c = String(c == null ? "" : c).trim();
    if (!c || /^youtube$/i.test(c)) return "";
    const vevo = /vevo$/i.test(c);
    c = c.replace(/\s*-\s*topic$/i, "").replace(/\s*vevo$/i, "").replace(/\s+official(\s+channel)?$/i, "").trim();
    if (vevo && !/\s/.test(c)) c = c.replace(/(\p{Ll})(\p{Lu})/gu, "$1 $2");
    return c;
  }

  // Xam YouTube başlığı + kanal adı → { title, artist }
  function cleanMeta(rawTitle, channel) {
    const ch = cleanChannel(channel);
    const t = stripNoise(rawTitle);
    let title = t, artist = ch;
    const parts = t.split(/\s+[-–—|]\s+/).map(x => x.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const first = parts[0], rest = parts.slice(1).join(" - "), nc = norm(ch);
      if (nc && norm(rest).includes(nc) && !norm(first).includes(nc) && norm(rest).length <= nc.length + 12) { title = first; artist = rest; }
      else if (first.length <= 60) { artist = first; title = rest; }
    }
    title = title.replace(/^["'“”‘’«»]+|["'“”‘’«»]+$/g, "").replace(/\s+/g, " ").trim() || String(rawTitle || "").trim();
    return { title: clip(title, 200), artist: clip(String(artist).trim(), 120) };
  }
  window.MU_FEAT = { cleanMeta, stripNoise };

  const PH = /^(?:YouTube: |Video )[A-Za-z0-9_-]{11}$/;
  const isPh = o => !!o && typeof o.title === "string" && (PH.test(o.title) || o.title === o.videoId);
  // Kataloqdakı əl ilə yazılmış adlar həmişə qalır (YouTube-un xam adı onları pozmasın)
  const CATALOG = new Map((S.list || []).map(s => [s.videoId, { title: s.title, artist: s.artist }]));

  const metaCache = new Map();
  const inflight = new Map();                                    // id -> davam edən sorğu (eyni ID iki dəfə soruşulmasın)
  async function getMeta(ids) {
    const need = [...new Set(ids)].filter(i => VID.test(i) && !metaCache.has(i)).slice(0, 20);
    const mine = need.filter(i => !inflight.has(i));
    if (mine.length && navigator.onLine) {
      const job = (async () => {
        try {
          const r = await fetch("/api/yt-meta?ids=" + mine.join(","), { signal: AbortSignal.timeout(9000) });
          if (r.ok) {
            const j = await r.json();
            Object.keys(j || {}).forEach(k => {
              const v = j[k];
              if (VID.test(k) && v && typeof v.title === "string" && v.title) metaCache.set(k, cleanMeta(v.title, v.author));
            });
          }
        } catch (_) {}
      })();
      mine.forEach(i => inflight.set(i, job));
      try { await job; } finally { mine.forEach(i => inflight.delete(i)); }
    }
    await Promise.all(need.filter(i => !mine.includes(i)).map(i => inflight.get(i)).filter(Boolean));   // başqasının sorğusunu gözlə
    const out = {};
    ids.forEach(i => { if (metaCache.has(i)) out[i] = metaCache.get(i); });
    return out;
  }
  function applyMeta(id, m) {
    if (CATALOG.has(id)) return;
    S.list.forEach(x => { if (x.videoId === id) { x.title = m.title; x.artist = m.artist || x.artist; x._src = "api"; } });
    const cur = S.list[S.idx];
    if (cur && cur.videoId === id) { try { window.updPI(cur.title, cur.artist, null); } catch (_) {} }
  }

  // Bazadakı yer tutucu adları (YouTube: ID / Video ID) əsl adla əvəz et
  async function persistMeta(id, m) {
    const patch = r => { if (isPh(r)) { r.title = m.title; r.artist = m.artist || r.artist; } };
    for (const t of ["history", "likes", "pl_songs", "downloads", "saved", "offline"]) {
      try { if (ldb[t]) await ldb[t].where("videoId").equals(id).modify(patch); } catch (_) {}
    }
    try {
      if (featDb) {
        const r = await featDb.plays.get(id);
        if (r && isPh(r)) await featDb.plays.put({ ...r, title: m.title, artist: m.artist || r.artist });
      }
    } catch (_) {}
    try {
      if (typeof FB !== "undefined" && FB && typeof fbD !== "undefined" && fbD && S.user && navigator.onLine) {
        fbD.ref("stats/" + S.user.uid + "/songs/" + id).transaction(cur => (cur && PH.test(cur.title || ""))
          ? Object.assign(cur, { title: m.title, artist: m.artist || cur.artist }) : undefined).catch(() => {});
      }
    } catch (_) {}
  }

  async function resolvePlaceholder(id) {
    try { await _histP; } catch (_) {}
    const m = (await getMeta([id]))[id];
    if (!m) return;
    applyMeta(id, m);
    await persistMeta(id, m);
  }

  // Yeni mahnı başlayanda: yer tutucu adı varsa API-dən əsl adı al
  if (typeof window.playSong === "function") {
    const _play = window.playSong;
    window.playSong = function (song) {
      const r = _play.apply(this, arguments);               // klik hadisəsi itmir
      try { if (song && VID.test(song.videoId || "") && isPh(song) && !CATALOG.has(song.videoId)) resolvePlaceholder(song.videoId); } catch (_) {}
      return r;
    };
  }

  // Pleyerdəki ad: kataloq adı qalır; yapışdırılan linklər üçün xam ad təmizlənir
  if (typeof window.updPI === "function") {
    const _upd = window.updPI;
    window.updPI = function (title, artist, src) {
      try {
        const cur = S.list[S.idx];
        const cat = cur && CATALOG.get(cur.videoId);
        if (cat) {
          cur.title = cat.title; cur.artist = cat.artist;
          title = cat.title; artist = cat.artist;
        } else if (cur) {
          if (cur._src === "api") { title = cur.title; artist = cur.artist; }
          else if ((isPh(cur) || cur._src === "yt") && title && !PH.test(title) && title !== cur.videoId) {
            const m = cleanMeta(title, artist);
            cur.title = m.title; cur.artist = m.artist || cur.artist; cur._src = "yt";
            title = cur.title; artist = cur.artist;
          }
        }
      } catch (_) {}
      return _upd.call(this, title, artist, src);
    };
  }

  // Köhnə yer tutucu adları bir dəfəyə düzəlt (internet olanda)
  let _migrating = false;
  async function migratePlaceholders() {
    if (_migrating || !navigator.onLine) return;
    _migrating = true;
    try {
      const ids = new Set();
      for (const t of ["history", "likes", "pl_songs", "downloads", "saved", "offline"]) {
        try { (await ldb[t].filter(isPh).toArray()).forEach(r => { if (VID.test(r.videoId || "")) ids.add(r.videoId); }); } catch (_) {}
      }
      const list = [...ids].filter(i => !CATALOG.has(i)).slice(0, 100);
      for (let i = 0; i < list.length; i += 20) {
        const got = await getMeta(list.slice(i, i + 20));
        for (const id of Object.keys(got)) { applyMeta(id, got[id]); await persistMeta(id, got[id]); }
      }
    } catch (_) {} finally { _migrating = false; }
  }
  window.addEventListener("online", () => { setTimeout(migratePlaceholders, 1500); });

  /* ════════════════════════════════════════════
     UI QOŞULMASI
  ════════════════════════════════════════════ */
  function injectCardButtons() {
    const pacts = document.querySelector(".pacts");
    if (pacts && !$("b-bar-card")) {
      const b = document.createElement("button");
      b.className = "pbtn"; b.id = "b-bar-card";
      b.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
      b.addEventListener("click", openSongCard);
      const sh = $("b-bar-sh");
      sh ? sh.insertAdjacentElement("afterend", b) : pacts.appendChild(b);
    }
    const pem = $("pem-sh");
    if (pem && !$("pem-card")) {
      const it = document.createElement("div");
      it.className = "pem-item"; it.id = "pem-card";
      it.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><span id="pem-card-lbl"></span>';
      it.addEventListener("click", () => { try { closeMeatball(); } catch (_) {} openSongCard(); });
      pem.insertAdjacentElement("afterend", it);
    }
    const l = $("pem-card-lbl"); if (l) l.textContent = L("card");
    const t = $("b-bar-card"); if (t) t.title = L("card");
  }

  function injectSettingsButton() {
    const end = document.querySelector(".bar-end");
    if (!end || $("mu-set-btn")) return;
    const b = document.createElement("button");
    b.className = "ibtn"; b.id = "mu-set-btn";
    b.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>';
    b.addEventListener("click", () => { try { openSettings(); } catch (e) { console.warn(e); } });
    end.insertBefore(b, $("thbtn") || end.firstChild);
    refreshSettingsBtn();
  }
  function refreshSettingsBtn() { const b = $("mu-set-btn"); if (b) b.title = L("settingsBtn"); }

  function injectHistoryButton() {
    const cnt = $("hist-cnt");
    if (!cnt || $("mu-recap-btn")) return;
    const b = document.createElement("button");
    b.className = "mu-btn"; b.id = "mu-recap-btn";
    b.addEventListener("click", openRecap);
    cnt.insertAdjacentElement("afterend", b);
    refreshHistoryButton();
  }
  function refreshHistoryButton() { const b = $("mu-recap-btn"); if (b) b.textContent = "📊 " + L("recap"); }

  function settingsRows() {
    return '' +
      '<div class="settings-row" id="mu-set-tempo" style="flex-direction:column;align-items:flex-start;gap:8px">' +
        '<div><div class="settings-lbl">⏩ ' + esc(L("tempo")) + '</div><div class="settings-sub">' + esc(L("tempoSub")) + '</div></div>' +
        '<div class="mu-chips">' + RATES.map(r => '<button class="mu-chip mu-rate-chip' + (r === rate ? " on" : "") + '" data-r="' + r + '">' + fmtRate(r) + '</button>').join("") + '</div>' +
      '</div>' +
      '<div class="settings-row" id="mu-set-recap">' +
        '<div><div class="settings-lbl">📊 ' + esc(L("recap")) + '</div><div class="settings-sub">' + esc(L("recapSub")) + '</div></div>' +
        '<button class="mu-btn" id="mu-set-recap-btn">' + esc(L("open")) + '</button>' +
      '</div>' +
      '<div class="settings-row" id="mu-set-backup" style="flex-direction:column;align-items:flex-start;gap:8px">' +
        '<div><div class="settings-lbl">💾 ' + esc(L("backup")) + '</div><div class="settings-sub">' + esc(L("backupSub")) + '</div></div>' +
        '<div style="display:flex;gap:8px"><button class="mu-btn" id="mu-exp">' + esc(L("exp")) + '</button><button class="mu-btn" id="mu-imp">' + esc(L("imp")) + '</button></div>' +
        '<input type="file" id="mu-file" accept="application/json,.json" hidden/>' +
      '</div>';
  }

  if (typeof window.openSettings === "function") {
    const _open = window.openSettings;
    window.openSettings = function () {
      const r = _open.apply(this, arguments);
      try {
        const b = $("m-settings-b");
        if (b && !$("mu-set-tempo")) {
          b.insertAdjacentHTML("beforeend", settingsRows());
          b.querySelectorAll(".mu-rate-chip").forEach(c => c.addEventListener("click", () => setRate(parseFloat(c.dataset.r))));
          $("mu-set-recap-btn").addEventListener("click", () => { closeM("m-settings"); openRecap(); });
          $("mu-exp").addEventListener("click", exportBackup);
          const f = $("mu-file");
          $("mu-imp").addEventListener("click", () => f.click());
          f.addEventListener("change", () => { const file = f.files && f.files[0]; f.value = ""; importBackup(file); });
        }
      } catch (e) { console.warn("[features] parametrlər:", e); }
      return r;
    };
  }

  // Dil dəyişəndə yazıları yenilə
  if (typeof window.applyLang === "function") {
    const _al = window.applyLang;
    window.applyLang = function () {
      const r = _al.apply(this, arguments);
      try { refreshTempoUI(); refreshOfflineText(); refreshHistoryButton(); refreshSettingsBtn(); injectCardButtons(); } catch (_) {}
      return r;
    };
  }

  /* ══ BAŞLAT ══ */
  try {
    injectTempoUI();
    injectCardButtons();
    injectHistoryButton();
    injectSettingsButton();
    injectOfflineUI();
    watchGrids();
    applyOfflineFilter();
    seedPlays();
    setTimeout(offlineStartup, 900);
    setTimeout(applyOfflineFilter, 1200);   // əsas skript kartları sonra çəkə bilər
    setTimeout(migratePlaceholders, 2500);  // köhnə "YouTube: ID" adlarını düzəlt
  } catch (e) {
    console.warn("[features] başlanğıc xətası:", e);
  }
})();