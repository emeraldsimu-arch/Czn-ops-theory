// NEXUS v5.6 — SERVICE WORKER
// Stale-while-revalidate caching strategy
// Changes from v5.5:
//   - Cache name bumped to nexus-v56-static
//   - Activate handler deletes all caches not matching current version
//     This forces fresh HTML on next load after deploy, preventing
//     the v5.3 shell / v5.5 JS mismatch seen in production
// ═══════════════════════════════════════════════════════════

const CACHE_NAME = 'nexus-v56-static';

const PRECACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/data/config.js',
  '/data/games.js',
  '/data/achievements.js',
  '/manifest.json',
];

// Install — precache all core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
  );
  // Take over immediately without waiting for old SW to finish
  self.skipWaiting();
});

// Activate — delete ALL old caches, not just ones we know about
// This is the critical fix: old version caches are purged on every deploy
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
    ).then(() => self.clients.claim()) // Take control of all open tabs immediately
  );
});

// Fetch — stale-while-revalidate
// Serve from cache immediately, update cache in background
self.addEventListener('fetch', event => {
  // Only cache same-origin GET requests — never cache API calls or Notion
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(event.request).then(cached => {
        const networkFetch = fetch(event.request).then(response => {
          // Only cache valid responses
          if (response && response.status === 200 && response.type === 'basic') {
            cache.put(event.request, response.clone());
          }
          return response;
        }).catch(() => cached); // Network fail — fall back to cache silently

        // Return cached immediately if available, otherwise wait for network
        return cached || networkFetch;
      })
    )
  );
});
