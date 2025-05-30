const CACHE_NAME = 'image-studio-cache-v1.2'; // Increment version with changes
const urlsToCache = [
  '/',
  '/index.html', // Explicitly cache index.html
  '/index.tsx',  // Cache the main entry point script
  '/manifest.json',
  // CDN dependencies from importmap
  'https://esm.sh/react@^19.1.0',
  'https://esm.sh/react-dom@^19.1.0/client', // Specific import from index.tsx
  'https://esm.sh/@google/genai@^1.2.0',
  'https://esm.sh/lucide-react@^0.437.0',
  'https://esm.sh/jszip@3.10.1',
  // Tailwind CSS
  'https://cdn.tailwindcss.com',
  // Placeholder for icons (actual icon files would be listed or dynamically cached if numerous)
  // It's often better to let the browser cache these via HTTP caching headers if they are static assets.
  // However, for a robust offline shell, a few key UI icons could be listed.
  // For simplicity, we are focusing on core app files and CDN libs here.
  // Asset paths like '/assets/icons/icon-192.png' would also be cached if used by the shell.
];

self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching app shell and key assets');
        // Add all URLs, but don't fail install if one CDN resource fails (optional: make more robust)
        const promises = urlsToCache.map(url => {
            return cache.add(url).catch(err => {
                console.warn(`[ServiceWorker] Failed to cache ${url}: ${err}`);
            });
        });
        return Promise.all(promises);
      })
      .then(() => self.skipWaiting()) // Activate worker immediately
  );
});

self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of uncontrolled clients
  );
});

self.addEventListener('fetch', (event) => {
  // Let browser handle requests for scripts from esm.sh during development to avoid caching issues
  // if (event.request.url.startsWith('https://esm.sh')) {
  //   return;
  // }

  // For other requests, try cache first, then network.
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          // console.log('[ServiceWorker] Serving from cache:', event.request.url);
          return response;
        }
        // console.log('[ServiceWorker] Fetching from network:', event.request.url);
        return fetch(event.request).then(
          (networkResponse) => {
            // Optionally, cache new requests dynamically (be careful with this)
            // For example, if it's a GET request and from your origin or known CDNs
            // if (event.request.method === 'GET' && (event.request.url.startsWith(self.origin) || urlsToCache.some(u => event.request.url.startsWith(u.substring(0, u.lastIndexOf('/')))) ) ) {
            //   return caches.open(CACHE_NAME).then((cache) => {
            //     console.log('[ServiceWorker] Caching new resource:', event.request.url);
            //     cache.put(event.request, networkResponse.clone());
            //     return networkResponse;
            //   });
            // }
            return networkResponse;
          }
        ).catch(error => {
            console.error('[ServiceWorker] Fetch failed; returning offline page if available, or error for resource', error);
            // Optionally, return a custom offline fallback page for HTML navigations
            // if (event.request.mode === 'navigate') {
            //   return caches.match('/offline.html'); 
            // }
        });
      })
  );
});
