console.log("Your service-worker.js file is working");


// Set up cache files
const FILES_TO_CACHE = [
    "/",
    "/db.js",
    "/index.html",
    "/styles.css",
    "/index.js",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
    "/manifest.webmanifest"
];


const STATIC_CACHE = "static-cache-v1";
const RUNTIME_CACHE = "runtime-cache";


// Install service worker
self.addEventListener("install", event => {
    // Pre-cache data
    event.waitUntil(
        caches
            .open(STATIC_CACHE)
            .then(cache => cache.addAll(FILES_TO_CACHE))
            .then(() => self.skipWaiting())
        );
    });


// Activate service worker, remove old data from cache

self.addEventListener("activate", event => {

    const currentCaches = [STATIC_CACHE, RUNTIME_CACHE];
    event.waitUntil(
      caches
      .keys()
      .then(cacheNames => {
        // Return array of cache names to be deleted
        return cacheNames.filter(
            cacheName => !currentCaches.includes(cacheName)
            );
        })
        .then(cachesToDelete => {
            return Promise.all(
                cachesToDelete.map(cacheToDelete => {
                    return caches.delete(cacheToDelete);
                })
            );
        })
        .then(() => self.clients.claim())
    );
});
  

// Modify our service worker to handle requests to /api, store those responses in our cache to access later

self.addEventListener("fetch", event => {
    // Non GET requests are not cached and requests to other origins are not cached
    if (
        event.request.method !== "GET" ||
        !event.request.url.startsWith(self.location.origin)
        ) {
            event.respondWith(fetch(event.request));
            return;
        }

        // Handle runtime GET requests for data from /api routes
        if (event.request.url.includes("/api/transaction")) {
            // Make network request and fallback to cache if network request fails (offline)
            event.respondWith(
                caches.open(RUNTIME_CACHE).then(cache => {
                    return fetch(event.request)
                    .then(response => {
                        cache.put(event.request, response.clone());
                        return response;
                    })
                    .catch(() => caches.match(event.request));
                })
            );
            return;
        }

        // Use cache first for all other requests for performance
        event.respondWith(
            caches.match(event.request).then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Request is not in cache. Make network request and cache the response
                return caches.open(RUNTIME_CACHE).then(cache => {
                    return fetch(event.request).then(response => {
                        return cache.put(event.request, response.clone()).then(() => {
                            return response;
                        });
                    });
                });
            })
        );
});