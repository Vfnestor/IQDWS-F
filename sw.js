// Service Worker برای پشتیبانی از حالت آفلاین
const CACHE_NAME = 'iqdws-cache-v1';
const urlsToCache = [
  './index.html',
  './main.html',
  './supplier.html',
  './admin.html',
  './assets/css/main.css',
  './assets/css/components.css',
  './assets/css/forms.css',
  './assets/css/tables.css',
  './assets/js/auth.js',
  './assets/js/config.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  // برای درخواست‌های API، ابتدا شبکه سپس کش (Network First)
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  } else {
    // برای فایل‌های استاتیک، ابتدا کش سپس شبکه (Cache First)
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  }
});