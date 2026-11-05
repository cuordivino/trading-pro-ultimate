// TRADING PRO ULTIMATE™ — Service Worker (Safe Passive v2.7.6)
// Safe, crash-free lifecycle for iOS WebKit, macOS Safari and Windows 10

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
