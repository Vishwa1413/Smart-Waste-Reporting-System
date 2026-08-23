// PWABuilder / TWA compliant Service Worker
const CACHE_NAME = 'smart-waste-pwa-v4';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/logo.png',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Purging old service worker cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // NEVER cache API calls or non-GET requests
  if (url.pathname.startsWith('/api') || event.request.method !== 'GET') {
    return;
  }

  // Network-First for HTML navigation and JS/CSS assets so APK updates instantly
  if (event.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.includes('/assets/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return response;
        })
        .catch(() => caches.match(event.request) || caches.match('/'))
    );
    return;
  }

  // Cache-First with Network fallback for static images
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchRes) => {
        if (fetchRes && fetchRes.status === 200) {
          const fetchClone = fetchRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, fetchClone));
        }
        return fetchRes;
      });
    })
  );
});
