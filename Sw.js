// NEXUS v5.6 — SERVICE WORKER
// Stale-while-revalidate caching strategy
// Changes from v5.5:
//   - Cache name bumped to nexus-v56-static
//   - Activate handler deletes all caches not matching current version
//     This forces fresh HTML on next load after deploy
// Changes from Netlify → GitHub Pages migration:
//   - PRECACHE paths updated for /czn-ops-theory/ subdirectory
//   - BASE_PATH added so fetch handler correctly scopes to repo subdirectory
// ═══════════════════════════════════════════════════════════

const CACHE_NAME = 'nexus-v56-static';

// GitHub Pages serves from /czn-ops-theory/ — all paths must include this prefix
const BASE_PATH = '/czn-ops-theory';

const PRECACHE = [
  BASE_PATH + '/',
  BASE_PATH + '/index.html',
  BASE_PATH + '/style.css',
  BASE_PATH + '/app.js',
  BASE_PATH + '/data/config.js',
  BASE_PATH + '/data/games.js',
  BASE_PATH + '/data/achievements.js',
  BASE_PATH + '/manifest.json',
];

// Install — precache all core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// Activate — delete ALL old caches on every deploy
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

// Fetch — stale-while-revalidate
// Only cache requests within our subdirectory — never cache API or Notion calls
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  // Only handle requests within our subdirectory
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
