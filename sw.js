let staticCache = 'site-static-v11';
let dynamicCache = 'site-dynamic-v5';

let assets = [
  '/',
  'index.html',
  'js/app.js',
  'js/ui.js',
  'js/materialize.min.js',
  'css/styles.css',
  'css/materialize.min.css',
  'img/dish.png',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'pages/fallBack.html',
];

// cache size limit function
const limitCacheSize = (name, size) => {
  caches.open(name).then((cache) => {
    cache.keys().then((keys) => {
      if (keys.length > size) {
        cache.delete(keys[0]).then(limitCacheSize(name, size));
      }
    });
  });
};

// install service worker
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(staticCache).then(function (cache) {
      console.log('[ServiceWorker] Caching app shell');
      cache.addAll(assets);
    })
  );
});
// activate event
self.addEventListener('activate', (event) => {
  //console.log('service worker has been activated');
  event.waitUntil(
    caches.keys().then((keys) => {
      // console.log(keys);
      return Promise.all(
        keys
          .filter((key) => key !== staticCache && key !== dynamicCache)
          .map((key) => caches.delete(key))
      );
    })
  );
});

// fetch event
self.addEventListener('fetch', (event) => {
  if (event.request.url.indexOf('firestore.googleapis.com') === -1) {
    event.respondWith(
      caches
        .match(event.request)
        .then((cacheRes) => {
          return (
            cacheRes ||
            fetch(event.request).then((fetchRes) => {
              return caches.open(dynamicCache).then((cache) => {
                cache.put(event.request.url, fetchRes.clone());
                limitCacheSize(dynamicCache, 15);
                return fetchRes;
              });
            })
          );
        })
        .catch(() => {
          if (event.request.url.indexOf('.html') > -1)
            return caches.match('pages/fallBack.html');
        })
    );
  }
});
