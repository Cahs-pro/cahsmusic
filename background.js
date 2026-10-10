/* ═══════════════════════════════════════════════════════════
   Music Universe — Fon rejimi (background.js)
   • Proqramdan çıxanda mahnı bildiriş panelində / kilid ekranında davam edir
   • Bildiriş paneli: şəkil, oynat/dayan, əvvəlki/sonrakı, ±10 san, irəliləyiş zolağı
   • Axın (stream) audiosu üçün pleyer düymələri düzgün işləyir
   • 3 rejim: Söndür / Qənaət (API xərci 0) / Tam (gündəlik limitlə)
   index.html-də features.js-dən SONRA yüklənir.
═══════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  try {
    if (typeof S === "undefined" || typeof ldb === "undefined") return;
  } catch (e) { return; }

  /* Tam rejimdə bir gündə fonda API ilə axıdıla bilən maksimum mahnı sayı.
     Hər mahnı RapidAPI-yə 1–5 sorğu ola bilər. Kvotan azdırsa, rəqəmi azalt. */
  const BG_DAILY_CAP = 10;

  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const say = (m, d) => { try { toast(m, d); } catch (_) { console.log(m); } };
  const VID = /^[A-Za-z0-9_-]{11}$/;

  /* ══ DİLLƏR ══ */
  const I18N = {
    az: {
      bgDesk: "Bu cihaz kompüterdir: brauzer fonda özü oxumağa davam edir, bu rejim yalnız telefon/planşet üçündür.",
      bgEq: "ℹ Ekvalayzer aktivdir, telefonda fonda səs kəsilə bilər. Parametrlərdə «Sıfırla» bas",
      bg: "Fon rejimi", bgSub: "Proqramdan çıxanda mahnı bildiriş panelində oxumağa davam etsin",
      bgOff: "Söndür", bgSave: "Qənaət", bgFull: "Tam",
      bgHelp1: "Qənaət: yalnız ⬇ endirilmiş mahnılar fonda oxuyur. API xərci yoxdur.",
      bgHelp2: "Tam: endirilməmiş mahnılar da fonda oxuyur, amma hər biri API sorğusu sayılır (gündə ən çox {cap} mahnı).",
      bgHelp0: "Fonda heç nə dəyişmir (brauzerin standart davranışı).",
      bgUsed: "Bu gün fonda axıdılan: {n} / {cap}",
      bgFail: "⚠ Fon rejimi alınmadı — ⬇ endirilmiş mahnılar həmişə fonda oxuyur",
      bgCap: "ℹ Bu günkü fon limiti ({cap}) dolub — yalnız endirilmiş mahnılar fonda oxuyacaq",
      bgHint: "ℹ Fon rejimi (Qənaət): bu mahnı endirilməyib, ona görə fonda dayandı. ⬇ Endir və ya Parametrlərdə «Tam» seç"
    },
    en: {
      bgDesk: "This is a computer: the browser keeps playing in the background by itself. This mode is for phones/tablets only.",
      bgEq: "ℹ The equalizer is on, so sound may cut out in the background on phones. Press “Reset” in Settings",
      bg: "Background play", bgSub: "Keep playing in the notification bar when you leave the app",
      bgOff: "Off", bgSave: "Saver", bgFull: "Full",
      bgHelp1: "Saver: only ⬇ downloaded songs keep playing in the background. No API cost.",
      bgHelp2: "Full: non-downloaded songs play too, but each one costs an API request (max {cap} songs per day).",
      bgHelp0: "Nothing changes in the background (browser default).",
      bgUsed: "Streamed in background today: {n} / {cap}",
      bgFail: "⚠ Background play failed — downloaded songs always keep playing",
      bgCap: "ℹ Today's background limit ({cap}) is reached — only downloaded songs will keep playing",
      bgHint: "ℹ Background (Saver): this song isn't downloaded, so it stopped. ⬇ Download it or choose “Full” in Settings"
    },
    ru: {
      bgDesk: "Это компьютер: браузер сам продолжает играть в фоне. Режим нужен только для телефона/планшета.",
      bgEq: "ℹ Эквалайзер включён, на телефоне звук в фоне может пропадать. Нажмите «Сбросить» в настройках",
      bg: "Фоновый режим", bgSub: "Продолжать играть в шторке уведомлений при выходе из приложения",
      bgOff: "Выкл", bgSave: "Экономия", bgFull: "Полный",
      bgHelp1: "Экономия: в фоне играют только ⬇ загруженные песни. Без расхода API.",
      bgHelp2: "Полный: играют и незагруженные, но каждая — запрос к API (не больше {cap} песен в день).",
      bgHelp0: "В фоне ничего не меняется (поведение браузера).",
      bgUsed: "Сегодня потоком в фоне: {n} / {cap}",
      bgFail: "⚠ Фон не сработал — загруженные песни всегда играют в фоне",
      bgCap: "ℹ Дневной лимит фона ({cap}) исчерпан — в фоне будут играть только загруженные",
      bgHint: "ℹ Фон (Экономия): песня не загружена, поэтому остановилась. ⬇ Загрузите её или выберите «Полный» в настройках"
    }
  };
  const L = (k, p) => {
    let l = "az"; try { if (I18N[LANG]) l = LANG; } catch (_) {}
    let s = (I18N[l] && I18N[l][k]) || I18N.az[k] || k;
    if (p) Object.keys(p).forEach(n => { s = s.replace("{" + n + "}", p[n]); });
    return s;
  };

  const css = document.createElement("style");
  css.textContent =
    ".bg-chips{display:flex;gap:6px;flex-wrap:wrap}" +
    ".bg-chip{padding:6px 12px;border-radius:999px;background:var(--c3);color:var(--t2);font:700 .73rem var(--fb);border:1.5px solid var(--bd2);cursor:pointer;white-space:nowrap}" +
    ".bg-chip.on{background:var(--g);color:#000;border-color:var(--g)}";
  document.head.appendChild(css);

  /* ══ REJİM + GÜNDƏLİK SAYĞAC ══ */
  // 0 = söndürülüb, 1 = qənaət (standart, API xərci 0), 2 = tam
  const bgMode = () => { try { const v = localStorage.getItem("mu_bg"); return v === "0" ? 0 : v === "2" ? 2 : 1; } catch (_) { return 1; } };
  const dayKey = () => { const d = new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); };
  function bgUsed() {
    try { const o = JSON.parse(localStorage.getItem("mu_bg_cnt") || "null"); return (o && o.d === dayKey()) ? (o.n | 0) : 0; } catch (_) { return 0; }
  }
  function bgSpend() { try { localStorage.setItem("mu_bg_cnt", JSON.stringify({ d: dayKey(), n: bgUsed() + 1 })); } catch (_) {} }
  const bgCanStream = () => bgMode() === 2 && bgUsed() < BG_DAILY_CAP;

  /* Fon məntiqi yalnız telefon/planşetdə lazımdır: orada YouTube iframe fonda dayanır.
     Kompüterdə brauzer başqa tabda özü oxumağa davam edir — heç nəyə toxunmuruq.
     (Kompüterdə sınamaq üçün konsolda: localStorage.mu_bg_force = "1") */
  const isTouch = () => {
    try {
      if (localStorage.getItem("mu_bg_force") === "1") return true;
      const ua = navigator.userAgent || "";
      return /Android|iPhone|iPad|iPod|Mobile/i.test(ua) ||
        (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ||
        matchMedia("(hover: none) and (pointer: coarse)").matches;
    } catch (_) { return false; }
  };
  const bgActive = () => bgMode() !== 0 && isTouch();

  /* ENDİRİLMİŞ MAHNILAR FONDA NİYƏ OXUMURDU:
     əsas skript HƏR endirilmiş mahnını Web Audio qrafindən (ekvalayzer) keçirir —
     ekvalayzer 0 dB olanda belə. Telefonda Web Audio çıxışı proqramdan çıxanda
     susdurulur. Telefonda ekvalayzer sıfırdırsa qrafı qurmuruq: <audio> birbaşa
     çıxır, fonda və bildiriş panelində davam edir. */
  const eqFlat = () => { const e = S.eq || {}; return !e.bass && !e.mid && !e.treble; };
  if (typeof window.buildAudioGraph === "function") {
    const _bag = window.buildAudioGraph;
    window.buildAudioGraph = function () {
      try { if (isTouch() && eqFlat()) return false; } catch (_) {}
      return _bag.apply(this, arguments);
    };
  }

  const curRate = () => { const r = parseFloat(localStorage.getItem("mu_rate")); return r > 0 ? r : 1; };
  const curAudio = () => S.offAudio || S.streamAudio || null;
  const isDl = id => !!((S.downloads && S.downloads.has(id)) || (S.offline && S.offline.has(id)));

  function togglePlay() {
    const a = curAudio();
    if (a) { if (a.paused) { const p = a.play(); if (p && p.catch) p.catch(() => {}); } else a.pause(); return; }
    if (S.ytOk && S.ytp) {
      if (S.idx < 0) { try { playSong(S.list[0]); } catch (_) {} return; }
      try { S.playing ? S.ytp.pauseVideo() : S.ytp.playVideo(); } catch (_) {}
    }
  }

  function pos() {
    const a = curAudio();
    if (a) return { c: a.currentTime, d: a.duration };
    if (S.ytOk && S.ytp && S.ytp.getCurrentTime) { try { return { c: S.ytp.getCurrentTime(), d: S.ytp.getDuration() }; } catch (_) {} }
    return null;
  }
  function seekAbs(sec) {
    const a = curAudio();
    if (a) { if (isFinite(a.duration)) a.currentTime = Math.max(0, Math.min(sec, a.duration)); return; }
    if (S.ytOk && S.ytp) { try { S.ytp.seekTo(sec, true); } catch (_) {} }
  }
  function seekRel(delta) { const p = pos(); if (p) seekAbs((p.c || 0) + delta); }

  /* ════════════════════════════════════════════
     BİLDİRİŞ PANELİ / KİLİD EKRANI (Media Session)
  ════════════════════════════════════════════ */
  function setMSState(st) {
    if (!("mediaSession" in navigator)) return;
    try {
      if (st === "play") navigator.mediaSession.playbackState = "playing";
      else if (st === "pause") navigator.mediaSession.playbackState = "paused";
    } catch (_) {}
  }
  if (typeof window.setPUI === "function") {
    const _setPUI = window.setPUI;
    window.setPUI = function (st) {
      const r = _setPUI.apply(this, arguments);
      setMSState(st);
      return r;
    };
  }

  function enhanceMS(song) {
    if (!("mediaSession" in navigator) || !song) return;
    const ms = navigator.mediaSession;
    try {
      const base = VID.test(song.videoId || "") ? "https://i.ytimg.com/vi/" + song.videoId + "/" : "";
      ms.metadata = new MediaMetadata({
        title: song.title || "Music Universe", artist: song.artist || "", album: "Music Universe",
        artwork: base ? [
          { src: base + "mqdefault.jpg", sizes: "320x180", type: "image/jpeg" },
          { src: base + "hqdefault.jpg", sizes: "480x360", type: "image/jpeg" },
          { src: base + "sddefault.jpg", sizes: "640x480", type: "image/jpeg" }
        ] : []
      });
    } catch (_) {}
    const h = (n, f) => { try { ms.setActionHandler(n, f); } catch (_) {} };
    h("play", () => {
      const a = curAudio();
      if (a) { const p = a.play(); if (p && p.catch) p.catch(() => {}); }
      else if (S.ytOk && S.ytp) { try { S.ytp.playVideo(); } catch (_) {} }
    });
    h("pause", () => {
      const a = curAudio();
      if (a) a.pause();
      else if (S.ytOk && S.ytp) { try { S.ytp.pauseVideo(); } catch (_) {} }
    });
    h("seekto", d => { if (d && isFinite(d.seekTime)) seekAbs(d.seekTime); });
    h("seekbackward", d => seekRel(-((d && d.seekOffset) || 10)));
    h("seekforward", d => seekRel((d && d.seekOffset) || 10));
  }

  if (typeof window.updateMediaSession === "function") {
    const _ums = window.updateMediaSession;
    window.updateMediaSession = function (song) {
      const r = _ums.apply(this, arguments);
      try { enhanceMS(song); } catch (_) {}
      return r;
    };
  }

  // Bildirişdəki irəliləyiş zolağı
  setInterval(() => {
    if (!("mediaSession" in navigator) || !navigator.mediaSession.setPositionState) return;
    const p = pos();
    if (!p || !isFinite(p.d) || p.d <= 0) return;
    try { navigator.mediaSession.setPositionState({ duration: p.d, playbackRate: curRate(), position: Math.max(0, Math.min(p.c || 0, p.d)) }); } catch (_) {}
  }, 1000);

  /* ════════════════════════════════════════════
     API XƏRCİNƏ NƏZARƏT
     • Fonda hər axın (streamPlay) sayılır və gündəlik limitə baxılır
     • Qənaət rejimində fonda axın ümumiyyətlə başlamır
     • Fonda "sonrakı" yalnız ⬇ endirilmiş mahnılara keçir
  ════════════════════════════════════════════ */
  let _hint = "";                                   // geri qayıdanda göstəriləcək mesaj: "save" | "cap" | "fail" | "eq"

  if (typeof window.streamPlay === "function") {
    const _sp = window.streamPlay;
    window.streamPlay = function () {
      if (document.hidden && bgActive()) {
        if (!bgCanStream()) {
          if (bgMode() === 2) _hint = "cap";
          S.playing = false; try { setPUI("pause"); } catch (_) {}
          return Promise.resolve();
        }
        bgSpend();
      }
      return _sp.apply(this, arguments);
    };
  }

  function nextDownloaded() {
    const n = S.list.length; if (!n) return -1;
    if (S.shuffle) {
      const c = []; S.list.forEach((s, i) => { if (i !== S.idx && isDl(s.videoId)) c.push(i); });
      return c.length ? c[Math.floor(Math.random() * c.length)] : -1;
    }
    for (let k = 1; k < n; k++) { const i = (S.idx + k) % n; if (isDl(S.list[i].videoId)) return i; }
    return -1;
  }

  if (typeof window.nextSong === "function") {
    const _next = window.nextSong;
    window.nextSong = function () {
      if (document.hidden && bgActive() && !bgCanStream()) {
        const i = nextDownloaded();
        if (i >= 0) { playSong(S.list[i]); }
        else { S.playing = false; try { setPUI("pause"); } catch (_) {} }
        return;
      }
      return _next.apply(this, arguments);
    };
  }

  /* ════════════════════════════════════════════
     FON REJİMİ (Tam): YouTube iframe fonda dayanır → <audio>-ya keç
  ════════════════════════════════════════════ */
  let _ytFlipped = false, _hidT = 0, _handoffBusy = false;

  // Fonda növbəti mahnılar iframe əvəzinə audio ilə çalsın (playSong S.ytOk-a baxır)
  function flipYt(on) {
    if (on && !_ytFlipped && S.ytOk) { _ytFlipped = true; S.ytOk = false; }
    else if (!on && _ytFlipped) { _ytFlipped = false; S.ytOk = true; }
  }

  // iframe dayanıb: eyni saniyədən <audio>-ya keç
  async function handoff(song, t) {
    if (_handoffBusy || typeof streamPlay !== "function") return;
    _handoffBusy = true;
    try {
      flipYt(true);
      try { S.ytp.stopVideo(); } catch (_) {}
      try { stopTimer(); } catch (_) {}
      S.playing = false;
      try { await streamPlay(song); } catch (_) {}
      const a = S.streamAudio;
      if (a && !a.paused) {
        if (t > 1) { try { a.currentTime = t; } catch (_) {} }
      } else {
        if (!_hint) _hint = "fail";                              // alınmadı: iframe-i qaldığı yerdə hazırla
        flipYt(false);
        try { S.ytp.cueVideoById({ videoId: song.videoId, startSeconds: t }); } catch (_) {}
      }
    } finally { _handoffBusy = false; }
  }

  async function backgroundCheck(song, ytWas, t, audioWas) {
    if (!document.hidden) return;                               // artıq qayıdıb
    const mode = bgMode();
    if (ytWas && song) {
      let st = -2; try { st = S.ytp.getPlayerState(); } catch (_) {}
      if (st === 1 || st === 3) return;                         // brauzer iframe-i dayandırmayıb — lazım deyil
      if (mode === 1) { _hint = "save"; return; }               // Qənaət: API çağırışı yoxdur
      if (!bgCanStream()) { _hint = "cap"; return; }            // Tam, amma limit dolub
      const cur = S.list[S.idx];
      if (!cur || cur.videoId !== song.videoId || !navigator.onLine) return;
      await handoff(cur, t);
    } else if (audioWas && mode === 2 && bgCanStream()) {
      flipYt(true);                                             // endirilmiş mahnıdan sonra gələnlər də fonda çalsın
    }
  }

  function onHide() {
    clearTimeout(_hidT);
    try { if (isTouch() && S.eqNodes && S.offAudio && S.playing && !_hint) _hint = "eq"; } catch (_) {}
    if (!bgActive()) return;
    try { if (S.audioCtx && S.audioCtx.state === "suspended") S.audioCtx.resume(); } catch (_) {}
    const song = S.list[S.idx];
    const ytWas = !!(S.ytOk && S.ytp && !S.offAudio && !S.streamAudio && S.playing);
    let t = 0; try { if (ytWas) t = S.ytp.getCurrentTime() || 0; } catch (_) {}
    const audioWas = !!(S.offAudio || S.streamAudio);
    _hidT = setTimeout(() => { backgroundCheck(song, ytWas, t, audioWas); }, 1200);
  }

  function onShow() {
    clearTimeout(_hidT);
    flipYt(false);
    const a = curAudio();
    if (a) { S.playing = !a.paused; try { setPUI(a.paused ? "pause" : "play"); } catch (_) {} }   // pleyerin vəziyyətini sinxronla
    const h = _hint; _hint = "";
    if (h === "eq") say(L("bgEq"), 7000);
    else if (h === "fail") say(L("bgFail"), 6000);
    else if (h === "cap") say(L("bgCap", { cap: BG_DAILY_CAP }), 6000);
    else if (h === "save") {                                    // sessiyada bir dəfə
      try { if (sessionStorage.getItem("mu_bg_hint")) return; sessionStorage.setItem("mu_bg_hint", "1"); } catch (_) {}
      say(L("bgHint"), 7000);
    }
  }

  document.addEventListener("visibilitychange", () => { document.hidden ? onHide() : onShow(); });

  // Axın (stream) audiosu üçün düymələr: əsas skript yalnız iframe/endirilmiş faylı idarə edir
  function injectBgControls() {
    const bp = $("b-play");
    if (bp) bp.addEventListener("click", e => {
      if (S.streamAudio && !S.offAudio) { e.stopImmediatePropagation(); togglePlay(); }
    }, true);
    const pt = $("ptrack");
    if (pt) pt.addEventListener("click", e => {
      if (S.streamAudio && !S.offAudio) {
        e.stopImmediatePropagation();
        const r = pt.getBoundingClientRect(), p = (e.clientX - r.left) / r.width, a = S.streamAudio;
        if (a.duration && isFinite(a.duration)) a.currentTime = Math.max(0, Math.min(1, p)) * a.duration;
      }
    }, true);
    const vt = $("vtrack");
    if (vt) vt.addEventListener("click", () => { if (S.streamAudio) { try { S.streamAudio.volume = S.vol / 100; } catch (_) {} } });
  }

  /* ════════════════════════════════════════════
     PARAMETRLƏRDƏ REJİM SEÇİMİ
  ════════════════════════════════════════════ */
  const helpText = m => m === 2 ? L("bgHelp2", { cap: BG_DAILY_CAP }) : m === 1 ? L("bgHelp1") : L("bgHelp0");
  const usedText = () => L("bgUsed", { n: bgUsed(), cap: BG_DAILY_CAP });

  function bgRow() {
    const m = bgMode();
    const chip = (v, k) => '<button class="bg-chip' + (m === v ? " on" : "") + '" data-m="' + v + '">' + esc(L(k)) + '</button>';
    return '<div class="settings-row" id="mu-set-bg" style="flex-direction:column;align-items:flex-start;gap:8px">' +
      '<div><div class="settings-lbl">🎧 ' + esc(L("bg")) + '</div><div class="settings-sub">' + esc(L("bgSub")) + '</div></div>' +
      '<div class="bg-chips">' + chip(0, "bgOff") + chip(1, "bgSave") + chip(2, "bgFull") + '</div>' +
      '<div class="settings-sub" id="mu-bg-help">' + esc(helpText(m)) + '</div>' +
      (isTouch() ? '' : '<div class="settings-sub" id="mu-bg-desk" style="color:var(--g)">' + esc(L("bgDesk")) + '</div>') +
      '<div class="settings-sub" id="mu-bg-used"' + (m === 2 ? "" : ' style="display:none"') + '>' + esc(usedText()) + '</div>' +
      '</div>';
  }

  if (typeof window.openSettings === "function") {
    const _open = window.openSettings;
    window.openSettings = function () {
      const r = _open.apply(this, arguments);
      try {
        const b = $("m-settings-b");
        if (b && !$("mu-set-bg")) {
          const anchor = $("mu-set-recap");                     // features.js sətirləri varsa, onlardan əvvələ
          if (anchor) anchor.insertAdjacentHTML("beforebegin", bgRow()); else b.insertAdjacentHTML("beforeend", bgRow());
          $("mu-set-bg").querySelectorAll(".bg-chip").forEach(c => c.addEventListener("click", () => {
            const m = parseInt(c.dataset.m, 10);
            try { localStorage.setItem("mu_bg", String(m)); } catch (_) {}
            $("mu-set-bg").querySelectorAll(".bg-chip").forEach(x => x.classList.toggle("on", x === c));
            $("mu-bg-help").textContent = helpText(m);
            const u = $("mu-bg-used"); u.textContent = usedText(); u.style.display = m === 2 ? "" : "none";
            if (m !== 2) flipYt(false);
          }));
        }
      } catch (e) { console.warn("[background] parametrlər:", e); }
      return r;
    };
  }

  try { injectBgControls(); } catch (e) { console.warn("[background] başlanğıc xətası:", e); }
})();