# 🎵 Music Universe

**Music Universe** — musiqi dinləmək, playlist yaratmaq və dostlarla paylaşmaq üçün pulsuz, reklamsız veb tətbiqidir (PWA). Telefona quraşdırıla bilər, bildiriş panelindən idarə olunur.

🌐 Canlı: **https://cahsmusic.vercel.app**

## İmkanlar
- **Musiqi dinləmə:** hazır kataloq və YouTube linki yapışdıraraq mahnı əlavə etmək (YouTube-un yerləşdirilmiş pleyeri ilə)
- **Playlistlər, sevimlilər, dinləmə tarixçəsi**
- **Dostlar və söhbət:** dost əlavə et, dostunun nə dinlədiyini gör, profil statistikası (oynatma, dəqiqə)
- **Səs imkanları:** tempo (0.75x–1.5x), ekvalayzer, crossfade, yuxu taymeri
- **Bildiriş paneli / kilid ekranı:** oynat-dayan, əvvəlki-sonrakı, irəli-geri (Media Session API)
- **Paylaşma kartı** və **“Ən çox dinlədiklərim”** xülasə şəkli
- **Ehtiyat nüsxə:** playlist, sevimli və parametrləri JSON fayl kimi ixrac/idxal
- **“Məlumatlarım” mərkəzi:** bütün məlumatların ixracı, dostlara görünənlərin seçimi (indi çalınan, statistika, onlayn status), hesabın və məlumatların tam silinməsi
- **Birlikdə dinləmə otağı:** dostlar eyni mahnını eyni anda dinləyir (Firebase Realtime Database ilə sinxron) — otaq kodu və dəvət linki ilə
- **YouTube-dan paylaş → tətbiqdə aç:** PWA-nın share_target-i ilə YouTube-dan paylaşılan link birbaşa Music Universe-də çalınır
- **Şəxsi dinləmə hesabatı:** son 7 günün qrafiki, saat üzrə dinləmə, ən çox dinlənən ifaçılar, ardıcıl gün seriyası
- **Əlçatanlıq:** tam klaviatura idarəetməsi (?, Space, ←→, ↑↓, N, P, M, S, R, Y-sözlər, A-radio, O-otaq, B-liderlik, G-nişanlar), ekran oxuyucu etiketləri, yüksək kontrast və böyük mətn rejimləri
- **Mahnı sözləri:** cari mahnının sözləri playerdən bir kliklə (LRCLIB)
- **Radio / ağıllı mix:** mahnı bitəndə oxşar mahnılar avtomatik çalınır
- **Otaq reaksiyaları:** birlikdə dinləyərkən ❤️🔥👏😂🎉 üzən emoji ilə
- **Həftəlik liderlik:** dostlar arasında bu həftənin dinləmə sıralaması
- **Ortaq playlistlər:** link ilə dostları dəvət et, hamı mahnı əlavə etsin
- **107 nişan, 21 kateqoriya:** seriya (🔥2–365 gün), dinləmə (🎧10–10000), həftəlik/günlük rekordlar, ifaçı/mahnı müxtəlifliyi, gecə-səhər dinləmələri, dostlar, mesajlar, otaqlar, reaksiyalar, playlistlər, bəyənmələr, yükləmələr, paylaşımlar, hesab yaşı, radio, sözlər, ortaq playlistlər — profildə kateqoriya üzrə irəliləyiş ilə görünür
- **Nişan bildirişi:** yeni nişan qazananda toast + sistem bildirişi (icazə verilibsə)
- **Zənginləşmiş profil:** mahnı/ifaçı sayı, seriya, ən aktiv saat və gün, ilk dinləmə tarixi, qazanılmış nişanlar
- **Dost seriyası və zövq uyğunluğu:** sosial bölmədə hər dostun üstündə 🔥 ardıcıl söhbət günü və 🎧% ortaq musiqi zövqü faizi (dostun məxfilik seçiminə hörmətlə)
- **PWA:** oflayn rejim, quraşdırma, 3 dil (AZ, EN, RU)

## Texnologiyalar
Vanilla JavaScript (build addımı yoxdur), Dexie (IndexedDB), Firebase Authentication və Realtime Database, YouTube IFrame Player API, Service Worker, Vercel Serverless Functions.

## Quruluş
```
index.html          əsas tətbiq (HTML + CSS + JS)
features.js         tempo, oflayn zolaq, ixrac/idxal, paylaşma kartı, xülasə, mahnı adlarının təmizlənməsi
background.js       bildiriş paneli və fon rejimi
stats.js            profil statistikası
plus.js             məlumatlarım mərkəzi, dinləmə otağı, dinləmə hesabatı, əlçatanlıq
extras.js           sözlər, radio, otaq reaksiyaları, liderlik, ortaq playlistlər, nişanlar
api/lyrics.js       mahnı sözləri (LRCLIB)
api/related.js      oxşar mahnılar (radio rejimi)
database.rules.json Firebase Realtime Database qaydaları (rooms + collab daxil)
sw.js               service worker (oflayn işləmə)
manifest.json       PWA parametrləri
api/dl.js           oflayn saxlama / axın üçün audio linki (istəyə bağlı)
api/yt-meta.js      mahnı adı və kanal məlumatı
api/admin-vip.js    VIP statusunu admin verir
terms.html · privacy.html · copyright.html   hüquqi səhifələr
```

## Quraşdırma
Tətbiq statikdir, `index.html`-i hər hansı statik serverdə açmaq kifayətdir. Vercel-də serverless funksiyalar üçün **Settings → Environment Variables**:

| Dəyişən | Nə üçün | Məcburi? |
|---|---|---|
| `RAPIDAPI_KEY` | oflayn saxlama / axın üçün audio çevirmə xidməti | istəyə bağlı |
| `FIREBASE_SERVICE_ACCOUNT` | `api/admin-vip.js` (VIP statusu vermək) | istəyə bağlı |
| `YT_API_KEY` | mahnı adları üçün YouTube Data API (yoxdursa oEmbed işləyir) | istəyə bağlı |

Firebase konfiqurasiyası `index.html`-dədir (veb açarları açıq olmaq üçün nəzərdə tutulub), məlumatları **Firebase Realtime Database qaydaları** qoruyur.

### ⚠️ Firebase qaydaları və indekslər (məcburi)

Dostluq, şəxsi mesaj, bildiriş və statistika sorğuları üçün `database.rules.json` daxilindəki bütün qaydalar tətbiq olunmalıdır. Xüsusilə `/users` altında `".indexOn": ["email"]` olmadıqda dost əlavə etmək zamanı **“Index not defined”** xətası yaranır.

1. Firebase Console → layihə → **Realtime Database → Rules** bölməsini açın.
2. `database.rules.json` faylının məzmununu köçürüb mövcud qaydalarla əvəz edin.
3. **Publish** basın. Vercel deploy-u Firebase qaydalarını avtomatik yeniləmir.

Alternativ: `firebase.json`-də rules faylı göstərilibsə, `firebase deploy --only database` əmrini işlədin. Qaydalarda e-poçt indeksləri, yalnız giriş etmiş istifadəçilər üçün profil oxuma, DM iştirakçılarının yoxlanması və VIP sahələrinin yalnız Admin SDK tərəfindən dəyişməsi təmin edilir.

## Məxfilik və hüquqlar
- [İstifadə Şərtləri](https://cahsmusic.vercel.app/terms) · [Məxfilik Siyasəti](https://cahsmusic.vercel.app/privacy) · [Müəllif Hüquqları](https://cahsmusic.vercel.app/copyright)
- Musiqi fayllarını serverimizdə saxlamırıq və yaymırıq. Məzmun YouTube-un pleyeri ilə göstərilir, hüquqlar sahiblərinə məxsusdur.
- Xidmət pulsuzdur, reklam və ödəniş yoxdur.

## Əlaqə
alahsukur120@gmail.com

© 2026 Music Universe