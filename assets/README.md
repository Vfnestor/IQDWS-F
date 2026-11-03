# فاز ۰ — پایه‌ریزی اکوسیستم کیفیت (IQDWS-F)

این فاز فقط زیرساخت مشترک فرانت‌اند را می‌سازد و هیچ صفحه‌ای از حالت فعلی خارج نمی‌شود.

## فایل‌های این فاز

| فایل | نقش |
|---|---|
| `css/tokens.css`     | توکن‌های طراحی (رنگ، فاصله، فونت) |
| `css/base.css`       | ریست، تایپوگرافی فارسی، RTL، یوتیلیتی‌ها |
| `css/components.css` | دکمه، کارت، KPI، بج، فرم، جدول، مودال، Toast، تب |
| `css/layout.css`     | پوسته، هدر، سایدبار، محتوا، گریدها، واکنش‌گرا |
| `js/store.js`        | state + IndexedDB (کش، صف سینک، session) |
| `js/offline.js`      | تشخیص آنلاین/آفلاین + تلاش دوره‌ای سینک |
| `js/api.js`          | لایه انتزاعی بین UI و بک‌اند (mock/real) |
| `js/ui.js`           | Toast، Modal، Confirm، Table، Loading، Empty، Formatters |
| `js/router.js`       | مسیریابی hash-based بین ماژول‌ها |
| `js/shell.js`        | تزریق هدر و سایدبار در همه صفحه‌ها |
| `js/mock-data.js`    | داده نمونه بر اساس مدل‌های iqdws-b |

## نحوه استفاده در صفحه‌ها (فاز ۱)

در هر صفحه، ابتدا فایل‌های CSS و سپس اسکریپت شل را بارگذاری کنید:

```html
<link rel="stylesheet" href="assets/css/tokens.css">
<link rel="stylesheet" href="assets/css/base.css">
<link rel="stylesheet" href="assets/css/components.css">
<link rel="stylesheet" href="assets/css/layout.css">

<script type="module">
  import { mountShell } from './assets/js/shell.js';
  import { store } from './assets/js/store.js';
  // بارگذاری session (در فاز ۱ از API/ورود)
  const session = await store.getSession();
  if (session) store.set('session', session);
  mountShell();
</script>