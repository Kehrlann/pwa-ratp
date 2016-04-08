var dataCacheName = 'ratpData-v1';
var cacheName = 'ratpPWA-v1';
var filesToCache = [
  '/',
  '/index.html',
  '/scripts/jquery.js',
  '/scripts/app.js',
  '/images/1.svg',
  '/images/2.svg',
  '/images/3.svg',
  '/images/3bis.svg',
  '/images/4.svg',
  '/images/5.svg',
  '/images/6.svg',
  '/images/7.svg',
  '/images/7bis.svg',
  '/images/8.svg',
  '/images/9.svg',
  '/images/10.svg',
  '/images/11.svg',
  '/images/12.svg',
  '/images/13.svg',
  '/images/14.svg',
  '/images/A.svg',
  '/images/B.svg',
  '/images/ic_refresh_white_24px.svg',
  '/images/RATP.svg'
];

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching App Shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        console.log('[ServiceWorker] Removing old cache', key);
        if (key !== cacheName) {
          return caches.delete(key);
        }
      }));
    })
  );
});

self.addEventListener('fetch', function(e) {
  console.log('[ServiceWorker] Fetch', e.request.url);
  var dataUrl = '/api';
  if (e.request.url.indexOf(dataUrl) != -1) {
    e.respondWith(
      fetch(e.request)
        .then(function(response) {
          return caches.open(dataCacheName).then(function(cache) {
            cache.put(e.request.url, response.clone());
            console.log('[ServiceWorker] Fetched&Cached Data');
            return response;
          });
        })
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(function(response) {
        return response || fetch(e.request);
      })
    );
  }
});
