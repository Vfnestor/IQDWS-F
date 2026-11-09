import { store } from '../store.js';
import { mountShell } from '../shell.js';
import { openModal, toast } from '../ui.js';

let MOCK_DEFECTS = [
  { id: 'D-1001', code: 'DF-101', desc: 'نقص رنگ درب سمت راست', station: 'مونتاژ ۴ - خط درب', status: 'open', rootCause: '' },
];

const STATUS_MAP = {
  'open': { label: 'ثبت شده (نیازمند بررسی)', color: 'danger' },
  'in_review': { label: 'در حال بررسی', color: 'warning' },
  'action_pending': { label: 'در انتظار تایید', color: 'info' },
  'closed': { label: 'بسته شده', color: 'success' }
};

async function init() {
  const session = await store.getSession();
  if (session) store.set('session', session);
  mountShell();

  if (['inspector', 'admin'].includes(session.role)) {
    document.getElementById('btn-create-ncr').style.display = 'inline-flex';
    document.getElementById('btn-create-ncr').onclick = () => openCreateModal(session);
  }

  renderNCRTable(session.role);
}

function renderNCRTable(role) {
  const container = document.getElementById('ncr-table-container');
  if (MOCK_DEFECTS.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state-title">هیچ ایرادی ثبت نشده است</div></div>`;
    return;
  }

  let html = `
    <div class="table-wrapper">
      <table class="table">
        <thead><tr><th>کد ایراد</th><th>شرح مشکل</th><th>ایستگاه</th><th>وضعیت</th><th>عملیات</th></tr></thead>
        <tbody>
  `;

  MOCK_DEFECTS.forEach(row => {
    const st = STATUS_MAP[row.status];
    html += `
      <tr>
        <td class="text-bold">${row.code}</td>
        <td>${row.desc}</td>
        <td>${row.station}</td>
        <td><span class="badge badge-${st.color}">${st.label}</span></td>
        <td class="table-actions">
          <button class="btn btn-sm btn-secondary" onclick="handleActionClick('${row.id}')">مشاهده</button>
        </td>
      </tr>
    `;
  });
  html += `</tbody></table></div>`;
  container.innerHTML = html;

  window.handleActionClick = (id) => {
    const defect = MOCK_DEFECTS.find(d => d.id === id);
    openWorkflowModal(defect, role);
  };
}

// 📌 فرم ثبت ایراد جدید (با تمام فیلدهای درخواستی)
function openCreateModal(session) {
  const content = document.createElement('div');
  content.innerHTML = `
    <div class="flex flex-col gap-4">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">شماره VIN <span class="required">*</span></label>
          <input type="text" class="input" id="new-vin" placeholder="IR-ABC-1234">
        </div>
        <div class="form-group">
          <label class="form-label">شماره فنی قطعه <span class="required">*</span></label>
          <input type="text" class="input" id="new-part" placeholder="Part Number">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">شدت ایراد</label>
          <select class="select" id="new-severity">
            <option value="A">A (بحرانی)</option>
            <option value="B">B (بالا)</option>
            <option value="C">C (متوسط)</option>
            <option value="S">S (ایمنی)</option>
            <option value="P">P (فرایند)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">شیفت</label>
          <select class="select" id="new-shift">
            <option value="A">صبح (A)</option>
            <option value="B">عصر (B)</option>
            <option value="C">شب (C)</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">ایستگاه کاری</label>
          <select class="select" id="new-station-select">
            <option value="">انتخاب کنید...</option>
            <option value="PDI">PDI</option>
            <option value="مونتاژ ۱">مونتاژ ۱</option>
            <option value="مونتاژ ۲">مونتاژ ۲</option>
            <option value="مونتاژ ۳">مونتاژ ۳</option>
            <option value="مونتاژ ۴">مونتاژ ۴</option>
            <option value="تکمیل‌کاری ۱">تکمیل‌کاری ۱</option>
            <option value="تکمیل‌کاری ۲">تکمیل‌کاری ۲</option>
            <option value="بدنه‌سازی">بدنه‌سازی</option>
            <option value="سالن رنگ">سالن رنگ</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">جزئیات ایستگاه</label>
          <input type="text" class="input" id="new-station-detail" placeholder="مثلا: خط درب - ایستگاه ۴">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">شرح ایراد <span class="required">*</span></label>
        <input type="text" class="input" id="new-desc" placeholder="شرح دقیق مشکل...">
      </div>

      <div class="form-group bg-gray-50 p-3 rounded border border-gray-200">
        <label class="form-label">5M اولیه (علت‌یابی اولیه)</label>
        <span class="form-hint mb-2">توضیح دهید ایراد مربوط به کدام یک از عوامل (نیروی انسانی، ماشین، مواد، روش، اندازه‌گیری) است.</span>
        <textarea class="textarea" id="new-5m" rows="4" placeholder="توضیحات کامل..."></textarea>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">تاریخ مشاهده (شمسی)</label>
          <input type="text" class="input" id="new-date" placeholder="1403/01/01" dir="ltr" style="text-align:right;">
        </div>
        <div class="form-group">
          <label class="form-label">ساعت مشاهده</label>
          <div class="analog-clock-container">
            <div class="analog-clock" id="clock-ui">
              <div class="clock-center"></div>
              <div class="clock-hand clock-hour" id="hour-hand" style="transform: translateX(-50%) rotate(0deg);"></div>
              <div class="clock-hand clock-minute" id="minute-hand" style="transform: translateX(-50%) rotate(0deg);"></div>
            </div>
            <div class="flex flex-col">
              <input type="time" id="new-time" class="clock-time-input" value="12:00" onchange="updateClock(this.value)">
              <span class="text-xs text-muted mt-1">تنظیم زمان</span>
            </div>
          </div>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">مشاهده‌کننده ایراد</label>
          <input type="text" class="input" id="new-observer" placeholder="نام یا کد پرسنلی">
        </div>
        <div class="form-group">
          <label class="form-label">ثبت‌کننده ایراد</label>
          <div class="registrar-field" id="registrar-btn">
            <span>🔒 ثبت توسط سیستم</span>
            <span class="registrar-name">${session.name}</span>
          </div>
        </div>
      </div>
    </div>
  `;

  // ساخت کارت پرسنلی
  const popover = document.createElement('div');
  popover.className = 'personnel-card-popover';
  popover.innerHTML = `
    <div class="personnel-card-header">
      <div class="personnel-avatar">👤</div>
      <div class="personnel-info">
        <h4>${session.name}</h4>
        <p>بازرس خط تولید</p>
      </div>
    </div>
    <div class="personnel-body">
      <div class="flex justify-between"><span>کد پرسنلی:</span> <strong>INS-9821</strong></div>
      <div class="flex justify-between"><span>بخش:</span> <strong>مونتاژ اصلی</strong></div>
      <div class="flex justify-between"><span>وضعیت:</span> <strong class="text-success">فعال</strong></div>
    </div>
  `;
  content.appendChild(popover);

  const modal = openModal({
    title: 'ثبت ایراد جدید (بازرس خط)',
    content: content,
    size: 'lg', // سایز بزرگ
    actions: [
      { label: 'انصراف', variant: 'secondary', onClick: ({close}) => close() },
      { label: 'ثبت نهایی', variant: 'primary', onClick: ({close}) => {
          const desc = document.getElementById('new-desc').value;
          const station = document.getElementById('new-station-select').value;
          const detail = document.getElementById('new-station-detail').value;
          if(!desc || !station) { toast('فیلدهای ستاره‌دار الزامی هستند', 'error'); return; }
          
          MOCK_DEFECTS.unshift({
            id: Date.now().toString(), 
            code: 'DF-' + Math.floor(Math.random()*1000),
            desc: desc, 
            station: detail ? `${station} - ${detail}` : station, 
            status: 'open', rootCause: ''
          });
          close(); renderNCRTable('inspector'); toast('ایراد با موفقیت ثبت شد', 'success');
      }}
    ]
  });

  // لاجیک کارت پرسنلی (Popover)
  const regBtn = document.getElementById('registrar-btn');
  regBtn.addEventListener('mouseenter', (e) => {
    const rect = regBtn.getBoundingClientRect();
    popover.style.top = `${rect.bottom + window.scrollY + 5}px`;
    popover.style.left = `${rect.left + window.scrollX}px`;
    popover.classList.add('is-visible');
  });
  regBtn.addEventListener('mouseleave', () => {
    popover.classList.remove('is-visible');
  });

  // لاجیک ساعت آنالوگ
  window.updateClock = (timeStr) => {
    if(!timeStr) return;
    const [h, m] = timeStr.split(':');
    const hourDeg = (parseInt(h) % 12) * 30 + (parseInt(m) / 60) * 30;
    const minDeg = parseInt(m) * 6;
    document.getElementById('hour-hand').style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;
    document.getElementById('minute-hand').style.transform = `translateX(-50%) rotate(${minDeg}deg)`;
  };
  // تنظیم اولیه ساعت
  window.updateClock('12:00');

  // در موبایل، کلیک روی فیلد کارت را نشان دهد
  regBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    popover.classList.toggle('is-visible');
  });
  document.addEventListener('click', (e) => {
    if (!regBtn.contains(e.target)) popover.classList.remove('is-visible');
  });
}

function openWorkflowModal(defect, role) {
  // (کد گردش کار فاز قبل را اینجا حفظ کنید - تغییر نمی‌کند)
  let content = `<p><strong>شرح:</strong> ${defect.desc}</p><p><strong>وضعیت:</strong> ${STATUS_MAP[defect.status].label}</p>`;
  openModal({ title: `پرونده ${defect.code}`, content, actions: [{label:'بستن', variant:'secondary', onClick:({close})=>close()}] });
}

init();