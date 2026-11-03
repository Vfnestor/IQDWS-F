import { store } from '../store.js';
import { offline } from '../offline.js';
import { openModal, toast } from '../ui.js';
import { lineChart } from '../charts.js';

// کاربران تستی (Mock)
const MOCK_USERS = {
  'admin': { password: 'admin', name: 'مدیر سیستم', role: 'admin', redirect: 'main.html' },
  'inspector': { password: '123', name: 'بازرس خط', role: 'inspector', redirect: 'main.html' },
  'expert': { password: '123', name: 'کارشناس قطعه', role: 'part_expert', redirect: 'main.html' }
};

function initLandingChart() {
  const container = document.getElementById('landing-chart');
  if (container) {
    lineChart(container, {
      labels: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور'],
      data: [120, 95, 80, 60, 45, 30], // روند نزولی ایرادات
      color: '#10b981', // رنگ سبز
    });
  }
}

function showLoginModal() {
  const content = document.createElement('div');
  content.innerHTML = `
    <form id="modal-login-form" class="flex flex-col gap-4">
      <div class="form-group">
        <label class="form-label">نام کاربری</label>
        <input type="text" class="input" id="username" required placeholder="مثلا: admin">
      </div>
      <div class="form-group">
        <label class="form-label">رمز عبور</label>
        <input type="password" class="input" id="password" required placeholder="••••••">
      </div>
      <div id="login-error" class="text-danger text-sm hidden mt-2"></div>
    </form>
  `;

  const modal = openModal({
    title: 'ورود به اکوسیستم کیفیت',
    content: content,
    actions: [
      { label: 'انصراف', variant: 'secondary', onClick: ({ close }) => close() },
      {
        label: 'ورود',
        variant: 'primary',
        onClick: ({ close }) => {
          const user = document.getElementById('username').value.trim();
          const pass = document.getElementById('password').value;
          const errorEl = document.getElementById('login-error');
          
          if (MOCK_USERS[user] && MOCK_USERS[user].password === pass) {
            // ورود موفق
            const sessionData = { ...MOCK_USERS[user], username: user, token: 'mock-token-' + user };
            store.setSession(sessionData).then(() => {
              close();
              window.location.href = sessionData.redirect;
            });
          } else {
            errorEl.textContent = 'نام کاربری یا رمز عبور اشتباه است.';
            errorEl.classList.remove('hidden');
          }
        }
      }
    ],
    size: 'sm'
  });
}

async function init() {
  initLandingChart();

  // بررسی اینکه آیا کاربر قبلا لاگین کرده است یا خیر
  const session = await store.getSession();
  if (session && session.token) {
    // اگر لاگین بود، دکمه را به "ورود به پنل" تغییر بده
    const btn = document.getElementById('btn-show-login');
    btn.textContent = 'ورود به پنل کاربری';
    btn.onclick = () => window.location.href = 'main.html';
  } else {
    // دکمه ورود پاپ آپ را باز کند
    document.getElementById('btn-show-login').onclick = showLoginModal;
  }

  // نشانگر آفلاین
  offline.onChange(({ online }) => {
    if (!online) toast('اتصال قطع شد — حالت آفلاین فعال است', 'warning', 4000);
  });
}

init();