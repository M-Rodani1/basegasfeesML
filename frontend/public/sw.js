const CACHE_NAME = 'base-gas-optimizer-v1';
const API_CACHE_NAME = 'base-gas-api-v1';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/logo.svg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network-first strategy for API, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // API requests - network-first with stale-while-revalidate
  if (url.pathname.includes('/api/')) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then(async (cache) => {
        try {
          const response = await fetch(request);
          if (response.ok) {
            // Clone and cache the fresh response
            cache.put(request, response.clone());
          }
          return response;
        } catch (error) {
          // Network failed, try cache
          const cachedResponse = await cache.match(request);
          if (cachedResponse) {
            const cachedDate = new Date(cachedResponse.headers.get('date') || 0);
            const now = new Date();

            // Return cached response if it's still fresh enough
            if (now - cachedDate < CACHE_DURATION) {
              return cachedResponse;
            }
          }
          // If no valid cache, throw the original error
          throw error;
        }
      })
    );
    return;
  }

  // Static assets - cache-first strategy
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });

        return response;
      });
    })
  );
});
