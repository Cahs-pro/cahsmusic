/* ═══════════════════════════════════════════════════════════
   Music Universe — Fon rejimi (background.js)
   • Proqramdan çıxanda mahnı bildiriş panelində / kilid ekranında davam edir
   • Bildiriş paneli: şəkil, oynat/dayan, əvvəlki/sonrakı, ±10 san, irəliləyiş zolağı
   • Axın (stream) audiosu üçün pleyer düymələri düzgün işləyir
   index.html-də features.js-dən SONRA yüklənir.
═══════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  try {
    if (typeof S === "undefined" || typeof ldb === "undefined") return;
  } catch (e) { return; }

  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const say = (m, d) => { try { toast(m, d); } catch (_) { console.log(m); } };
  const VID = /^[A-Za-z0-9_-]{11}$/;

  /* ══ DİLLƏR ══ */
  const I18N = {
    az: { bg: "Fon rejimi", bgSub: "Proqramdan çıxanda mahnı bildiriş panelində oxumağa davam etsin", bgOn: "Aktiv", bgOff: "Söndürülüb", bgFail: "⚠ Fon rejimi alınmadı — ⬇ endirilmiş mahnılar həmişə fonda oxuyur" },
    en: { bg: "Background play", bgSub: "Keep playing in the notification bar when you leave the app", bgOn: "On", bgOff: "Off", bgFail: "⚠ Background play failed — downloaded songs always keep playing" },
    ru: { bg: "Фоновый режим", bgSub: "Продолжать играть в шторке уведомлений при выходе из приложения", bgOn: "Вкл", bgOff: "Выкл", bgFail: "⚠ Фон не сработал — загруженные песни всегда играют в фоне" }
  };
  const L = k => { let l = "az"; try { if (I18N[LANG]) l = LANG; } catch (_) {} return (I18N[l] && I18N[l][k]) || I18N.az[k] || k; };

  const css = document.createElement("style");
  css.textContent = ".bg-chip{padding:6px 12px;border-radius:999px;background:var(--c3);color:var(--t2);font:700 .73rem var(--fb);border:1.5px solid var(--bd2);cursor:pointer;white-space:nowrap}.bg-chip.on{background:var(--g);color:#000;border-color:var(--g)}";
  document.head.appendChild(css);

  /* ══ ÜMUMİ KÖMƏKÇİLƏR ══ */
  const bgEnabled = () => { try { return localStorage.getItem("mu_bg") !== "0"; } catch (_) { return true; } };
  const curRate = () => { const r = parseFloat(localStorage.getItem("mu_rate")); return r > 0 ? r : 1; };
  const curAudio = () => S.offAudio || S.streamAudio || null;

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
     FON REJİMİ
     YouTube iframe telefonda proqramdan çıxanda dayanır; <audio> isə
     (endirilmiş mahnı / axın) bildiriş panelində davam edir.
  ════════════════════════════════════════════ */
  let _ytFlipped = false, _hidT = 0, _handoffBusy = false, _handoffFail = false;

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
        _handoffFail = true;                                    // alınmadı: iframe-i qaldığı yerdə hazırla
        flipYt(false);
        try { S.ytp.cueVideoById({ videoId: song.videoId, startSeconds: t }); } catch (_) {}
      }
    } finally { _handoffBusy = false; }
  }

  async function backgroundCheck(song, ytWas, t, audioWas) {
    if (!document.hidden) return;                               // artıq qayıdıb
    if (ytWas && song) {
      let st = -2; try { st = S.ytp.getPlayerState(); } catch (_) {}
      if (st === 1 || st === 3) return;                         // brauzer iframe-i dayandırmayıb — lazım deyil
      const cur = S.list[S.idx];
      if (!cur || cur.videoId !== song.videoId || !navigator.onLine) return;
      await handoff(cur, t);
    } else if (audioWas) {
      flipYt(true);                                             // endirilmiş mahnıdan sonra gələnlər də fonda çalsın
    }
  }

  function onHide() {
    clearTimeout(_hidT);
    if (!bgEnabled()) return;
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
    if (_handoffFail) { _handoffFail = false; say(L("bgFail"), 6000); }
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
     PARAMETRLƏRDƏ AÇAR
  ════════════════════════════════════════════ */
  function bgRow() {
    const on = bgEnabled();
    return '<div class="settings-row" id="mu-set-bg">' +
      '<div><div class="settings-lbl">🎧 ' + esc(L("bg")) + '</div><div class="settings-sub">' + esc(L("bgSub")) + '</div></div>' +
      '<button class="bg-chip' + (on ? " on" : "") + '" id="mu-bg-toggle">' + esc(L(on ? "bgOn" : "bgOff")) + '</button>' +
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
          $("mu-bg-toggle").addEventListener("click", e => {
            const on = !bgEnabled(); try { localStorage.setItem("mu_bg", on ? "1" : "0"); } catch (_) {}
            e.currentTarget.classList.toggle("on", on); e.currentTarget.textContent = L(on ? "bgOn" : "bgOff");
            if (!on) flipYt(false);
          });
        }
      } catch (e) { console.warn("[background] parametrlər:", e); }
      return r;
    };
  }

  try { injectBgControls(); } catch (e) { console.warn("[background] başlanğıc xətası:", e); }
})();