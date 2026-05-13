// NEXUS v5.3 — Service Worker
// Strategy: stale-while-revalidate
// Serves cached version instantly, fetches update in background, applies on next load

const CACHE_NAME = 'nexus-v5.3';
const DATA_CACHE = 'nexus-data-v5.3';

// Core files to cache on install
const CORE_FILES = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/data/config.js',
  '/data/games.js',
  '/data/achievements.js',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Syne:wght@400;500;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap'
];

// ── INSTALL ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CORE_FILES);
    }).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE ──
// Clean up old caches when a new SW takes over
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME && key !== DATA_CACHE)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH — stale-while-revalidate ──
self.addEventListener('fetch', event => {
  // Skip non-GET and cross-origin API calls (Notion, Anthropic)
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.hostname.includes('anthropic.com') ||
      url.hostname.includes('notion.com') ||
      url.hostname.includes('googleapis.com') && url.pathname.includes('fonts/css')) {
    // Let font CSS through stale-while-revalidate, skip API calls
    if (url.hostname.includes('anthropic.com') || url.hostname.includes('notion.com')) return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(event.request).then(cached => {
        const fetchPromise = fetch(event.request)
          .then(response => {
            if (response && response.status === 200 && response.type === 'basic') {
              cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch(() => null);

        // Return cached immediately, update in background
        return cached || fetchPromise;
      })
    )
  );
});

// ── MESSAGE — force update ──
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
