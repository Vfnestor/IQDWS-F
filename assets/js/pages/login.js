import { store } from '../store.js';
import { offline } from '../offline.js';
import { openModal, toast } from '../ui.js';
import { lineChart } from '../charts.js';

// تعریف کاربران با ۷ رده مختلف برای تست
const MOCK_USERS = {
  'admin':      { password: 'admin', name: 'مدیر سیستم', role: 'admin', redirect: 'main.html' },
  'inspector':  { password: '123',   name: 'بازرس خط',   role: 'inspector', redirect: 'main.html' },
  'expert':     { password: '123',   name: 'کارشناس قطعه', role: 'part_expert', redirect: 'main.html' },
  'supervisor': { password: '123',   name: 'مسئول بخش',  role: 'supervisor', redirect: 'main.html' },
  'chief':      { password: '123',   name: 'رئیس اداره', role: 'chief', redirect: 'main.html' },
  'manager':    { password: '123',   name: 'مدیر کیفیت', role: 'quality_manager', redirect: 'main.html' },
  'vp':         { password: '123',   name: 'معاونت',     role: 'vp', redirect: 'main.html' },
  'ceo':        { password: '123',   name: 'مدیر عامل',  role: 'ceo', redirect: 'main.html' }
};

function initLandingChart() {
  const container = document.getElementById('landing-chart');
  if (container) {
    lineChart(container, {
      labels: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور'],
      data: [120, 95, 80, 60, 45, 30],
      color: '#10b981',
    });
  }
}

function showLoginModal() {
  const content = document.createElement('div');
  content.innerHTML = `
    <form id="modal-login-form" class="flex flex-col gap-4">
      <div class="form-group">
        <label class="form-label">نام کاربری</label>
        <input type="text" class="input" id="username" required placeholder="مثلا: inspector">
      </div>
      <div class="form-group">
        <label class="form-label">رمز عبور</label>
        <input type="password" class="input" id="password" required placeholder="••••••">
      </div>
      <div id="login-error" class="text-danger text-sm hidden mt-2"></div>
      
      <div class="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-600 border border-gray-200">
        <p class="font-bold mb-1">راهنمای ورود تست:</p>
        <p>ادمین: admin / admin</p>
        <p>سایر رده‌ها (بازرس، کارشناس و...): پسورد 123</p>
        <p>نام کاربری‌ها: inspector, expert, supervisor, chief, manager, vp, ceo</p>
      </div>
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
    size: 'md'
  });
}

async function init() {
  initLandingChart();
  const session = await store.getSession();
  const btn = document.getElementById('btn-show-login');
  
  if (session && session.token) {
    btn.textContent = 'ورود به پنل کاربری';
    btn.onclick = () => window.location.href = 'main.html';
  } else {
    btn.onclick = showLoginModal;
  }
}
init();