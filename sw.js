const CACHE_NAME = 'iqdws-cache-v3'; // تغییر نسخه برای دور زدن کش
const urlsToCache = [
  './index.html',
  './main.html',
  './supplier.html',
  './admin.html',
  './assets/css/main.css',
  './assets/css/components.css',
  './assets/css/forms.css',
  './assets/css/tables.css',
  './assets/js/config.js',
  './assets/js/auth.js'
];

self.addEventListener('install', event => {
  // پاک کردن کش‌های قبلی
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim()); // اعمال فوری تغییرات
});

self.addEventListener('fetch', event => {
  // برای درخواست‌های API، همیشه از شبکه بخوان
  if (event.request.url.includes('/api/')) {
    event.preventDefault();
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});