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
- **PWA:** oflayn rejim, quraşdırma, 3 dil (AZ, EN, RU)

## Texnologiyalar
Vanilla JavaScript (build addımı yoxdur), Dexie (IndexedDB), Firebase Authentication və Realtime Database, YouTube IFrame Player API, Service Worker, Vercel Serverless Functions.

## Quruluş
```
index.html          əsas tətbiq (HTML + CSS + JS)
features.js         tempo, oflayn zolaq, ixrac/idxal, paylaşma kartı, xülasə, mahnı adlarının təmizlənməsi
background.js       bildiriş paneli və fon rejimi
stats.js            profil statistikası
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

## Məxfilik və hüquqlar
- [İstifadə Şərtləri](https://cahsmusic.vercel.app/terms) · [Məxfilik Siyasəti](https://cahsmusic.vercel.app/privacy) · [Müəllif Hüquqları](https://cahsmusic.vercel.app/copyright)
- Musiqi fayllarını serverimizdə saxlamırıq və yaymırıq. Məzmun YouTube-un pleyeri ilə göstərilir, hüquqlar sahiblərinə məxsusdur.
- Xidmət pulsuzdur, reklam və ödəniş yoxdur.

## Əlaqə
alahsukur120@gmail.com

© 2026 Music Universe