/* ═══════════════════════════════════════════════════════════
   Music Universe — Profil statistikası (stats.js)
   Dostun profilində "Oynatma / Dəqiqə / Endirilmiş" 0 görünürdü, çünki:
     • "Oynatma" yalnız ən çox dinlənən 5 mahnının cəmi idi
     • "Endirilmiş" yalnız öz profilində hesablanırdı (başqası üçün həmişə 0)
     • stats/{uid} oxunmasa xəta səssizcə uddurulurdu
   Həll: hər istifadəçi öz xülasəsini users/{uid}/stats düyününə yazır
   (dostlar ad, e-poçt, VIP, "indi çalınır" kimi onu da oxuya bilir).
   index.html-də features.js-dən SONRA yüklənir.
═══════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  try {
    if (typeof S === "undefined" || typeof FB === "undefined" || typeof fbD === "undefined") return;
  } catch (e) { return; }

  const VID = /^[A-Za-z0-9_-]{11}$/;
  const num = v => { v = Number(v); return Number.isFinite(v) && v >= 0 ? Math.min(Math.round(v), 1e9) : null; };
  const clip = (v, n) => String(v == null ? "" : v).slice(0, n);
  const code = e => (e && (e.code || e.message)) ? String(e.code || e.message).slice(0, 80) : "xəta";
  const ready = () => !!(FB && fbD && S.user && S.user.uid);

  /* ══ DİLLƏR ══ */
  const I18N = {
    az: { plays: "Oynatma", mins: "Dəqiqə", dl: "Endirilmiş", top: "Top Mahnılar", times: "oynatma",
          noSum: "ℹ Bu dostun statistikası hələ paylaşılmayıb. O, tətbiqi yeniləyib bir mahnı çaldıqdan sonra görünəcək",
          noTop: "ℹ Top mahnılar göstərilmir (Firebase oxuma icazəsi yoxdur)" },
    en: { plays: "Plays", mins: "Minutes", dl: "Downloaded", top: "Top songs", times: "plays",
          noSum: "ℹ This friend hasn't shared stats yet. They appear after they update the app and play a song",
          noTop: "ℹ Top songs are hidden (no Firebase read permission)" },
    ru: { plays: "Прослушиваний", mins: "Минут", dl: "Загружено", top: "Топ песни", times: "раз",
          noSum: "ℹ Этот друг ещё не поделился статистикой. Она появится после обновления приложения и первой песни",
          noTop: "ℹ Топ песен скрыт (нет разрешения на чтение в Firebase)" }
  };
  const L = k => { let l = "az"; try { if (I18N[LANG]) l = LANG; } catch (_) {} return (I18N[l] && I18N[l][k]) || I18N.az[k] || k; };

  /* ════════════════════════════════════════════
     1) ÖZ XÜLASƏNİ DÖVRİ OLARAQ YAZ
  ════════════════════════════════════════════ */
  const RESEED_MS = 10 * 60 * 1000;                             // başqa cihazlarda dinlənənləri tutmaq üçün
  let totalPlays = null, seededAt = 0, seeding = null, lastSig = "", lastUid = "", tmr = 0;

  async function seed() {                       // bütün zamanların cəmi: stats/{uid}/songs-un hamısı
    if (!ready()) return;
    if (totalPlays != null) return;
    if (seeding) return seeding;
    seeding = (async () => {
      try {
        const snap = await fbD.ref(`stats/${S.user.uid}/songs`).get();
        let n = 0; snap.forEach(ch => { n += num((ch.val() || {}).count) || 0; });
        totalPlays = n; seededAt = Date.now();
      } catch (e) {
        console.warn("[stats] öz statistikanı oxuya bilmədim:", code(e));
        totalPlays = num(localStorage.getItem("mu_plays_total")) || 0; seededAt = Date.now();
      }
    })();
    try { await seeding; } finally { seeding = null; }
  }

  async function publish(force) {
    if (!ready() || !navigator.onLine) return;
    if (S.user.uid !== lastUid) { lastUid = S.user.uid; lastSig = ""; totalPlays = null; }
    if (totalPlays != null && Date.now() - seededAt > RESEED_MS) totalPlays = null;   // buluddakı real cəmi yenidən oxu
    await seed();
    const plays = totalPlays || 0, dl = S.downloads ? S.downloads.size : 0;
    const sig = plays + "|" + dl;
    if (!force && sig === lastSig) return;                       // dəyişməyibsə yazma
    try {
      await fbD.ref(`users/${S.user.uid}/stats`).set({ plays, mins: Math.round(plays * 3.5), dl, t: Date.now() });
      lastSig = sig;
      try { localStorage.setItem("mu_plays_total", String(plays)); } catch (_) {}
    } catch (e) { console.warn("[stats] xülasəni yaza bilmədim (Firebase qaydaları?):", code(e)); }
  }
  const schedule = ms => { clearTimeout(tmr); tmr = setTimeout(() => { publish(); }, ms); };

  if (typeof window.addToHistory === "function") {               // hər çalmada say artır
    const _add = window.addToHistory;
    window.addToHistory = function () {
      const r = _add.apply(this, arguments);
      try { if (totalPlays != null) totalPlays++; schedule(4000); } catch (_) {}
      return r;
    };
  }
  setInterval(() => { publish(); }, 8000);                       // yüklənmə sayı dəyişsə də tutur; dəyişməyibsə yazmır
  document.addEventListener("visibilitychange", () => { if (document.hidden) publish(); });
  setTimeout(() => { publish(); }, 3500);

  /* ════════════════════════════════════════════
     2) PROFİL STATİSTİKASI (köhnə funksiyanı əvəz edir)
  ════════════════════════════════════════════ */
  const e2 = s => X(String(s || "").replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/[\r\n]+/g, " "));
  const safeThumb = (t, id) => /^https:\/\//i.test(String(t || "")) ? clip(t, 300) : TH(id);

  async function renderStatsInProfile(uid, container) {
    if (!FB || !fbD || !container) return;
    const self = !!(S.user && uid === S.user.uid);

    const [sRes, tRes] = await Promise.allSettled([
      fbD.ref(`users/${uid}/stats`).get(),                       // dostun paylaşdığı xülasə
      fbD.ref(`stats/${uid}/songs`).get()                        // mahnı-mahnı say (qaydalar icazə verməyə bilər)
    ]);

    let sum = null;
    if (sRes.status === "fulfilled" && sRes.value.exists()) sum = sRes.value.val() || {};
    else if (sRes.status === "rejected") console.warn("[stats] users/" + uid + "/stats oxunmadı:", code(sRes.reason));

    let songs = [], total = null, topBlocked = false;
    if (tRes.status === "fulfilled") {
      const arr = []; let n = 0;
      tRes.value.forEach(ch => {
        const v = ch.val() || {}, c = num(v.count) || 0; n += c;
        if (VID.test(ch.key || "")) arr.push({ videoId: ch.key, title: clip(v.title, 200), artist: clip(v.artist, 120), thumb: v.thumb, count: c });
      });
      arr.sort((a, b) => b.count - a.count);
      songs = arr.slice(0, 5); total = n;
    } else { topBlocked = true; console.warn("[stats] stats/" + uid + "/songs oxunmadı:", code(tRes.reason)); }

    // rəqəmlər: dəqiq mənbə varsa onu, yoxsa dostun xülasəsini götür; bilinmirsə "—"
    let plays = total != null && total > 0 ? total : (sum ? num(sum.plays) : (total != null ? total : null));
    if (self && plays == null && totalPlays != null) plays = totalPlays;
    const mins = plays == null ? null : Math.round(plays * 3.5);
    const dl = self ? (S.downloads ? S.downloads.size : 0) : (sum ? num(sum.dl) : null);
    const show = v => v == null ? "—" : String(v);

    let html = `<div class="stats-grid">` +
      `<div class="stat-card"><div class="stat-num">${show(plays)}</div><div class="stat-lbl">${X(L("plays"))}</div></div>` +
      `<div class="stat-card"><div class="stat-num">${show(mins)}</div><div class="stat-lbl">${X(L("mins"))}</div></div>` +
      `<div class="stat-card"><div class="stat-num">${show(dl)}</div><div class="stat-lbl">${X(L("dl"))}</div></div></div>`;

    if (!self && !sum && plays == null) html += `<div class="settings-sub" style="margin:6px 2px 10px">${X(L("noSum"))}</div>`;

    if (songs.length) {
      html += `<div class="sh" style="margin:6px 0 8px"><span class="dot"></span>${X(L("top"))}</div><div class="top-songs">`;
      songs.forEach((s, i) => {
        const th = safeThumb(s.thumb, s.videoId);
        html += `<div class="top-song-row" onclick="playSong({videoId:'${e2(s.videoId)}',title:'${e2(s.title)}',artist:'${e2(s.artist)}',thumb:'${e2(th)}'})">` +
          `<span class="top-rank${i === 0 ? " gold" : ""}">${i + 1}</span>` +
          `<div class="top-thumb"><img src="${X(th)}" onerror="this.onerror=null;this.src='${PHO}'" alt=""/></div>` +
          `<div class="top-info"><div class="top-tit">${X(s.title)}</div><div class="top-cnt">${s.count} ${X(L("times"))}</div></div></div>`;
      });
      html += `</div>`;
    } else if (topBlocked && !self) {
      html += `<div class="settings-sub" style="margin:6px 2px 10px">${X(L("noTop"))}</div>`;
    }
    container.insertAdjacentHTML("beforeend", html);
  }
  window.renderStatsInProfile = renderStatsInProfile;

  window.MU_PSTATS = { publish, seed, reset() { totalPlays = null; seededAt = 0; lastSig = ""; }, _state: () => ({ totalPlays, lastSig }) };   // sınaq üçün
})();