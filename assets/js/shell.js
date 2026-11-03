/**
 * Shell — تزریق هدر و سایدبار مشترک در همه صفحه‌ها
 * - هر آیتم منو یک فلگ ready دارد. اگر false باشد، به modules/_stub.html می‌رود.
 */
import { offline } from './offline.js';
import { store } from './store.js';

const NAV_GROUPS = [
  {
    label: 'عمومی',
    items: [
      { key: 'dashboard', label: 'داشبورد', href: 'main.html', icon: '🏠', ready: true },
    ],
  },
  {
    label: 'تضمین کیفیت (QA)',
    items: [
      { key: 'fmea',         label: 'FMEA',        href: 'modules/qa/fmea.html',         icon: '⚠️', ready: false },
      { key: 'control-plan', label: 'کنترل‌پلن',    href: 'modules/qa/control-plan.html', icon: '📋', ready: false },
      { key: 'documents',    label: 'مستندات',     href: 'modules/qa/documents.html',    icon: '📁', ready: false },
      { key: 'audit',        label: 'ممیزی',       href: 'modules/qa/audit.html',        icon: '🔎', ready: false },
      { key: 'calibration',  label: 'کالیبراسیون', href: 'modules/qa/calibration.html',  icon: '⚖️', ready: false },
      { key: 'training',     label: 'آموزش',       href: 'modules/qa/training.html',     icon: '🎓', ready: false },
    ],
  },
  {
    label: 'کنترل کیفیت (QC)',
    items: [
      { key: 'inspection', label: 'بازرسی', href: 'modules/qc/inspection.html', icon: '🔍', ready: false },
      { key: 'ncr',        label: 'NCR',     href: 'modules/qc/ncr.html',        icon: '📛', ready: false },
      { key: 'capa',       label: 'CAPA',    href: 'modules/qc/capa.html',       icon: '♻️', ready: false },
      { key: 'eight-d',    label: '8D',      href: 'modules/qc/eight-d.html',    icon: '🎯', ready: false },
      { key: 'spc',        label: 'SPC',     href: 'modules/qc/spc.html',        icon: '📈', ready: false },
      { key: 'msa',        label: 'MSA',     href: 'modules/qc/msa.html',        icon: '📐', ready: false },
      { key: 'quarantine', label: 'قرنطینه', href: 'modules/qc/quarantine.html', icon: '🚧', ready: false },
    ],
  },
  {
    label: 'کیفیت تأمین‌کننده',
    items: [
      { key: 'supplier-portal',    label: 'پورتال تأمین‌کننده', href: 'modules/supplier/portal.html',      icon: '🏭', ready: false },
      { key: 'supplier-scorecard', label: 'کارت امتیاز',        href: 'modules/supplier/scorecard.html',   icon: '⭐', ready: false },
      { key: 'ppap',               label: 'PPAP',               href: 'modules/supplier/ppap.html',        icon: '📦', ready: false },
      { key: 'supplier-8d',        label: 'پاسخ 8D',            href: 'modules/supplier/response-8d.html', icon: '↩️', ready: false },
    ],
  },
  {
    label: 'مشتری و گارانتی',
    items: [
      { key: 'complaints', label: 'شکایات',  href: 'modules/customer/complaints.html', icon: '🗣️', ready: false },
      { key: 'warranty',   label: 'گارانتی', href: 'modules/customer/warranty.html',   icon: '🛡️', ready: false },
    ],
  },
  {
    label: 'تحلیل و KPI',
    items: [
      { key: 'analytics', label: 'داشبورد تحلیلی', href: 'modules/analytics/dashboard.html', icon: '📊', ready: false },
      { key: 'kpi',       label: 'شاخص‌ها',        href: 'modules/analytics/kpi.html',       icon: '🎯', ready: false },
      { key: 'trends',    label: 'روندها',         href: 'modules/analytics/trends.html',    icon: '📉', ready: false },
    ],
  },
  {
    label: 'مدیریت سیستم',
    items: [
      { key: 'users',       label: 'کاربران',    href: 'modules/admin/users.html',       icon: '👥', ready: false },
      { key: 'roles',       label: 'نقش‌ها',      href: 'modules/admin/roles.html',       icon: '🔐', ready: false },
      { key: 'master-data', label: 'داده پایه',  href: 'modules/admin/master-data.html', icon: '🗂️', ready: false },
      { key: 'audit-log',   label: 'لاگ سیستم',  href: 'modules/admin/audit-log.html',   icon: '📜', ready: false },
      { key: 'settings',    label: 'تنظیمات',    href: 'modules/admin/settings.html',    icon: '⚙️', ready: false },
    ],
  },
  {
    label: 'آفلاین',
    items: [
      { key: 'sync-queue',  label: 'صف ارسال',   href: 'offline/sync-queue.html',  icon: '📤', ready: false },
      { key: 'sync-status', label: 'وضعیت سینک', href: 'offline/sync-status.html', icon: '🔄', ready: false },
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

function buildSidebar(activePath) {
  const nav = document.createElement('nav');
  nav.className = 'sidebar-nav';
  NAV_GROUPS.forEach(group => {
    const g = document.createElement('div');
    g.className = 'nav-group';
    const label = document.createElement('span');
    label.className = 'nav-group-label';
    label.textContent = group.label;
    g.appendChild(label);
    group.items.forEach(item => {
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
  const session = store.get('session') || { name: 'کاربر', role: 'کاربر' };

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
  sidebar.appendChild(buildSidebar(activePath));
  const footer = document.createElement('div');
  footer.className = 'sidebar-footer';
  footer.innerHTML = `<a class="nav-link" href="index.html"><span class="nav-link-icon">🚪</span><span>خروج</span></a>`;
  sidebar.appendChild(footer);

  const header = document.createElement('header');
  header.className = 'app-header';
  header.innerHTML = `
    <div class="app-header-start">
      <button class="header-icon-btn sidebar-toggle" id="sidebar-toggle" aria-label="منو">☰</button>
      <div class="header-search">
        <input type="search" placeholder="جست‌وجو در اکوسیستم..." id="global-search">
      </div>
    </div>
    <div class="app-header-end">
      <div class="offline-badge" id="offline-badge">
        <span class="offline-badge-dot"></span>
        <span id="offline-badge-text">آنلاین</span>
      </div>
      <button class="header-icon-btn" aria-label="اعلان‌ها">🔔<span class="badge-dot"></span></button>
      <div class="user-menu">
        <div class="user-avatar">${getInitials(session.name)}</div>
        <div class="user-meta">
          <span class="user-name">${session.name}</span>
          <span class="user-role">${session.role}</span>
        </div>
      </div>
    </div>
  `;

  shell.prepend(header);
  shell.prepend(sidebar);

  const toggle = header.querySelector('#sidebar-toggle');
  toggle?.addEventListener('click', () => sidebar.classList.toggle('is-open'));

  const badge = header.querySelector('#offline-badge');
  const badgeText = header.querySelector('#offline-badge-text');
  const updateOnline = ({ online }) => {
    badge.classList.toggle('is-offline', !online);
    badgeText.textContent = online ? 'آنلاین' : 'آفلاین';
  };
  updateOnline({ online: offline.isOnline() });
  offline.onChange(updateOnline);
}