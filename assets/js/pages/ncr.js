import { store } from '../store.js';
import { mountShell } from '../shell.js';
import { openModal, toast, renderTable, badge } from '../ui.js';

// دیتای تستی (در نسخه نهایی به دیتابیس وصل می‌شود)
let MOCK_DEFECTS = [
  { id: 'D-1001', code: 'DF-101', desc: 'نقص رنگ درب', station: 'Final', status: 'open', owner: 'inspector' },
  { id: 'D-1002', code: 'DF-102', desc: 'نشتی جزئی روغن', station: 'Engine', status: 'in_review', owner: 'expert' },
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

  // نمایش دکمه ثبت برای بازرس
  if (['inspector', 'admin'].includes(session.role)) {
    document.getElementById('btn-create-ncr').style.display = 'inline-flex';
  }

  renderNCRTable(session.role);
}

function renderNCRTable(role) {
  const container = document.getElementById('ncr-table-container');
  
  // تعریف ستون‌ها
  const columns = [
    { label: 'کد ایراد', key: 'code' },
    { label: 'شرح مشکل', key: 'desc' },
    { label: 'ایستگاه', key: 'station' },
    { label: 'وضعیت', key: 'status', render: (row) => badge(STATUS_MAP[row.status].label, STATUS_MAP[row.status].color) },
    { label: 'عملیات', key: 'action', render: (row) => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-sm btn-secondary';
        btn.textContent = 'مشاهده و اقدام';
        btn.onclick = () => openWorkflowModal(row, role);
        return btn;
      }
    }
  ];

  renderTable(container, { columns, rows: MOCK_DEFECTS });
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
          MOCK_DEFECTS.unshift({
            id: Date.now().toString(), code: 'DF-' + Math.floor(Math.random()*1000),
            desc: document.getElementById('new-desc').value, station: document.getElementById('new-station').value,
            status: 'open', owner: 'expert'
          });
          close(); renderNCRTable('inspector'); toast('ایراد ثبت شد', 'success');
        }
      }
    ]
  });
}

// 📌 گردش کار اقدام بر اساس نقش
function openWorkflowModal(defect, role) {
  let content = `<p><strong>شرح:</strong> ${defect.desc}</p><p><strong>وضعیت فعلی:</strong> ${STATUS_MAP[defect.status].label}</p><hr>`;
  let actions = [{ label: 'بستن', variant: 'secondary', onClick: ({close}) => close() }];

  // کارشناس قطعه
  if (role === 'part_expert' && defect.status === 'open') {
    content += `<div class="form-group mt-4"><label class="form-label">علت ریشه‌ای (Root Cause)</label><textarea class="textarea" id="root-cause" placeholder="علت را بنویسید..."></textarea></div>`;
    actions.push({ label: 'ثبت علت و ارسال برای مسئول', variant: 'primary', onClick: ({close}) => {
      defect.status = 'action_pending';
      close(); renderNCRTable('part_expert'); toast('برای مسئول بخش ارسال شد', 'success');
    }});
  }
  
  // مسئول بخش
  else if (role === 'supervisor' && defect.status === 'action_pending') {
    content += `<p class="text-warning">کارشناس قطعه علت را بررسی کرده است. تایید می‌کنید؟</p>`;
    actions.push({ label: 'تایید و ارسال به مدیر کیفیت', variant: 'primary', onClick: ({close}) => {
      defect.status = 'action_pending'; // تغییر وضعیت برای مدیر
      close(); renderNCRTable('supervisor'); toast('تایید شد', 'success');
    }});
  }

  // مدیر کیفیت
  else if (role === 'quality_manager' && defect.status === 'action_pending') {
    content += `<p class="text-success">این پرونده آماده بستن نهایی است.</p>`;
    actions.push({ label: 'بستن پرونده', variant: 'danger', onClick: ({close}) => {
      defect.status = 'closed';
      close(); renderNCRTable('quality_manager'); toast('پرونده بسته شد', 'success');
    }});
  }

  // ادمین (دسترسی به همه چیز)
  else if (role === 'admin') {
    content += `<p class="text-muted">شما به عنوان ادمین می‌توانید وضعیت را مستقیماً تغییر دهید.</p>`;
    actions.push({ label: 'تغییر به بسته شده', variant: 'danger', onClick: ({close}) => {
      defect.status = 'closed'; close(); renderNCRTable('admin'); toast('توسط ادمین بسته شد', 'success');
    }});
  }

  // رده‌های نظارتی (فقط مشاهده)
  else if (['ceo', 'vp', 'chief'].includes(role)) {
    content += `<p class="text-muted">شما در این مرحله فقط امکان مشاهده را دارید.</p>`;
  }

  // اگر وضعیت برای نقش کاربر تطابق نداشت
  else if (defect.status === 'closed') {
    content += `<p class="text-success">این پرونده قبلا بسته شده است.</p>`;
  } else {
    content += `<p class="text-warning">در حال حاضر اقدامی برای شما تعریف نشده است.</p>`;
  }

  openModal({ title: `اقدامات پرونده ${defect.code}`, content, actions, size: 'md' });
}

document.getElementById('btn-create-ncr')?.addEventListener('click', openCreateModal);
init();