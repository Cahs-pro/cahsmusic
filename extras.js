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
    cntInc("lyrics");
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
    if (on && !radioOn) cntInc("radio");
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
    cntInc("react");
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
      cntInc("collabAdd");
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
     6) NİŞANLAR — 21 kateqoriya, 100+ nişan
     Mənbələr: MUreport hadisələri, IndexedDB sayları,
     Firebase sosial məlumatlar, lokal fəaliyyət sayğacları.
  ════════════════════════════════════════════ */
  const I18NX = {
    az: { cats: { streak: "Seriya", plays: "Dinləmə", week: "Həftəlik", day: "Gündəlik", artists: "İfaçılar",
        songs: "Mahnılar", night: "Gecə quşu", early: "Səhər quşu", friends: "Dostlar", msg: "Söhbət",
        rooms: "Otaq", react: "Reaksiya", pl: "Playlist", likes: "Sevimli", dl: "Endirmə",
        plsongs: "Playlist mahnıları", share: "Paylaşım", age: "Veteran", radio: "Radio", lyrics: "Sözlər", collab: "Ortaq" },
      units: { streak: "gün seriya", plays: "dinləmə", week: "həftəlik", day: "gündəlik", artists: "ifaçı",
        songs: "mahnı", night: "gecə", early: "səhər", friends: "dost", msg: "mesaj", rooms: "otaq",
        react: "reaksiya", pl: "playlist", likes: "sevimli", dl: "endirmə", plsongs: "mahnı",
        share: "paylaşım", age: "gün", radio: "radio", lyrics: "sözlər", collab: "mahnı" },
      earned: "qazanıldı", lockedB: "açılmayıb", allBadges: "🏅 Bütün nişanlar",
      compat: "Zövq uyğunluğu", commonSongs: "ortaq mahnı", hiddenSt: "gizlədilib",
      stDays: "gün", since: "İlk dinləmə", topHour: "Ən aktiv saat", topDay: "Ən aktiv gün",
      totPlays: "Ümumi dinləmə", totMins: "Dəqiqə", uArtists: "İfaçı", uSongs: "Mahnı",
      curStreak: "Cari seriya", badgeCnt: "Nişan" },
    en: { cats: { streak: "Streak", plays: "Listening", week: "Weekly", day: "Daily", artists: "Artists",
        songs: "Songs", night: "Night owl", early: "Early bird", friends: "Friends", msg: "Chat",
        rooms: "Rooms", react: "Reactions", pl: "Playlists", likes: "Likes", dl: "Downloads",
        plsongs: "Playlist songs", share: "Shares", age: "Veteran", radio: "Radio", lyrics: "Lyrics", collab: "Collab" },
      units: { streak: "day streak", plays: "plays", week: "weekly", day: "daily", artists: "artists",
        songs: "songs", night: "nights", early: "mornings", friends: "friends", msg: "messages", rooms: "rooms",
        react: "reactions", pl: "playlists", likes: "likes", dl: "downloads", plsongs: "songs",
        share: "shares", age: "days", radio: "radio", lyrics: "lyrics", collab: "songs" },
      earned: "earned", lockedB: "locked", allBadges: "🏅 All badges",
      compat: "Taste match", commonSongs: "songs in common", hiddenSt: "hidden",
      stDays: "days", since: "Listening since", topHour: "Most active hour", topDay: "Most active day",
      totPlays: "Total plays", totMins: "Minutes", uArtists: "Artists", uSongs: "Songs",
      curStreak: "Current streak", badgeCnt: "Badges" },
    ru: { cats: { streak: "Серия", plays: "Прослушивания", week: "За неделю", day: "За день", artists: "Исполнители",
        songs: "Песни", night: "Ночной слушатель", early: "Ранняя пташка", friends: "Друзья", msg: "Чат",
        rooms: "Комнаты", react: "Реакции", pl: "Плейлисты", likes: "Лайки", dl: "Загрузки",
        plsongs: "Песни в плейлистах", share: "Репосты", age: "Ветеран", radio: "Радио", lyrics: "Тексты", collab: "Вместе" },
      units: { streak: "дней подряд", plays: "прослушиваний", week: "за неделю", day: "за день", artists: "исполнителей",
        songs: "песен", night: "ночей", early: "утра", friends: "друзей", msg: "сообщений", rooms: "комнат",
        react: "реакций", pl: "плейлистов", likes: "лайков", dl: "загрузок", plsongs: "песен",
        share: "репостов", age: "дней", radio: "радио", lyrics: "текстов", collab: "песен" },
      earned: "получен", lockedB: "закрыт", allBadges: "🏅 Все значки",
      compat: "Совпадение вкуса", commonSongs: "общих песен", hiddenSt: "скрыто",
      stDays: "дней", since: "Слушает с", topHour: "Самый активный час", topDay: "Самый активный день",
      totPlays: "Всего прослушиваний", totMins: "Минут", uArtists: "Исполнителей", uSongs: "Песен",
      curStreak: "Текущая серия", badgeCnt: "Значков" }
  };
  const LX = (g, k) => (I18NX[curLang()] || I18NX.az)[g][k] ?? I18NX.az[g][k] ?? k;

  /* [tip, emoji, [eşiklər]] — cəmi 103 nişan */
  const BADGE_CATS = [
    ["streak",  "🔥", [2, 3, 5, 7, 10, 14, 21, 30, 45, 60, 75, 100, 150, 200, 365]],
    ["plays",   "🎧", [10, 25, 50, 100, 200, 350, 500, 750, 1000, 1500, 2500, 5000, 10000]],
    ["week",    "📅", [10, 25, 50, 100, 200]],
    ["day",     "☀️", [10, 20, 30, 50, 100]],
    ["artists", "🎤", [5, 10, 25, 50, 100, 200]],
    ["songs",   "🎵", [10, 25, 50, 100, 250, 500]],
    ["night",   "🌙", [1, 10, 50]],
    ["early",   "🌅", [1, 10, 50]],
    ["friends", "👥", [1, 3, 5, 10, 25]],
    ["msg",     "💬", [1, 10, 50, 100, 500]],
    ["rooms",   "🪩", [1, 5, 10, 25]],
    ["react",   "❤️", [1, 10, 50, 100]],
    ["pl",      "📂", [1, 3, 5, 10]],
    ["likes",   "💖", [1, 10, 25, 50, 100]],
    ["dl",      "⬇️", [1, 10, 25, 50]],
    ["plsongs", "📜", [10, 50, 100]],
    ["share",   "🔗", [1, 5, 10, 25]],
    ["age",     "🗓️", [7, 30, 100, 365]],
    ["radio",   "📻", [1, 10, 50]],
    ["lyrics",  "📝", [1, 10, 50]],
    ["collab",  "🤝", [1, 5, 10]]
  ];
  const ALL_BADGES = [];
  BADGE_CATS.forEach(([type, icon, needs]) =>
    needs.forEach(need => ALL_BADGES.push({ id: type + need, type, icon, need })));

  const badgeLabel = bd => bd.icon + " " + bd.need + " " + LX("units", bd.type);

  /* ── Fəaliyyət sayğacları (lokal) ── */
  function cntGet() { try { return JSON.parse(localStorage.getItem("mu_counts") || "{}"); } catch (_) { return {}; } }
  function cntInc(k) {
    try { const c = cntGet(); c[k] = (c[k] | 0) + 1; localStorage.setItem("mu_counts", JSON.stringify(c)); } catch (_) {}
    scheduleBadgeCheck();
  }
  let _badgeT = 0;
  function scheduleBadgeCheck() {
    clearTimeout(_badgeT);
    _badgeT = setTimeout(() => { checkNewBadges().catch(() => {}); }, 4000);
  }

  const repDb2 = (typeof Dexie !== "undefined") ? new Dexie("MUreport") : null;
  if (repDb2) repDb2.version(1).stores({ events: "++id, ts, videoId" });

  const dayKey = ts => { const d = new Date(ts); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };

  /* ── Bütün statistik göstəricilər ── */
  async function computeBadgeStats() {
    const out = { streak: 0, plays: 0, week: 0, day: 0, artists: 0, songs: 0, night: 0, early: 0,
      friends: 0, msg: 0, rooms: 0, react: 0, pl: 0, likes: 0, dl: 0, plsongs: 0, share: 0,
      age: 0, radio: 0, lyrics: 0, collab: 0 };

    const ev = repDb2 ? await repDb2.events.toArray().catch(() => []) : [];
    out.plays = ev.length;
    if (ev.length) {
      const days = new Set(ev.map(e => dayKey(e.ts)));
      const DAY = 86400000, now = Date.now();
      let cursor = days.has(dayKey(now)) ? now : now - DAY;
      while (days.has(dayKey(cursor))) { out.streak++; cursor -= DAY; }
      const artists = new Set(), songs = new Set(), byDay = {};
      const wk = weekKey();
      ev.forEach(e => {
        const a = (e.artist || "").trim(); if (a) artists.add(a);
        songs.add(e.videoId);
        const h = new Date(e.ts).getHours();
        if (h >= 0 && h < 5) out.night++;
        if (h >= 5 && h < 9) out.early++;
        const dk = dayKey(e.ts);
        byDay[dk] = (byDay[dk] || 0) + 1;
        if (isoWeekOf(new Date(e.ts)) === wk) out.week++;
      });
      out.artists = artists.size;
      out.songs = songs.size;
      out.day = Math.max(0, ...Object.values(byDay));
      out.age = Math.max(0, Math.floor((now - Math.min(...ev.map(e => e.ts))) / DAY));
    }

    const c = cntGet();
    out.msg = c.msg | 0; out.rooms = c.rooms | 0; out.react = c.react | 0;
    out.share = c.share | 0; out.radio = c.radio | 0; out.lyrics = c.lyrics | 0; out.collab = c.collab | 0;
    out.friends = Object.keys(S.friends || {}).length;
    out.dl = S.downloads ? S.downloads.size : 0;
    try { out.pl = await ldb.playlists.count(); } catch (_) {}
    try { out.likes = await ldb.likes.count(); } catch (_) {}
    try { out.plsongs = await ldb.pl_songs.count(); } catch (_) {}
    return out;
  }
  function isoWeekOf(d) {
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = (t.getUTCDay() + 6) % 7;
    t.setUTCDate(t.getUTCDate() - dayNum + 3);
    const firstThu = new Date(Date.UTC(t.getUTCFullYear(), 0, 4));
    const week = 1 + Math.round(((t - firstThu) / 86400000 - 3 + ((firstThu.getUTCDay() + 6) % 7)) / 7);
    return t.getUTCFullYear() + "-W" + String(week).padStart(2, "0");
  }

  const earnedBadgeList = st => ALL_BADGES.filter(b => (st[b.type] | 0) >= b.need);

  /* ── Yeni nişan bildirişi (toast + sistem bildirişi) ── */
  function notifyBadge(text) {
    say("🏅 " + L("badgeNew") + text, 5000);
    try {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Music Universe — 🏅", { body: text, icon: "/icon-192.png" });
      }
    } catch (_) {}
  }

  async function checkNewBadges() {
    if (!repDb2) return;
    const st = await computeBadgeStats();
    const earned = earnedBadgeList(st);
    let known;
    try { known = JSON.parse(localStorage.getItem("mu_badges") || "[]"); } catch (_) { known = []; }
    const fresh = earned.filter(b => !known.includes(b.id));
    if (!fresh.length) return;
    try { localStorage.setItem("mu_badges", JSON.stringify([...new Set([...known, ...earned.map(b => b.id)])])); } catch (_) {}
    fresh.forEach(bd => {
      notifyBadge(badgeLabel(bd));
      if (hasFB() && me() && privStats()) {
        fbD.ref(`users/${me().uid}/badges/${bd.id}`).set(Date.now()).catch(() => {});
      }
    });
  }

  /* ── Nişanlar modalı (hamısı + progress) ── */
  async function openBadges() {
    ensureOverlay("m-badges", 430);
    const b = $("m-badges-b");
    b.innerHTML = `<div class="mtit">🏅 ${esc(L("badges"))}</div><div class="mu-note">…</div>`;
    openM("m-badges");
    const st = await computeBadgeStats();
    const earned = new Set(earnedBadgeList(st).map(x => x.id));
    b.innerHTML = `<div class="mtit">🏅 ${esc(L("badges"))} <span style="color:var(--g)">${earned.size}/${ALL_BADGES.length}</span></div>` +
      BADGE_CATS.map(([type, icon]) => {
        const items = ALL_BADGES.filter(x => x.type === type);
        const val = st[type] | 0;
        return `<div class="mu-sect">${icon} ${esc(LX("cats", type))} <span style="color:var(--t3);font-weight:600">(${val})</span></div>
        <div class="mu-badges">` + items.map(bd => {
          const has = earned.has(bd.id);
          return `<span class="mu-badge${has ? "" : " off"}" title="${has ? esc(LX("cats", type)) : esc(LX("units", bd.type))}: ${Math.min(val, bd.need)}/${bd.need}">${esc(badgeLabel(bd))}${has ? "" : ` <small style="opacity:.8">${Math.min(val, bd.need)}/${bd.need}</small>`}</span>`;
        }).join("") + `</div>`;
      }).join("");
  }

  /* ── Profilə əlavə məlumatlar ── */
  if (typeof window.renderStatsInProfile === "function") {
    const _rs = window.renderStatsInProfile;
    window.renderStatsInProfile = function (uid, container) {
      const r = _rs.apply(this, arguments);
      try { renderProfileExtras(uid, container); } catch (_) {}
      return r;
    };
  }

  async function renderProfileExtras(uid, container) {
    if (!container) return;
    await Promise.resolve();
    const isSelf = me() && uid === me().uid;

    if (isSelf) {
      const st = await computeBadgeStats();
      const earned = earnedBadgeList(st);
      const ev = repDb2 ? await repDb2.events.toArray().catch(() => []) : [];
      let extra = "";
      if (ev.length) {
        const hours = new Array(24).fill(0), byDay = {};
        ev.forEach(e => { const d = new Date(e.ts); hours[d.getHours()]++; const k = dayKey(e.ts); byDay[k] = (byDay[k] || 0) + 1; });
        const bestHour = hours.indexOf(Math.max(...hours));
        const bestDay = Object.entries(byDay).sort((a, c) => c[1] - a[1])[0][0];
        const first = new Date(Math.min(...ev.map(e => e.ts)));
        const cell = (n, l) => `<div class="stat-card"><div class="stat-num">${n}</div><div class="stat-lbl">${esc(l)}</div></div>`;
        extra = `<div class="stats-grid" style="margin-top:7px">` +
          cell(st.songs, "🎵 " + LX("cats", "songs")) +
          cell(st.artists, "🎤 " + LX("cats", "artists")) +
          cell(st.streak + " 🔥", LX("cats", "streak")) +
          `</div>
          <div class="mu-note" style="margin-top:6px">🕐 ${esc(bestHour + ":00")} · 📅 ${esc(bestDay)} · 🗓 ${esc(first.toLocaleDateString())}</div>`;
      }
      const badgeHtml = earned.length
        ? `<div class="sh" style="margin:10px 0 6px"><span class="dot"></span>🏅 ${esc(L("badges"))} (${earned.length}/${ALL_BADGES.length})</div>
           <div class="mu-badges">${earned.slice(0, 14).map(bd => `<span class="mu-badge">${esc(badgeLabel(bd))}</span>`).join("")}</div>
           ${earned.length > 14 ? `<button class="mu-ghost-btn" onclick="MU_EXTRAS.openBadges()">🏅 ${esc(L("badges"))} →</button>` : ""}`
        : "";
      container.insertAdjacentHTML("beforeend", extra + badgeHtml);
    } else if (hasFB()) {
      // Dostun profili: nişanlar + zövq uyğunluğu
      const [snap, compat] = await Promise.all([
        fbD.ref(`users/${uid}/badges`).get().catch(() => null),
        compatWith(uid).catch(() => null)
      ]);
      let html = "";
      if (compat && compat.pct != null) {
        html += `<div class="mu-note" style="margin-top:8px">🎧 ${esc(compatText())}: <strong style="color:var(--g)">${compat.pct}%</strong> · ${compat.common} ${esc(LX("cats","songs").toLowerCase())}</div>`;
      }
      if (snap && snap.exists()) {
        const ids = Object.keys(snap.val() || {});
        const list = ALL_BADGES.filter(b => ids.includes(b.id));
        if (list.length) {
          html += `<div class="sh" style="margin:10px 0 6px"><span class="dot"></span>🏅 ${esc(L("badges"))} (${list.length})</div>
          <div class="mu-badges">${list.map(bd => `<span class="mu-badge">${esc(badgeLabel(bd))}</span>`).join("")}</div>`;
        }
      }
      if (html) container.insertAdjacentHTML("beforeend", html);
    }
  }
  function compatText() { return curLang() === "en" ? "Taste match" : curLang() === "ru" ? "Совпадение вкуса" : "Zövq uyğunluğu"; }

  /* ════════════════════════════════════════════
     7) DOST SERİYASI + ZÖVQ UYĞUNLUĞU
     Dost sətrində: 🔥N (ardıcıl DM günləri) · 🎧N% (ortaq mahnılar)
  ════════════════════════════════════════════ */
  const frCache = {};   // uid -> {at, streak, pct, common, hidden}
  const FR_TTL = 5 * 60 * 1000;

  async function friendStreak(uid) {
    if (!me()) return 0;
    const room = [me().uid, uid].sort().join("_");
    const snap = await fbD.ref("dms/" + room).orderByChild("ts").limitToLast(400).get().catch(() => null);
    if (!snap || !snap.exists()) return 0;
    const days = new Set();
    snap.forEach(ch => { const ts = (ch.val() || {}).ts; if (ts) days.add(dayKey(ts)); });
    const DAY = 86400000, now = Date.now();
    let streak = 0;
    let cursor = days.has(dayKey(now)) ? now : now - DAY;
    while (days.has(dayKey(cursor))) { streak++; cursor -= DAY; }
    return streak;
  }

  let _mySongsCache = null;
  async function mySongSet() {
    if (_mySongsCache && Date.now() - _mySongsCache.at < FR_TTL) return _mySongsCache.set;
    const ev = repDb2 ? await repDb2.events.toArray().catch(() => []) : [];
    const set = new Set(ev.map(e => e.videoId));
    _mySongsCache = { at: Date.now(), set };
    return set;
  }

  async function compatWith(uid) {
    if (!hasFB() || !me()) return null;
    // Dostun məxfilik seçiminə hörmət et
    const pv = await fbD.ref(`users/${uid}/privacy`).get().catch(() => null);
    if (pv && pv.exists() && pv.val() && pv.val().stats === false) return { hidden: true };
    const snap = await fbD.ref(`stats/${uid}/songs`).orderByChild("count").limitToLast(200).get().catch(() => null);
    if (!snap || !snap.exists()) return null;
    const friendSet = new Set();
    snap.forEach(ch => { if (VID.test(ch.key || "")) friendSet.add(ch.key); });
    if (!friendSet.size) return null;
    const mine = await mySongSet();
    if (!mine.size) return null;
    let common = 0;
    friendSet.forEach(v => { if (mine.has(v)) common++; });
    const pct = Math.round(common / Math.min(mine.size, friendSet.size) * 100);
    return { pct, common };
  }

  async function friendExtras(uid) {
    const c = frCache[uid];
    if (c && Date.now() - c.at < FR_TTL) return c;
    const out = { at: Date.now(), streak: 0, pct: null, common: 0 };
    try { out.streak = await friendStreak(uid); } catch (_) {}
    try { const cp = await compatWith(uid); if (cp) { out.pct = cp.hidden ? null : cp.pct; out.common = cp.common || 0; } } catch (_) {}
    frCache[uid] = out;
    return out;
  }

  function decorateFriendRows() {
    const list = $("fr-list");
    if (!list || !me()) return;
    list.querySelectorAll(".frrow").forEach(row => {
      const uid = row.dataset.uid;
      if (!uid) return;
      const cached = frCache[uid];
      const render = d => {
        const inf = row.querySelector(".frinf");
        if (!inf || !row.isConnected) return;
        inf.querySelector(".mu-frx") && inf.querySelector(".mu-frx").remove();
        const parts = [];
        if (d.streak >= 2) parts.push(`🔥${d.streak}`);
        if (d.pct != null && d.pct >= 5) parts.push(`🎧${d.pct}%`);
        if (!parts.length) return;
        const span = document.createElement("div");
        span.className = "mu-frx";
        span.style.cssText = "font-size:.66rem;color:var(--g);font-weight:800;margin-top:1px";
        span.textContent = parts.join(" · ");
        inf.appendChild(span);
      };
      if (cached && Date.now() - cached.at < FR_TTL) render(cached);
      else friendExtras(uid).then(render).catch(() => {});
    });
  }

  if (typeof window.renderFrList === "function") {
    const _rfl = window.renderFrList;
    window.renderFrList = function () {
      const r = _rfl.apply(this, arguments);
      try { decorateFriendRows(); } catch (_) {}
      return r;
    };
  }

  /* ── Sosial fəaliyyət sayğacları (hook-lar) ── */
  if (typeof window.sendMsg === "function") {
    const _sm = window.sendMsg;
    window.sendMsg = function () { cntInc("msg"); return _sm.apply(this, arguments); };
  }
  if (typeof window.shareSong === "function") {
    const _sh = window.shareSong;
    window.shareSong = function () { cntInc("share"); return _sh.apply(this, arguments); };
  }
  if (window.MU_PLUS && typeof MU_PLUS.joinRoom === "function") {
    const _jr = MU_PLUS.joinRoom;
    MU_PLUS.joinRoom = function () { cntInc("rooms"); return _jr.apply(this, arguments); };
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

  window.MU_EXTRAS = { openLyrics, openBoard, setRadio, openCollab, joinCollab, openBadges };
})();
