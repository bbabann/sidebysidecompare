// Cache-first with background refresh: the app opens instantly and works offline,
// and a new deploy shows up on the next open. Bump CACHE to drop old files at once.
const CACHE = 'galaxy-specs-v2';
const SHELL = [
  './',
  'index.html',
  'style.css',
  'script.js',
  'specs.js',
  'manifest.webmanifest',
  'assets/guide-phone.png',
  'assets/guide-hands.png',
  'assets/guide-glow.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(caches.open(CACHE).then(async (cache) => {
    // ignoreSearch so ?device=s26 opens the cached page too
    const cached = await cache.match(request, { ignoreSearch: true });
    const fresh = fetch(request)
      .then((response) => {
        if (response.ok) cache.put(request, response.clone());
        return response;
      })
      .catch(() => cached);
    return cached || fresh;
  }));
});
