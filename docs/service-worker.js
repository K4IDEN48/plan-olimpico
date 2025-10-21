// Service Worker para funcionamiento offline (PWA)
const CACHE_NAME = 'plan-olimpico-v1';
const urlsToCache = [
  '/plan-olimpico/',
  '/plan-olimpico/index.html',
  '/plan-olimpico/styles.css',
  '/plan-olimpico/app.js',
  '/plan-olimpico/data.js',
  '/plan-olimpico/manifest.json'
];

// Instalación
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activación
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch (cargar desde cache si está offline)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - devolver respuesta
        if (response) {
          return response;
        }
        
        // Si no está en cache, hacer fetch normal
        return fetch(event.request);
      })
  );
});