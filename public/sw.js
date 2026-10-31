// Offline support for the floor assistant. Everything is static, so the app can run with no signal
// once it has been opened once. Bump CACHE when this file's strategy changes.
const CACHE = 'floor-assistant-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    // Newest page when online, last good copy when not.
    event.respondWith(fetch(request).then((response) => { const copy = response.clone(); caches.open(CACHE).then((cache) => cache.put('/index.html', copy)); return response; })
      .catch(() => caches.match('/index.html')));
    return;
  }
  if (url.pathname.startsWith('/assets/')) {
    // Hashed file names never change, so a cached copy is always right.
    event.respondWith(caches.match(request).then((hit) => hit || fetch(request).then((response) => { const copy = response.clone(); caches.open(CACHE).then((cache) => cache.put(request, copy)); return response; })));
    return;
  }
  // Catalog JSON, images, icons: show the saved copy now, refresh it in the background.
  event.respondWith(caches.open(CACHE).then((cache) => cache.match(request).then((hit) => {
    const refresh = fetch(request).then((response) => { if (response.ok) cache.put(request, response.clone()); return response; }).catch(() => hit);
    return hit || refresh;
  })));
});
