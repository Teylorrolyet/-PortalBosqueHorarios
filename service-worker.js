const cacheName = 'portal-bosque-cache-v1';
const assets = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  './logo-portal-bosque.png'
];

self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open(cacheName).then(cache=>{
      return cache.addAll(assets);
    })
  );
});

self.addEventListener('fetch', e=>{
  e.respondWith(
    caches.match(e.request).then(resp=>resp || fetch(e.request))
  );
});
