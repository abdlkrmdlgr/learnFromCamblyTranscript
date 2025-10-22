const APP_VERSION = '1.1.5';
const CACHE_NAME = `cambly-learning-v${APP_VERSION}`;
const STATIC_CACHE = `cambly-static-v${APP_VERSION}`;
const DYNAMIC_CACHE = `cambly-dynamic-v${APP_VERSION}`;

const urlsToCache = [
  '/learnFromCamblyTranscript/',
  '/learnFromCamblyTranscript/manifest.json',
  '/learnFromCamblyTranscript/icon-192.png',
  '/learnFromCamblyTranscript/icon-512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log(`Service Worker installing version ${APP_VERSION}`);
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Skip waiting to activate immediately for updates
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log(`Service Worker activating version ${APP_VERSION}`);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete ALL old caches aggressively
          if (cacheName.startsWith('cambly-') && 
              cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim();
    }).then(() => {
      // Notify all clients about the update
      return self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SW_UPDATE_AVAILABLE',
            version: APP_VERSION
          });
        });
      });
    })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Fetch from network
        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache dynamic content
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/learnFromCamblyTranscript/');
            }
          });
      })
  );
});

// Handle version updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Listen for messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CHECK_FOR_UPDATES') {
    // Check if there's a waiting service worker
    if (self.registration && self.registration.waiting) {
      event.ports[0].postMessage({
        type: 'UPDATE_AVAILABLE',
        version: APP_VERSION
      });
    }
  }
});

// Force update check on every activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'SW_VERSION_UPDATE',
          version: APP_VERSION
        });
      });
    })
  );
});