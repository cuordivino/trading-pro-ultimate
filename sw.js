// TRADING PRO ULTIMATE™ — Service Worker (Force Clear Cache v3.5.0)
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (typeof caches !== 'undefined'
      ? caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      : Promise.resolve()
    ).then(() => self.clients.claim())
  );
});
