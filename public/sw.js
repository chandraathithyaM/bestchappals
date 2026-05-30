const CACHE_NAME = "bestchappals-cache-v1";
const OFFLINE_URL = "/offline";

const ASSETS_TO_CACHE = [
  OFFLINE_URL,
  "/logo.png",
  "/favicon.ico"
];

// ─── INSTALL EVENT: Pre-cache crucial offline pages & assets ─────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// ─── ACTIVATE EVENT: Clean up older caches ────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("[Service Worker] Clearing old cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ─── FETCH EVENT: High-performance caching strategies ────────────────────────
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests (e.g. POST, PUT, DELETE for payments & Clerk)
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Skip Clerk authentication endpoints and Next API routes to avoid caching auth states
  if (
    url.pathname.startsWith("/api") || 
    url.hostname.includes("clerk") || 
    url.pathname.startsWith("/sign-in") || 
    url.pathname.startsWith("/sign-up") ||
    url.pathname.startsWith("/admin")
  ) {
    return;
  }

  // 1. Navigation Requests (HTML pages): Network-First, fallback to cache, then offline page
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Open cache and save the fresh page
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Network failed, try fetching page from cache
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            // Page not in cache, fallback to the offline page
            return caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // 2. Static Assets (Images, Fonts, Stylesheets): Cache-First, fallback to Network
  const isStaticAsset =
    event.request.destination === "image" ||
    event.request.destination === "font" ||
    event.request.destination === "style" ||
    event.request.destination === "script" ||
    url.pathname.includes(".jpg") ||
    url.pathname.includes(".png") ||
    url.pathname.includes(".jpeg") ||
    url.pathname.includes(".webp") ||
    url.pathname.includes(".svg");

  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200) return response;
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
            return response;
          })
          .catch(() => {
            // Safe fallback for missing offline image
            if (event.request.destination === "image") {
              return caches.match("/logo.png");
            }
          });
      })
    );
  }
});
