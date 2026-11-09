/**
 * Service Worker — کش آفلاین اکوسیستم IQDWS
 * نسخه را هنگام تغییر محتوا افزایش دهید تا کش قدیمی پاک شود.
 */
const CACHE_VERSION = 'iqdws-v3';

const CORE_ASSETS = [
  /* صفحات */
  './',
  './index.html',
  './main.html',
  './admin.html',
  './supplier.html',
  './modules/_stub.html',
  './manifest.json',

  /* CSS */
  './assets/css/tokens.css',
  './assets/css/base.css',
  './assets/css/components.css',
  './assets/css/layout.css',
  './assets/css/pages.css',

  /* JS — هسته */
  './assets/js/store.js',
  './assets/js/offline.js',
  './assets/js/api.js',
  './assets/js/ui.js',
  './assets/js/router.js',
  './assets/js/shell.js',
  './assets/js/charts.js',
  './assets/js/mock-data.js',
  './modules/qc/ncr.html',
  
  
  /* JS — صفحات */
  './assets/js/pages/main.js',
  './assets/js/pages/admin.js',
  './assets/js/pages/supplier.js',
  './assets/js/pages/login.js',
  ./assets/js/pages/ncr.js,
];

/* --- Install --- */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(CORE_ASSETS).catch((err) => {
        console.warn('[SW] برخی از فایل‌های کش نشدند:', err);
      }))
      .then(() => self.skipWaiting())
  );
});

/* --- Activate --- */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k !== CACHE_VERSION)
          .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* --- Fetch --- */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // فقط درخواست‌های same-origin را مدیریت کن (CDN و ... رد شوند)
  if (url.origin !== self.location.origin) return;

  // API → Network First با fallback به cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(req)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_VERSION).then(c => c.put(req, clone));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // HTML → Network First با fallback به cache، سپس به main.html
  const acceptsHtml = req.headers.get('accept')?.includes('text/html');
  if (acceptsHtml) {
    event.respondWith(
      fetch(req)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_VERSION).then(c => c.put(req, clone));
          return res;
        })
        .catch(() =>
          caches.match(req).then(r => r || caches.match('./main.html'))
        )
    );
    return;
  }

  // CSS/JS/تصاویر → Stale While Revalidate
  event.respondWith(
    caches.match(req).then(cached => {
      const fetchPromise = fetch(req)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_VERSION).then(c => c.put(req, clone));
          return res;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

/* --- پیام از کلاینت (مثلاً برای پاک کردن کش) --- */
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
