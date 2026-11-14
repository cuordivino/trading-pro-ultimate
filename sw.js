// TRADING PRO ULTIMATE™ — Service Worker (Master v18.0)
// Complete anti-cache purge, immediate activation and claims for iOS WebKit & Android Chrome
const CACHE_NAME = 'trading-pro-ultimate-v22.0';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      if (typeof caches !== 'undefined') {
        const keys = await caches.keys();
        await Promise.all(
          keys.map((k) => {
            if (k !== CACHE_NAME) {
              return caches.delete(k);
            }
          })
        );
      }
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  // Network-first policy with graceful fallback
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
