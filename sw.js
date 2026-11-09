const CACHE_VERSION = 'iqdws-test-v9';
self.addEventListener('install', (e) => {
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  // پاک کردن تمام کش‌های قبلی
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  // در این نسخه تست، تمام درخواست‌ها مستقیم به شبکه (گیت‌هاب) می‌روند و هیچ چیزی کش نمی‌شود
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
