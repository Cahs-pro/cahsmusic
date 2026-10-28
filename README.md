# 🎵 Music Universe

**Music Universe** is a free, ad-free web app (PWA) for listening to music, creating playlists, and sharing them with friends. It can be installed on your phone and controlled from the notification panel.

🌐 Live demo: **https://cahsmusic.vercel.app**

## Features
- **Music playback:** a ready-made catalog, plus adding songs by pasting a YouTube link (using YouTube's embedded player)
- **Playlists, favorites, and listening history**
- **Friends and chat:** add friends, see what your friends are listening to, and view profile statistics (plays, minutes)
- **Audio features:** tempo (0.75x–1.5x), equalizer, crossfade, and sleep timer
- **Notification panel / lock screen:** play-pause, previous-next, and forward-back controls (Media Session API)
- **Share card** and a **"My most played"** summary image
- **Backup:** export and import playlists, favorites, and settings as a JSON file
- **"My Data" center:** export all your data, choose what friends can see (now playing, statistics, online status), and fully delete your account and data
- **Listen-together rooms:** friends listen to the same song at the same time (synced with Firebase Realtime Database), joined with a room code and invite link
- **Share from YouTube → open in the app:** with the PWA share_target, a link shared from YouTube plays directly in Music Universe
- **Personal listening report:** a chart of the last 7 days, listening by hour, top artists, and a day streak
- **Accessibility:** full keyboard control (?, Space, ←→, ↑↓, N, P, M, S, R, Y lyrics, A radio, O room, B leaderboard, G badges), screen reader labels, and high-contrast and large-text modes
- **Lyrics:** the lyrics of the current song with one click from the player (LRCLIB)
- **Radio / smart mix:** when a song ends, similar songs play automatically
- **Room reactions:** floating emoji (❤️🔥👏😂🎉) while listening together
- **Weekly leaderboard:** this week's listening ranking among friends
- **Shared playlists:** invite friends with a link, and everyone can add songs
- **107 badges in 21 categories:** streak (🔥 2–365 days), listening (🎧 10–10000), weekly/daily records, artist/song variety, night and morning listening, friends, messages, rooms, reactions, playlists, likes, downloads, shares, account age, radio, lyrics, and shared playlists, shown on the profile with progress per category
- **Badge notifications:** a toast and a system notification (if permission is granted) when you earn a new badge
- **Enriched profile:** song/artist counts, streak, most active hour and day, first listening date, and earned badges
- **Friend streaks and taste match:** in the social section, each friend shows a 🔥 streak of consecutive chat days and a 🎧 percentage of shared music taste (respecting the friend's privacy settings)
- **PWA:** offline mode, installation, and 3 languages (AZ, EN, RU)

## Technologies
Vanilla JavaScript (no build step), Dexie (IndexedDB), Firebase Authentication and Realtime Database, YouTube IFrame Player API, Service Worker, Vercel Serverless Functions.

## Structure
```
index.html          main app (HTML + CSS + JS)
features.js         tempo, offline bar, export/import, share card, summary, song title cleanup
background.js       notification panel and background mode
stats.js            profile statistics
plus.js             "My Data" center, listening room, listening report, accessibility
extras.js           lyrics, radio, room reactions, leaderboard, shared playlists, badges
api/lyrics.js       song lyrics (LRCLIB)
api/related.js      similar songs (radio mode)
database.rules.json Firebase Realtime Database rules (including rooms + collab)
sw.js               service worker (offline support)
manifest.json       PWA settings
api/dl.js           audio link for offline storage / streaming (optional)
api/yt-meta.js      song title and channel information
api/admin-vip.js    admin grants VIP status
terms.html · privacy.html · copyright.html   legal pages
```


## Privacy and legal
- [Terms of Use](https://cahsmusic.vercel.app/terms) · [Privacy Policy](https://cahsmusic.vercel.app/privacy) · [Copyright](https://cahsmusic.vercel.app/copyright)
- We do not store or distribute music files on our servers. Content is displayed through YouTube's player, and all rights belong to their owners.
- The service is free, with no ads and no payments.

## Contact
alahsukur120@gmail.com

© 2026 Music Universe
