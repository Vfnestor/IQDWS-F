import { store } from '../store.js';
import { mountShell } from '../shell.js';
import { offline } from '../offline.js';
import { api } from '../api.js';
import { toast, formatDateTime, formatNumber } from '../ui.js';
import { lineChart, donutChart, PALETTE } from '../charts.js';

// ... توابع رندر KPI، QAN و NCR مثل قبل (کدهای قبلی را حفظ کنید)
function renderKPIs(container, kpis) {
  // کد قبلی
  container.innerHTML = '';
  if (!kpis || kpis.length === 0) return;
  kpis.forEach(k => {
    const card = document.createElement('div');
    card.className = `kpi-card${k.variant ? ' kpi-' + k.variant : ''}`;
    card.innerHTML = `
      <span class="kpi-label">${k.label}</span>
      <div class="kpi-value dashboard-kpi-value">
        ${formatNumber(k.value)} ${k.unit ? `<span class="dashboard-kpi-unit">${k.unit}</span>` : ''}
      </div>
    `;
    container.appendChild(card);
  });
}
function renderQANList(container, qans) { /* کد قبلی */ }
function renderNCRList(container, defects) { /* کد قبلی */ }

const QUICK_ACCESS = [
  { label: 'ثبت NCR', desc: 'گزارش عیب جدید', href: 'modules/_stub.html?key=ncr&label=NCR', icon: '📛', roles: ['admin', 'inspector', 'part_expert'] },
  { label: 'بازرسی', desc: 'ورودی / حین / نهایی', href: 'modules/_stub.html?key=inspection&label=بازرسی', icon: '🔍', roles: ['admin', 'inspector'] },
  { label: 'CAPA', desc: 'اقدام اصلاحی', href: 'modules/_stub.html?key=capa&label=CAPA', icon: '♻️', roles: ['admin'] },
  { label: 'پورتال تأمین‌کننده', desc: 'کیفیت تأمین‌کنندگان', href: 'supplier.html', icon: '🏭', roles: ['admin', 'part_expert'] },
  { label: 'KPI', desc: 'شاخص‌های عملکرد', href: 'modules/_stub.html?key=kpi&label=KPI', icon: '🎯', roles: ['admin'] },
];

function renderQuickAccess(container, role) {
  container.innerHTML = '';
  QUICK_ACCESS.filter(q => q.roles.includes(role)).forEach(q => {
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

async function loadDashboard() {
  // نمایش لودینگ ...
  const [dashRes, qanRes, defectRes] = await Promise.all([
    api.getDashboard(), api.listQANs(), api.listDefects()
  ]);

  const dash = dashRes?.data || {};
  renderKPIs(document.getElementById('kpi-grid'), dash.kpis || []);
  lineChart(document.getElementById('chart-trend'), { data: dash.trend7d?.data || [], labels: dash.trend7d?.labels || [], color: PALETTE.brand });
  donutChart(document.getElementById('chart-severity'), { segments: dash.severity || [] });
  renderQANList(document.getElementById('qan-list'), qanRes?.data || []);
  renderNCRList(document.getElementById('ncr-list'), defectRes?.data || []);
}

async function init() {
  const session = await store.getSession();
  if (session) store.set('session', session);
  
  mountShell(); // سایدبار را بر اساس نقش می‌سازد

  // تغییر عنوان و دسترسی‌های سریع بر اساس نقش
  const pageTitle = document.querySelector('.page-title');
  const pageSubtitle = document.querySelector('.page-subtitle');
  
  if (session.role === 'inspector') {
    pageTitle.textContent = 'پنل بازرس خط';
    pageSubtitle.textContent = 'ثبت و پیگیری عیوب خط تولید';
    // بازرس فقط NCR و لیست عیوب را ببیند (میتوانید نمودارها را مخفی کنید)
    document.getElementById('chart-trend').parentElement.parentElement.style.display = 'none';
  } else if (session.role === 'part_expert') {
    pageTitle.textContent = 'پنل کارشناس قطعه';
    pageSubtitle.textContent = 'پیگیری کیفیت قطعات و تأمین‌کنندگان';
    document.getElementById('chart-severity').parentElement.parentElement.style.display = 'none';
  }

  renderQuickAccess(document.getElementById('quick-access'), session.role);
  await loadDashboard();

  document.getElementById('refresh-dashboard')?.addEventListener('click', loadDashboard);
}

init();