import { store } from '../store.js';
import { mountShell } from '../shell.js';
import { openModal, toast, badge } from '../ui.js';

// دیتای تستی (داده‌های اولیه)
let MOCK_DEFECTS = [
  { id: 'D-1001', code: 'DF-101', desc: 'نقص رنگ درب سمت راست', station: 'Final Assembly', status: 'open', rootCause: '' },
  { id: 'D-1002', code: 'DF-102', desc: 'نشتی جزئی روغن موتور', station: 'Engine Line', status: 'closed', rootCause: 'شل بودن واشر' },
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

  // نمایش دکمه ثبت فقط برای بازرس
  if (['inspector', 'admin'].includes(session.role)) {
    document.getElementById('btn-create-ncr').style.display = 'inline-flex';
    document.getElementById('btn-create-ncr').onclick = openCreateModal;
  }

  renderNCRTable(session.role);
}

function renderNCRTable(role) {
  const container = document.getElementById('ncr-table-container');
  
  if (MOCK_DEFECTS.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state-title">هیچ ایرادی ثبت نشده است</div></div>`;
    return;
  }

  // ساخت جدول به صورت دستی برای کنترل بیشتر
  let html = `
    <div class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>کد ایراد</th>
            <th>شرح مشکل</th>
            <th>ایستگاه</th>
            <th>وضعیت</th>
            <th>عملیات</th>
          </tr>
        </thead>
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
          <button class="btn btn-sm btn-secondary" onclick="handleActionClick('${row.id}')">مشاهده و اقدام</button>
        </td>
      </tr>
    `;
  });

  html += `</tbody></table></div>`;
  container.innerHTML = html;

  // اتصال رویداد کلیک به دکمه‌ها
  window.handleActionClick = (id) => {
    const defect = MOCK_DEFECTS.find(d => d.id === id);
    openWorkflowModal(defect, role);
  };
}

// 📌 فرم ثبت ایراد جدید
function openCreateModal() {
  const content = `
    <div class="form-group"><label class="form-label">شرح ایراد</label><input type="text" class="input" id="new-desc" placeholder="مثلا: خط و خش روی درب"></div>
    <div class="form-group"><label class="form-label">ایستگاه</label><input type="text" class="input" id="new-station" placeholder="مثلا: Final Assembly"></div>
  `;
  openModal({
    title: 'ثبت ایراد جدید',
    content,
    actions: [
      { label: 'انصراف', variant: 'secondary', onClick: ({close}) => close() },
      { label: 'ثبت', variant: 'primary', onClick: ({close}) => {
          const desc = document.getElementById('new-desc').value;
          const station = document.getElementById('new-station').value;
          if(!desc || !station) { toast('لطفا همه فیلدها را پر کنید', 'error'); return; }
          
          MOCK_DEFECTS.unshift({
            id: Date.now().toString(), 
            code: 'DF-' + Math.floor(Math.random()*1000),
            desc, station, status: 'open', rootCause: ''
          });
          close(); 
          renderNCRTable('inspector'); 
          toast('ایراد با موفقیت ثبت شد', 'success');
        }
      }
    ]
  });
}

// 📌 گردش کار اقدام بر اساس نقش (Workflow)
function openWorkflowModal(defect, role) {
  let content = `
    <div class="mb-4">
      <p><strong>کد ایراد:</strong> ${defect.code}</p>
      <p><strong>شرح:</strong> ${defect.desc}</p>
      <p><strong>ایستگاه:</strong> ${defect.station}</p>
      <p><strong>وضعیت فعلی:</strong> <span class="badge badge-${STATUS_MAP[defect.status].color}">${STATUS_MAP[defect.status].label}</span></p>
    </div>
    <hr>
  `;
  let actions = [{ label: 'بستن پنجره', variant: 'secondary', onClick: ({close}) => close() }];

  // ۱. کارشناس قطعه: بررسی و ثبت علت
  if (role === 'part_expert' && defect.status === 'open') {
    content += `<div class="form-group mt-4"><label class="form-label">علت ریشه‌ای (Root Cause)</label><textarea class="textarea" id="root-cause" placeholder="علت را بنویسید...">${defect.rootCause}</textarea></div>`;
    actions.push({ label: 'ثبت علت و ارسال برای مسئول', variant: 'primary', onClick: ({close}) => {
      const rc = document.getElementById('root-cause').value;
      if(!rc) { toast('لطفا علت را وارد کنید', 'error'); return; }
      defect.rootCause = rc;
      defect.status = 'action_pending'; // تغییر وضعیت به انتظار تایید
      close(); renderNCRTable('part_expert'); toast('برای مسئول بخش ارسال شد', 'success');
    }});
  }
  
  // ۲. مسئول بخش: تایید اقدامات
  else if (role === 'supervisor' && defect.status === 'action_pending') {
    content += `<p class="text-warning mt-4">کارشناس قطعه علت را بررسی کرده است. آیا اقدامات را تایید می‌کنید؟</p>`;
    content += `<p class="text-sm text-muted">علت ثبت شده: ${defect.rootCause}</p>`;
    actions.push({ label: 'تایید و ارسال به مدیر کیفیت', variant: 'primary', onClick: ({close}) => {
      defect.status = 'action_pending'; // در اینجا میتوانستیم وضعیت جدید بگذاریم
      close(); renderNCRTable('supervisor'); toast('تایید شد و برای مدیر کیفیت ارسال گردید', 'success');
    }});
  }

  // ۳. مدیر کیفیت: بستن نهایی
  else if (role === 'quality_manager' && defect.status === 'action_pending') {
    content += `<p class="text-success mt-4">این پرونده آماده بستن نهایی است.</p>`;
    actions.push({ label: 'بستن نهایی پرونده', variant: 'danger', onClick: ({close}) => {
      defect.status = 'closed';
      close(); renderNCRTable('quality_manager'); toast('پرونده با موفقیت بسته شد', 'success');
    }});
  }

  // ۴. ادمین: دسترسی کامل
  else if (role === 'admin') {
    content += `<p class="text-muted mt-4">شما به عنوان ادمین می‌توانید وضعیت را مستقیماً تغییر دهید.</p>`;
    actions.push({ label: 'بستن پرونده (ادمین)', variant: 'danger', onClick: ({close}) => {
      defect.status = 'closed'; close(); renderNCRTable('admin'); toast('توسط ادمین بسته شد', 'success');
    }});
  }

  // ۵. رده‌های نظارتی (مدیرعامل، معاونت، رئیس اداره): فقط مشاهده
  else if (['ceo', 'vp', 'chief'].includes(role)) {
    content += `<p class="text-info mt-4">شما در این مرحله فقط امکان مشاهده گردش کار را دارید.</p>`;
  }

  // اگر پرونده بسته شده باشد
  else if (defect.status === 'closed') {
    content += `<p class="text-success mt-4">این پرونده قبلا بسته شده است. (علت: ${defect.rootCause})</p>`;
  } 
  
  // اگر نقش کاربر با وضعیت پرونده همخوانی نداشته باشد
  else {
    content += `<p class="text-warning mt-4">در حال حاضر اقدامی برای نقش شما در این مرحله تعریف نشده است.</p>`;
  }

  openModal({ title: `اقدامات پرونده ${defect.code}`, content, actions, size: 'md' });
}

init();