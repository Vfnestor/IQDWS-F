import { store } from '../store.js';
import { mountShell } from '../shell.js';
import { openModal, toast } from '../ui.js';

let MOCK_OPERATORS = [
  { id: '1', name: 'علی رضایی', code: 'OP-101', group: 'مونتاژ ۱ - گروه ۲', score: 85, date: '1403/08/01' },
  { id: '2', name: 'حسن محمدی', code: 'OP-102', group: 'مونتاژ ۱ - گروه ۲', score: 92, date: '1403/08/01' },
  { id: '3', name: 'سعید کریمی', code: 'OP-103', group: 'مونتاژ ۱ - گروه ۲', score: 78, date: '1403/08/01' },
];

// 📌 آیتم‌های چک‌لیست خودکنترلی (هر کدام نمره مشخصی دارد که مجموع آن‌ها 100 می‌شود)
const CHECKLIST_ITEMS = [
  { id: 'c1', label: 'رعایت لباس فرم و وسایل حفاظت فردی (PPE)', weight: 10 },
  { id: 'c2', label: 'سلامت ابزارآلات و تجهیزات ایستگاه', weight: 15 },
  { id: 'c3', label: 'پاکیزگی قطعات ورودی (بدون خط و خش یا زدگی)', weight: 20 },
  { id: 'c4', label: 'صحت انجام عملیات مونتاژ طبق دستورالعمل', weight: 25 },
  { id: 'c5', label: 'ثبت دقیق اطلاعات در شناسنامه محصول', weight: 15 },
  { id: 'c6', label: 'عدم وجود قطعات معیوب در سبد خروجی', weight: 15 },
];

async function init() {
  const session = await store.getSession();
  if (session) store.set('session', session);
  mountShell();

  const pageTitle = document.querySelector('.page-title');
  const pageSubtitle = document.querySelector('.page-subtitle');
  const btnCreate = document.getElementById('btn-create-inspection');

  if (session.role === 'inspector' || session.role === 'admin') {
    pageTitle.textContent = 'فرم گزارش خودکنترلی اپراتوران';
    pageSubtitle.textContent = 'ثبت نمرات کیفی روزانه خطوط مونتاژ و تکمیل‌کاری';
    btnCreate.style.display = 'inline-flex';
    btnCreate.onclick = openCreateModal;
  } else if (session.role === 'supervisor') {
    pageTitle.textContent = 'گزارش عملکرد مسئول بخش';
    pageSubtitle.textContent = 'مشاهده میانگین نمرات و لیست پرسنل گروه';
    btnCreate.style.display = 'none';
  } else {
    pageTitle.textContent = 'داشبورد نظارتی خودکنترلی';
    pageSubtitle.textContent = 'مشاهده وضعیت کلی خطوط';
    btnCreate.style.display = 'none';
  }

  renderDashboard(session.role);
}

function renderDashboard(role) {
  const container = document.getElementById('inspection-table-container');
  const summaryContainer = document.getElementById('summary-container');
  
  const total = MOCK_OPERATORS.length;
  const sum = MOCK_OPERATORS.reduce((a, b) => a + b.score, 0);
  const avg = total > 0 ? Math.round(sum / total) : 0;

  if (role === 'supervisor') {
    summaryContainer.innerHTML = `
      <div class="card">
        <div class="card-header"><h3 class="card-title">خلاصه عملکرد گروه شما (مونتاژ ۱ - گروه ۲)</h3></div>
        <div class="card-body">
           <div class="flex justify-between items-center mb-4">
              <span class="text-muted">میانگین نمره خودکنترلی گروه:</span>
              <span class="score-badge" style="font-size: 2rem; color: var(--brand-600);">${avg}</span>
           </div>
           <div class="flex justify-between items-center">
              <span class="text-muted">تعداد پرسنل تحت نظارت:</span>
              <span class="text-bold">${total} نفر</span>
           </div>
        </div>
      </div>
    `;
  } else {
    summaryContainer.innerHTML = '';
  }

  let html = `
    <div class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>نام اپراتور</th>
            <th>کد پرسنلی</th>
            <th>گروه/بخش</th>
            <th>نمره خودکنترلی</th>
            <th>تاریخ ثبت</th>
            <th>وضعیت</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
  `;

  MOCK_OPERATORS.forEach(op => {
    const color = op.score >= 90 ? 'success' : op.score >= 80 ? 'warning' : 'danger';
    const statusLabel = op.score >= 90 ? 'عالی' : op.score >= 80 ? 'قابل قبول' : 'نیازمند آموزش';
    
    html += `
      <tr>
        <td class="text-bold">${op.name}</td>
        <td class="text-mono">${op.code}</td>
        <td>${op.group}</td>
        <td><span class="badge badge-${color}">${op.score} از ۱۰۰</span></td>
        <td class="text-sm text-muted">${op.date}</td>
        <td>${statusLabel}</td>
        <td class="table-actions">
          <button class="btn btn-sm btn-ghost" onclick="window.alert('گزارش کامل ارزیابی ${op.name}')">مشاهده جزئیات</button>
        </td>
      </tr>
    `;
  });
  html += `</tbody></table></div>`;
  container.innerHTML = html;
}

// 📌 فرم ثبت نمره (چک‌لیست)
function openCreateModal() {
  const content = document.createElement('div');
  
  // ساخت HTML چک‌لیست
  let checklistHtml = CHECKLIST_ITEMS.map(item => `
    <label class="flex items-start gap-3 p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
      <input type="checkbox" class="mt-1 checklist-item" data-weight="${item.weight}" checked>
      <div class="flex-1">
        <div class="text-sm font-medium">${item.label}</div>
        <div class="text-xs text-gray-500 mt-1">وزن نمره: ${item.weight}</div>
      </div>
    </label>
  `).join('');

  content.innerHTML = `
    <div class="form-group">
      <label class="form-label">انتخاب اپراتور <span class="required">*</span></label>
      <select class="select" id="op-select">
        <option value="">یک اپراتور انتخاب کنید...</option>
        ${MOCK_OPERATORS.map(o => `<option value="${o.id}">${o.name} (${o.code})</option>`).join('')}
      </select>
    </div>

    <div class="form-group">
      <label class="form-label">چک‌لیست خودکنترلی (موارد رعایت شده را تیک بزنید)</label>
      <div class="border border-gray-200 rounded-lg overflow-hidden bg-white">
        ${checklistHtml}
      </div>
    </div>

    <div class="flex justify-between items-center bg-brand-50 p-4 rounded-lg mt-4 border border-brand-100">
      <span class="text-brand-700 font-bold">نمره نهایی محاسبه شده:</span>
      <span id="calc-score" class="text-2xl font-bold text-brand-600">100</span>
    </div>

    <div class="form-group mt-4">
      <label class="form-label">توضیحات (اختیاری)</label>
      <input type="text" class="input" id="op-desc" placeholder="علت کسر نمره...">
    </div>
  `;

  const modal = openModal({
    title: 'ثبت نمره خودکنترلی (ارزیابی اپراتور)',
    content,
    size: 'lg',
    actions: [
      { label: 'انصراف', variant: 'secondary', onClick: ({close}) => close() },
      { label: 'ثبت نمره', variant: 'primary', onClick: ({close}) => {
          const id = document.getElementById('op-select').value;
          const finalScore = parseInt(document.getElementById('calc-score').textContent);
          
          if (!id) { toast('لطفا اپراتور را انتخاب کنید', 'error'); return; }

          const op = MOCK_OPERATORS.find(o => o.id === id);
          if (op) {
            op.score = finalScore;
            op.date = new Intl.DateTimeFormat('fa-IR').format(new Date());
          }
          
          close();
          renderDashboard('inspector');
          toast('نمره با موفقیت ثبت شد', 'success');
      }}
    ]
  });

  // 📌 لاجیک محاسبه نمره خودکار
  const checkboxes = content.querySelectorAll('.checklist-item');
  const scoreDisplay = content.querySelector('#calc-score');

  function calculateScore() {
    let total = 0;
    checkboxes.forEach(cb => {
      if (cb.checked) {
        total += parseInt(cb.dataset.weight);
      }
    });
    scoreDisplay.textContent = total;
    
    // تغییر رنگ نمره بر اساس مقدار
    if (total >= 90) scoreDisplay.className = 'text-2xl font-bold text-success-600';
    else if (total >= 80) scoreDisplay.className = 'text-2xl font-bold text-warning-600';
    else scoreDisplay.className = 'text-2xl font-bold text-danger-600';
  }

  checkboxes.forEach(cb => cb.addEventListener('change', calculateScore));
}

init();
