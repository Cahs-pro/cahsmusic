/* ═══════════════════════════════════════════════════════════
   Music Universe — Müstəqil musiqi (jamendo.js)
   Jamendo kataloqundan Creative Commons musiqi: axtarış, janrlar, çalma.
   • Sadə <audio> ilə çalır → endirmədən, API kvotası olmadan, fonda və
     bildiriş panelində / kilid ekranında həmişə davam edir
   • Jamendo şərtlərinə görə: endirmə və oflayn keş YOXDUR; hər trekdə müəllif,
     lisenziya və Jamendo səhifəsinə keçid göstərilir
   index.html-də background.js-dən SONRA yüklənir.
═══════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  try {
    if (typeof S === "undefined" || typeof switchPage !== "function") return;
  } catch (e) { return; }

  const $ = id => document.getElementById(id);
  const say = (m, d) => { try { toast(m, d); } catch (_) { console.log(m); } };
  const JM = /^https:\/\/([a-z0-9-]+\.)*jamendo\.com\//i;           // yalnız Jamendo domenləri
  const CC = /^https?:\/\/creativecommons\.org\/licenses\//i;
  const GENRES = ["world", "folk", "pop", "rock", "electronic", "hiphop", "jazz", "classical", "lounge", "relaxation", "soundtrack", "songwriter", "metal"];
  const PAGE = 20;

  /* ══ DİLLƏR ══ */
  const I18N = {
    az: {
      nav: "Müstəqil", title: "Müstəqil musiqi",
      sub: "Müəlliflərin razılığı ilə Creative Commons altında paylaşdığı musiqi. Endirmədən oxuyur və proqramdan çıxanda da bildiriş panelində davam edir.",
      ph: "Axtar: mahnı, sənətçi, janr…", pop_: "Populyar",
      loading: "Yüklənir…", empty: "Heç nə tapılmadı", more: "Daha çox", err: "Yükləmək alınmadı. Bir azdan yenidən yoxla",
      offline: "İnternet yoxdur", noKey: "Jamendo açarı təyin edilməyib (Vercel: JAMENDO_CLIENT_ID)", playErr: "❌ Bu trek çalmadı",
      src: "Jamendo-da aç ↗",
      credit: "Musiqi təminatçısı: Jamendo (jamendo.com). Hər trek öz müəllifinə məxsusdur və göstərilən Creative Commons lisenziyası ilə paylaşılır. Bu tətbiq Jamendo ilə əlaqəli deyil.",
      g_world: "Dünya", g_folk: "Folk", g_pop: "Pop", g_rock: "Rok", g_electronic: "Elektron", g_hiphop: "Hip-hop", g_jazz: "Caz",
      g_classical: "Klassik", g_lounge: "Lounge", g_relaxation: "Rahatlama", g_soundtrack: "Film musiqisi", g_songwriter: "Müəllif mahnısı", g_metal: "Metal"
    },
    en: {
      nav: "Indie", title: "Independent music",
      sub: "Music its authors share under Creative Commons. Plays without downloading and keeps going in the notification bar when you leave the app.",
      ph: "Search: song, artist, genre…", pop_: "Popular",
      loading: "Loading…", empty: "Nothing found", more: "Load more", err: "Couldn't load. Try again in a moment",
      offline: "You are offline", noKey: "Jamendo key is not set (Vercel: JAMENDO_CLIENT_ID)", playErr: "❌ This track failed to play",
      src: "Open on Jamendo ↗",
      credit: "Music provided by Jamendo (jamendo.com). Every track belongs to its author and is shared under the Creative Commons license shown. This app is not affiliated with Jamendo.",
      g_world: "World", g_folk: "Folk", g_pop: "Pop", g_rock: "Rock", g_electronic: "Electronic", g_hiphop: "Hip-hop", g_jazz: "Jazz",
      g_classical: "Classical", g_lounge: "Lounge", g_relaxation: "Relaxation", g_soundtrack: "Soundtrack", g_songwriter: "Songwriter", g_metal: "Metal"
    },
    ru: {
      nav: "Инди", title: "Независимая музыка",
      sub: "Музыка, которой авторы делятся по лицензии Creative Commons. Играет без загрузки и продолжает в шторке уведомлений при выходе из приложения.",
      ph: "Поиск: песня, исполнитель, жанр…", pop_: "Популярное",
      loading: "Загрузка…", empty: "Ничего не найдено", more: "Ещё", err: "Не удалось загрузить. Попробуйте позже",
      offline: "Нет интернета", noKey: "Ключ Jamendo не задан (Vercel: JAMENDO_CLIENT_ID)", playErr: "❌ Трек не воспроизводится",
      src: "Открыть на Jamendo ↗",
      credit: "Музыку предоставляет Jamendo (jamendo.com). Каждый трек принадлежит автору и распространяется по указанной лицензии Creative Commons. Приложение не связано с Jamendo.",
      g_world: "Мировая", g_folk: "Фолк", g_pop: "Поп", g_rock: "Рок", g_electronic: "Электроника", g_hiphop: "Хип-хоп", g_jazz: "Джаз",
      g_classical: "Классика", g_lounge: "Лаунж", g_relaxation: "Релакс", g_soundtrack: "Саундтреки", g_songwriter: "Авторская", g_metal: "Метал"
    }
  };
  const L = k => { let l = "az"; try { if (I18N[LANG]) l = LANG; } catch (_) {} return (I18N[l] && I18N[l][k]) || I18N.az[k] || k; };

  /* ══ KÖMƏKÇİ: təhlükəsiz DOM ══ */
  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  const licLabel = u => { const m = /licenses\/([a-z-]+)\/([0-9.]+)/i.exec(u || ""); return m ? "CC " + m[1].toUpperCase() + " " + m[2] : "CC"; };

  /* ══ CSS ══ */
  const css = document.createElement("style");
  css.textContent = `
.jm-sub{font-size:.8rem;color:var(--t2);line-height:1.6;margin:-4px 0 14px;max-width:640px}
.jm-search{display:flex;gap:8px;margin-bottom:12px;max-width:640px}
.jm-search input{flex:1;min-width:0;padding:11px 14px;border-radius:12px;background:var(--c2);color:var(--tx);border:1.5px solid var(--bd2);font:600 .85rem var(--fb);outline:none}
.jm-search input:focus{border-color:var(--g)}
.jm-chips{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px}
.jm-chip{padding:6px 12px;border-radius:999px;background:var(--c3);color:var(--t2);font:700 .73rem var(--fb);border:1.5px solid var(--bd2);cursor:pointer;white-space:nowrap}
.jm-chip.on{background:var(--g);color:#000;border-color:var(--g)}
.jm-list{display:flex;flex-direction:column;gap:7px;max-width:760px}
.jm-row{display:flex;align-items:center;gap:12px;padding:8px 10px;border-radius:14px;background:var(--c2);border:1.5px solid transparent}
.jm-row.on{border-color:var(--g);background:var(--gd)}
.jm-cover{position:relative;flex:0 0 52px;width:52px;height:52px;border-radius:10px;overflow:hidden;background:var(--c3);cursor:pointer;padding:0}
.jm-cover img{width:100%;height:100%;object-fit:cover;display:block}
.jm-cover i{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.38);color:#fff;font-style:normal;font-size:1rem;opacity:0;transition:opacity .15s}
.jm-row:hover .jm-cover i,.jm-row.on .jm-cover i{opacity:1}
.jm-info{flex:1;min-width:0;cursor:pointer}
.jm-t{font-weight:700;font-size:.86rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.jm-a{font-size:.76rem;color:var(--t2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.jm-meta{font-size:.68rem;color:var(--t3);margin-top:2px;display:flex;gap:8px;flex-wrap:wrap}
.jm-meta a{color:var(--t3);text-decoration:underline}
.jm-meta a:hover{color:var(--g)}
.jm-dur{font-size:.72rem;color:var(--t3);flex-shrink:0}
.jm-msg{text-align:center;padding:26px 14px;color:var(--t2);font-size:.85rem}
.jm-more{display:block;margin:14px auto 4px;padding:9px 22px;border-radius:999px;background:var(--c3);color:var(--tx);font:700 .78rem var(--fb);border:1.5px solid var(--bd2);cursor:pointer}
.jm-more[hidden]{display:none}
.jm-credit{max-width:640px;margin:22px 0 90px;font-size:.7rem;color:var(--t3);line-height:1.6}
`;
  document.head.appendChild(css);

  /* ══ DƏYİŞƏNLƏR ══ */
  const J = { q: "", tag: "", offset: 0, list: [], queue: [], qi: -1, cur: "", active: false, audio: null, hasMore: false, gen: 0, started: false };

  /* ════════════════════════════════════════════
     SƏHİFƏ, MENYU və SƏHİFƏ DÜYMƏLƏRİ
  ════════════════════════════════════════════ */
  const NOTE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>';

  function buildPage() {
    if ($("page-jamendo")) return;
    const page = el("div", "page"); page.id = "page-jamendo";
    const sh = el("div", "sh"); sh.appendChild(el("span", "dot")); const h = el("span", "", ""); h.id = "jm-h"; sh.appendChild(h);
    const sub = el("p", "jm-sub"); sub.id = "jm-sub";
    const sw = el("div", "jm-search"); const inp = el("input"); inp.id = "jm-q"; inp.type = "search"; inp.maxLength = 60; inp.autocomplete = "off"; inp.setAttribute("enterkeyhint", "search"); sw.appendChild(inp);
    const chips = el("div", "jm-chips"); chips.id = "jm-chips";
    const list = el("div", "jm-list"); list.id = "jm-list";
    const msg = el("div", "jm-msg"); msg.id = "jm-msg";
    const more = el("button", "jm-more"); more.id = "jm-more"; more.hidden = true;
    const credit = el("p", "jm-credit"); credit.id = "jm-credit";
    [sh, sub, sw, chips, list, msg, more, credit].forEach(x => page.appendChild(x));
    const anchor = $("page-discover");
    if (anchor) anchor.insertAdjacentElement("afterend", page); else document.body.appendChild(page);

    // janr düymələri
    const mk = (key, label) => { const b = el("button", "jm-chip", label); b.dataset.k = key; b.addEventListener("click", () => pickChip(key)); chips.appendChild(b); };
    mk("", L("pop_")); GENRES.forEach(g => mk(g, L("g_" + g)));

    // axtarış
    let t = 0;
    inp.addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => runSearch(inp.value), 450); });
    inp.addEventListener("keydown", e => { if (e.key === "Enter") { clearTimeout(t); runSearch(inp.value); inp.blur(); } });
    more.addEventListener("click", () => load(false));
    refreshText();
  }

  function addNav() {
    const pills = document.querySelector(".pills");
    if (pills && !pills.querySelector('[data-pg="jamendo"]')) {
      const b = el("button", "pill"); b.dataset.pg = "jamendo";
      b.innerHTML = NOTE.replace("<svg ", '<svg width="12" height="12" ');
      b.appendChild(el("span", "", "")); b.lastChild.id = "n-jm";
      b.addEventListener("click", () => switchPage("jamendo"));
      const first = pills.querySelector('[data-pg="discover"]');
      first ? first.insertAdjacentElement("afterend", b) : pills.appendChild(b);
    }
    const ham = document.querySelector("#ham-menu .ham-item[data-pg]");
    if (ham && !document.querySelector('#ham-menu .ham-item[data-pg="jamendo"]')) {
      const it = el("div", "ham-item"); it.dataset.pg = "jamendo";
      it.innerHTML = NOTE; it.appendChild(el("span", "", "")); it.lastChild.id = "hm-jm";
      it.addEventListener("click", () => { try { closeHam(); } catch (_) {} switchPage("jamendo"); });
      ham.insertAdjacentElement("afterend", it);
    }
  }

  function refreshText() {
    const set = (id, v) => { const e = $(id); if (e) e.textContent = v; };
    set("n-jm", L("nav")); set("hm-jm", L("nav")); set("jm-h", L("title")); set("jm-sub", L("sub")); set("jm-credit", L("credit")); set("jm-more", L("more"));
    const q = $("jm-q"); if (q) q.placeholder = L("ph");
    document.querySelectorAll("#jm-chips .jm-chip").forEach(c => { c.textContent = c.dataset.k ? L("g_" + c.dataset.k) : L("pop_"); c.classList.toggle("on", c.dataset.k === J.tag && !J.q); });
    document.querySelectorAll(".jm-src").forEach(a => { a.textContent = L("src"); });
  }

  const msg = t => { const m = $("jm-msg"); if (m) m.textContent = t || ""; };

  /* ════════════════════════════════════════════
     YÜKLƏMƏ (proksi: /api/jamendo)
  ════════════════════════════════════════════ */
  function pickChip(key) { J.tag = key; J.q = ""; const q = $("jm-q"); if (q) q.value = ""; refreshText(); load(true); }
  function runSearch(v) { v = String(v || "").trim().slice(0, 60); if (v === J.q) return; J.q = v; if (v) J.tag = ""; refreshText(); load(true); }

  async function load(reset) {
    if (reset) { J.offset = 0; J.gen++; J.list.length = 0; $("jm-list").textContent = ""; }
    const g = J.gen;
    $("jm-more").hidden = true;
    if (!navigator.onLine) { msg(L("offline")); return; }
    msg(L("loading"));
    const p = new URLSearchParams({ offset: String(J.offset), limit: String(PAGE) });
    if (J.q) p.set("q", J.q); else if (J.tag) p.set("tag", J.tag);
    try {
      const r = await fetch("/api/jamendo?" + p.toString(), { signal: AbortSignal.timeout(15000) });
      const j = await r.json().catch(() => ({}));
      if (g !== J.gen) return;                                  // arada başqa axtarış başlayıb
      if (!r.ok || !j.ok) { msg(/JAMENDO_CLIENT_ID/.test(j.error || "") ? L("noKey") : L("err")); return; }
      const fresh = (j.tracks || []).filter(t => t && JM.test(t.audio || "") && !J.list.some(x => x.id === t.id));
      fresh.forEach(t => { J.list.push(t); $("jm-list").appendChild(row(t, J.list.length - 1)); });
      J.offset += PAGE; J.hasMore = !!j.hasMore;
      msg(J.list.length ? "" : L("empty"));
      $("jm-more").hidden = !(J.hasMore && J.list.length);
      markRows();
    } catch (e) {
      if (g === J.gen) msg(L("err"));
    }
  }

  function row(t, i) {
    const r = el("div", "jm-row"); r.dataset.i = String(i);
    const cv = el("button", "jm-cover"); cv.type = "button"; cv.setAttribute("aria-label", L("title") + ": " + t.title);
    if (t.image && JM.test(t.image)) { const im = el("img"); im.alt = ""; im.loading = "lazy"; im.src = t.image; im.onerror = () => { im.remove(); }; cv.appendChild(im); }
    cv.appendChild(el("i", "", "▶"));
    const info = el("div", "jm-info");
    info.appendChild(el("div", "jm-t", t.title)); info.appendChild(el("div", "jm-a", t.artist));
    const meta = el("div", "jm-meta");
    if (t.license && CC.test(t.license)) { const a = el("a", "", licLabel(t.license)); a.href = t.license; a.target = "_blank"; a.rel = "noopener noreferrer"; meta.appendChild(a); }
    if (t.link && JM.test(t.link)) { const a = el("a", "jm-src", L("src")); a.href = t.link; a.target = "_blank"; a.rel = "noopener noreferrer"; meta.appendChild(a); }
    info.appendChild(meta);
    const dur = el("div", "jm-dur", fmt(t.duration || 0));
    r.appendChild(cv); r.appendChild(info); r.appendChild(dur);
    const go = () => { J.queue = J.list.slice(); play(i); };
    cv.addEventListener("click", go); info.addEventListener("click", e => { if (e.target.closest("a")) return; go(); });
    return r;
  }

  function markRows() {
    document.querySelectorAll("#jm-list .jm-row").forEach(r => { const t = J.list[+r.dataset.i]; r.classList.toggle("on", !!(J.active && t && t.id === J.cur)); });
  }

  /* ════════════════════════════════════════════
     ÇALMA — sadə <audio> (Web Audio YOX → fonda susmur)
  ════════════════════════════════════════════ */
  function stopOthers() {
    try { stopOffAudio(); } catch (_) {}
    try { stopStreamAudio(); } catch (_) {}
    try { if (S.ytOk && S.ytp && S.ytp.stopVideo) S.ytp.stopVideo(); } catch (_) {}
    try { stopTimer(); } catch (_) {}
  }

  function setInfo(t) {
    $("p-title").textContent = t.title; $("p-artist").textContent = t.artist;
    const img = $("p-img"), ico = $("note-ico");
    if (t.image && JM.test(t.image)) {
      img.onerror = () => { img.style.display = "none"; ico.style.display = ""; };
      img.onload = () => { img.style.display = "block"; ico.style.display = "none"; };
      img.src = t.image;
    } else { img.style.display = "none"; ico.style.display = ""; }
    $("pfill").style.width = "0%"; $("p-cur").textContent = "0:00"; $("p-dur").textContent = fmt(t.duration || 0);
  }

  function setMS(t) {
    if (!("mediaSession" in navigator)) return;
    const ms = navigator.mediaSession;
    try {
      ms.metadata = new MediaMetadata({
        title: t.title, artist: t.artist, album: t.album || "",
        artwork: t.image ? [{ src: t.image, sizes: "500x500", type: "image/jpeg" }] : []
      });
    } catch (_) {}
    const a = () => J.audio;
    const h = (n, f) => { try { ms.setActionHandler(n, f); } catch (_) {} };
    h("play", () => { if (a()) { const p = a().play(); if (p && p.catch) p.catch(() => {}); } });
    h("pause", () => { if (a()) a().pause(); });
    h("seekto", d => { if (a() && d && isFinite(d.seekTime) && isFinite(a().duration)) a().currentTime = Math.max(0, Math.min(d.seekTime, a().duration)); });
    h("seekbackward", d => { if (a()) a().currentTime = Math.max(0, a().currentTime - ((d && d.seekOffset) || 10)); });
    h("seekforward", d => { if (a() && isFinite(a().duration)) a().currentTime = Math.min(a().duration, a().currentTime + ((d && d.seekOffset) || 10)); });
    h("previoustrack", () => prev());
    h("nexttrack", () => next());
  }

  function play(i) {
    const t = J.queue[i]; if (!t || !JM.test(t.audio || "")) return;
    stopOthers();
    const a = new Audio();
    a.preload = "auto"; a.volume = S.vol / 100; a.src = t.audio;
    S.streamAudio = a; J.audio = a; J.qi = i; J.cur = t.id; J.active = true; S.idx = -1; S.playing = false;
    a.onplay = () => { S.playing = true; setPUI("play"); try { navigator.mediaSession.playbackState = "playing"; } catch (_) {} };
    a.onpause = () => { S.playing = false; setPUI("pause"); try { navigator.mediaSession.playbackState = "paused"; } catch (_) {} };
    a.onwaiting = () => setPUI("loading");
    a.onplaying = () => setPUI("play");
    a.onended = () => { S.playing = false; if (S.repeat) { a.currentTime = 0; const p = a.play(); if (p && p.catch) p.catch(() => {}); } else next(); };
    a.onerror = () => { if (S.streamAudio === a) { S.playing = false; setPUI("pause"); say(L("playErr")); } };
    a.ontimeupdate = () => {
      const c = a.currentTime, d = a.duration; if (!d || isNaN(d)) return;
      $("pfill").style.width = (c / d * 100) + "%"; $("p-cur").textContent = fmt(c); $("p-dur").textContent = fmt(d);
    };
    setInfo(t); setMS(t); setPUI("loading"); markRows();
    const p = a.play(); if (p && p.catch) p.catch(() => { if (S.streamAudio === a) { setPUI("pause"); } });
  }

  async function next() {
    if (!J.queue.length) return;
    // növbənin sonundayıq və siyahı hələ də eynidir: daha çox trek yüklə
    if (J.qi >= J.queue.length - 1 && J.hasMore && !S.shuffle && J.queue.length === J.list.length) {
      await load(false); J.queue = J.list.slice();
    }
    let n;
    if (S.shuffle && J.queue.length > 1) { do { n = Math.floor(Math.random() * J.queue.length); } while (n === J.qi); }
    else n = (J.qi + 1) % J.queue.length;
    play(n);
  }
  function prev() {
    if (!J.queue.length) return;
    if (J.audio && J.audio.currentTime > 3) { J.audio.currentTime = 0; return; }
    play((J.qi - 1 + J.queue.length) % J.queue.length);
  }

  // Başqa mühərrik (YouTube / endirilmiş) başlayanda Jamendo əlaqəsini burax
  function deactivate() {
    if (!J.active) return;
    J.active = false; J.audio = null; markRows();
  }
  if (typeof window.playSong === "function") {
    const _ps = window.playSong;
    window.playSong = function () { deactivate(); return _ps.apply(this, arguments); };
  }

  // Pleyer düymələri Jamendo trekini idarə etsin (əsas skript yalnız YouTube/endirilmişi tanıyır)
  function hookControls() {
    const on = (id, fn) => {
      const e = $(id); if (!e) return;
      e.addEventListener("click", ev => { if (J.active && J.audio && S.streamAudio === J.audio) { ev.stopImmediatePropagation(); fn(ev); } }, true);
    };
    on("b-next", () => next());
    on("b-prev", () => prev());
    on("b-play", () => { const a = J.audio; if (a.paused) { const p = a.play(); if (p && p.catch) p.catch(() => {}); } else a.pause(); });
    on("ptrack", ev => {
      const a = J.audio, r = $("ptrack").getBoundingClientRect(), p = (ev.clientX - r.left) / r.width;
      if (a.duration && isFinite(a.duration)) a.currentTime = Math.max(0, Math.min(1, p)) * a.duration;
    });
    const vt = $("vtrack");
    if (vt) vt.addEventListener("click", () => { if (J.active && J.audio) { try { J.audio.volume = S.vol / 100; } catch (_) {} } });
  }

  // Bildirişdəki irəliləyiş zolağı
  setInterval(() => {
    const a = J.active && J.audio;
    if (!a || !("mediaSession" in navigator) || !navigator.mediaSession.setPositionState) return;
    if (!isFinite(a.duration) || a.duration <= 0) return;
    try { navigator.mediaSession.setPositionState({ duration: a.duration, playbackRate: a.playbackRate || 1, position: Math.max(0, Math.min(a.currentTime, a.duration)) }); } catch (_) {}
  }, 1000);

  /* ══ səhifə açılanda ilk yükləmə + dil ══ */
  const _sw = window.switchPage;
  window.switchPage = function (pg) {
    const r = _sw.apply(this, arguments);
    if (pg === "jamendo" && !J.started) { J.started = true; setTimeout(() => load(true), 0); }
    return r;
  };
  if (typeof window.applyLang === "function") {
    const _al = window.applyLang;
    window.applyLang = function () { const r = _al.apply(this, arguments); try { refreshText(); } catch (_) {} return r; };
  }

  try { buildPage(); addNav(); hookControls(); }
  catch (e) { console.warn("[jamendo] başlanğıc xətası:", e); }
})();