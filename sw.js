const CACHE_NAME   = 'mu-shell-v5';
const THUMB_CACHE  = 'mu-thumbs-v5';
const FONT_CACHE   = 'mu-fonts-v5';
const CDN_CACHE    = 'mu-cdn-v5';

/* App Shell — bu fayllar həmişə cache-də olur */
const SHELL_URLS = [
  '/',
  '/index.html',
  '/icon.png',
  '/manifest.json',
];

/* Offline fallback image (SVG data URL kimi) */
const THUMB_FALLBACK = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 180'><rect width='320' height='180' fill='%230e1521'/><text x='160' y='105' font-size='56' text-anchor='middle' fill='%23283858'>♪</text></svg>`;

/* ── INSTALL ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // addAll ilə bir URL uğursuz olsa hamısı bloklanır.
      // Hər URL-i ayrıca cache-ə əlavə edirik ki, xəta izolyasiya olsun.
      return Promise.allSettled(
        SHELL_URLS.map(url =>
          cache.add(url).catch(err => {
            console.warn('[SW] Shell cache skip:', url, err.message);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

/* ── ACTIVATE ── */
self.addEventListener('activate', event => {
  const keepCaches = [CACHE_NAME, THUMB_CACHE, FONT_CACHE, CDN_CACHE];
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => !keepCaches.includes(k)).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* ── FETCH ── */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  /* 1. Non-GET requests — şəbəkəyə göndər */
  if (request.method !== 'GET') return;

  /* 2. Chrome extension / blob / data — keç */
  if (!url.protocol.startsWith('http')) return;

  /* 3. YouTube IFrame API & player scripts — network-first, cache fallback */
  if (url.hostname.includes('youtube.com') || url.hostname.includes('ytimg.com')) {
    /* Thumbnail-lar: cache-first */
    if (url.hostname === 'i.ytimg.com' || url.hostname === 'img.youtube.com') {
      event.respondWith(cacheFirstThumb(request));
      return;
    }
    /* YT API scripts: network-first */
    event.respondWith(networkFirst(request, CDN_CACHE));
    return;
  }

  /* 4. Google Fonts — cache-first */
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(cacheFirst(request, FONT_CACHE));
    return;
  }

  /* 5. Firebase — həmişə şəbəkə */
  if (url.hostname.includes('firebase') || url.hostname.includes('firebaseio.com') || url.hostname.includes('googleapis.com')) {
    return; // SW keçir, şəbəkə işləsin
  }

  /* 5b. Download/Audio API-ləri — heç vaxt cache-ləmə, birbaşa şəbəkəyə göndər
         (Piped, Invidious, Cobalt, CORS proxies — CORS xətası olan sorğular
          cache-ə düşə bilmər, cəhd etmək mənasızdır) */
  if (
    url.hostname.includes('pipedapi') ||
    url.hostname.includes('piped-api') ||
    url.hostname.includes('piped.yt') ||
    url.hostname.includes('invidious') ||
    url.hostname.includes('inv.tux') ||
    url.hostname.includes('vid.puffyan') ||
    url.hostname.includes('cobalt.tools') ||
    url.hostname.includes('corsproxy.io') ||
    url.hostname.includes('allorigins.win') ||
    url.hostname.includes('thingproxy')
  ) {
    return; // SW keçir, birbaşa şəbəkə işləsin
  }

  /* 6. CDN (jsdelivr, gstatic) — cache-first */
  if (url.hostname.includes('jsdelivr.net') || url.hostname.includes('gstatic.com')) {
    event.respondWith(cacheFirst(request, CDN_CACHE));
    return;
  }

  /* 7. App Shell (öz origin) — stale-while-revalidate */
  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
});

/* ═══ STRATEGİYALAR ═══ */

/** Cache-first: cache-dədirsə cache-dən, yoxsa şəbəkədən al və cache-ə yaz */
async function cacheFirst(request, cacheName = CACHE_NAME) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return new Response('', { status: 503 });
  }
}

/** Cache-first for thumbnails — fallback SVG qaytarır */
async function cacheFirstThumb(request) {
  const cache = await caches.open(THUMB_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return new Response(THUMB_FALLBACK, {
      headers: { 'Content-Type': 'image/svg+xml' }
    });
  }
}

/** Network-first: şəbəkəni cəhd et, xəta olarsa cache-dən qaytarır */
async function networkFirst(request, cacheName = CACHE_NAME) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached || new Response('', { status: 503 });
  }
}

/** Stale-while-revalidate: cache-dən tez qaytarır, arxa planda yeniləyir */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);

  /* App Shell navigasiya — index.html qaytar */
  if (!cached && request.mode === 'navigate') {
    try {
      const response = await fetchPromise;
      if (response) return response;
    } catch {}
    const shell = await cache.match('/index.html') || await cache.match('/');
    return shell || new Response('<h1>Offline</h1>', { headers: { 'Content-Type': 'text/html' } });
  }

  return cached || fetchPromise || new Response('', { status: 503 });
}

/* ═══ BACKGROUND SYNC (offline download köməkçisi) ═══ */
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data?.type === 'CACHE_URLS') {
    const urls = event.data.urls || [];
    caches.open(CACHE_NAME).then(cache => cache.addAll(urls));
  }
});