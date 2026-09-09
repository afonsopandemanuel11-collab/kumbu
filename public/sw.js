// KUMBU Progressive Web App Service Worker
// Offline-First Caching Strategy for App Shell & Dynamic Pages

const CACHE_NAME = "kumbu-cache-v3";
const OFFLINE_URL = "/offline";

const CORE_STATIC = [
  "/",
  OFFLINE_URL,
  "/favicon.svg",
  "/manifest.webmanifest",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/icon-maskable-192x192.png",
  "/icons/icon-maskable-512x512.png",
  "/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(CORE_STATIC).catch((err) => {
          console.warn("[KUMBU SW] Falha ao pré-cachear alguns assets:", err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              console.log("[KUMBU SW] A limpar cache antiga:", key);
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. NUNCA interceptar requisições que não sejam GET (mutations, logins, forms)
  if (request.method !== "GET") {
    return;
  }

  // 2. NUNCA interceptar chamadas ao Supabase ou autenticação privada
  if (url.hostname.includes("supabase.co") || url.pathname.startsWith("/api/auth")) {
    return;
  }

  // 3. Navegação (páginas HTML do App Router): Network-first com fallback para Cache da App
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(async (networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);

          // 1. Procura a página solicitada em cache
          const cachedExact = await cache.match(request);
          if (cachedExact) return cachedExact;

          // 2. Se não encontrar a rota exata, devolve a página principal cached '/'
          const cachedRoot = await cache.match("/");
          if (cachedRoot) return cachedRoot;

          // 3. Se nenhuma página estiver guardada, devolve a página offline de fallback
          const cachedOffline = await cache.match(OFFLINE_URL);
          return (
            cachedOffline ||
            new Response("KUMBU Offline - Sem ligação à internet", {
              status: 503,
              headers: { "Content-Type": "text/html; charset=utf-8" },
            })
          );
        })
    );
    return;
  }

  // 4. Pedidos RSC do Next.js App Router (?_rsc=... ou cabeçalho RSC)
  if (url.searchParams.has("_rsc") || request.headers.get("RSC") === "1") {
    event.respondWith(
      fetch(request)
        .then(async (networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          const cached = await cache.match(request);
          return cached || new Response("", { status: 200 });
        })
    );
    return;
  }

  // 5. Assets estáticos (Chunks JS, CSS, Imagens, Fontes, Ícones)
  const isStatic =
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/_next/static/") ||
      url.pathname.startsWith("/icons/") ||
      url.pathname.endsWith(".svg") ||
      url.pathname.endsWith(".png") ||
      url.pathname.endsWith(".ico") ||
      url.pathname.endsWith(".woff2") ||
      url.pathname.endsWith(".css") ||
      url.pathname.endsWith(".js"));

  if (isStatic) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        });
      })
    );
  }
});
