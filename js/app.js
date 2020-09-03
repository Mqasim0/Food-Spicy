if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then((req) => console.log('service worker Registered', req))
    .catch((error) => console.log('service worker not registered', error));
}
