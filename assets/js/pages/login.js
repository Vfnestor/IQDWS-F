/**
 * login.js — راه‌اندازی صفحه ورود
 * - اگر session موجود باشد، به main.html هدایت می‌شود.
 * - بج آفلاین را در گوشه صفحه نمایش می‌دهد.
 */
import { store } from '../store.js';
import { offline } from '../offline.js';

async function init() {
  // بررسی session موجود
  const session = await store.getSession();
  if (session && session.token) {
    location.replace('main.html');
    return;
  }

  // تزریق بج آفلاین در گوشه صفحه
  const badge = document.createElement('div');
  badge.className = 'offline-badge login-offline-badge';
  badge.id = 'offline-badge';
  badge.innerHTML = `
    <span class="offline-badge-dot"></span>
    <span id="offline-badge-text">${offline.isOnline() ? 'آنلاین' : 'آفلاین'}</span>
  `;
  if (!offline.isOnline()) badge.classList.add('is-offline');
  document.body.appendChild(badge);

  offline.onChange(({ online }) => {
    badge.classList.toggle('is-offline', !online);
    badge.querySelector('#offline-badge-text').textContent = online ? 'آنلاین' : 'آفلاین';
  });
}

init();