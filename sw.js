const CACHE_NAME = 'nexus-v511-static';
const ASSETS = [
  '/czn-ops-theory/',
  '/czn-ops-theory/index.html',
  '/czn-ops-theory/style.css',
  '/czn-ops-theory/app.js',
  '/czn-ops-theory/manifest.json',
  '/czn-ops-theory/data/config.js',
  '/czn-ops-theory/data/games.js',
  '/czn-ops-theory/data/achievements.js',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fresh = fetch(e.request).then(res => {
        if (res && res.status === 200 && e.request.method === 'GET') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || fresh;
    })
  );
});
