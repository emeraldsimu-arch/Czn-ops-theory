// NEXUS v5.7 — SERVICE WORKER
// GitHub Pages: emeraldsimu-arch.github.io/czn-ops-theory
// Changes from v5.6:
//   - CACHE_NAME bumped to nexus-v57-static (forces cache bust on deploy)
// ═══════════════════════════════════════════════════════════
const CACHE_NAME = 'nexus-v57-static';
const BASE_PATH  = '/czn-ops-theory';
const PRECACHE = [
  BASE_PATH + '/',
  BASE_PATH + '/index.html',
  BASE_PATH + '/style.css',
  BASE_PATH + '/app.js',
  BASE_PATH + '/data/config.js',
  BASE_PATH + '/data/games.js',
  BASE_PATH + '/data/achievements.js',
  BASE_PATH + '/manifest.json',
  BASE_PATH + '/icons/icon-192.png',
  BASE_PATH + '/icons/icon-512.png',
];
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('NEXUS SW: deleting old cache', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;
  const url = new URL(event.request.url);
  if (!url.pathname.startsWith(BASE_PATH)) return;
  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(event.request).then(cached => {
        const networkFetch = fetch(event.request).then(response => {
          if (response && response.status === 200 && response.type === 'basic') {
            cache.put(event.request, response.clone());
          }
          return response;
        }).catch(() => cached);
        return cached || networkFetch;
      })
    )
  );
});
