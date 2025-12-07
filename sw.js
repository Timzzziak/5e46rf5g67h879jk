const CACHE_NAME = 'mobywatel-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/qr.html',
  '/card.html',
  '/assets/main.js',
  '/assets/qr.js',
  '/assets/index.css',
  '/assets/main.css',
  '/assets/qr.css',
  '/assets/images/2137.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Try network first for API/POST, otherwise respond from cache first
  if (req.method !== 'GET') return;
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          // put a copy in cache
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, res.clone());
            return res;
          });
        })
        .catch(() => caches.match('/index.html'));
    })
  );
});
