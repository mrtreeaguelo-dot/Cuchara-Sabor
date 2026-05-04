const CACHE_NAME = 'cuchara-sabor-v2';
const STATIC_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json'
];

// Install: Cache static local assets only
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate: Clean old caches
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch: Strategy Network-First for external assets, Cache-First for local
self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url);
    
    // External assets (Fonts, Icons, Images) -> Network First
    if (url.origin !== location.origin) {
        e.respondWith(
            fetch(e.request)
                .then((res) => {
                    const resClone = res.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(e.request, resClone));
                    return res;
                })
                .catch(() => caches.match(e.request))
        );
    } else {
        // Local assets -> Cache First
        e.respondWith(
            caches.match(e.request)
                .then((response) => {
                    return response || fetch(e.request);
                })
        );
    }
});
