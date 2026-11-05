// TRADING PRO ULTIMATE™ — Service Worker Uninstaller & Cache Buster v2.7.0
// Ensures clients always receive fresh real-time financial market data and scripts

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          console.log('[SW] Deleting stale cache:', key);
          return caches.delete(key);
        })
      );
    })
    .then(() => self.registration.unregister())
    .then(() => self.clients.matchAll())
    .then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ type: 'CACHE_PURGED_V27' });
      });
      return self.clients.claim();
    })
  );
});

// Network direct pass-through: never cache dynamic trading terminal responses
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
