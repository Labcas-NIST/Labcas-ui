/* Service Worker for serving the simulated OHIF JSON file */

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

const CACHE_NAME = 'simulated-json-cache';

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CLEAR_CACHE' && event.data.url === '/nist/simulated.json') {
    console.log('Clearing simulated.json cache in Service Worker.');
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        return cache.delete('/nist/simulated.json');
      })
    );
  } else if (event.data && event.data.type === 'SET_BLOB' && event.data.url === '/nist/simulated.json') {
    const simulatedData = event.data.data;
    console.log('Simulated data received in Service Worker.');
    const blobResponse = new Response(simulatedData, { headers: { 'Content-Type': 'application/json' } });
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        return cache.delete('/nist/simulated.json').then(() => {
          return cache.put('/nist/simulated.json', blobResponse);
        });
      })
    );
  }
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.pathname === '/nist/simulated.json') {
    event.respondWith(
      caches.match('/nist/simulated.json', { ignoreSearch: true }).then(response => {
        return response || fetch(event.request);
      })
    );
  }
});
