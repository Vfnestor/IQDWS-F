/**
 * supplier.js — راه‌اندازی صفحه تأمین‌کننده
 * در فاز ۱ فقط پوسته را سوار می‌کند.
 */
import { store } from '../store.js';
import { mountShell } from '../shell.js';

async function init() {
  const session = await store.getSession();
  if (session) store.set('session', session);
  mountShell();
}

init();