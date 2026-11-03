/**
 * Shell — تزریق هدر و سایدبار مشترک در همه صفحه‌ها
 * - اگر المان #app-shell در صفحه باشد، هدر و سایدبار تزریق می‌شوند.
 * - منو بر اساس سند راهبردی تعریف شده است.
 */
import { offline } from './offline.js';
import { store } from './store.js';

const NAV_GROUPS = [
  {
    label: 'عمومی',
    items: [
      { key: 'dashboard', label: 'داشبورد', href: 'main.html', icon: '🏠' },
    ],
  },
  {
    label: 'تضمین کیفیت (QA)',
    items: [
      { key: 'fmea',        label: 'FMEA',        href: 'modules/qa/fmea.html',         icon: '⚠️' },
      { key: 'control-plan',label: 'کنترل‌پلن',    href: 'modules/qa/control-plan.html', icon: '📋' },
      { key: 'documents',   label: 'مستندات',     href: 'modules/qa/documents.html',    icon: '📁' },
      { key: 'audit',       label: 'ممیزی',       href: 'modules/qa/audit.html',        icon: '🔎' },
      { key: 'calibration', label: 'کالیبراسیون', href: 'modules/qa/calibration.html',  icon: '⚖️' },
      { key: 'training',    label: 'آموزش',       href: 'modules/qa/training.html',     icon: '🎓' },
    ],
  },
  {
    label: 'کنترل کیفیت (QC)',
    items: [
      { key: 'inspection', label: 'بازرسی',   href: 'modules/qc/inspection.html', icon: '🔍' },
      { key: 'ncr',        label: 'NCR',       href: 'modules/qc/ncr.html',        icon: '📛' },
      { key: 'capa',       label: 'CAPA',      href: 'modules/qc/capa.html',       icon: '♻️' },
      { key: 'eight-d',    label: '8D',        href: 'modules/qc/eight-d.html',    icon: '🎯' },
      { key: 'spc',        label: 'SPC',       href: 'modules/qc/spc.html',        icon: '📈' },
      { key: 'msa',        label: 'MSA',       href: 'modules/qc/msa.html',        icon: '📐' },
      { key: 'quarantine', label: 'قرنطینه',   href: 'modules/qc/quarantine.html', icon: '🚧' },
    ],
  },
  {
    label: 'کیفیت تأمین‌کننده',
    items: [
      { key: 'supplier-portal',    label: 'پورتال تأمین‌کننده', href: 'modules/supplier/portal.html',      icon: '🏭' },
      { key: 'supplier-scorecard', label: 'کارت امتیاز',       href: 'modules/supplier/scorecard.html',   icon: '⭐' },
      { key: 'ppap',               label: 'PPAP',              href: 'modules/supplier/ppap.html',        icon: '📦' },
      { key: 'supplier-8d',        label: 'پاسخ 8D',           href: 'modules/supplier/response-8d.html', icon: '↩️' },
    ],
  },
  {
    label: 'مشتری و گارانتی',
    items: [
      { key: 'complaints', label: 'شکایات',  href: 'modules/customer/complaints.html', icon: '🗣️' },
      { key: 'warranty',   label: 'گارانتی', href: 'modules/customer/warranty.html',   icon: '🛡️' },
    ],
  },
  {
    label: 'تحلیل و KPI',
    items: [
      { key: 'analytics', label: 'داشبورد تحلیلی', href: 'modules/analytics/dashboard.html', icon: '📊' },
      { key: 'kpi',       label: 'شاخص‌ها',        href: 'modules/analytics/kpi.html',       icon: '🎯' },
      { key: 'trends',    label: 'روندها',         href: 'modules/analytics/trends.html',    icon: '📉' },
    ],
  },
  {
    label: 'مدیریت سیستم',
    items: [
      { key: 'users',       label: 'کاربران',     href: 'modules/admin/users.html',       icon: '👥' },
      { key: 'roles',       label: 'نقش‌ها',       href: 'modules/admin/roles.html',       icon: '🔐' },
      { key: 'master-data', label: 'داده پایه',   href: 'modules/admin/master-data.html', icon: '🗂️' },
      { key: 'audit-log',   label: 'لاگ سیستم',   href: 'modules/admin/audit-log.html',   icon: '📜' },
      { key: 'settings',    label: 'تنظیمات',     href: 'modules/admin/settings.html',    icon: '⚙️' },
    ],
  },
  {
    label: 'آفلاین',
    items: [
      { key: 'sync-queue',  label: 'صف ارسال',    href: 'offline/sync-queue.html',  icon: '📤' },
      { key: 'sync-status', label: 'وضعیت سینک',  href: 'offline/sync-status.html', icon: '🔄' },
    ],
  },
];

function getInitials(name = 'U') {
  return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function currentPagePath() {
  const parts = location.pathname.split('/').filter(Boolean);
  const file = parts.pop() || 'main.html';
  const dir = parts.pop();
  return dir ? `modules/${dir}/${file}` : file;
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
      a.href = item.href;
      if (item.href.endsWith(activePath) || (activePath === 'main.html' && item.key === 'dashboard')) {
        a.classList.add('active');
      }
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
  sidebar.appendChild(buildSidebar(activePath));
  const footer = document.createElement('div');
  footer.className = 'sidebar-footer';
  footer.innerHTML = `<a class="nav-link" href="index.html"><span class="nav-link-icon">🚪</span><span>خروج</span></a>`;
  sidebar.appendChild(footer);

  // --- Header ---
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

  // ترتیب: سایدبار اول در DOM، هدر بعد، main داخل شل
  shell.prepend(header);
  shell.prepend(sidebar);

  // --- Behavior ---
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