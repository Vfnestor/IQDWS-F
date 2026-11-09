import { offline } from './offline.js';
import { store } from './store.js';

// تعریف آرایه دسترسی‌ها (roles)
const ALL_ROLES = ['admin', 'inspector', 'part_expert', 'supervisor', 'chief', 'quality_manager', 'vp', 'ceo'];
const QA_MANAGERS = ['admin', 'quality_manager', 'chief'];
const OPS = ['admin', 'inspector', 'part_expert', 'supervisor', 'quality_manager'];
const EXECUTIVES = ['admin', 'vp', 'ceo'];

const NAV_GROUPS = [
  {
    label: 'عمومی',
    items: [
      { key: 'dashboard', label: 'داشبورد', href: 'main.html', icon: '🏠', ready: true, roles: ALL_ROLES },
    ],
  },
  {
    label: 'کنترل کیفیت (QC)',
    items: [
      { key: 'ncr', label: 'مدیریت ایرادات (NCR)', href: 'modules/qc/ncr.html', icon: '📛', ready: true, roles: OPS },
      { key: 'inspection', label: 'بازرسی', href: 'modules/qc/inspection.html', icon: '🔍', ready: false, roles: ['admin', 'inspector'] },
      { key: 'capa', label: 'اقدام اصلاحی', href: 'modules/qc/capa.html', icon: '♻️', ready: false, roles: QA_MANAGERS },
    ],
  },
  {
    label: 'کیفیت تأمین‌کننده',
    items: [
      { key: 'supplier-portal', label: 'پورتال تأمین‌کننده', href: 'modules/supplier/portal.html', icon: '🏭', ready: false, roles: ['admin', 'part_expert'] },
    ],
  },
  {
    label: 'مدیریت سیستم',
    items: [
      { key: 'users', label: 'کاربران', href: 'modules/admin/users.html', icon: '👥', ready: false, roles: ['admin'] },
      { key: 'kpi', label: 'شاخص‌های ارشد (KPI)', href: 'modules/analytics/kpi.html', icon: '📊', ready: false, roles: EXECUTIVES },
    ],
  },
];

function getInitials(name = 'U') { return String(name).trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase(); }
function currentPagePath() {
  const parts = location.pathname.split('/').filter(Boolean);
  const file = parts.pop() || 'main.html';
  const dir = parts.pop();
  return dir ? `${dir}/${file}` : file;
}
function resolveHref(item) {
  if (item.ready) return item.href;
  return `modules/_stub.html?key=${item.key}&label=${item.label}`;
}

function getRoleLabel(role) {
  const map = {
    'admin': 'مدیر سیستم', 'inspector': 'بازرس خط', 'part_expert': 'کارشناس قطعه',
    'supervisor': 'مسئول بخش', 'chief': 'رئیس اداره', 'quality_manager': 'مدیر کیفیت',
    'vp': 'معاونت', 'ceo': 'مدیر عامل'
  };
  return map[role] || role;
}

function buildSidebar(activePath, userRole) {
  const nav = document.createElement('nav');
  nav.className = 'sidebar-nav';
  
  NAV_GROUPS.forEach(group => {
    const allowedItems = group.items.filter(item => item.roles.includes(userRole));
    if (allowedItems.length === 0) return;

    const g = document.createElement('div');
    g.className = 'nav-group';
    g.innerHTML = `<span class="nav-group-label">${group.label}</span>`;
    
    allowedItems.forEach(item => {
      const a = document.createElement('a');
      a.className = `nav-link ${item.href.endsWith(activePath) || (activePath === 'main.html' && item.key === 'dashboard') ? 'active' : ''}`;
      a.href = resolveHref(item);
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
  const session = store.get('session') || { name: 'مهمان', role: 'guest' };
  
  if (session.role === 'guest') { window.location.href = 'index.html'; return; }

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
  sidebar.appendChild(buildSidebar(activePath, session.role));
  
  const footer = document.createElement('div');
  footer.className = 'sidebar-footer';
  footer.innerHTML = `<a class="nav-link" href="#" id="btn-logout"><span class="nav-link-icon">🚪</span><span>خروج از حساب</span></a>`;
  sidebar.appendChild(footer);

  const header = document.createElement('header');
  header.className = 'app-header';
  header.innerHTML = `
    <div class="app-header-start">
      <button class="header-icon-btn sidebar-toggle" id="sidebar-toggle">☰</button>
    </div>
    <div class="app-header-end">
      <div class="offline-badge" id="offline-badge"><span class="offline-badge-dot"></span><span id="offline-badge-text">آنلاین</span></div>
      <div class="user-menu">
        <div class="user-avatar">${getInitials(session.name)}</div>
        <div class="user-meta">
          <span class="user-name">${session.name}</span>
          <span class="user-role">${getRoleLabel(session.role)}</span>
        </div>
      </div>
    </div>
  `;

  shell.prepend(header);
  shell.prepend(sidebar);

  document.getElementById('sidebar-toggle')?.addEventListener('click', () => sidebar.classList.toggle('is-open'));
  document.getElementById('btn-logout').addEventListener('click', async (e) => {
    e.preventDefault(); await store.clearSession(); window.location.href = 'index.html';
  });

  const badge = header.querySelector('#offline-badge');
  const updateOnline = ({ online }) => {
    badge.classList.toggle('is-offline', !online);
    badge.querySelector('#offline-badge-text').textContent = online ? 'آنلاین' : 'آفلاین';
  };
  updateOnline({ online: offline.isOnline() });
  offline.onChange(updateOnline);
}