import { offline } from './offline.js';
import { store } from './store.js';

// در این ساختار، roles مشخص می‌کند چه کسانی به این آیتم دسترسی دارند
const NAV_GROUPS = [
  {
    label: 'عمومی',
    items: [
      { key: 'dashboard', label: 'داشبورد', href: 'main.html', icon: '🏠', ready: true, roles: ['admin', 'inspector', 'part_expert'] },
    ],
  },
  {
    label: 'تضمین کیفیت (QA)',
    items: [
      { key: 'fmea', label: 'FMEA', href: 'modules/qa/fmea.html', icon: '⚠️', ready: false, roles: ['admin'] },
      { key: 'control-plan', label: 'کنترل‌پلن', href: 'modules/qa/control-plan.html', icon: '📋', ready: false, roles: ['admin'] },
      { key: 'audit', label: 'ممیزی', href: 'modules/qa/audit.html', icon: '🔎', ready: false, roles: ['admin'] },
    ],
  },
  {
    label: 'کنترل کیفیت (QC)',
    items: [
      { key: 'inspection', label: 'بازرسی', href: 'modules/qc/inspection.html', icon: '🔍', ready: false, roles: ['admin', 'inspector'] },
      { key: 'ncr', label: 'ثبت و پیگیری عیب (NCR)', href: 'modules/qc/ncr.html', icon: '📛', ready: false, roles: ['admin', 'inspector', 'part_expert'] },
      { key: 'capa', label: 'CAPA', href: 'modules/qc/capa.html', icon: '♻️', ready: false, roles: ['admin'] },
      { key: 'eight-d', label: '8D', href: 'modules/qc/eight-d.html', icon: '🎯', ready: false, roles: ['admin'] },
    ],
  },
  {
    label: 'کیفیت تأمین‌کننده',
    items: [
      { key: 'supplier-portal', label: 'پورتال تأمین‌کننده', href: 'modules/supplier/portal.html', icon: '🏭', ready: false, roles: ['admin', 'part_expert'] },
      { key: 'claims', label: 'مطالبات قطعه', href: 'modules/supplier/scorecard.html', icon: '⭐', ready: false, roles: ['admin', 'part_expert'] },
    ],
  },
  {
    label: 'مدیریت سیستم',
    items: [
      { key: 'users', label: 'کاربران', href: 'modules/admin/users.html', icon: '👥', ready: false, roles: ['admin'] },
      { key: 'settings', label: 'تنظیمات', href: 'modules/admin/settings.html', icon: '⚙️', ready: false, roles: ['admin'] },
    ],
  },
];

function getInitials(name = 'U') {
  return String(name).trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function currentPagePath() {
  const parts = location.pathname.split('/').filter(Boolean);
  const file = parts.pop() || 'main.html';
  const dir = parts.pop();
  return dir ? `${dir}/${file}` : file;
}

function resolveHref(item) {
  if (item.ready) return item.href;
  const params = new URLSearchParams({ key: item.key, label: item.label });
  return `modules/_stub.html?${params.toString()}`;
}

// تابع بررسی دسترسی
function hasAccess(userRole, allowedRoles) {
  if (!allowedRoles) return true; // اگر نقشی تعریف نشده بود، همه دسترسی دارند
  return allowedRoles.includes(userRole);
}

function buildSidebar(activePath, userRole) {
  const nav = document.createElement('nav');
  nav.className = 'sidebar-nav';
  
  NAV_GROUPS.forEach(group => {
    // فیلتر کردن آیتم‌های گروه
    const allowedItems = group.items.filter(item => hasAccess(userRole, item.roles));
    
    // اگر کاربر هیچ دسترسی به آیتم‌های این گروه نداشت، کل گروه را مخفی کن
    if (allowedItems.length === 0) return;

    const g = document.createElement('div');
    g.className = 'nav-group';
    const label = document.createElement('span');
    label.className = 'nav-group-label';
    label.textContent = group.label;
    g.appendChild(label);
    
    allowedItems.forEach(item => {
      const a = document.createElement('a');
      a.className = 'nav-link';
      a.href = resolveHref(item);
      const isActive = item.ready && (item.href.endsWith(activePath) ||
        (activePath === 'main.html' && item.key === 'dashboard'));
      if (isActive) a.classList.add('active');
      a.innerHTML = `<span class="nav-link-icon">${item.icon}</span><span>${item.label}</span>`;
      g.appendChild(a);
    });
    nav.appendChild(g);
  });
  return nav;
}

export function mountShell() {
  const shell = document.getElementById('app-shell');
  if (!shell) return;

  const activePath = currentPagePath();
  
  // دریافت اطلاعات کاربر از استور
  const session = store.get('session') || { name: 'کاربر مهمان', role: 'guest' };
  
  // اگر کاربر لاگین نکرده، به صفحه اصلی برگردد
  if (session.role === 'guest') {
    window.location.href = 'index.html';
    return;
  }

  // --- Sidebar ---
  const sidebar = document.createElement('aside');
  sidebar.className = 'app-sidebar';
  sidebar.id = 'app-sidebar';
  sidebar.innerHTML = `
    <div class="sidebar-brand">
      <div class="sidebar-brand-logo">IQ</div>
      <div class="sidebar-brand-text">
        <span class="sidebar-brand-name">IQDWS</span>
        <span class="sidebar-brand-sub">Quality Ecosystem</span>
      </div>
    </div>
  `;
  // ارسال نقش کاربر به تابع ساخت سایدبار
  sidebar.appendChild(buildSidebar(activePath, session.role));
  
  const footer = document.createElement('div');
  footer.className = 'sidebar-footer';
  footer.innerHTML = `<a class="nav-link" href="#" id="btn-logout"><span class="nav-link-icon">🚪</span><span>خروج از حساب</span></a>`;
  sidebar.appendChild(footer);

  // --- Header ---
  const header = document.createElement('header');
  header.className = 'app-header';
  header.innerHTML = `
    <div class="app-header-start">
      <button class="header-icon-btn sidebar-toggle" id="sidebar-toggle" aria-label="منو">☰</button>
    </div>
    <div class="app-header-end">
      <div class="offline-badge" id="offline-badge">
        <span class="offline-badge-dot"></span>
        <span id="offline-badge-text">آنلاین</span>
      </div>
      <div class="user-menu">
        <div class="user-avatar">${getInitials(session.name)}</div>
        <div class="user-meta">
          <span class="user-name">${session.name}</span>
          <span class="user-role">${session.role === 'admin' ? 'مدیر سیستم' : session.role === 'inspector' ? 'بازرس خط' : 'کارشناس قطعه'}</span>
        </div>
      </div>
    </div>
  `;

  shell.prepend(header);
  shell.prepend(sidebar);

  // --- Behavior ---
  const toggle = header.querySelector('#sidebar-toggle');
  toggle?.addEventListener('click', () => sidebar.classList.toggle('is-open'));

  // دکمه خروج
  document.getElementById('btn-logout').addEventListener('click', async (e) => {
    e.preventDefault();
    await store.clearSession();
    window.location.href = 'index.html';
  });

  // نشانگر آفلاین
  const badge = header.querySelector('#offline-badge');
  const badgeText = header.querySelector('#offline-badge-text');
  const updateOnline = ({ online }) => {
    badge.classList.toggle('is-offline', !online);
    badgeText.textContent = online ? 'آنلاین' : 'آفلاین';
  };
  updateOnline({ online: offline.isOnline() });
  offline.onChange(updateOnline);
}