const CACHE_NAME  = 'mu-shell-v9';
const THUMB_CACHE = 'mu-thumbs-v9';
const FONT_CACHE  = 'mu-fonts-v9';
const CDN_CACHE   = 'mu-cdn-v9';

const SHELL_URLS = ['/', '/index.html', '/icon.png', '/manifest.json', '/sw.js'];

/* ── INSTALL ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(SHELL_URLS.map(url =>
        cache.add(url).catch(e => console.warn('[SW] skip:', url, e.message))
      ))
    ).then(() => self.skipWaiting())
  );
});

/* ── ACTIVATE ── */
self.addEventListener('activate', event => {
  const keep = [CACHE_NAME, THUMB_CACHE, FONT_CACHE, CDN_CACHE];
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => !keep.includes(k)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* ── FETCH ── */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Yalnız GET
  if (request.method !== 'GET') return;

  // chrome-extension / blob / data
  if (!url.protocol.startsWith('http')) return;

  // ① Firebase / Google APIs — həmişə şəbəkə
  if (
    url.hostname.includes('firebase') ||
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('gstatic.com') && !url.hostname.includes('fonts.gstatic.com')
  ) return;

  // ② YouTube video stream / ads — keç
  if (
    url.hostname.includes('googlevideo.com') ||
    (url.hostname.includes('youtube.com') && url.pathname.includes('/videoplayback')) ||
    url.hostname.includes('doubleclick.net') ||
    url.hostname.includes('ytimg.com') && url.pathname.includes('ptracking')
  ) return;

  // ③ RapidAPI / download API — keç
  if (
    url.hostname.includes('rapidapi.com') ||
    url.hostname.includes('youtube-mp36') ||
    url.pathname.startsWith('/api/')
  ) return;

  // ④ YouTube thumbnails — cache-first + SVG fallback
  if (
    url.hostname === 'i.ytimg.com' ||
    url.hostname === 'img.youtube.com'
  ) {
    event.respondWith(cacheFirstThumb(request));
    return;
  }

  // ⑤ Google Fonts — cache-first
  if (
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  ) {
    event.respondWith(cacheFirst(request, FONT_CACHE));
    return;
  }

  // ⑥ CDN (jsdelivr) — cache-first
  if (url.hostname.includes('jsdelivr.net')) {
    event.respondWith(cacheFirst(request, CDN_CACHE));
    return;
  }

  // ⑦ YouTube IFrame API skriptləri — network-first
  if (
    url.hostname.includes('youtube.com') ||
    url.hostname.includes('ytimg.com')
  ) {
    event.respondWith(networkFirst(request, CDN_CACHE));
    return;
  }

  // ⑧ Öz origin (app shell) — stale-while-revalidate
  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
});

/* ═══ STRATEGİYALAR ═══ */

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

const THUMB_FALLBACK = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 180'><rect width='320' height='180' fill='%230e1521'/><text x='160' y='105' font-size='56' text-anchor='middle' fill='%23283858'>♪</text></svg>`;

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

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);

  if (!cached && request.mode === 'navigate') {
    const response = await fetchPromise;
    if (response) return response;
    const shell = await cache.match('/index.html') || await cache.match('/');
    return shell || new Response('<h1>Offline</h1>', { headers: { 'Content-Type': 'text/html' } });
  }

  return cached || fetchPromise || new Response('', { status: 503 });
}

/* ═══ MESSAGES ═══ */
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data?.type === 'CACHE_URLS') {
    const urls = event.data.urls || [];
    caches.open(THUMB_CACHE).then(cache =>
      Promise.allSettled(urls.map(u => cache.add(u).catch(() => {})))
    );
  }
});
