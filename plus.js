/* ═══════════════════════════════════════════════════════════
   Music Universe — plus.js
   1) "Məlumatlarım" mərkəzi (ixrac, hesab silmə, məxfilik)
   2) Birlikdə dinləmə otağı (Firebase Realtime DB sinxron)
   3) Şəxsi dinləmə hesabatı (həftəlik, saatlıq, top ifaçı, seriya)
   4) Əlçatanlıq (klaviatura qısayolları, ekran oxuyucu, kontrast, mətn)
   index.html-in ƏSAS skriptindən, features.js və stats.js-dən
   SONRA yüklənir. Heç bir mövcud funksiyanı sındırmır — hamısı
   əlavə (additive) və müdafiəçi (defensive) yazılıb.
═══════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ── Əsas skript hazırdırmı? ── */
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
  const me = () => (typeof S !== "undefined" && S.user) ? S.user : null;
  const thumbOf = v => { try { return TH(v); } catch (_) { return "https://img.youtube.com/vi/" + v + "/mqdefault.jpg"; } };

  /* ══ DİLLƏR ══ */
  const I18N = {
    az: {
      myData: "Məlumatlarım", myDataSub: "İxrac, məxfilik, hesabın silinməsi",
      open: "Aç", close: "Bağla",
      exportT: "Məlumatları ixrac et", exportSub: "Profil, playlistlər, sevimlilər, tarix, statistika və parametrlər — bir JSON faylda (endirilmiş audio fayllar daxil deyil)",
      exportBtn: "⬆ JSON yüklə", exported: "✅ Məlumatlar yükləndi",
      privT: "Dostlara görünən", privSub: "Nələrin görünəcəyini seç",
      privNow: "İndi çalınan mahnı", privNowSub: "Dostlar nə dinlədiyini görür",
      privStats: "Profil statistikası", privStatsSub: "Oynatma, dəqiqə, top mahnılar",
      privOnline: "Onlayn statusu", privOnlineSub: "Dostlar onlayn olduğunu görür",
      dangerT: "Təhlükəli zona", dangerSub: "Hesab və bütün məlumatlar həmişəlik silinir — geri qaytarmaq olmur",
      delBtn: "🗑 Hesabı və məlumatları sil",
      delC1: "Əminsən? Bu, profilini, dostluqlarını, mesajlarını, statistikanı və bu cihazdakı bütün məlumatları siləcək.",
      delYes: "Bəli, hər şeyi sil", delNo: "Ləğv et", deleting: "⏳ Silinir…", deleted: "✅ Hər şey silindi",
      delReauth: "⚠ Təhlükəsizlik üçün hesaba yenidən daxil olub təkrar silməyi yoxla",
      room: "Birlikdə dinləmə", roomSub: "Dostlarla eyni mahnını eyni anda (sinxron)",
      roomNew: "Yeni otaq yarat", roomJoin: "Qoşul", roomCodePh: "Otaq kodu (məs. X7K2P9)",
      roomNeedLogin: "Otaq üçün əvvəlcə Google ilə daxil ol", roomLogin: "Google ilə daxil ol",
      roomCreated: "✅ Otaq yaradıldı — kodu dostlara göndər",
      roomJoined: "🎧 Otağa qoşuldun — sinxron dinləmə aktivdir",
      roomLeft: "Otaqdan çıxdın", roomNotFound: "❌ Otaq tapılmadı", roomBadCode: "⚠ Kod düzgün deyil", roomPerm: "⚠ Firebase qaydaları /rooms-a icazə vermir — database.rules.json-dakı rooms blokunu Firebase Console → Realtime Database → Rules-a əlavə et",
      roomInvite: "Dəvət linki", roomCopied: "🔗 Dəvət linki kopyalandı!",
      roomMembers: "İştirakçılar", roomNow: "Otaqda çalınır", roomLeave: "Otaqdan çıx",
      roomCode: "Kod:", roomSync: "sinxron", roomHost: "qonaqpərvər", copyLbl: "kopyala", rep7days: "7 gün",
      report: "Dinləmə hesabatı", reportSub: "Həftəlik qrafik, saatlar, top ifaçı, seriya",
      repTitle: "📈 Dinləmə hesabatım", repWeek: "Son 7 gün", repHours: "Saat üzrə dinləmə",
      repTopArtist: "Ən çox dinlənən ifaçı", repTopArtists: "Top ifaçılar",
      repStreak: "Ardıcıl gün", repPlays: "dinləmə", repMins: "dəqiqə", repNoData: "Hələ kifayət qədər dinləmə məlumatı yoxdur — bir neçə mahnı çal, sonra bura bax 🎧",
      repDays: ["B.e", "Ç.a", "Ç.", "C.a", "C.", "Ş.", "B."],
      a11y: "Əlçatanlıq", a11ySub: "Klaviatura, kontrast, mətn ölçüsü",
      a11yHC: "Yüksək kontrast", a11yHCSub: "Daha güclü rənglər və kənarlar",
      a11yBig: "Böyük mətn", a11yBigSub: "Bütün yazılar böyüyür",
      a11yKeys: "Klaviatura qısayolları", a11yKeysSub: "Tam idarəetmə klaviaturadan",
      keysTitle: "⌨️ Klaviatura qısayolları",
      nowPlayingAnn: "İndi çalınır:",
      kSpace: "Oynat / Dayandır", kSeek: "10 san. geri / irəli", kVol: "Səsi azalt / artır",
      kNext: "Növbəti mahnı", kPrev: "Əvvəlki mahnı", kMute: "Səsi söndür / aç",
      kShuf: "Qarışdırma aç / bağla", kRep: "Təkrar aç / bağla", kSearch: "Axtarışa keç", kHelp: "Bu pəncərəni aç",
    },
    en: {
      myData: "My Data", myDataSub: "Export, privacy, account deletion",
      open: "Open", close: "Close",
      exportT: "Export my data", exportSub: "Profile, playlists, likes, history, stats and settings in one JSON file (downloaded audio not included)",
      exportBtn: "⬆ Download JSON", exported: "✅ Data downloaded",
      privT: "Visible to friends", privSub: "Choose what friends can see",
      privNow: "Now playing", privNowSub: "Friends see what you're listening to",
      privStats: "Profile stats", privStatsSub: "Plays, minutes, top songs",
      privOnline: "Online status", privOnlineSub: "Friends see when you're online",
      dangerT: "Danger zone", dangerSub: "Account and all data are permanently deleted — this cannot be undone",
      delBtn: "🗑 Delete account and data",
      delC1: "Are you sure? This deletes your profile, friendships, messages, stats and all data on this device.",
      delYes: "Yes, delete everything", delNo: "Cancel", deleting: "⏳ Deleting…", deleted: "✅ Everything deleted",
      delReauth: "⚠ For security, sign in again and retry deletion",
      room: "Listen together", roomSub: "Same song, same time, in sync with friends",
      roomNew: "Create a room", roomJoin: "Join", roomCodePh: "Room code (e.g. X7K2P9)",
      roomNeedLogin: "Sign in with Google to use rooms", roomLogin: "Sign in with Google",
      roomCreated: "✅ Room created — send the code to friends",
      roomJoined: "🎧 Joined — synced listening is on",
      roomLeft: "Left the room", roomNotFound: "❌ Room not found", roomBadCode: "⚠ Invalid code", roomPerm: "⚠ Firebase rules deny /rooms — add the rooms block from database.rules.json in Firebase Console → Realtime Database → Rules",
      roomInvite: "Invite link", roomCopied: "🔗 Invite link copied!",
      roomMembers: "Members", roomNow: "Playing in room", roomLeave: "Leave room",
      roomCode: "Code:", roomSync: "in sync", roomHost: "host", copyLbl: "copy", rep7days: "7 days",
      report: "Listening report", reportSub: "Weekly chart, hours, top artist, streak",
      repTitle: "📈 My listening report", repWeek: "Last 7 days", repHours: "Listening by hour",
      repTopArtist: "Most played artist", repTopArtists: "Top artists",
      repStreak: "Day streak", repPlays: "plays", repMins: "minutes", repNoData: "Not enough listening data yet — play a few songs and check back 🎧",
      repDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      a11y: "Accessibility", a11ySub: "Keyboard, contrast, text size",
      a11yHC: "High contrast", a11yHCSub: "Stronger colors and borders",
      a11yBig: "Large text", a11yBigSub: "Enlarges all text",
      a11yKeys: "Keyboard shortcuts", a11yKeysSub: "Full control from the keyboard",
      keysTitle: "⌨️ Keyboard shortcuts",
      nowPlayingAnn: "Now playing:",
      kSpace: "Play / Pause", kSeek: "Seek 10s back / forward", kVol: "Volume down / up",
      kNext: "Next song", kPrev: "Previous song", kMute: "Mute / unmute",
      kShuf: "Toggle shuffle", kRep: "Toggle repeat", kSearch: "Go to search", kHelp: "Open this panel",
    },
    ru: {
      myData: "Мои данные", myDataSub: "Экспорт, приватность, удаление аккаунта",
      open: "Открыть", close: "Закрыть",
      exportT: "Экспорт данных", exportSub: "Профиль, плейлисты, лайки, история, статистика и настройки в одном JSON (без аудиофайлов)",
      exportBtn: "⬆ Скачать JSON", exported: "✅ Данные скачаны",
      privT: "Видно друзьям", privSub: "Выбери, что видят друзья",
      privNow: "Сейчас играет", privNowSub: "Друзья видят, что ты слушаешь",
      privStats: "Статистика профиля", privStatsSub: "Прослушивания, минуты, топ песен",
      privOnline: "Статус онлайн", privOnlineSub: "Друзья видят, когда ты в сети",
      dangerT: "Опасная зона", dangerSub: "Аккаунт и все данные удаляются навсегда — восстановить нельзя",
      delBtn: "🗑 Удалить аккаунт и данные",
      delC1: "Ты уверен? Это удалит профиль, друзей, сообщения, статистику и все данные на этом устройстве.",
      delYes: "Да, удалить всё", delNo: "Отмена", deleting: "⏳ Удаление…", deleted: "✅ Всё удалено",
      delReauth: "⚠ Для безопасности войди снова и повтори удаление",
      room: "Слушать вместе", roomSub: "Одна песня в одно время — синхронно с друзьями",
      roomNew: "Создать комнату", roomJoin: "Войти", roomCodePh: "Код комнаты (напр. X7K2P9)",
      roomNeedLogin: "Войди через Google, чтобы использовать комнаты", roomLogin: "Войти через Google",
      roomCreated: "✅ Комната создана — отправь код друзьям",
      roomJoined: "🎧 Ты в комнате — синхронное прослушивание включено",
      roomLeft: "Ты вышел из комнаты", roomNotFound: "❌ Комната не найдена", roomBadCode: "⚠ Неверный код", roomPerm: "⚠ Правила Firebase не пускают /rooms — добавь блок rooms из database.rules.json в Firebase Console → Realtime Database → Rules",
      roomInvite: "Ссылка-приглашение", roomCopied: "🔗 Ссылка скопирована!",
      roomMembers: "Участники", roomNow: "Играет в комнате", roomLeave: "Выйти из комнаты",
      roomCode: "Код:", roomSync: "синхронно", roomHost: "хост", copyLbl: "копировать", rep7days: "7 дней",
      report: "Отчёт прослушиваний", reportSub: "Недельный график, часы, топ исполнитель, серия",
      repTitle: "📈 Мой отчёт", repWeek: "Последние 7 дней", repHours: "Прослушивания по часам",
      repTopArtist: "Самый слушаемый исполнитель", repTopArtists: "Топ исполнители",
      repStreak: "Дней подряд", repPlays: "прослушиваний", repMins: "минут", repNoData: "Пока мало данных — послушай несколько песен и возвращайся 🎧",
      repDays: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
      a11y: "Доступность", a11ySub: "Клавиатура, контраст, размер текста",
      a11yHC: "Высокий контраст", a11yHCSub: "Более сильные цвета и рамки",
      a11yBig: "Крупный текст", a11yBigSub: "Увеличивает весь текст",
      a11yKeys: "Горячие клавиши", a11yKeysSub: "Полное управление с клавиатуры",
      keysTitle: "⌨️ Горячие клавиши",
      nowPlayingAnn: "Сейчас играет:",
      kSpace: "Играть / Пауза", kSeek: "10 сек назад / вперёд", kVol: "Громкость",
      kNext: "Следующая песня", kPrev: "Предыдущая песня", kMute: "Без звука",
      kShuf: "Перемешать", kRep: "Повтор", kSearch: "К поиску", kHelp: "Открыть эту панель",
    }
  };
  const curLang = () => { try { return I18N[LANG] ? LANG : "az"; } catch (_) { return "az"; } };
  const L = k => (I18N[curLang()] || I18N.az)[k] ?? I18N.az[k] ?? k;

  /* ══ CSS ══ */
  const css = document.createElement("style");
  css.id = "mu-plus-css";
  css.textContent = `
/* ── keçid (switch) ── */
.mu-sw{position:relative;width:40px;height:23px;flex-shrink:0;display:inline-block}
.mu-sw input{position:absolute;inset:0;opacity:0;margin:0;cursor:pointer;z-index:2}
.mu-sw i{position:absolute;inset:0;background:var(--c4);border:1.5px solid var(--bd2);border-radius:999px;transition:.18s;pointer-events:none}
.mu-sw i:before{content:"";position:absolute;left:2px;top:2px;width:15px;height:15px;border-radius:50%;background:var(--t2);transition:.18s}
.mu-sw input:checked + i{background:var(--g);border-color:var(--g)}
.mu-sw input:checked + i:before{transform:translateX(16px);background:#06210f}
.mu-sw input:focus-visible + i{outline:2.5px solid var(--g);outline-offset:2px}
.mu-hr{height:1px;background:var(--bd2);margin:14px 0;opacity:.7}
.mu-sect{font-family:var(--fh);font-weight:800;font-size:.85rem;margin:14px 0 4px}
.mu-note{font-size:.72rem;color:var(--t3);line-height:1.55;margin:3px 0 8px}
.mu-danger{border:1.5px solid rgba(240,48,80,.3);background:rgba(240,48,80,.06);border-radius:12px;padding:11px 12px;margin-top:6px}
.mu-danger-btn{width:100%;padding:10px;border-radius:10px;background:rgba(240,48,80,.12);border:1.5px solid rgba(240,48,80,.35);color:var(--red);font:800 .8rem var(--fb);cursor:pointer}
.mu-danger-btn:hover{background:rgba(240,48,80,.2)}
.mu-ghost-btn{width:100%;padding:9px;border-radius:10px;background:var(--c3);border:1.5px solid var(--bd2);color:var(--t2);font:700 .79rem var(--fb);cursor:pointer;margin-top:7px}
.mu-ghost-btn:hover{background:var(--c4);color:var(--tx)}
/* ── otaq ── */
.mu-room-code{display:flex;gap:7px;margin:8px 0}
.mu-room-code input{flex:1;padding:10px 12px;border-radius:10px;background:var(--c2);border:1.5px solid var(--bd2);color:var(--tx);font:700 .9rem var(--fh);letter-spacing:.14em;text-transform:uppercase;outline:none}
.mu-room-code input:focus{border-color:var(--g)}
.mu-code-chip{display:inline-flex;align-items:center;gap:7px;padding:7px 12px;border-radius:999px;background:var(--gd);border:1.5px solid rgba(30,215,96,.35);color:var(--g);font:800 .85rem var(--fh);letter-spacing:.12em;cursor:pointer}
.mu-members{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}
.mu-member{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:999px;background:var(--c3);border:1.5px solid var(--bd2);font:700 .72rem var(--fb);color:var(--t2)}
.mu-member img{width:18px;height:18px;border-radius:50%;object-fit:cover}
.mu-member.host{border-color:rgba(245,197,24,.4);color:var(--vip)}
.mu-room-now{display:flex;align-items:center;gap:10px;padding:10px;border-radius:12px;background:var(--c2);border:1.5px solid var(--bd2);margin:8px 0}
.mu-room-now img{width:46px;height:46px;border-radius:8px;object-fit:cover}
.mu-sync-dot{width:8px;height:8px;border-radius:50%;background:var(--g);box-shadow:0 0 8px var(--g);animation:muPulse 1.6s infinite}
@keyframes muPulse{50%{opacity:.35}}
.mu-room-btn{display:inline-flex;align-items:center;gap:7px;width:100%;padding:10px 12px;border-radius:11px;background:linear-gradient(135deg,var(--gd),transparent);border:1.5px solid rgba(30,215,96,.3);color:var(--tx);font:800 .81rem var(--fh);cursor:pointer;margin:6px 0 10px}
.mu-room-btn:hover{background:var(--gd)}
/* ── hesabat qrafikləri ── */
.rep-cards{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;margin:10px 0}
.rep-card{background:var(--c2);border:1.5px solid var(--bd2);border-radius:11px;padding:10px 8px;text-align:center}
.rep-num{font:800 1.15rem var(--fh);color:var(--g)}
.rep-lbl{font-size:.64rem;color:var(--t3);font-weight:700;text-transform:uppercase;letter-spacing:.04em;margin-top:2px}
.rep-bars{display:flex;align-items:flex-end;gap:4px;height:96px;padding:4px 2px 0}
.rep-bar-w{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;height:100%;justify-content:flex-end}
.rep-bar{width:100%;border-radius:4px 4px 2px 2px;background:linear-gradient(180deg,var(--g),var(--g2));min-height:3px;transition:height .3s}
.rep-bar.dim{background:var(--c4)}
.rep-bar-lbl{font-size:.58rem;color:var(--t3);font-weight:700}
.rep-sect{font:800 .8rem var(--fh);margin:14px 0 6px;display:flex;align-items:center;gap:6px}
.rep-artist{display:flex;align-items:center;gap:9px;padding:7px 4px;border-bottom:1px solid var(--bd2)}
.rep-artist:last-child{border-bottom:none}
.rep-rank{font:800 .82rem var(--fh);color:var(--t3);width:18px;text-align:center}
.rep-rank.gold{color:var(--vip)}
.rep-aname{flex:1;font-weight:700;font-size:.83rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rep-acnt{font-size:.72rem;color:var(--t3);font-weight:700}
/* ── qısayol cədvəli ── */
.mu-keys{display:flex;flex-direction:column;gap:5px;margin-top:6px}
.mu-key-row{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:.8rem;color:var(--t2)}
.mu-kbd{display:inline-flex;gap:3px}
.mu-kbd span{padding:3px 8px;border-radius:6px;background:var(--c3);border:1.5px solid var(--bd2);border-bottom-width:3px;font:700 .68rem var(--fb);color:var(--tx)}
/* ── ekran oxuyucu üçün gizli ── */
.mu-sr{position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
/* ── ƏLÇATANLIQ: fokus ── */
:focus-visible{outline:2.5px solid var(--g)!important;outline-offset:2px;border-radius:6px}
/* ── ƏLÇATANLIQ: yüksək kontrast ── */
html.mu-hc[data-theme="dark"]{--t2:#e6efe9;--t3:#c3d2c9;--bd2:#7e93a8;--c2:#16202e;--c3:#1d2a3b}
html.mu-hc[data-theme="light"]{--t2:#1c2733;--t3:#3a4a5a;--bd2:#55677a}
html.mu-hc .card,html.mu-hc .mbox,html.mu-hc .ibtn,html.mu-hc .pbtn,html.mu-hc .frrow,html.mu-hc .hist-row{border-width:2px!important}
html.mu-hc #player{border-top:2.5px solid var(--t2)}
html.mu-hc a,html.mu-hc button{outline-offset:2px}
html.mu-hc .settings-sub,html.mu-hc .mu-note{color:var(--t2)!important}
/* ── ƏLÇATANLIQ: böyük mətn ── */
html.mu-big{font-size:118%}
html.mu-big .pbtn{width:44px;height:44px}
html.mu-big .ibtn{width:38px;height:38px}
html.mu-big input,html.mu-big textarea{font-size:1rem!important}
@media (max-width:640px){ html.mu-big{font-size:112%} }
`;
  document.head.appendChild(css);

  /* ════════════════════════════════════════════
     1) MƏLUMATLARIM MƏRKƏZİ
     • ixrac (yerli + bulud, bir JSON)
     • dostlara görünənlər (məxfilik)
     • hesabın və bütün məlumatların silinməsi
  ════════════════════════════════════════════ */

  // window.MU_PRIV index.html-də yaradılır; burada Firebase ilə sinxronlayırıq
  function cachePriv() { try { localStorage.setItem("mu_privacy", JSON.stringify(window.MU_PRIV)); } catch (_) {} }

  async function loadPrivacy() {
    if (!hasFB() || !me()) return;
    try {
      const snap = await fbD.ref(`users/${me().uid}/privacy`).get();
      if (snap && snap.exists()) {
        const v = snap.val() || {};
        ["nowPlaying", "stats", "online"].forEach(k => { if (typeof v[k] === "boolean") window.MU_PRIV[k] = v[k]; });
        cachePriv();
      }
    } catch (_) {}
  }

  // Məxfilik dəyişəndə dərhal tətbiq olunan yan təsirlər
  async function applyPrivacySideEffects() {
    if (!hasFB() || !me()) return;
    const uid = me().uid;
    try {
      if (!window.MU_PRIV_ON("nowPlaying")) await fbD.ref(`users/${uid}/nowPlaying`).remove().catch(() => {});
      if (!window.MU_PRIV_ON("stats")) await fbD.ref(`users/${uid}/stats`).remove().catch(() => {});
      if (!window.MU_PRIV_ON("online")) await fbD.ref(`users/${uid}/online`).set(false).catch(() => {});
      else await fbD.ref(`users/${uid}/online`).set(true).catch(() => {});
    } catch (_) {}
  }

  async function setPrivacy(key, val) {
    window.MU_PRIV[key] = !!val;
    cachePriv();
    if (hasFB() && me()) {
      try { await fbD.ref(`users/${me().uid}/privacy/${key}`).set(!!val); } catch (_) {}
    }
    applyPrivacySideEffects();
  }

  /* ── Tam ixrac ── */
  async function exportAllData() {
    try {
      const out = {
        app: "music-universe", type: "full-export", version: 1,
        exportedAt: new Date().toISOString(),
        account: me() ? { uid: me().uid, email: me().email, name: me().displayName } : null,
        cloud: null,
        local: {},
        settings: {}
      };

      // Yerli (IndexedDB) — audio blob-lar nəzərdə tutulmayıb
      const grab = t => ldb[t].toArray().catch(() => []);
      const [saved, offline, downloads, likes, history, playlists, plSongs] = await Promise.all([
        grab("saved"), grab("offline"), grab("downloads"), grab("likes"), grab("history"), grab("playlists"), grab("pl_songs")
      ]);
      const strip = r => { const o = Object.assign({}, r); delete o.blob; delete o.id; return o; };
      out.local = {
        saved: saved.map(strip), offline: offline.map(strip), downloads: downloads.map(strip),
        likes: likes.map(strip), history: history.map(strip),
        playlists: playlists.map(p => ({
          name: p.name, createdAt: p.createdAt || 0,
          songs: plSongs.filter(s => s.playlistId === p.id).map(strip)
        }))
      };

      // Parametrlər (mu_* açarları)
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("mu_")) out.settings[k] = localStorage.getItem(k);
      }

      // Bulud (Firebase) — yalnız öz məlumatların
      if (hasFB() && me() && navigator.onLine) {
        const uid = me().uid;
        const [prof, songs, sum, fr] = await Promise.allSettled([
          fbD.ref(`users/${uid}`).get(),
          fbD.ref(`stats/${uid}/songs`).get(),
          fbD.ref(`stats/${uid}`).get(),
          fbD.ref(`friends/${uid}`).get()
        ]);
        const songStats = [];
        if (songs.status === "fulfilled" && songs.value.exists()) {
          songs.value.forEach(ch => songStats.push(Object.assign({ videoId: ch.key }, ch.val())));
        }
        out.cloud = {
          profile: prof.status === "fulfilled" && prof.value.exists() ? prof.value.val() : null,
          statsSummary: sum.status === "fulfilled" && sum.value.exists() ? sum.value.val() : null,
          songStats,
          friendUids: fr.status === "fulfilled" && fr.value.exists() ? Object.keys(fr.value.val()) : []
        };
      }

      const day = new Date().toISOString().slice(0, 10);
      const blob = new Blob([JSON.stringify(out, null, 1)], { type: "application/json" });
      const a = document.createElement("a");
      const url = URL.createObjectURL(blob);
      a.href = url; a.download = "music-universe-my-data-" + day + ".json";
      document.body.appendChild(a); a.click();
      setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 2000);
      say(L("exported"));
    } catch (e) { console.warn("[mydata] ixrac:", e); say("❌ " + e.message); }
  }

  /* ── Hesabın və bütün məlumatların silinməsi ── */
  async function wipeLocal() {
    try { localStorage.clear(); } catch (_) {}
    try { if (window.caches) { const ks = await caches.keys(); await Promise.all(ks.map(k => caches.delete(k))); } } catch (_) {}
    try { await ldb.delete(); } catch (_) {}
    try { if (typeof Dexie !== "undefined") { await new Dexie("MUfeat").delete().catch(() => {}); await new Dexie("MUreport").delete().catch(() => {}); } } catch (_) {}
  }

  async function deleteAccountEverything(statusEl) {
    const setStatus = m => { if (statusEl) statusEl.textContent = m; };
    const uid = me() && me().uid;

    // 1) Bulud məlumatları
    if (hasFB() && uid && navigator.onLine) {
      setStatus(L("deleting"));
      try {
        // Otaqlar: üzv olduğum otaqlardan çıx, yaratdıqlarımı sil
        let joined = [];
        try { joined = JSON.parse(localStorage.getItem("mu_rooms_joined") || "[]"); } catch (_) {}
        for (const rid of joined.slice(0, 50)) {
          const rsnap = await fbD.ref(`rooms/${rid}`).get().catch(() => null);
          if (rsnap && rsnap.exists()) {
            const rv = rsnap.val() || {};
            if (rv.host === uid) await fbD.ref(`rooms/${rid}`).remove().catch(() => {});
            else await fbD.ref(`rooms/${rid}/members/${uid}`).remove().catch(() => {});
          }
        }
        // Dostlar: qarşılıqlı sil + DM otaqlarını təmizlə
        const frSnap = await fbD.ref(`friends/${uid}`).get().catch(() => null);
        const fuids = frSnap && frSnap.exists() ? Object.keys(frSnap.val()) : [];
        for (const f of fuids.slice(0, 300)) {
          await fbD.ref(`friends/${f}/${uid}`).remove().catch(() => {});
          await fbD.ref(`friendRequests/${f}/${uid}`).remove().catch(() => {});
          await fbD.ref(`dms/${[uid, f].sort().join("_")}`).remove().catch(() => {});
        }
        // Öz düyünlərim
        for (const path of [`friends/${uid}`, `friendRequests/${uid}`, `notifications/${uid}`, `stats/${uid}`, `users/${uid}`]) {
          await fbD.ref(path).remove().catch(() => {});
        }
      } catch (e) { console.warn("[mydata] bulud silmə:", e); }
    }

    // 2) Auth hesabı
    let authDeleted = true;
    if (hasFB() && me()) {
      try { await fbA.currentUser.delete(); }
      catch (e) {
        authDeleted = false;
        console.warn("[mydata] auth silmə:", e);
        if (e && e.code === "auth/requires-recent-login") say(L("delReauth"), 5000);
        try { await fbA.signOut(); } catch (_) {}
      }
    }

    // 3) Yerli məlumatlar
    await wipeLocal();
    say(L("deleted"));
    setTimeout(() => location.reload(), 1200);
    return authDeleted;
  }

  /* ── Modal ── */
  function privRow(key, title, sub) {
    return `<div class="settings-row">
  <div><div class="settings-lbl">${esc(title)}</div><div class="settings-sub">${esc(sub)}</div></div>
  <label class="mu-sw"><input type="checkbox" data-priv="${key}" ${window.MU_PRIV_ON(key) ? "checked" : ""} aria-label="${esc(title)}"/><i></i></label>
</div>`;
  }

  function openDataCenter() {
    const b = $("m-data-b"); if (!b) return;
    const loggedIn = !!me();
    b.innerHTML = `<div class="mtit">🗂 ${esc(L("myData"))}</div>

<div class="mu-sect">⬆ ${esc(L("exportT"))}</div>
<div class="mu-note">${esc(L("exportSub"))}</div>
<button class="mu-ghost-btn" id="mu-data-exp" style="margin-top:0">${esc(L("exportBtn"))}</button>

<div class="mu-hr"></div>
<div class="mu-sect">👀 ${esc(L("privT"))}</div>
<div class="mu-note">${esc(L("privSub"))}${loggedIn ? "" : " — ⚠ " + esc(L("roomNeedLogin"))}</div>
${privRow("nowPlaying", "🎵 " + L("privNow"), L("privNowSub"))}
${privRow("stats", "📊 " + L("privStats"), L("privStatsSub"))}
${privRow("online", "🟢 " + L("privOnline"), L("privOnlineSub"))}

<div class="mu-hr"></div>
<div class="mu-sect" style="color:var(--red)">⚠ ${esc(L("dangerT"))}</div>
<div class="mu-note">${esc(L("dangerSub"))}</div>
<div class="mu-danger">
  <button class="mu-danger-btn" id="mu-del-1">${esc(L("delBtn"))}</button>
  <div id="mu-del-confirm" style="display:none;margin-top:10px">
    <div class="mu-note" style="color:var(--red)">${esc(L("delC1"))}</div>
    <div id="mu-del-status" class="mu-note" aria-live="polite"></div>
    <div style="display:flex;gap:8px">
      <button class="mu-danger-btn" id="mu-del-yes" style="flex:1">${esc(L("delYes"))}</button>
      <button class="mu-ghost-btn" id="mu-del-no" style="flex:1;margin-top:0">${esc(L("delNo"))}</button>
    </div>
  </div>
</div>`;

    $("mu-data-exp").addEventListener("click", exportAllData);
    b.querySelectorAll("[data-priv]").forEach(inp => {
      inp.addEventListener("change", () => setPrivacy(inp.dataset.priv, inp.checked));
    });
    $("mu-del-1").addEventListener("click", () => { $("mu-del-confirm").style.display = "block"; $("mu-del-1").style.display = "none"; });
    $("mu-del-no").addEventListener("click", () => { $("mu-del-confirm").style.display = "none"; $("mu-del-1").style.display = "block"; });
    $("mu-del-yes").addEventListener("click", async () => {
      $("mu-del-yes").disabled = true;
      await deleteAccountEverything($("mu-del-status"));
    });

    openM("m-data");
  }

  /* ════════════════════════════════════════════
     2) BİRLİKDƏ DİNLƏMƏ OTAĞI (Firebase sinxron)
     rooms/{id} = { name, host, createdAt,
                    state:{videoId,title,artist,thumb,playing,pos,at,by},
                    members:{uid:{name,photo,at}} }
     Hamı idarə edə bilər; dəyişikliklər otağın "state" düyününə
     yazılır və bütün üzvlərə yayılır.
  ════════════════════════════════════════════ */
  const ROOM = { id: null, host: null, name: "", stateRef: null, memRef: null, membersRef: null,
                 members: {}, lastRemote: null, timer: 0, hb: 0, suppressUntil: 0 };
  let pendingRoom = null;

  const curSong = () => (S.idx >= 0 && S.list[S.idx]) ? S.list[S.idx] : null;

  function curPos() {
    try {
      if (S.offAudio && isFinite(S.offAudio.currentTime)) return S.offAudio.currentTime;
      if (S.streamAudio && isFinite(S.streamAudio.currentTime)) return S.streamAudio.currentTime;
      if (S.ytOk && S.ytp && typeof S.ytp.getCurrentTime === "function") return S.ytp.getCurrentTime() || 0;
    } catch (_) {}
    return 0;
  }
  function seekAbs(sec) {
    try {
      if (S.offAudio) { S.offAudio.currentTime = sec; return; }
      if (S.streamAudio) { S.streamAudio.currentTime = sec; return; }
      if (S.ytOk && S.ytp && typeof S.ytp.seekTo === "function") S.ytp.seekTo(sec, true);
    } catch (_) {}
  }
  const togglePlayUI = () => { const b = $("b-play"); if (b) b.click(); };
  const expectedPos = st => st.playing ? st.pos + (Date.now() - st.at) / 1000 : st.pos;

  function localSnap() {
    const s = curSong();
    return { videoId: s ? s.videoId : null, title: s ? s.title : "", artist: s ? s.artist : "",
             thumb: s ? s.thumb : "", playing: !!S.playing, pos: curPos() };
  }

  /* ── Uzaq vəziyyəti tətbiq et ── */
  function applyRemote(st) {
    ROOM.lastRemote = st;
    if (!st || !st.videoId) return;
    if (me() && st.by === me().uid) return;                    // öz yazımın eхosu
    ROOM.suppressUntil = Date.now() + 2500;

    const cur = curSong();
    if (!cur || cur.videoId !== st.videoId) {
      // başqa mahnıya keçilib
      try { playSong({ videoId: st.videoId, title: st.title, artist: st.artist, thumb: st.thumb || thumbOf(st.videoId) }); } catch (_) {}
      const target = expectedPos(st);
      let tries = 0;
      const fix = setInterval(() => {
        tries++;
        if (target > 1) seekAbs(target);
        if (!st.playing && S.playing) togglePlayUI();
        if (tries > 6 || !ROOM.id) clearInterval(fix);
      }, 1200);
    } else {
      if (!!S.playing !== !!st.playing) togglePlayUI();
      const drift = Math.abs(curPos() - expectedPos(st));
      if (drift > 3) seekAbs(expectedPos(st));
    }
    if ($("m-room") && $("m-room").classList.contains("open")) renderRoomModal();
  }

  /* ── Lokal dəyişikliyi yay ── */
  function roomTick() {
    if (!ROOM.id || !hasFB() || !me()) return;
    if (Date.now() < ROOM.suppressUntil) return;
    const l = localSnap();
    if (!l.videoId) return;
    const r = ROOM.lastRemote;
    const changed = !r ||
      l.videoId !== r.videoId ||
      l.playing !== !!r.playing ||
      Math.abs(l.pos - expectedPos(r)) > 4;
    if (changed) {
      const st = { videoId: l.videoId, title: clip(l.title, 200), artist: clip(l.artist, 120),
                   thumb: l.thumb || thumbOf(l.videoId), playing: l.playing,
                   pos: Math.round(l.pos * 10) / 10, at: Date.now(), by: me().uid };
      ROOM.lastRemote = st;
      ROOM.suppressUntil = Date.now() + 900;
      fbD.ref(`rooms/${ROOM.id}/state`).set(st).catch(() => {});
    }
  }

  function rememberRoom(id) {
    try {
      const arr = JSON.parse(localStorage.getItem("mu_rooms_joined") || "[]").filter(x => x !== id);
      arr.unshift(id);
      localStorage.setItem("mu_rooms_joined", JSON.stringify(arr.slice(0, 20)));
    } catch (_) {}
  }

  function attachRoom(id, data) {
    ROOM.id = id; ROOM.host = data.host || null; ROOM.name = data.name || "";
    ROOM.lastRemote = data.state || null; ROOM.members = data.members || {};
    rememberRoom(id);

    ROOM.stateRef = fbD.ref(`rooms/${id}/state`);
    ROOM.stateRef.on("value", s => { applyRemote(s.val()); });
    ROOM.membersRef = fbD.ref(`rooms/${id}/members`);
    ROOM.membersRef.on("value", s => {
      ROOM.members = s.exists() ? (s.val() || {}) : {};
      // host çıxıbsa, ən köhnə üzv host olur
      if (ROOM.host && !ROOM.members[ROOM.host] && me() && ROOM.members[me().uid]) {
        const sorted = Object.entries(ROOM.members).sort((a, b) => (a[1].at || 0) - (b[1].at || 0));
        if (sorted.length && sorted[0][0] === me().uid) {
          ROOM.host = me().uid;
          fbD.ref(`rooms/${id}/host`).set(me().uid).catch(() => {});
        }
      }
      if ($("m-room") && $("m-room").classList.contains("open")) renderRoomModal();
    });

    // üzvlük + avtomatik çıxış
    ROOM.memRef = fbD.ref(`rooms/${id}/members/${me().uid}`);
    ROOM.joinPromise = ROOM.memRef.set({ name: me().displayName || "Anonim", photo: me().photoURL || "", at: Date.now() });
    ROOM.memRef.onDisconnect().remove().catch(() => {});
    ROOM.hb = setInterval(() => { try { ROOM.memRef && ROOM.memRef.child("at").set(Date.now()).catch(() => {}); } catch (_) {} }, 15000);

    ROOM.timer = setInterval(roomTick, 800);
  }

  function detachRoom() {
    try { if (ROOM.stateRef) ROOM.stateRef.off(); } catch (_) {}
    try { if (ROOM.membersRef) ROOM.membersRef.off(); } catch (_) {}
    try { if (ROOM.memRef) ROOM.memRef.onDisconnect().cancel(); } catch (_) {}
    clearInterval(ROOM.timer); clearInterval(ROOM.hb);
    ROOM.id = null; ROOM.host = null; ROOM.name = ""; ROOM.lastRemote = null; ROOM.members = {}; ROOM.joinPromise = null;
    ROOM.stateRef = ROOM.membersRef = ROOM.memRef = null; ROOM.timer = ROOM.hb = 0;
  }

  async function leaveRoom() {
    if (!ROOM.id || !hasFB() || !me()) { detachRoom(); renderRoomModal(); return; }
    const id = ROOM.id, uid = me().uid;
    try {
      await fbD.ref(`rooms/${id}/members/${uid}`).remove();
      const ms = await fbD.ref(`rooms/${id}/members`).get().catch(() => null);
      if (!ms || !ms.exists() || ms.numChildren() === 0) await fbD.ref(`rooms/${id}`).remove().catch(() => {});
    } catch (_) {}
    detachRoom();
    say("👋 " + L("roomLeft"));
    renderRoomModal();
  }

  const isPermErr = e => !!(e && /permission_denied|PERMISSION_DENIED/i.test(String(e.code || e.message || e)));
  const roomFail = e => { say(isPermErr(e) ? L("roomPerm") : "❌ " + (e && e.message ? e.message : e), isPermErr(e) ? 7000 : 3500); };

  const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const mkCode = () => Array.from({ length: 6 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join("");

  async function createRoom() {
    if (!hasFB()) { say("❌ Firebase yüklənməyib"); return; }
    if (!me()) { say("⚠ " + L("roomNeedLogin")); renderRoomModal(); return; }
    for (let i = 0; i < 5; i++) {
      const code = mkCode();
      const snap = await fbD.ref(`rooms/${code}`).get().catch(() => null);
      if (snap && snap.exists()) continue;
      const data = { name: (me().displayName || "Anonim") + " — otaq", host: me().uid, createdAt: Date.now() };
      try { await fbD.ref(`rooms/${code}`).set(data); } catch (e) { console.warn("[room] yaratma:", e); roomFail(e); return; }
      detachRoom();
      attachRoom(code, data);
      say(L("roomCreated"));
      renderRoomModal();
      return;
    }
    say("❌ " + L("roomBadCode"));
  }

  async function joinRoom(codeRaw) {
    const code = String(codeRaw || "").trim().toUpperCase();
    if (!/^[A-Z0-9-]{4,24}$/.test(code)) { say(L("roomBadCode")); return; }
    if (!hasFB()) { say("❌ Firebase yüklənməyib"); return; }
    if (!me()) { pendingRoom = code; say("⚠ " + L("roomNeedLogin")); renderRoomModal(); return; }
    let snap = null;
    try { snap = await fbD.ref(`rooms/${code}`).get(); }
    catch (e) { console.warn("[room] qoşulma:", e); roomFail(e); return; }
    if (!snap || !snap.exists()) { say(L("roomNotFound")); return; }
    detachRoom();
    attachRoom(code, snap.val() || {});
    // üzvlük yazısı icazəsizdirsə dərhal xəbər ver
    try { await ROOM.joinPromise; }
    catch (e) { console.warn("[room] üzvlük:", e); detachRoom(); roomFail(e); return; }
    say(L("roomJoined"), 4000);
    renderRoomModal();
  }

  function inviteLink() {
    return location.origin + "/room/" + ROOM.id;
  }
  async function copyInvite() {
    const url = inviteLink();
    if (navigator.share) { try { await navigator.share({ title: "Music Universe — " + L("room"), url }); return; } catch (e) { if (e.name === "AbortError") return; } }
    try { await navigator.clipboard.writeText(url); say(L("roomCopied")); }
    catch (_) { prompt(L("roomInvite"), url); }
  }

  /* ── Otaq modalı ── */
  function renderRoomModal() {
    const b = $("m-room-b"); if (!b) return;

    if (!ROOM.id) {
      b.innerHTML = `<div class="mtit">🎧 ${esc(L("room"))}</div>
<div class="mu-note">${esc(L("roomSub"))}</div>
${me() ? "" : `<div class="mu-note">⚠ ${esc(L("roomNeedLogin"))}</div>
<button class="mu-ghost-btn" id="mu-room-login">${esc(L("roomLogin"))}</button>`}
<button class="mu-room-btn" id="mu-room-new">✨ ${esc(L("roomNew"))}</button>
<div class="mu-hr"></div>
<div class="mu-room-code">
  <input id="mu-room-code-inp" maxlength="24" placeholder="${esc(L("roomCodePh"))}" aria-label="${esc(L("roomCodePh"))}"/>
  <button class="mu-btn mu-pri" id="mu-room-join">${esc(L("roomJoin"))}</button>
</div>`;
      const login = $("mu-room-login");
      if (login) login.addEventListener("click", () => { try { authToggle(); } catch (_) {} });
      $("mu-room-new").addEventListener("click", createRoom);
      const doJoin = () => joinRoom($("mu-room-code-inp").value);
      $("mu-room-join").addEventListener("click", doJoin);
      $("mu-room-code-inp").addEventListener("keydown", e => { if (e.key === "Enter") doJoin(); });
      return;
    }

    const st = ROOM.lastRemote;
    const members = Object.entries(ROOM.members);
    b.innerHTML = `<div class="mtit">🎧 ${esc(ROOM.name || L("room"))}</div>
<div style="display:flex;align-items:center;gap:8px;margin:4px 0 8px">
  <span class="mu-code-chip" id="mu-room-invite" role="button" tabindex="0" aria-label="${esc(L("roomInvite"))}">${esc(L("roomCode"))} ${esc(ROOM.id)} 🔗</span>
  <span style="display:inline-flex;align-items:center;gap:6px;font:700 .7rem var(--fb);color:var(--g)"><span class="mu-sync-dot"></span>${esc(L("roomSync"))}</span>
</div>
${st && st.videoId ? `<div class="mu-note" style="margin-bottom:4px">${esc(L("roomNow"))}:</div>
<div class="mu-room-now">
  <img src="${esc(st.thumb || thumbOf(st.videoId))}" alt="" onerror="this.style.display='none'"/>
  <div style="flex:1;min-width:0">
    <div style="font:800 .84rem var(--fh);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(st.title)}</div>
    <div style="font-size:.72rem;color:var(--t3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(st.artist)}</div>
  </div>
  <div style="font-size:.85rem">${st.playing ? "▶" : "⏸"}</div>
</div>` : `<div class="mu-note">${esc(L("roomNow"))}: —</div>`}
<div class="mu-sect">👥 ${esc(L("roomMembers"))} (${members.length})</div>
<div class="mu-members">${members.map(([uid, m]) =>
  `<span class="mu-member${uid === ROOM.host ? " host" : ""}">${m.photo ? `<img src="${esc(m.photo)}" alt=""/>` : ""}${esc(m.name || "?")}${uid === ROOM.host ? " 👑" : ""}</span>`).join("")}</div>
<button class="mu-ghost-btn" id="mu-room-copy">${esc(L("roomInvite"))} — ${esc(L("copyLbl"))}</button>
<button class="mu-danger-btn" id="mu-room-leave" style="margin-top:8px">${esc(L("roomLeave"))}</button>`;

    $("mu-room-invite").addEventListener("click", copyInvite);
    $("mu-room-copy").addEventListener("click", copyInvite);
    $("mu-room-leave").addEventListener("click", leaveRoom);
  }

  function openRoomModal() { renderRoomModal(); openM("m-room"); }

  /* ── Sosial səhifəyə otaq düyməsi ── */
  function injectRoomButton() {
    const frSec = $("fr-sec");
    if (!frSec || $("mu-room-open")) return;
    const btn = document.createElement("button");
    btn.className = "mu-room-btn"; btn.id = "mu-room-open";
    btn.innerHTML = `🎧 <span>${esc(L("room"))}</span>`;
    btn.addEventListener("click", openRoomModal);
    frSec.parentNode.insertBefore(btn, frSec);
  }

  /* ── /room/{id} dəvət linki ── */
  function handleRoomDeepLink() {
    try {
      const m = location.pathname.match(/^\/room\/([A-Za-z0-9-]{4,24})$/);
      if (!m) return;
      history.replaceState({}, document.title, "/");
      pendingRoom = m[1].toUpperCase();
      setTimeout(() => {
        openRoomModal();
        if (me()) { const id = pendingRoom; pendingRoom = null; joinRoom(id); }
      }, 1300);
    } catch (_) {}
  }

  /* ════════════════════════════════════════════
     3) ŞƏXSİ DİNLƏMƏ HESABATI
     Hər çalma vaxt damğası ilə "MUreport" bazasına yazılır:
     həftəlik qrafik, saat üzrə bölgü, top ifaçı, ardıcıl gün seriyası.
  ════════════════════════════════════════════ */
  const repDb = (typeof Dexie !== "undefined") ? new Dexie("MUreport") : null;
  if (repDb) repDb.version(1).stores({ events: "++id, ts, videoId" });

  async function logPlayEvent(song) {
    if (!repDb || !song || !VID.test(song.videoId || "")) return;
    try {
      await repDb.events.add({ ts: Date.now(), videoId: song.videoId,
        title: clip(song.title, 200), artist: clip(song.artist, 120) });
      // bazanı saxla: 20 mindən çox qeyd varsa ən köhnələri at
      const n = await repDb.events.count();
      if (n > 20000) {
        const old = await repDb.events.orderBy("ts").limit(n - 20000).primaryKeys();
        await repDb.events.bulkDelete(old);
      }
    } catch (_) {}
  }

  // Mövcud tarixçədən bir dəfəlik başlanğıc (seed)
  async function seedReport() {
    if (!repDb || localStorage.getItem("mu_rep_seeded")) return;
    try {
      if (await repDb.events.count() === 0) {
        const h = await ldb.history.toArray().catch(() => []);
        await repDb.events.bulkPut(
          h.filter(r => VID.test(r.videoId || ""))
           .map(r => ({ ts: r.playedAt || Date.now(), videoId: r.videoId, title: clip(r.title, 200), artist: clip(r.artist, 120) }))
        );
      }
      localStorage.setItem("mu_rep_seeded", "1");
    } catch (_) {}
  }

  // addToHistory zəncirinə qoşul (features.js-dən sonra)
  if (typeof window.addToHistory === "function") {
    const _addH = window.addToHistory;
    window.addToHistory = function (song) {
      try { logPlayEvent(song); } catch (_) {}
      return _addH.apply(this, arguments);
    };
  }

  const dayKey = ts => { const d = new Date(ts); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };

  async function computeReport() {
    const ev = await repDb.events.toArray().catch(() => []);
    if (!ev.length) return null;
    const now = Date.now(), DAY = 86400000;

    // Son 7 gün
    const week = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * DAY);
      week.push({ key: dayKey(d.getTime()), dow: (d.getDay() + 6) % 7, n: 0 }); // B.e=0
    }
    const wkIdx = Object.fromEntries(week.map((w, i) => [w.key, i]));
    ev.forEach(e => { const i = wkIdx[dayKey(e.ts)]; if (i != null) week[i].n++; });

    // Saat üzrə (bütün zamanlar)
    const hours = new Array(24).fill(0);
    ev.forEach(e => hours[new Date(e.ts).getHours()]++);

    // Top ifaçılar
    const byArtist = new Map();
    ev.forEach(e => {
      const a = (e.artist || "").trim() || "—";
      byArtist.set(a, (byArtist.get(a) || 0) + 1);
    });
    const topArtists = [...byArtist.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

    // Ardıcıl gün seriyası (bu gün və ya dünəndən geriyə)
    const days = new Set(ev.map(e => dayKey(e.ts)));
    let streak = 0;
    let cursor = days.has(dayKey(now)) ? now : now - DAY;
    while (days.has(dayKey(cursor))) { streak++; cursor -= DAY; }

    const weekPlays = week.reduce((s, w) => s + w.n, 0);
    return { week, hours, topArtists, streak, weekPlays, total: ev.length };
  }

  function barsHtml(values, labels, dimEvery) {
    const max = Math.max(1, ...values);
    return `<div class="rep-bars" role="img" aria-label="${esc(labels.join(" "))}">` +
      values.map((v, i) =>
        `<div class="rep-bar-w"><div class="rep-bar${dimEvery && i % dimEvery ? " dim" : ""}" style="height:${Math.round(v / max * 100)}%"></div><div class="rep-bar-lbl">${esc(labels[i])}</div></div>`
      ).join("") + `</div>`;
  }

  async function openReport() {
    const b = $("m-report-b"); if (!b) return;
    openM("m-report");
    b.innerHTML = `<div class="mtit">${esc(L("repTitle"))}</div><div class="mu-note">…</div>`;
    if (!repDb) { b.innerHTML = `<div class="mtit">${esc(L("repTitle"))}</div><div class="mu-note">${esc(L("repNoData"))}</div>`; return; }
    const r = await computeReport();
    if (!r) { b.innerHTML = `<div class="mtit">${esc(L("repTitle"))}</div><div class="mu-note">${esc(L("repNoData"))}</div>`; return; }

    const dayNames = L("repDays");
    const top = r.topArtists[0];
    b.innerHTML = `<div class="mtit">${esc(L("repTitle"))}</div>

<div class="rep-cards">
  <div class="rep-card"><div class="rep-num">${r.weekPlays}</div><div class="rep-lbl">${esc(L("repPlays"))} / ${esc(L("rep7days"))}</div></div>
  <div class="rep-card"><div class="rep-num">${Math.round(r.weekPlays * 3.5)}</div><div class="rep-lbl">${esc(L("repMins"))}</div></div>
  <div class="rep-card"><div class="rep-num">🔥 ${r.streak}</div><div class="rep-lbl">${esc(L("repStreak"))}</div></div>
</div>

${top ? `<div class="rep-sect">🏆 ${esc(L("repTopArtist"))}</div>
<div class="mu-note" style="font-size:.85rem;color:var(--tx);font-weight:800">${esc(top[0])} <span style="color:var(--t3);font-weight:600">(${top[1]} ${esc(L("repPlays"))})</span></div>` : ""}

<div class="rep-sect">📅 ${esc(L("repWeek"))}</div>
${barsHtml(r.week.map(w => w.n), r.week.map(w => dayNames[w.dow]))}

<div class="rep-sect">🕐 ${esc(L("repHours"))}</div>
${barsHtml(r.hours, r.hours.map((_, i) => i % 3 === 0 ? String(i) : ""), 0)}

${r.topArtists.length ? `<div class="rep-sect">🎤 ${esc(L("repTopArtists"))}</div>
<div>${r.topArtists.map(([a, n], i) =>
  `<div class="rep-artist"><span class="rep-rank${i === 0 ? " gold" : ""}">${i + 1}</span><span class="rep-aname">${esc(a)}</span><span class="rep-acnt">${n} ${esc(L("repPlays"))}</span></div>`
).join("")}</div>` : ""}`;
  }

  /* ════════════════════════════════════════════
     4) ƏLÇATANLIQ
  ════════════════════════════════════════════ */

  /* ── Yüksək kontrast / böyük mətn ── */
  function applyA11y() {
    const hc = localStorage.getItem("mu_hc") === "1";
    const big = localStorage.getItem("mu_big") === "1";
    document.documentElement.classList.toggle("mu-hc", hc);
    document.documentElement.classList.toggle("mu-big", big);
  }
  function setA11y(key, val) {
    try { localStorage.setItem(key, val ? "1" : "0"); } catch (_) {}
    applyA11y();
  }

  /* ── Ekran oxuyucu: canlı elan bölgəsi ── */
  function injectLiveRegion() {
    if ($("mu-sr-live")) return;
    const d = document.createElement("div");
    d.id = "mu-sr-live"; d.className = "mu-sr";
    d.setAttribute("aria-live", "polite");
    document.body.appendChild(d);
  }
  if (typeof window.updPI === "function") {
    const _upd = window.updPI;
    window.updPI = function (title, artist, src) {
      const r = _upd.apply(this, arguments);
      try { const el = $("mu-sr-live"); if (el) el.textContent = L("nowPlayingAnn") + " " + title + " — " + artist; } catch (_) {}
      return r;
    };
  }

  /* ── Sürüşmə çubuqları üçün aria-valuenow sinxronu ── */
  setInterval(() => {
    try {
      const pt = $("ptrack");
      if (pt) {
        let c = 0, d = 0;
        if (S.offAudio && isFinite(S.offAudio.duration)) { c = S.offAudio.currentTime; d = S.offAudio.duration; }
        else if (S.ytOk && S.ytp && typeof S.ytp.getDuration === "function") { c = S.ytp.getCurrentTime() || 0; d = S.ytp.getDuration() || 0; }
        if (d > 0) pt.setAttribute("aria-valuenow", String(Math.round(c / d * 100)));
      }
      const vt = $("vtrack");
      if (vt) vt.setAttribute("aria-valuenow", String(S.vol | 0));
    } catch (_) {}
  }, 1000);

  /* ── Klaviatura qısayolları ── */
  function seekBy(delta) {
    try {
      if (S.offAudio && isFinite(S.offAudio.duration)) { S.offAudio.currentTime = Math.max(0, S.offAudio.currentTime + delta); return; }
      if (S.streamAudio && isFinite(S.streamAudio.duration)) { S.streamAudio.currentTime = Math.max(0, S.streamAudio.currentTime + delta); return; }
      if (S.ytOk && S.ytp && typeof S.ytp.getCurrentTime === "function") S.ytp.seekTo(Math.max(0, (S.ytp.getCurrentTime() || 0) + delta), true);
    } catch (_) {}
  }
  function volBy(delta) {
    try {
      S.vol = Math.max(0, Math.min(100, (S.vol | 0) + delta));
      if (S.ytOk && S.ytp) S.ytp.setVolume(S.vol);
      if (S.offAudio) S.offAudio.volume = S.vol / 100;
      if (S.streamAudio) S.streamAudio.volume = S.vol / 100;
      const vf = $("vfill"); if (vf) vf.style.width = S.vol + "%";
      const vt = $("vtrack"); if (vt) vt.setAttribute("aria-valuenow", String(S.vol));
    } catch (_) {}
  }
  let _muted = false, _volBeforeMute = 72;
  function toggleMute() {
    try {
      if (S.ytOk && S.ytp && typeof S.ytp.isMuted === "function") {
        _muted = S.ytp.isMuted();
        _muted ? S.ytp.unMute() : S.ytp.mute();
        _muted = !_muted;
      } else {
        if (_muted) { volBy(0); _muted = false; }
        else { _volBeforeMute = S.vol; S.vol = 0; if (S.offAudio) S.offAudio.volume = 0; if (S.streamAudio) S.streamAudio.volume = 0; const vf = $("vfill"); if (vf) vf.style.width = "0%"; _muted = true; }
      }
      say(_muted ? "🔇" : "🔊");
    } catch (_) {}
  }

  document.addEventListener("keydown", e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
    const k = e.key;
    const click = id => { const el = $(id); if (el) el.click(); };
    switch (k) {
      case " ": case "k": case "K":
        e.preventDefault(); click("b-play"); break;
      case "ArrowLeft": case "j": case "J":
        e.preventDefault(); seekBy(-10); break;
      case "ArrowRight": case "l": case "L":
        e.preventDefault(); seekBy(10); break;
      case "ArrowUp":
        e.preventDefault(); volBy(5); break;
      case "ArrowDown":
        e.preventDefault(); volBy(-5); break;
      case "n": case "N":
        click("b-next"); break;
      case "p": case "P":
        click("b-prev"); break;
      case "m": case "M":
        toggleMute(); break;
      case "s": case "S":
        click("b-shuf"); break;
      case "r": case "R":
        click("b-rep"); break;
      case "/":
        e.preventDefault(); { const s = $("sinp"); if (s) { s.focus(); s.scrollIntoView({ block: "center" }); } } break;
      case "?":
        openKeysModal(); break;
    }
  });

  function keyRow(keys, label) {
    return `<div class="mu-key-row"><span>${esc(label)}</span><span class="mu-kbd">${keys.map(k => `<span>${esc(k)}</span>`).join("")}</span></div>`;
  }
  function openKeysModal() {
    const b = $("m-keys-b"); if (!b) return;
    b.innerHTML = `<div class="mtit">${esc(L("keysTitle"))}</div><div class="mu-keys">` +
      keyRow(["Space", "K"], L("kSpace")) +
      keyRow(["←", "→"], L("kSeek")) +
      keyRow(["↑", "↓"], L("kVol")) +
      keyRow(["N"], L("kNext")) +
      keyRow(["P"], L("kPrev")) +
      keyRow(["M"], L("kMute")) +
      keyRow(["S"], L("kShuf")) +
      keyRow(["R"], L("kRep")) +
      keyRow(["/"], L("kSearch")) +
      keyRow(["?"], L("kHelp")) +
      `</div>`;
    openM("m-keys");
  }

  /* ── Köhnə modallara dialoq rolları (JS ilə, HTML toxunulmur) ── */
  function patchModalsA11y() {
    document.querySelectorAll(".moverlay").forEach(ov => {
      const box = ov.querySelector(".mbox");
      if (box && !box.getAttribute("role")) { box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); }
      const cls = ov.querySelector(".mcls");
      if (cls && !cls.getAttribute("aria-label")) cls.setAttribute("aria-label", L("close"));
    });
  }

  /* ════════════════════════════════════════════
     PARAMETRLƏRƏ YENİ SƏTRLƏR
     (features.js-in əlavələrindən sonra sonda əlavə olunur)
  ════════════════════════════════════════════ */
  function a11yToggleRow(key, title, sub, storageKey) {
    const on = localStorage.getItem(storageKey) === "1";
    return `<div class="settings-row">
  <div><div class="settings-lbl">${esc(title)}</div><div class="settings-sub">${esc(sub)}</div></div>
  <label class="mu-sw"><input type="checkbox" data-a11y="${storageKey}" ${on ? "checked" : ""} aria-label="${esc(title)}"/><i></i></label>
</div>`;
  }

  function plusSettingsRows() {
    return '' +
      '<div class="settings-row" id="mu-set-data">' +
        '<div><div class="settings-lbl">🗂 ' + esc(L("myData")) + '</div><div class="settings-sub">' + esc(L("myDataSub")) + '</div></div>' +
        '<button class="mu-btn" id="mu-set-data-btn">' + esc(L("open")) + '</button>' +
      '</div>' +
      '<div class="settings-row" id="mu-set-room">' +
        '<div><div class="settings-lbl">🎧 ' + esc(L("room")) + '</div><div class="settings-sub">' + esc(L("roomSub")) + '</div></div>' +
        '<button class="mu-btn" id="mu-set-room-btn">' + esc(L("open")) + '</button>' +
      '</div>' +
      '<div class="settings-row" id="mu-set-report">' +
        '<div><div class="settings-lbl">📈 ' + esc(L("report")) + '</div><div class="settings-sub">' + esc(L("reportSub")) + '</div></div>' +
        '<button class="mu-btn" id="mu-set-report-btn">' + esc(L("open")) + '</button>' +
      '</div>' +
      '<div class="settings-row" id="mu-set-a11y" style="flex-direction:column;align-items:stretch;gap:0">' +
        '<div style="margin-bottom:4px"><div class="settings-lbl">♿ ' + esc(L("a11y")) + '</div><div class="settings-sub">' + esc(L("a11ySub")) + '</div></div>' +
        a11yToggleRow("hc", "🌗 " + L("a11yHC"), L("a11yHCSub"), "mu_hc") +
        a11yToggleRow("big", "🔠 " + L("a11yBig"), L("a11yBigSub"), "mu_big") +
        '<div class="settings-row" style="padding-left:0;padding-right:0;border-bottom:none">' +
          '<div><div class="settings-lbl">⌨️ ' + esc(L("a11yKeys")) + '</div><div class="settings-sub">' + esc(L("a11yKeysSub")) + '</div></div>' +
          '<button class="mu-btn" id="mu-set-keys-btn">' + esc(L("open")) + '</button>' +
        '</div>' +
      '</div>';
  }

  if (typeof window.openSettings === "function") {
    const _openS = window.openSettings;
    window.openSettings = function () {
      const r = _openS.apply(this, arguments);
      try {
        const b = $("m-settings-b");
        if (b && !$("mu-set-data")) {
          b.insertAdjacentHTML("beforeend", plusSettingsRows());
          $("mu-set-data-btn").addEventListener("click", () => { closeM("m-settings"); openDataCenter(); });
          $("mu-set-room-btn").addEventListener("click", () => { closeM("m-settings"); openRoomModal(); });
          $("mu-set-report-btn").addEventListener("click", () => { closeM("m-settings"); openReport(); });
          $("mu-set-keys-btn").addEventListener("click", () => { closeM("m-settings"); openKeysModal(); });
          b.querySelectorAll("[data-a11y]").forEach(inp => {
            inp.addEventListener("change", () => setA11y(inp.dataset.a11y, inp.checked));
          });
        }
      } catch (e) { console.warn("[plus] parametrlər:", e); }
      return r;
    };
  }

  /* ── Tarix səhifəsinə hesabat düyməsi (xülasə düyməsinin yanına) ── */
  function injectReportButton() {
    const recapBtn = $("mu-recap-btn");
    if (!recapBtn || $("mu-report-btn")) return;
    const b = document.createElement("button");
    b.className = "mu-btn"; b.id = "mu-report-btn";
    b.textContent = "📈 " + L("report");
    b.style.marginLeft = "6px";
    b.addEventListener("click", openReport);
    recapBtn.insertAdjacentElement("afterend", b);
  }

  /* ── stats.js-in "users/{uid}/stats" yazısı məxfilik söndürüləndə bloklanır ──
     (stats.js öz intervalında həmişə yazır; yazı vaxtı tutulur) */
  try {
    if (hasFB() && typeof fbD !== "undefined" && fbD && !fbD.__muPrivPatched) {
      const _ref = fbD.ref.bind(fbD);
      fbD.ref = function (path) {
        const r = _ref(path);
        try {
          const uid = me() && me().uid;
          if (uid && String(path || "") === "users/" + uid + "/stats" && !window.MU_PRIV_ON("stats")) {
            return new Proxy(r, {
              get(t, k) {
                if (k === "set" || k === "update") return () => Promise.resolve();
                const v = t[k];
                return (typeof v === "function") ? v.bind(t) : v;
              }
            });
          }
        } catch (_) {}
        return r;
      };
      fbD.__muPrivPatched = true;
    }
  } catch (_) {}

  /* ══ GİRİŞ İZLƏYİCİSİ: məxfilik yüklə + gözləyən otaq dəvəti ══ */
  if (hasFB() && typeof fbA !== "undefined" && fbA) {
    try {
      fbA.onAuthStateChanged(u => {
        if (u) {
          loadPrivacy();
          if (pendingRoom) { const id = pendingRoom; pendingRoom = null; joinRoom(id); }
        }
      });
    } catch (_) {}
  }

  /* ══ BAŞLAT ══ */
  try {
    applyA11y();
    injectLiveRegion();
    patchModalsA11y();
    injectRoomButton();
    injectReportButton();
    seedReport();
    handleRoomDeepLink();
    // DOM/Skriptlər gec yüklənərsə yenidən cəhd et
    setTimeout(() => { injectRoomButton(); injectReportButton(); patchModalsA11y(); }, 1500);
    setTimeout(() => { injectRoomButton(); injectReportButton(); }, 4000);
  } catch (e) {
    console.warn("[plus] başlanğıc xətası:", e);
  }

  // Sınaq və xarici istifadə üçün
  window.MU_PLUS = { openDataCenter, openRoomModal, openReport, openKeysModal, joinRoom, leaveRoom, setPrivacy };
})();
