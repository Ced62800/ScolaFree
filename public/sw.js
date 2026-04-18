const CACHE_NAME = "scolafree-v2";
const STATIC_ASSETS = ["/", "/cours", "/connexion", "/inscription", "/offline"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Ne pas intercepter les requêtes Supabase ou API
  if (
    event.request.url.includes("supabase.co") ||
    event.request.url.includes("/api/")
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Mettre en cache la réponse pour les ressources statiques
        if (event.request.method === "GET" && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback cache
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // Fallback page offline
          if (event.request.mode === "navigate") {
            return caches.match("/offline");
          }
        });
      }),
  );
});
