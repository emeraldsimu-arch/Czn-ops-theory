// NEXUS v5.9 — Service Worker
const CACHE_NAME = 'nexus-v59-static';
const ASSETS = [
  '/czn-ops-theory/',
  '/czn-ops-theory/index.html',
  '/czn-ops-theory/style.css',
  '/czn-ops-theory/app.js',
  '/czn-ops-theory/data/config.js',
  '/czn-ops-theory/data/games.js',
  '/czn-ops-theory/data/achievements.js',
  '/czn-ops-theory/manifest.json',
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.open(CACHE_NAME).then(cache =>
    cache.match(e.request).then(cached => {
      const fresh = fetch(e.request).then(res => { if (res.ok) cache.put(e.request, res.clone()); return res; });
      return cached || fresh;
    })
  ));
});
