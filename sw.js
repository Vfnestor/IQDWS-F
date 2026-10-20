const CACHE_NAME = 'iqdws-cache-v2'; // تغییر نسخه به 2
const urlsToCache = [
  './index.html',
  './main.html',
  './supplier.html',
  './admin.html',
  './assets/css/main.css',
  './assets/css/components.css',
  './assets/css/forms.css',
  './assets/css/tables.css',
  './assets/js/config.js', // اضافه شدن فایل تنظیمات
  './assets/js/auth.js'
];

self.addEventListener('install', event => {
  // پاک کردن کش‌های قدیمی هنگام نصب نسخه جدید
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

self.addEventListener('fetch', event => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
  } else {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  }
});