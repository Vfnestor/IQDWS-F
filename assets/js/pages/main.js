/**
 * main.js — راه‌اندازی داشبورد اکوسیستم کیفیت
 * - پوسته را سوار می‌کند
 * - KPIها، نمودارها، لیست QAN/NCR و دسترسی سریع را رندر می‌کند
 * - در حالت آفلاین از کش/داده mock استفاده می‌کند
 */
import { store } from '../store.js';
import { mountShell } from '../shell.js';
import { offline } from '../offline.js';
import { api } from '../api.js';
import { toast, formatDateTime, formatNumber, badge } from '../ui.js';
import { lineChart, donutChart, PALETTE } from '../charts.js';

/* --- KPI --- */
function renderKPIs(container, kpis) {
  container.innerHTML = '';
  if (!kpis || kpis.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state-title">KPIای تعریف نشده است</div></div>`;
    return;
  }
  kpis.forEach(k => {
    const card = document.createElement('div');
    card.className = `kpi-card${k.variant ? ' kpi-' + k.variant : ''}`;
    const trendIcon = k.trend === 'up' ? '▲' : k.trend === 'down' ? '▼' : '■';
    const trendDir = k.trend === 'flat' ? 'flat' : (k.variant === 'danger' ? 'down' : k.trend === 'up' ? 'up' : 'down');
    card.innerHTML = `
      <span class="kpi-label">${k.label}</span>
      <div class="kpi-value dashboard-kpi-value">
        ${formatNumber(k.value)}
        ${k.unit ? `<span class="dashboard-kpi-unit">${k.unit}</span>` : ''}
      </div>
      <span class="kpi-trend ${trendDir}">
        ${trendIcon} ${k.trendValue}
      </span>
    `;
    container.appendChild(card);
  });
}

/* --- QAN list --- */
function renderQANList(container, qans) {
  container.innerHTML = '';
  const active = (qans || []).filter(q => q.status === 'active').slice(0, 5);
  if (active.length === 0) {
    container.innerHTML = `<div class="empty-state" style="padding: var(--space-8) var(--space-4);">
      <div class="empty-state-title">هشدار فعالی نیست</div>
      <div class="empty-state-desc">همه هشدارهای کیفیت در وضعیت عادی هستند.</div>
    </div>`;
    return;
  }
  const list = document.createElement('div');
  list.className = 'compact-list';
  active.forEach(q => {
    const item = document.createElement('div');
    item.className = 'compact-list-item';
    const iconClass = q.level === 'critical' ? 'is-critical'
                    : q.level === 'warning'  ? 'is-warning'
                    : 'is-info';
    item.innerHTML = `
      <div class="compact-list-item-icon ${iconClass}">${q.level === 'critical' ? '🚨' : q.level === 'warning' ? '⚠️' : 'ℹ️'}</div>
      <div class="compact-list-item-body">
        <p class="compact-list-item-title">${q.title}</p>
        <div class="compact-list-item-meta">
          <span>${formatDateTime(q.createdAt)}</span>
          ${q.penalty ? `<span>جریمه: ${formatNumber(q.penalty)} ریال</span>` : ''}
        </div>
      </div>
    `;
    list.appendChild(item);
  });
  container.appendChild(list);
}

/* --- NCR list --- */
function renderNCRList(container, defects) {
  container.innerHTML = '';
  const recent = (defects || []).slice(0, 5);
  if (recent.length === 0) {
    container.innerHTML = `<div class="empty-state" style="padding: var(--space-8) var(--space-4);">
      <div class="empty-state-title">NCR ثبت نشده است</div>
    </div>`;
    return;
  }
  const list = document.createElement('div');
  list.className = 'compact-list';
  recent.forEach(d => {
    const item = document.createElement('div');
    item.className = 'compact-list-item';
    const sevClass = d.severity === 'critical' || d.severity === 'high' ? 'is-critical'
                   : d.severity === 'medium' ? 'is-warning'
                   : 'is-success';
    const sevLabel = { critical: 'بحرانی', high: 'بالا', medium: 'متوسط', low: 'پایین' }[d.severity] || d.severity;
    const statusLabel = { open: 'باز', in_progress: 'در حال بررسی', closed: 'بسته' }[d.status] || d.status;
    item.innerHTML = `
      <div class="compact-list-item-icon ${sevClass}">📛</div>
      <div class="compact-list-item-body">
        <p class="compact-list-item-title">${d.code} — ${d.description || 'بدون توضیح'}</p>
        <div class="compact-list-item-meta">
          <span>${d.station || '—'}</span>
          <span>VIN: ${d.vin || '—'}</span>
          <span>${sevLabel}</span>
          <span>${statusLabel}</span>
        </div>
      </div>
    `;
    list.appendChild(item);
  });
  container.appendChild(list);
}

/* --- Quick access --- */
const QUICK_ACCESS = [
  { label: 'ثبت NCR',          desc: 'گزارش عیب جدید',        href: 'modules/_stub.html?key=ncr&label=NCR',                   icon: '📛' },
  { label: 'بازرسی',           desc: 'ورودی / حین / نهایی',    href: 'modules/_stub.html?key=inspection&label=بازرسی',        icon: '🔍' },
  { label: 'CAPA',             desc: 'اقدام اصلاحی',           href: 'modules/_stub.html?key=capa&label=CAPA',                icon: '♻️' },
  { label: 'پورتال تأمین‌کننده', desc: 'کیفیت تأمین‌کنندگان',    href: 'supplier.html',                                          icon: '🏭' },
  { label: 'شکایات مشتری',      desc: 'ثبت و پیگیری',           href: 'modules/_stub.html?key=complaints&label=شکایات',        icon: '🗣️' },
  { label: 'KPI',              desc: 'شاخص‌های عملکرد',         href: 'modules/_stub.html?key=kpi&label=KPI',                  icon: '🎯' },
];

function renderQuickAccess(container) {
  container.innerHTML = '';
  QUICK_ACCESS.forEach(q => {
    const a = document.createElement('a');
    a.className = 'quick-access-item';
    a.href = q.href;
    a.innerHTML = `
      <div class="quick-access-icon">${q.icon}</div>
      <div class="quick-access-text">
        <span class="quick-access-label">${q.label}</span>
        <span class="quick-access-desc">${q.desc}</span>
      </div>
    `;
    container.appendChild(a);
  });
}

/* --- Skeletons --- */
function showSkeletons() {
  document.getElementById('kpi-grid').innerHTML =
    Array(5).fill('<div class="skeleton skeleton-kpi"></div>').join('');
  document.getElementById('chart-trend').innerHTML =
    '<div class="skeleton skeleton-chart"></div>';
  document.getElementById('chart-severity').innerHTML =
    '<div class="skeleton skeleton-chart"></div>';
  document.getElementById('qan-list').innerHTML =
    Array(3).fill('<div class="skeleton skeleton-line" style="height:40px;"></div>').join('');
  document.getElementById('ncr-list').innerHTML =
    Array(3).fill('<div class="skeleton skeleton-line" style="height:40px;"></div>').join('');
}

/* --- Load & render --- */
async function loadDashboard() {
  showSkeletons();
  try {
    const [dashRes, qanRes, defectRes] = await Promise.all([
      api.getDashboard(),
      api.listQANs(),
      api.listDefects(),
    ]);

    const dash = dashRes?.data || {};
    renderKPIs(document.getElementById('kpi-grid'), dash.kpis || []);
    lineChart(document.getElementById('chart-trend'), {
      data: dash.trend7d?.data || [],
      labels: dash.trend7d?.labels || [],
      color: PALETTE.brand,
    });
    donutChart(document.getElementById('chart-severity'), {
      segments: dash.severity || [],
    });

    renderQANList(document.getElementById('qan-list'), qanRes?.data || []);
    renderNCRList(document.getElementById('ncr-list'), defectRes?.data || []);

    if (dashRes?._offline) toast('نمایش داده‌های ذخیره‌شده (آفلاین)', '', 2500);
  } catch (err) {
    console.error(err);
    toast('خطا در بارگذاری داشبورد', 'error');
  }
}

async function init() {
  const session = await store.getSession();
  if (session) store.set('session', session);
  mountShell();

  renderQuickAccess(document.getElementById('quick-access'));
  await loadDashboard();

  offline.onChange(({ online }) => {
    if (!online) toast('اتصال قطع شد — حالت آفلاین فعال است', 'warning', 4000);
  });

  document.getElementById('refresh-dashboard')?.addEventListener('click', loadDashboard);
}

init();