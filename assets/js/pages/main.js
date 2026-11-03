/**
 * main.js — راه‌اندازی داشبورد
 * در فاز ۱ فقط پوسته را سوار می‌کند.
 * در فاز ۲ داشبورد KPI به این فایل اضافه می‌شود.
 */
import { store } from '../store.js';
import { mountShell } from '../shell.js';
import { offline } from '../offline.js';
import { toast } from '../ui.js';

async function init() {
  // بارگذاری session در store برای استفاده در shell
  const session = await store.getSession();
  if (session) store.set('session', session);

  // سوار کردن پوسته (هدر + سایدبار)
  mountShell();

  // اعلان وضعیت آفلاین به کاربر
  offline.onChange(({ online }) => {
    if (!online) toast('اتصال قطع شد — حالت آفلاین فعال است', 'warning', 4000);
    else toast('اتصال برقرار شد', 'success', 2500);
  });
}

init();