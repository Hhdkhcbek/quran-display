const CACHE = 'quran-v1';

// Cache all app files on install
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      cache.addAll([
        '/quran-display/',
        '/quran-display/index.html',
        '/quran-display/data/quran_sample.json',
        '/quran-display/data/phoneme_db.json',
        '/quran-display/manifest.json',
        '/quran-display/icons/icon-192.png',
        '/quran-display/icons/icon-512.png',
      ])
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

// Serve from cache, fall back to network
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        // Cache JS/CSS/JSON assets as they load
        if (resp.ok && (
          e.request.url.includes('/assets/') ||
          e.request.url.includes('/data/')
        )) {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return resp;
      }).catch(() => {
        // Fully offline - serve index.html for navigation requests
        if (e.request.mode === 'navigate') {
          return caches.match('/quran-display/index.html');
        }
      });
    })
  );
});
