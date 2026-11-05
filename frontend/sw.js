// TRADING PRO ULTIMATE™ — Service Worker Uninstaller & Cache Buster v2.7.5
// Cleanly unregisters legacy workers and wipes caches without intercepting network fetch

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    })
    .then(() => self.registration.unregister())
    .then(() => self.clients.matchAll())
    .then((clients) => {
      clients.forEach((client) => {
        try { client.postMessage({ type: 'CACHE_PURGED_V27' }); } catch(e) {}
      });
    })
  );
});
