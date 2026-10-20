/* ═══════════════════════════════════════════════════════════
   Music Universe — extras.js
   1) Mahnı sözləri (LRCLIB, /api/lyrics)
   2) Radio / ağıllı mix (/api/related)
   3) Otaq reaksiyaları (Firebase, üzən emoji)
   4) Dostlarla həftəlik liderlik tablosu
   5) Ortaq playlistlər (Firebase, link ilə qoşulma)
   6) Seriya və dinləmə nişanları (profil)
   plus.js-dən SONRA yüklənir.
═══════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  try {
    if (typeof S === "undefined" || typeof ldb === "undefined") return;
  } catch (e) { return; }

  /* ══ KÖMƏKÇİLƏR ══ */
  const $ = id => document.getElementById(id);
  const say = (m, d) => { try { toast(m, d); } catch (_) { console.log(m); } };
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const VID = /^[A-Za-z0-9_-]{11}$/;
  const clip = (v, max) => String(v == null ? "" : v).slice(0, max);
  const hasFB = () => (typeof FB !== "undefined") && FB && typeof fbD !== "undefined" && !!fbD;
  const me = () => (S.user || null);
  const thumbOf = v => { try { return TH(v); } catch (_) { return "https://img.youtube.com/vi/" + v + "/mqdefault.jpg"; } };
  const curSong = () => (S.idx >= 0 && S.list[S.idx]) ? S.list[S.idx] : null;
  const privStats = () => { try { return window.MU_PRIV_ON("stats"); } catch (_) { return true; } };

  /* ══ DİLLƏR ══ */
  const I18N = {
    az: {
      lyrics: "Sözlər", lyLoading: "Sözlər axtarılır…", lyNone: "Bu mahnının sözləri tapılmadı 😔",
      lyNoSong: "⚠ Əvvəlcə mahnı seçin", lySrc: "Mənbə: LRCLIB",
      radio: "Radio", radioOn: "📻 Radio aktiv — oxşar mahnılar avtomatik çalınacaq", radioOff: "📻 Radio söndürüldü",
      radioLoad: "📻 Oxşar mahnılar axtarılır…", radioFail: "Oxşar mahnı tapılmadı — növbəti çalınır",
      reactT: "Reaksiya göndər",
      board: "Liderlik", boardSub: "Bu həftə dostlar arasında", boardEmpty: "Bu həftə hələ heç kim dinləməyib — ilk sən ol! 🎧",
      you: "sən", plays: "dinləmə", mins: "dəq",
      collab: "Ortaq playlistlər", collabSub: "Dostlarla birlikdə doldurun",
      collabNew: "Yeni ortaq playlist", collabNamePh: "Playlist adı…", collabCreate: "Yarat",
      collabJoinPh: "Qoşulma kodu", collabJoin: "Qoşul",
      collabEmpty: "Hələ ortaq playlist yoxdur", collabNoSongs: "Playlist boşdur — ilk mahnını əlavə et!",
      collabCopied: "🔗 Playlist linki kopyalandı — dostlara göndər",
      collabAddCur: "＋ Cari mahnını əlavə et", collabAdded: "✅ Mahnı əlavə edildi",
      collabDel: "Playlisti sil", collabLeave: "Playlistdən çıx", collabDeleted: "Playlist silindi",
      collabLeft: "Playlistdən çıxdın", collabPlay: "▶ Hamısını çal", collabMembers: "üzv",
      addedBy: "əlavə etdi:", needLogin: "Bunun üçün Google ilə daxil ol",
      collabBad: "⚠ Kod düzgün deyil", collab404: "❌ Playlist tapılmadı",
      badges: "Nişanlar", badgeNew: "🏅 Yeni nişan qazandın: ",
      streakB: "günlük seriya", playsB: "dinləmə", locked: "açılmayıb",
    },
    en: {
      lyrics: "Lyrics", lyLoading: "Looking for lyrics…", lyNone: "No lyrics found for this song 😔",
      lyNoSong: "⚠ Pick a song first", lySrc: "Source: LRCLIB",
      radio: "Radio", radioOn: "📻 Radio on — similar songs will play automatically", radioOff: "📻 Radio off",
      radioLoad: "📻 Finding similar songs…", radioFail: "No similar song found — playing next",
      reactT: "Send a reaction",
      board: "Leaderboard", boardSub: "This week among friends", boardEmpty: "Nobody listened this week yet — be the first! 🎧",
      you: "you", plays: "plays", mins: "min",
      collab: "Shared playlists", collabSub: "Fill them together with friends",
      collabNew: "New shared playlist", collabNamePh: "Playlist name…", collabCreate: "Create",
      collabJoinPh: "Join code", collabJoin: "Join",
      collabEmpty: "No shared playlists yet", collabNoSongs: "Playlist is empty — add the first song!",
      collabCopied: "🔗 Playlist link copied — send it to friends",
      collabAddCur: "＋ Add current song", collabAdded: "✅ Song added",
      collabDel: "Delete playlist", collabLeave: "Leave playlist", collabDeleted: "Playlist deleted",
      collabLeft: "Left the playlist", collabPlay: "▶ Play all", collabMembers: "members",
      addedBy: "added by", needLogin: "Sign in with Google for this",
      collabBad: "⚠ Invalid code", collab404: "❌ Playlist not found",
      badges: "Badges", badgeNew: "🏅 New badge earned: ",
      streakB: "day streak", playsB: "plays", locked: "locked",
    },
    ru: {
      lyrics: "Текст", lyLoading: "Ищу текст…", lyNone: "Текст этой песни не найден 😔",
      lyNoSong: "⚠ Сначала выбери песню", lySrc: "Источник: LRCLIB",
      radio: "Радио", radioOn: "📻 Радио включено — похожие песни будут играть автоматически", radioOff: "📻 Радио выключено",
      radioLoad: "📻 Ищу похожие песни…", radioFail: "Похожие песни не найдены — играю следующую",
      reactT: "Отправить реакцию",
      board: "Лидеры", boardSub: "На этой неделе среди друзей", boardEmpty: "На этой неделе ещё никто не слушал — будь первым! 🎧",
      you: "ты", plays: "прослушиваний", mins: "мин",
      collab: "Общие плейлисты", collabSub: "Наполняйте вместе с друзьями",
      collabNew: "Новый общий плейлист", collabNamePh: "Название плейлиста…", collabCreate: "Создать",
      collabJoinPh: "Код доступа", collabJoin: "Войти",
      collabEmpty: "Общих плейлистов пока нет", collabNoSongs: "Плейлист пуст — добавь первую песню!",
      collabCopied: "🔗 Ссылка скопирована — отправь друзьям",
      collabAddCur: "＋ Добавить текущую песню", collabAdded: "✅ Песня добавлена",
      collabDel: "Удалить плейлист", collabLeave: "Выйти из плейлиста", collabDeleted: "Плейлист удалён",
      collabLeft: "Ты вышел из плейлиста", collabPlay: "▶ Играть все", collabMembers: "участников",
      addedBy: "добавил(а)", needLogin: "Для этого войди через Google",
      collabBad: "⚠ Неверный код", collab404: "❌ Плейлист не найден",
      badges: "Значки", badgeNew: "🏅 Новый значок: ",
      streakB: "дней подряд", playsB: "прослушиваний", locked: "закрыт",
    }
  };
  const curLang = () => { try { return I18N[LANG] ? LANG : "az"; } catch (_) { return "az"; } };
  const L = k => (I18N[curLang()] || I18N.az)[k] ?? I18N.az[k] ?? k;

  /* ══ CSS ══ */
  const css = document.createElement("style");
  css.id = "mu-extras-css";
  css.textContent = `
.mu-xbtn.on{color:var(--g)!important;background:var(--gd)}
.mu-ly-box{max-height:52vh;overflow-y:auto;padding:6px 4px;font-size:.88rem;line-height:1.85;color:var(--tx);white-space:pre-wrap}
.mu-ly-src{margin-top:10px;font-size:.66rem;color:var(--t3);text-align:right}
.mu-float-wrap{position:fixed;right:16px;bottom:calc(var(--pl) + 26px);z-index:1500;pointer-events:none;width:70px;height:230px;overflow:hidden}
.mu-float{position:absolute;bottom:0;left:50%;font-size:25px;transform:translateX(-50%);animation:muFloatUp 2.7s ease-out forwards;pointer-events:none;filter:drop-shadow(0 2px 5px rgba(0,0,0,.45))}
@keyframes muFloatUp{0%{transform:translateX(-50%) translateY(0) scale(.5);opacity:0}12%{opacity:1;transform:translateX(-50%) translateY(-20px) scale(1)}100%{transform:translateX(-50%) translateY(-200px) scale(1.15);opacity:0}}
.mu-react-bar{display:flex;gap:6px;margin:8px 0}
.mu-react-bar button{flex:1;font-size:19px;padding:8px 0;border-radius:10px;background:var(--c3);border:1.5px solid var(--bd2);cursor:pointer;transition:transform .12s}
.mu-react-bar button:hover{transform:scale(1.12);background:var(--c4)}
.mu-react-lbl{font-size:.7rem;color:var(--t3);margin-top:2px}
.mu-board-row{display:flex;align-items:center;gap:10px;padding:9px 6px;border-bottom:1px solid var(--bd2)}
.mu-board-row:last-child{border-bottom:none}
.mu-board-row.me{background:var(--gd);border-radius:10px;border-bottom-color:transparent}
.mu-brank{width:26px;text-align:center;font:800 .95rem var(--fh);color:var(--t3)}
.mu-bav{width:32px;height:32px;border-radius:50%;object-fit:cover}
.mu-bname{flex:1;font-weight:700;font-size:.84rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mu-bval{font-size:.73rem;color:var(--t2);font-weight:700;white-space:nowrap}
.mu-badges{display:flex;flex-wrap:wrap;gap:7px;margin:8px 0 4px}
.mu-badge{display:inline-flex;align-items:center;gap:5px;padding:5px 10px;border-radius:999px;background:var(--gd);border:1.5px solid rgba(30,215,96,.3);font:700 .72rem var(--fb);color:var(--tx)}
.mu-badge.off{background:var(--c3);border-color:var(--bd2);color:var(--t3);filter:grayscale(1);opacity:.55}
.mu-colab-row{display:flex;align-items:center;gap:10px;padding:10px;border-radius:12px;background:var(--c2);border:1.5px solid var(--bd2);margin-bottom:7px;cursor:pointer}
.mu-colab-row:hover{border-color:var(--g)}
.mu-clist{margin-top:10px}
.mu-csong{display:flex;align-items:center;gap:9px;padding:7px 4px;border-bottom:1px solid var(--bd2);cursor:pointer}
.mu-csong:last-child{border-bottom:none}
.mu-csong img{width:38px;height:38px;border-radius:7px;object-fit:cover}
.mu-csong .t{flex:1;min-width:0}
.mu-csong .tt{font-weight:700;font-size:.8rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mu-csong .ta{font-size:.68rem;color:var(--t3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mu-cdel{background:none;border:none;color:var(--t3);cursor:pointer;font-size:14px;padding:6px}
.mu-cdel:hover{color:var(--red)}
`;
  document.head.appendChild(css);

  /* ── Dinamik modal (overlay) ── */
  function ensureOverlay(id, maxW) {
    let ov = $(id);
    if (ov) return ov;
    ov = document.createElement("div");
    ov.className = "moverlay"; ov.id = id;
    ov.innerHTML = `<div class="mbox" role="dialog" aria-modal="true" style="max-width:${maxW || 420}px">
      <button class="mcls" aria-label="Bağla">✕</button>
      <div id="${id}-b"></div></div>`;
    ov.querySelector(".mcls").addEventListener("click", () => closeM(id));
    ov.addEventListener("click", e => { if (e.target === ov) closeM(id); });
    document.body.appendChild(ov);
    return ov;
  }

  /* ════════════════════════════════════════════
     1) MAHNI SÖZLƏRİ
  ════════════════════════════════════════════ */
  const stripNoise = t => String(t || "")
    .replace(/[\(\[][^\)\]]*(official|video|lyric|lyrics|audio|hd|4k|mv|clip|visualizer|remastered)[^\)\]]*[\)\]]/gi, "")
    .replace(/\s{2,}/g, " ").trim();

  async function openLyrics() {
    const s = curSong();
    if (!s) { say(L("lyNoSong")); return; }
    ensureOverlay("m-lyrics", 430);
    const b = $("m-lyrics-b");
    b.innerHTML = `<div class="mtit">📝 ${esc(L("lyrics"))}</div>
      <div style="font-weight:800;font-size:.9rem">${esc(s.title)}</div>
      <div style="font-size:.75rem;color:var(--t3);margin-bottom:8px">${esc(s.artist)}</div>
      <div class="mu-ly-box" style="color:var(--t3)">⏳ ${esc(L("lyLoading"))}</div>`;
    openM("m-lyrics");

    let dur = 0;
    try {
      if (S.ytOk && S.ytp && S.ytp.getDuration) dur = S.ytp.getDuration() || 0;
      else if (S.offAudio) dur = S.offAudio.duration || 0;
      else if (S.streamAudio) dur = S.streamAudio.duration || 0;
    } catch (_) {}

    const artist = (s.artist && s.artist !== "YouTube") ? s.artist : "";
    const track = stripNoise(s.title) || s.title;
    try {
      const r = await fetch("/api/lyrics?track=" + encodeURIComponent(track) +
        (artist ? "&artist=" + encodeURIComponent(artist) : "") +
        (dur ? "&dur=" + Math.round(dur) : ""));
      const j = await r.json();
      const box = b.querySelector(".mu-ly-box");
      if (!box) return;
      if (j && j.found && j.lyrics) {
        box.style.color = "";
        box.textContent = j.lyrics;
        box.insertAdjacentHTML("afterend", `<div class="mu-ly-src">${esc(L("lySrc"))}</div>`);
      } else {
        box.innerHTML = `<div style="text-align:center;padding:26px 10px">${esc(L("lyNone"))}</div>`;
      }
    } catch (e) {
      const box = b.querySelector(".mu-ly-box");
      if (box) box.innerHTML = `<div style="text-align:center;padding:26px 10px">${esc(L("lyNone"))}</div>`;
    }
  }

  /* ════════════════════════════════════════════
     2) RADİO / AĞILLI MİX
     Mahnı bitəndə /api/related ilə oxşar mahnı seçilir.
  ════════════════════════════════════════════ */
  let radioOn = false;
  try { radioOn = localStorage.getItem("mu_radio") === "1"; } catch (_) {}
  const relCache = {};   // videoId -> [id...]

  function setRadio(on) {
    radioOn = !!on;
    try { localStorage.setItem("mu_radio", on ? "1" : "0"); } catch (_) {}
    document.querySelectorAll(".mu-radio-btn").forEach(b => b.classList.toggle("on", radioOn));
    say(radioOn ? L("radioOn") : L("radioOff"));
  }

  // index.html-dəki 3 "mahnı bitdi" yeri bunu çağırır; true qaytarırsa nextSong ləğv olunur
  window.MU_SONG_ENDED = function () {
    if (!radioOn) return false;
    radioNext().catch(e => { console.warn("[radio]", e); say(L("radioFail")); try { nextSong(); } catch (_) {} });
    return true;
  };

  async function radioNext() {
    const cur = curSong();
    if (!cur) { nextSong(); return; }
    say(L("radioLoad"), 1800);

    let ids = relCache[cur.videoId];
    if (!ids) {
      const r = await fetch("/api/related?v=" + encodeURIComponent(cur.videoId));
      const j = await r.json().catch(() => ({}));
      ids = (Array.isArray(j.ids) ? j.ids : []).filter(id => VID.test(id));
      relCache[cur.videoId] = ids;
    }
    if (!ids.length) { say(L("radioFail")); nextSong(); return; }

    // Son dinlənilənləri təkrarlama
    const hist = await ldb.history.orderBy("playedAt").reverse().limit(15).toArray().catch(() => []);
    const recent = new Set(hist.map(h => h.videoId));
    const nextId = ids.find(id => !recent.has(id)) || ids[0];

    let title = "YouTube: " + nextId, artist = "YouTube";
    try {
      const m = await fetch("/api/yt-meta?ids=" + nextId).then(r => r.json());
      if (m && m[nextId] && m[nextId].title) { title = m[nextId].title; artist = m[nextId].author || "YouTube"; }
    } catch (_) {}
    playSong({ videoId: nextId, title, artist, thumb: thumbOf(nextId) });
  }

  /* ════════════════════════════════════════════
     3) OTAQ REAKSİYALARI (üzən emojilər)
  ════════════════════════════════════════════ */
  const EMOJIS = ["❤️", "🔥", "👏", "😂", "🎉"];
  let reactRef = null, reactRoom = null, reactSince = 0;

  function floatWrap() {
    let w = $("mu-float-wrap");
    if (!w) {
      w = document.createElement("div");
      w.id = "mu-float-wrap"; w.className = "mu-float-wrap"; w.setAttribute("aria-hidden", "true");
      document.body.appendChild(w);
    }
    return w;
  }

  function spawnFloat(emoji) {
    const w = floatWrap();
    const d = document.createElement("div");
    d.className = "mu-float";
    d.textContent = emoji;
    d.style.left = (20 + Math.random() * 60) + "%";
    w.appendChild(d);
    setTimeout(() => d.remove(), 2800);
  }

  function watchReactions() {
    const rid = (window.MU_PLUS && MU_PLUS.roomId) ? MU_PLUS.roomId() : null;
    if (rid === reactRoom) return;
    try { if (reactRef) reactRef.off(); } catch (_) {}
    reactRef = null; reactRoom = rid;
    if (!rid || !hasFB()) return;
    reactSince = Date.now();
    reactRef = fbD.ref(`rooms/${rid}/reactions`).limitToLast(25);
    reactRef.on("child_added", snap => {
      const v = snap.val() || {};
      if (!v.at || v.at < reactSince - 10000) return;   // köhnə reaksiyaları təkrar göstərmə
      spawnFloat(v.emoji || "❤️");
    });
  }
  setInterval(watchReactions, 2000);

  function sendReaction(emoji) {
    const rid = (window.MU_PLUS && MU_PLUS.roomId) ? MU_PLUS.roomId() : null;
    if (!rid || !hasFB() || !me()) return;
    fbD.ref(`rooms/${rid}/reactions`).push({
      emoji, by: me().uid, name: me().displayName || "Anonim", at: Date.now()
    }).catch(() => {});
  }

  // plus.js otaq modalını açanda reaksiya panelini qoşur
  window.MU_ROOM_EXTRA = [function injectReactionBar(boxEl) {
    if (!boxEl || $("mu-react-bar")) return;
    const wrap = document.createElement("div");
    wrap.innerHTML = `<div class="mu-react-bar" id="mu-react-bar" role="group" aria-label="${esc(L("reactT"))}">` +
      EMOJIS.map(e => `<button type="button" data-e="${e}" aria-label="${e}">${e}</button>`).join("") +
      `</div><div class="mu-react-lbl">${esc(L("reactT"))}</div>`;
    const leave = boxEl.querySelector("#mu-room-leave");
    boxEl.insertBefore(wrap, leave || null);
    wrap.querySelectorAll("[data-e]").forEach(btn =>
      btn.addEventListener("click", () => {
        sendReaction(btn.dataset.e);
        spawnFloat(btn.dataset.e);
      }));
    watchReactions();
  }];

  /* ════════════════════════════════════════════
     4) HƏFTƏLİK LİDERLİK (dostlarla müqayisə)
     Hər çalma users/{uid}/weekPlays-ə yazılır (məxfilik açıqdırsa).
  ════════════════════════════════════════════ */
  function weekKey() {
    const d = new Date();
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = (t.getUTCDay() + 6) % 7;
    t.setUTCDate(t.getUTCDate() - dayNum + 3);
    const firstThu = new Date(Date.UTC(t.getUTCFullYear(), 0, 4));
    const week = 1 + Math.round(((t - firstThu) / 86400000 - 3 + ((firstThu.getUTCDay() + 6) % 7)) / 7);
    return t.getUTCFullYear() + "-W" + String(week).padStart(2, "0");
  }

  function bumpWeek() {
    const wk = weekKey();
    let st;
    try { st = JSON.parse(localStorage.getItem("mu_week") || "{}"); } catch (_) { st = {}; }
    if (st.k !== wk) st = { k: wk, n: 0 };
    st.n++;
    try { localStorage.setItem("mu_week", JSON.stringify(st)); } catch (_) {}
    if (hasFB() && me() && privStats() && navigator.onLine) {
      clearTimeout(bumpWeek._t);
      bumpWeek._t = setTimeout(() => {
        fbD.ref(`users/${me().uid}/weekPlays`).set({ week: wk, plays: st.n, at: Date.now() }).catch(() => {});
      }, 3000);
    }
  }

  async function openBoard() {
    if (!hasFB() || !me()) { say("⚠ " + L("needLogin")); return; }
    ensureOverlay("m-board", 400);
    const b = $("m-board-b");
    b.innerHTML = `<div class="mtit">🏆 ${esc(L("board"))}</div><div class="mu-note">${esc(L("boardSub"))}</div><div class="mu-note">…</div>`;
    openM("m-board");

    const wk = weekKey();
    const entries = [];
    // özüm
    let mine = 0;
    try { const st = JSON.parse(localStorage.getItem("mu_week") || "{}"); if (st.k === wk) mine = st.n | 0; } catch (_) {}
    entries.push({ uid: me().uid, name: (me().displayName || "?") + " (" + L("you") + ")", photo: me().photoURL || "", plays: mine, me: true });
    // dostlar
    const fuids = Object.keys(S.friends || {});
    const snaps = await Promise.all(fuids.map(f => fbD.ref(`users/${f}/weekPlays`).get().catch(() => null)));
    fuids.forEach((f, i) => {
      const v = snaps[i] && snaps[i].exists() ? snaps[i].val() : null;
      entries.push({
        uid: f, name: (S.friends[f] && (S.friends[f].name || S.friends[f].displayName)) || "Anonim",
        photo: (S.friends[f] && S.friends[f].photo) || "",
        plays: (v && v.week === wk) ? (v.plays | 0) : 0, me: false
      });
    });
    entries.sort((a, c) => c.plays - a.plays);

    const medals = ["🥇", "🥈", "🥉"];
    b.innerHTML = `<div class="mtit">🏆 ${esc(L("board"))}</div><div class="mu-note">${esc(L("boardSub"))}</div>` +
      (entries.every(e => !e.plays)
        ? `<div class="mu-note" style="text-align:center;padding:16px 6px">${esc(L("boardEmpty"))}</div>`
        : "") +
      entries.map((e, i) => `<div class="mu-board-row${e.me ? " me" : ""}">
        <span class="mu-brank">${medals[i] || (i + 1)}</span>
        ${e.photo ? `<img class="mu-bav" src="${esc(e.photo)}" alt=""/>` : `<span class="mu-bav" style="display:inline-flex;align-items:center;justify-content:center;background:var(--c3);font-weight:800">${esc((e.name || "?")[0].toUpperCase())}</span>`}
        <span class="mu-bname">${esc(e.name)}</span>
        <span class="mu-bval">${e.plays} ${esc(L("plays"))} · ${Math.round(e.plays * 3.5)} ${esc(L("mins"))}</span>
      </div>`).join("");
  }

  /* ════════════════════════════════════════════
     5) ORTAQ PLAYLISTLƏR (collab/{id})
  ════════════════════════════════════════════ */
  function myCollabs() {
    try { return JSON.parse(localStorage.getItem("mu_collabs") || "[]"); } catch (_) { return []; }
  }
  function rememberCollab(id, name) {
    const arr = myCollabs().filter(x => x.id !== id);
    arr.unshift({ id, name });
    try { localStorage.setItem("mu_collabs", JSON.stringify(arr.slice(0, 20))); } catch (_) {}
  }
  function forgetCollab(id) {
    try { localStorage.setItem("mu_collabs", JSON.stringify(myCollabs().filter(x => x.id !== id))); } catch (_) {}
  }

  let collabRef = null, collabId = null;

  async function createCollab(name) {
    if (!hasFB() || !me()) { say("⚠ " + L("needLogin")); return; }
    name = clip(name, 60).trim();
    if (!name) { say(L("collabBad")); return; }
    const ref = fbD.ref("collab").push();
    try {
      await ref.set({ name, owner: me().uid, ownerName: me().displayName || "Anonim", createdAt: Date.now() });
      await ref.child(`members/${me().uid}`).set({ name: me().displayName || "Anonim", photo: me().photoURL || "", at: Date.now() });
      rememberCollab(ref.key, name);
      renderCollabSection();
      openCollab(ref.key);
      copyText(location.origin + "/collab/" + ref.key, L("collabCopied"));
    } catch (e) { console.warn("[collab] yaratma:", e); say("❌ " + (e.message || e)); }
  }

  async function joinCollab(id) {
    if (!hasFB() || !me()) { say("⚠ " + L("needLogin")); return; }
    id = String(id || "").trim();
    if (!/^[A-Za-z0-9_-]{6,40}$/.test(id)) { say(L("collabBad")); return; }
    const snap = await fbD.ref(`collab/${id}`).get().catch(() => null);
    if (!snap || !snap.exists()) { say(L("collab404")); return; }
    const v = snap.val() || {};
    await fbD.ref(`collab/${id}/members/${me().uid}`).set({ name: me().displayName || "Anonim", photo: me().photoURL || "", at: Date.now() }).catch(() => {});
    rememberCollab(id, v.name || "Playlist");
    renderCollabSection();
    openCollab(id);
  }

  function copyText(txt, msg) {
    if (navigator.share) { navigator.share({ title: "Music Universe", url: txt }).catch(() => {}); return; }
    try { navigator.clipboard.writeText(txt); say(msg); } catch (_) { prompt(msg, txt); }
  }

  async function openCollab(id) {
    if (!hasFB()) return;
    ensureOverlay("m-collab", 430);
    collabId = id;
    try { if (collabRef) collabRef.off(); } catch (_) {}
    collabRef = fbD.ref(`collab/${id}`);
    collabRef.on("value", snap => {
      if (collabId !== id) return;
      if (!snap.exists()) { forgetCollab(id); closeM("m-collab"); renderCollabSection(); say(L("collabDeleted")); return; }
      renderCollab(id, snap.val() || {});
    });
    openM("m-collab");
  }

  function renderCollab(id, v) {
    const b = $("m-collab-b"); if (!b) return;
    const isOwner = me() && v.owner === me().uid;
    const members = v.members || {};
    const songs = Object.entries(v.songs || {}).map(([vid, s]) => ({ videoId: vid, ...s }))
      .filter(s => VID.test(s.videoId)).sort((a, c) => (a.at || 0) - (c.at || 0));

    b.innerHTML = `<div class="mtit">🤝 ${esc(v.name || "Playlist")}</div>
<div class="mu-note">${Object.keys(members).length} ${esc(L("collabMembers"))} · ${songs.length} 🎵</div>
<div style="display:flex;gap:7px;margin-bottom:8px">
  <button class="mu-btn" id="mu-c-share" style="flex:1">🔗 ${esc(L("collabCopied").replace("🔗 ", "").split(" — ")[0])}</button>
  <button class="mu-btn" id="mu-c-play" style="flex:1">${esc(L("collabPlay"))}</button>
</div>
<button class="mu-ghost-btn" id="mu-c-add" style="margin-top:0">${esc(L("collabAddCur"))}</button>
<div class="mu-clist" id="mu-c-list">
  ${songs.length ? "" : `<div class="mu-note" style="text-align:center;padding:14px 4px">${esc(L("collabNoSongs"))}</div>`}
  ${songs.map(s => `<div class="mu-csong" data-v="${esc(s.videoId)}">
    <img src="${esc(s.thumb || thumbOf(s.videoId))}" alt="" onerror="this.style.visibility='hidden'"/>
    <div class="t"><div class="tt">${esc(s.title)}</div><div class="ta">${esc(s.artist || "")} · ${esc(L("addedBy"))} ${esc(s.byName || "?")}</div></div>
    ${(isOwner || (me() && s.by === me().uid)) ? `<button class="mu-cdel" data-del="${esc(s.videoId)}" aria-label="Sil">✕</button>` : ""}
  </div>`).join("")}
</div>
<button class="${isOwner ? "mu-danger-btn" : "mu-ghost-btn"}" id="mu-c-exit" style="margin-top:10px">${esc(isOwner ? L("collabDel") : L("collabLeave"))}</button>`;

    $("mu-c-share").addEventListener("click", () => copyText(location.origin + "/collab/" + id, L("collabCopied")));
    $("mu-c-play").addEventListener("click", () => {
      if (!songs.length) return;
      songs.forEach(s => { if (!S.list.find(p => p.videoId === s.videoId)) S.list.push({ videoId: s.videoId, title: s.title, artist: s.artist, thumb: s.thumb || thumbOf(s.videoId) }); });
      try { playSong(songs[0]); } catch (_) {}
      closeM("m-collab");
    });
    $("mu-c-add").addEventListener("click", async () => {
      const s = curSong();
      if (!s) { say(L("lyNoSong")); return; }
      if (!me()) { say("⚠ " + L("needLogin")); return; }
      await fbD.ref(`collab/${id}/songs/${s.videoId}`).set({
        title: clip(s.title, 200), artist: clip(s.artist, 120), thumb: s.thumb || thumbOf(s.videoId),
        by: me().uid, byName: me().displayName || "Anonim", at: Date.now()
      }).catch(() => {});
      say(L("collabAdded"));
    });
    b.querySelectorAll(".mu-csong").forEach(row => {
      row.addEventListener("click", e => {
        if (e.target.closest("[data-del]")) return;
        const vid = row.dataset.v;
        const s = songs.find(x => x.videoId === vid);
        if (s) { try { playSong({ videoId: s.videoId, title: s.title, artist: s.artist, thumb: s.thumb || thumbOf(s.videoId) }); } catch (_) {} }
      });
    });
    b.querySelectorAll("[data-del]").forEach(btn =>
      btn.addEventListener("click", () => fbD.ref(`collab/${id}/songs/${btn.dataset.del}`).remove().catch(() => {})));
    $("mu-c-exit").addEventListener("click", async () => {
      if (isOwner) {
        await fbD.ref(`collab/${id}`).remove().catch(() => {});
        forgetCollab(id); say(L("collabDeleted"));
      } else {
        await fbD.ref(`collab/${id}/members/${me().uid}`).remove().catch(() => {});
        forgetCollab(id); say(L("collabLeft"));
      }
      try { if (collabRef) collabRef.off(); } catch (_) {}
      collabRef = null; collabId = null;
      closeM("m-collab");
      renderCollabSection();
    });
  }

  /* ── Playlist səhifəsində bölmə ── */
  async function renderCollabSection() {
    const page = $("page-playlists");
    if (!page) return;
    let sec = $("mu-collab-sec");
    if (!sec) {
      sec = document.createElement("div");
      sec.id = "mu-collab-sec";
      const list = $("pl-list");
      list ? list.after(sec) : page.appendChild(sec);
    }
    const mine = myCollabs();
    // Firebase-dən adları təzələ (oflayndırsa köhnə adlar qalır)
    let items = mine;
    if (hasFB() && me() && navigator.onLine && mine.length) {
      const snaps = await Promise.all(mine.map(c => fbD.ref(`collab/${c.id}/name`).get().catch(() => null)));
      items = [];
      mine.forEach((c, i) => {
        const nm = snaps[i] && snaps[i].exists() ? snaps[i].val() : null;
        if (nm) items.push({ id: c.id, name: nm });
        else if (!snaps[i]) items.push(c);   // şəbəkə xətası — saxla
      });
      if (items.length !== mine.length) {
        try { localStorage.setItem("mu_collabs", JSON.stringify(items)); } catch (_) {}
      }
    }

    sec.innerHTML = `<div class="sh" style="margin-top:18px"><span class="dot"></span><span>🤝 ${esc(L("collab"))}</span></div>
<div class="mu-note">${esc(L("collabSub"))}</div>
<div style="display:flex;gap:7px;margin-bottom:8px">
  <input id="mu-collab-name" placeholder="${esc(L("collabNamePh"))}" maxlength="60" style="flex:1;padding:9px 11px;border-radius:10px;background:var(--c2);border:1.5px solid var(--bd2);color:var(--tx);font:600 .8rem var(--fb);outline:none"/>
  <button class="mu-btn mu-pri" id="mu-collab-create">${esc(L("collabCreate"))}</button>
</div>
<div style="display:flex;gap:7px;margin-bottom:10px">
  <input id="mu-collab-join" placeholder="${esc(L("collabJoinPh"))}" maxlength="40" style="flex:1;padding:9px 11px;border-radius:10px;background:var(--c2);border:1.5px solid var(--bd2);color:var(--tx);font:600 .8rem var(--fb);outline:none"/>
  <button class="mu-btn" id="mu-collab-join-btn">${esc(L("collabJoin"))}</button>
</div>
<div id="mu-collab-list">
  ${items.length ? "" : `<div class="mu-note" style="text-align:center;padding:10px">${esc(L("collabEmpty"))}</div>`}
  ${items.map(c => `<div class="mu-colab-row" data-id="${esc(c.id)}" role="button" tabindex="0">
    <span style="font-size:18px">🤝</span>
    <span style="flex:1;font-weight:700;font-size:.85rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(c.name)}</span>
    <span style="color:var(--t3);font-size:.75rem">›</span>
  </div>`).join("")}
</div>`;

    $("mu-collab-create").addEventListener("click", () => {
      const v = $("mu-collab-name").value; $("mu-collab-name").value = "";
      createCollab(v);
    });
    $("mu-collab-join-btn").addEventListener("click", () => {
      const v = $("mu-collab-join").value; $("mu-collab-join").value = "";
      joinCollab(v);
    });
    sec.querySelectorAll(".mu-colab-row").forEach(row => {
      row.addEventListener("click", () => { me() ? openCollab(row.dataset.id) : say("⚠ " + L("needLogin")); });
    });
  }

  /* ════════════════════════════════════════════
     6) NİŞANLAR (seriya + dinləmə mərhələləri)
     MUreport bazasından hesablanır; qazanılanlar profilə yazılır.
  ════════════════════════════════════════════ */
  const BADGES = [
    { id: "st3",   e: "🔥", type: "streak", need: 3 },
    { id: "st7",   e: "⚡", type: "streak", need: 7 },
    { id: "st14",  e: "💫", type: "streak", need: 14 },
    { id: "st30",  e: "🌟", type: "streak", need: 30 },
    { id: "st60",  e: "🚀", type: "streak", need: 60 },
    { id: "st100", e: "👑", type: "streak", need: 100 },
    { id: "pl50",   e: "🎧", type: "plays", need: 50 },
    { id: "pl200",  e: "💿", type: "plays", need: 200 },
    { id: "pl500",  e: "📀", type: "plays", need: 500 },
    { id: "pl1000", e: "🏆", type: "plays", need: 1000 }
  ];
  const badgeLabel = bd => bd.e + " " + bd.need + " " + L(bd.type === "streak" ? "streakB" : "playsB");

  const repDb2 = (typeof Dexie !== "undefined") ? new Dexie("MUreport") : null;
  if (repDb2) repDb2.version(1).stores({ events: "++id, ts, videoId" });

  const dayKey = ts => { const d = new Date(ts); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };

  async function myStats() {
    if (!repDb2) return { streak: 0, plays: 0 };
    const ev = await repDb2.events.toArray().catch(() => []);
    const days = new Set(ev.map(e => dayKey(e.ts)));
    const DAY = 86400000, now = Date.now();
    let streak = 0;
    let cursor = days.has(dayKey(now)) ? now : now - DAY;
    while (days.has(dayKey(cursor))) { streak++; cursor -= DAY; }
    return { streak, plays: ev.length };
  }

  function earnedBadges(st) {
    return BADGES.filter(b => (b.type === "streak" ? st.streak : st.plays) >= b.need);
  }

  async function checkNewBadges() {
    if (!repDb2) return;
    const st = await myStats();
    const earned = earnedBadges(st).map(b => b.id);
    let known;
    try { known = JSON.parse(localStorage.getItem("mu_badges") || "[]"); } catch (_) { known = []; }
    const fresh = earned.filter(id => !known.includes(id));
    if (!fresh.length) return;
    try { localStorage.setItem("mu_badges", JSON.stringify([...new Set([...known, ...earned])])); } catch (_) {}
    fresh.forEach(id => {
      const bd = BADGES.find(b => b.id === id);
      if (bd) say(L("badgeNew") + badgeLabel(bd), 5000);
      if (hasFB() && me() && privStats()) {
        fbD.ref(`users/${me().uid}/badges/${id}`).set(Date.now()).catch(() => {});
      }
    });
  }

  // Profilə nişanlar bölməsi əlavə et
  if (typeof window.renderStatsInProfile === "function") {
    const _rs = window.renderStatsInProfile;
    window.renderStatsInProfile = function (uid, container) {
      const r = _rs.apply(this, arguments);
      try { renderProfileBadges(uid, container); } catch (_) {}
      return r;
    };
  }

  async function renderProfileBadges(uid, container) {
    if (!container) return;
    await Promise.resolve();   // əsas statistika əvvəl düşsün
    let html = "";
    if (me() && uid === me().uid) {
      const st = await myStats();
      const earned = new Set(earnedBadges(st).map(b => b.id));
      if (!earned.size) return;
      html = `<div class="sh" style="margin:10px 0 6px"><span class="dot"></span>🏅 ${esc(L("badges"))}</div><div class="mu-badges">` +
        BADGES.filter(b => earned.has(b.id)).map(b => `<span class="mu-badge">${esc(badgeLabel(b))}</span>`).join("") +
        `</div>`;
    } else if (hasFB()) {
      const snap = await fbD.ref(`users/${uid}/badges`).get().catch(() => null);
      if (!snap || !snap.exists()) return;
      const ids = Object.keys(snap.val() || {});
      const list = BADGES.filter(b => ids.includes(b.id));
      if (!list.length) return;
      html = `<div class="sh" style="margin:10px 0 6px"><span class="dot"></span>🏅 ${esc(L("badges"))}</div><div class="mu-badges">` +
        list.map(b => `<span class="mu-badge">${esc(badgeLabel(b))}</span>`).join("") +
        `</div>`;
    }
    if (html) container.insertAdjacentHTML("beforeend", html);
  }

  /* ════════════════════════════════════════════
     DÜYMƏLƏRİN YERLƏŞDİRİLMƏSİ + BAŞLATMA
  ════════════════════════════════════════════ */
  function mkPBtn(id, emoji, label, cls) {
    const b = document.createElement("button");
    b.className = "pbtn mu-xbtn " + (cls || ""); b.id = id;
    b.textContent = emoji;
    b.title = label; b.setAttribute("aria-label", label);
    b.style.fontSize = "13px";
    return b;
  }
  function mkPemItem(id, emoji, label) {
    const d = document.createElement("div");
    d.className = "pem-item"; d.id = id;
    d.setAttribute("role", "button"); d.setAttribute("tabindex", "0");
    d.innerHTML = `<span style="font-size:13px;width:14px;text-align:center">${emoji}</span><span>${esc(label)}</span>`;
    return d;
  }

  function injectPlayerButtons() {
    const pacts = document.querySelector(".pacts");
    if (pacts && !$("b-bar-ly")) {
      const ly = mkPBtn("b-bar-ly", "📝", L("lyrics"));
      ly.addEventListener("click", openLyrics);
      pacts.appendChild(ly);
      const rd = mkPBtn("b-bar-radio", "📻", L("radio"), "mu-radio-btn");
      rd.classList.toggle("on", radioOn);
      rd.addEventListener("click", () => setRadio(!radioOn));
      pacts.appendChild(rd);
    }
    const pem = $("p-extra-menu");
    if (pem && !$("pem-ly")) {
      const ly = mkPemItem("pem-ly", "📝", L("lyrics"));
      ly.addEventListener("click", () => { try { closeMeatball(); } catch (_) {} openLyrics(); });
      pem.appendChild(ly);
      const rd = mkPemItem("pem-radio", "📻", L("radio"));
      rd.classList.add("mu-radio-btn"); rd.classList.toggle("on", radioOn);
      rd.addEventListener("click", () => { setRadio(!radioOn); });
      pem.appendChild(rd);
    }
  }

  function injectBoardButton() {
    const roomBtn = $("mu-room-open");
    if (!roomBtn || $("mu-board-open")) return;
    const b = document.createElement("button");
    b.className = "mu-room-btn"; b.id = "mu-board-open";
    b.innerHTML = `🏆 <span>${esc(L("board"))}</span>`;
    b.addEventListener("click", openBoard);
    roomBtn.after(b);
  }

  // Hər çalma: həftəlik sayğac + nişan yoxlaması
  if (typeof window.addToHistory === "function") {
    const _addH = window.addToHistory;
    window.addToHistory = function (song) {
      try { bumpWeek(); } catch (_) {}
      clearTimeout(window.__muBadgeT);
      window.__muBadgeT = setTimeout(() => { checkNewBadges().catch(() => {}); }, 5000);
      return _addH.apply(this, arguments);
    };
  }

  // /collab/{id} dəvət linki
  function handleCollabDeepLink() {
    try {
      const m = location.pathname.match(/^\/collab\/([A-Za-z0-9_-]{6,40})$/);
      if (!m) return;
      history.replaceState({}, document.title, "/");
      const id = m[1];
      setTimeout(() => {
        if (me()) joinCollab(id);
        else { say("⚠ " + L("needLogin"), 5000); window.__muPendingCollab = id; }
      }, 1500);
    } catch (_) {}
  }
  if (hasFB() && typeof fbA !== "undefined" && fbA) {
    try {
      fbA.onAuthStateChanged(u => {
        if (u && window.__muPendingCollab) {
          const id = window.__muPendingCollab; window.__muPendingCollab = null;
          joinCollab(id);
        }
        if (u) setTimeout(renderCollabSection, 800);
      });
    } catch (_) {}
  }

  /* ══ BAŞLAT ══ */
  try {
    injectPlayerButtons();
    injectBoardButton();
    renderCollabSection();
    handleCollabDeepLink();
    setTimeout(() => { injectPlayerButtons(); injectBoardButton(); }, 1500);
    setTimeout(() => { injectPlayerButtons(); injectBoardButton(); renderCollabSection(); }, 4000);
    setTimeout(() => { checkNewBadges().catch(() => {}); }, 6000);
  } catch (e) {
    console.warn("[extras] başlanğıc xətası:", e);
  }

  window.MU_EXTRAS = { openLyrics, openBoard, setRadio, openCollab, joinCollab };
})();
