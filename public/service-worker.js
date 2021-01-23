console.log("Your service-worker.js file is working");


// Set up cache files
const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";
const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/styles.css",
    "/index.js",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
    "/manifest.webmanifest"
];


// Install service worker
self.addEventListener("install", function(evt) {
    // Pre-cache data
    evt.waitUntil(
        caches.open(DATA_CACHE_NAME).then((cache) => cache.add("/api/transaction"))
    );

    // Pre-cache all static assets
    evt.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
    );

    // Tell the browser to activate this service worker once it's done installing
    self.skipWaiting();
});


// Activate service worker, remove old data from cache

self.addEventListener("activate", function(evt) {
    evt.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
              console.log("Removing old cache data", key);
              return caches.delete(key);
            }
          })
        );
      })
    );
  
    self.clients.claim();
});


// Modify our service worker to handle requests to /api, store those responses in our cache to access later

self.addEventListener("fetch", function(evt) {
    // Cache successful requests to the API
    if (evt.request.url.includes("/api/")) {
        console.log('[Service Worker] Fetch (data)', evt.request.url);

        evt.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(evt.request)
                .then(response => {
                    // If the response was good, clone it and store it in the cache
                    if (response.status === 200) {
                        cache.put(evt.request.url, response.clone());
                    }

                    return response;
                })
                .catch(err => {
                    // If network request fails, try to get it from the cache
                    return cache.match(evt.request);
                });
            }).catch(err => console.log(err))
        );

        return;
    }

    //Proceed with network request when the source is not in the cache
    evt.respondWith(
        caches.open(CACHE_NAME).then(cache => {
        return cache.match(evt.request).then(response => {
            return response || fetch(evt.request);
        });
        })
    );

});