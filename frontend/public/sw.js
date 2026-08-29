const CACHE_NAME = "honeychain-v3";
const STATIC_ASSETS = [
  "/",
  "/verify",
  "/dashboard/login",
  "/manifest.json",
  "/honeychain_app_icon.jpg",
  "/honeychain_logo_badge.jpg",
];

// Install: pre-cache critical offline assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        STATIC_ASSETS.map((url) =>
          fetch(url, { cache: "reload" })
            .then((res) => {
              if (res.ok) return cache.put(url, res);
            })
            .catch(() => {})
        )
      );
    })
  );
  self.skipWaiting();
});

// Activate: purge any older cache versions immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: Network-First with Offline Cache Fallback
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Only handle http(s) requests
  if (!url.protocol.startsWith("http")) return;

  // Skip dynamic API routes, auth, websockets, and HMR
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/webpack-hmr") ||
    url.pathname.includes("__nextjs")
  ) {
    return;
  }

  // Network-First strategy: fetch live version from server first
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          (networkResponse.type === "basic" || networkResponse.type === "cors")
        ) {
          const responseToCache = networkResponse.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache).catch(() => {});
            })
            .catch(() => {});
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache only if network is offline
        return caches.match(event.request);
      })
  );
});
