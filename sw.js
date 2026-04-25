const CACHE_NAME  = 'mu-v10';
const THUMB_CACHE = 'mu-thumb-v10';
const FONT_CACHE  = 'mu-font-v10';
const CDN_CACHE   = 'mu-cdn-v10';

const SHELL = ['/', '/index.html', '/icon.png', '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.allSettled(SHELL.map(u => cache.add(u).catch(err => console.warn('[SW]', u, err.message)))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  const keep = [CACHE_NAME, THUMB_CACHE, FONT_CACHE, CDN_CACHE];
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => !keep.includes(k)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);

  if (req.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  // Firebase / Google APIs — keç
  if (url.hostname.includes('firebaseio.com') ||
      url.hostname.includes('firebase.google.com') ||
      url.hostname.includes('googleapis.com') ||
      url.hostname.includes('google.com/') ||
      url.hostname.includes('doubleclick.net') ||
      url.hostname.includes('googleadservices.com')) return;

  // YouTube video stream — keç (IndexedDB-dən çalınır)
  if (url.hostname.includes('googlevideo.com') ||
      (url.hostname.includes('youtube.com') && url.pathname.includes('/videoplayback'))) return;

  // RapidAPI / kendi API — keç
  if (url.hostname.includes('rapidapi.com') || url.pathname.startsWith('/api/')) return;

  // YouTube thumbnailer — cache-first + SVG fallback
  if (url.hostname === 'i.ytimg.com' || url.hostname === 'img.youtube.com') {
    e.respondWith(thumbFirst(req)); return;
  }

  // Google Fonts — cache-first
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    e.respondWith(cacheFirst(req, FONT_CACHE)); return;
  }

  // CDN — cache-first
  if (url.hostname.includes('jsdelivr.net') || url.hostname.includes('cdnjs.cloudflare.com')) {
    e.respondWith(cacheFirst(req, CDN_CACHE)); return;
  }

  // YouTube skriptləri — network-first
  if (url.hostname.includes('youtube.com') || url.hostname.includes('ytimg.com')) {
    e.respondWith(netFirst(req, CDN_CACHE)); return;
  }

  // Öz origin — stale-while-revalidate
  if (url.origin === self.location.origin) {
    e.respondWith(swr(req)); return;
  }
});

const SVG_FALLBACK = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 180'><rect width='320' height='180' fill='%230e1521'/><text x='160' y='105' font-size='56' text-anchor='middle' fill='%23283858'>♪</text></svg>`;

async function thumbFirst(req) {
  const cache = await caches.open(THUMB_CACHE);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    return new Response(SVG_FALLBACK, { headers: { 'Content-Type': 'image/svg+xml' } });
  }
}

async function cacheFirst(req, cacheName = CACHE_NAME) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch { return new Response('', { status: 503 }); }
}

async function netFirst(req, cacheName = CACHE_NAME) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    return (await cache.match(req)) || new Response('', { status: 503 });
  }
}

async function swr(req) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(req);
  const fetchP = fetch(req).then(res => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => null);
  if (!cached && req.mode === 'navigate') {
    const res = await fetchP;
    if (res) return res;
    return (await cache.match('/index.html')) || new Response('<h1>Offline</h1>', { headers: { 'Content-Type': 'text/html' } });
  }
  return cached || fetchP || new Response('', { status: 503 });
}

self.addEventListener('message', e => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (e.data?.type === 'CACHE_URLS') {
    caches.open(THUMB_CACHE).then(c => Promise.allSettled((e.data.urls || []).map(u => c.add(u).catch(() => {}))));
  }
});