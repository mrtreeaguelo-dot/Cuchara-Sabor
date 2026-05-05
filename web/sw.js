const CACHE_NAME = 'cuchara-sabor-v5';
const STATIC_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './recipes.js',
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

// Fetch: Strategy Network-First for all assets to ensure fresh code in active development
self.addEventListener('fetch', (e) => {
    e.respondWith(
        fetch(e.request)
            .then((res) => {
                // If valid response, clone and update cache
                if (res && res.status === 200 && res.type === 'basic' || res.type === 'cors') {
                    const resClone = res.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(e.request, resClone));
                }
                return res;
            })
            .catch(() => caches.match(e.request)) // Fallback to cache if offline
    );
});
