import { store } from '../store.js';
import { mountShell } from '../shell.js';
import { api } from '../api.js';
import { toast, formatNumber, emptyState } from '../ui.js';
import { lineChart, donutChart, PALETTE } from '../charts.js';

// دیتای تستی برای نوار وضعیت
const MOCK_DEFECTS = [
  { id: 'd-1', code: 'DF-101', description: 'نقص رنگ درب', severity: 'medium', status: 'open', station: 'Final' },
  { id: 'd-2', code: 'DF-102', description: 'نشتی روغن', severity: 'high', status: 'in_progress', station: 'Engine' },
];

function renderKPI(container, role) {
  container.innerHTML = '';
  let cards = [];
  if (['admin', 'quality_manager', 'ceo', 'vp', 'chief'].includes(role)) {
    cards = [
      { label: 'FTQ (کیفیت)', value: 94.2, unit: '%', variant: 'success' },
      { label: 'DPPM', value: 1240, unit: '', variant: 'warning' },
      { label: 'زمان بستن CAPA', value: 12, unit: 'روز', variant: 'danger' },
    ];
  } else if (role === 'inspector') {
    cards = [
      { label: 'ایرادات ثبت‌شده امروز', value: 4, unit: 'مورد', variant: 'warning' },
      { label: 'ایرادات در انتظار بررسی', value: 12, unit: 'مورد', variant: 'danger' },
    ];
  } else if (role === 'part_expert') {
    cards = [
      { label: 'پرونده‌های ارجاعی به من', value: 8, unit: 'مورد', variant: 'warning' },
      { label: 'در انتظار تایید مسئول', value: 3, unit: 'مورد', variant: 'success' },
    ];
  }

  cards.forEach(k => {
    const el = document.createElement('div');
    el.className = `kpi-card ${k.variant ? 'kpi-' + k.variant : ''}`;
    el.innerHTML = `<span class="kpi-label">${k.label}</span><div class="kpi-value">${formatNumber(k.value)} <span class="dashboard-kpi-unit">${k.unit}</span></div>`;
    container.appendChild(el);
  });
}

function renderQuickAccess(container, role) {
  const allLinks = [
    { label: 'ثبت ایراد جدید', desc: 'بازرس خط', href: 'modules/qc/ncr.html', icon: '📛', roles: ['inspector', 'admin'] },
    { label: 'بررسی و تحلیل', desc: 'کارشناس قطعه', href: 'modules/qc/ncr.html', icon: '🔍', roles: ['part_expert', 'admin'] },
    { label: 'تایید اقدامات', desc: 'مسئول/رئیس', href: 'modules/qc/ncr.html', icon: '✅', roles: ['supervisor', 'chief', 'admin'] },
    { label: 'بستن پرونده', desc: 'مدیر کیفیت', href: 'modules/qc/ncr.html', icon: '🔒', roles: ['quality_manager', 'admin'] },
  ];
  
  container.innerHTML = '';
  allLinks.filter(l => l.roles.includes(role)).forEach(l => {
    const a = document.createElement('a');
    a.className = 'quick-access-item';
    a.href = l.href;
    a.innerHTML = `<div class="quick-access-icon">${l.icon}</div><div class="quick-access-text"><span class="quick-access-label">${l.label}</span><span class="quick-access-desc">${l.desc}</span></div>`;
    container.appendChild(a);
  });
}

async function init() {
  const session = await store.getSession();
  if (session) store.set('session', session);
  mountShell();

  // ۱. تنظیم عنوان
  const titles = {
    'admin': 'پنل مدیریت کل اکوسیستم', 'ceo': 'داشبورد مدیرعامل', 'vp': 'داشبورد معاونت',
    'quality_manager': 'داشبورد مدیر کیفیت', 'chief': 'داشبورد رئیس اداره', 'supervisor': 'داشبورد مسئول بخش',
    'inspector': 'پنل بازرس خط تولید', 'part_expert': 'پنل کارشناس قطعه'
  };
  document.querySelector('.page-title').textContent = titles[session.role] || 'داشبورد';
  document.querySelector('.page-subtitle').textContent = `خوش آمدید ${session.name}`;

  // ۲. رندر کردن اجزا
  renderKPI(document.getElementById('kpi-grid'), session.role);
  renderQuickAccess(document.getElementById('quick-access'), session.role);

  // ۳. نمایش/مخفی کردن نمودارها بر اساس نقش
  const chartTrend = document.getElementById('chart-trend').parentElement.parentElement;
  const chartSev = document.getElementById('chart-severity').parentElement.parentElement;
  
  if (['inspector', 'part_expert', 'supervisor'].includes(session.role)) {
    chartTrend.style.display = 'none'; // کارشناسان نیازی به نمودار کلان ندارند
    chartSev.style.display = 'none';
    // به جای نمودار، یک لیست نشان میدهیم
    document.getElementById('qan-list').parentElement.parentElement.style.display = 'none'; 
  } else {
    lineChart(document.getElementById('chart-trend'), { labels: ['شنبه','یکشنبه','دوشنبه'], data: [12,15,8], color: PALETTE.brand });
    donutChart(document.getElementById('chart-severity'), { segments: [{label:'بحرانی',value:4,color:'#ef4444'},{label:'متوسط',value:10,color:'#f59e0b'}] });
  }
}
init();