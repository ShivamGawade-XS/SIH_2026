const CACHE_NAME = "honeychain-v4";
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
              if (res && res.ok) return cache.put(url, res);
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
    }).then(() => self.clients.claim())
  );
});

// Fetch: Network-First for HTML navigation only; never intercept Next.js chunks or APIs
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Only handle http(s) requests
  if (!url.protocol.startsWith("http")) return;

  // Never intercept Next.js internals, chunks, RSC payloads, Vercel scripts, or APIs
  if (
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/_vercel/") ||
    url.pathname.startsWith("/api/") ||
    url.searchParams.has("_rsc") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css")
  ) {
    return;
  }

  // Only handle HTML navigation requests
  if (event.request.mode === "navigate" || event.request.destination === "document") {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone)).catch(() => {});
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          const fallback = await caches.match("/");
          if (fallback) return fallback;
          return new Response("Offline - HoneyChain by TrueTag", {
            status: 503,
            headers: { "Content-Type": "text/plain" },
          });
        })
    );
  }
});
