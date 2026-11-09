import { store } from '../store.js';
import { mountShell } from '../shell.js';
import { openModal, toast } from '../ui.js';

let MOCK_OPERATORS = [
  { id: '1', name: 'علی رضایی', code: 'OP-101', group: 'مونتاژ ۱ - گروه ۲', score: 85 },
  { id: '2', name: 'حسن محمدی', code: 'OP-102', group: 'مونتاژ ۱ - گروه ۲', score: 92 },
  { id: '3', name: 'سعید کریمی', code: 'OP-103', group: 'مونتاژ ۱ - گروه ۲', score: 78 },
];

async function init() {
  const session = await store.getSession();
  if (session) store.set('session', session);
  mountShell();

  if (['inspector', 'admin'].includes(session.role)) {
    document.getElementById('btn-create-inspection').onclick = openCreateModal;
  } else {
    document.getElementById('btn-create-inspection').style.display = 'none';
  }

  renderTable();
  updateSummary();
}

function renderTable() {
  const container = document.getElementById('inspection-table-container');
  let html = `
    <table class="table">
      <thead><tr><th>نام اپراتور</th><th>کد پرسنلی</th><th>گروه</th><th>نمره خودکنترلی</th><th>عملیات</th></tr></thead>
      <tbody>
  `;

  MOCK_OPERATORS.forEach(op => {
    const color = op.score >= 90 ? 'success' : op.score >= 80 ? 'warning' : 'danger';
    html += `
      <tr>
        <td>${op.name}</td>
        <td class="text-mono">${op.code}</td>
        <td>${op.group}</td>
        <td><span class="badge badge-${color}">${op.score} از ۱۰۰</span></td>
        <td class="table-actions">
          <button class="btn btn-sm btn-ghost" onclick="alert('گزارش کامل ${op.name}')">مشاهده</button>
        </td>
      </tr>
    `;
  });
  html += `</tbody></table>`;
  container.innerHTML = html;
}

function updateSummary() {
  const total = MOCK_OPERATORS.length;
  const sum = MOCK_OPERATORS.reduce((a, b) => a + b.score, 0);
  const avg = total > 0 ? Math.round(sum / total) : 0;
  
  document.getElementById('avg-score').textContent = avg;
  document.getElementById('total-evals').textContent = total;
}

function openCreateModal() {
  const content = document.createElement('div');
  content.innerHTML = `
    <div class="form-group">
      <label class="form-label">انتخاب اپراتور</label>
      <select class="select" id="op-select">
        ${MOCK_OPERATORS.map(o => `<option value="${o.id}">${o.name} (${o.code})</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">نمره خودکنترلی (از ۱۰۰)</label>
      <input type="number" class="input" id="op-score" min="0" max="100" value="100">
    </div>
    <div class="form-group">
      <label class="form-label">توضیحات (اختیاری)</label>
      <input type="text" class="input" id="op-desc" placeholder="علت کسر نمره...">
    </div>
  `;

  openModal({
    title: 'ثبت نمره خودکنترلی',
    content,
    actions: [
      { label: 'انصراف', variant: 'secondary', onClick: ({close}) => close() },
      { label: 'ثبت نمره', variant: 'primary', onClick: ({close}) => {
          const id = document.getElementById('op-select').value;
          const score = parseInt(document.getElementById('op-score').value);
          
          if (isNaN(score) || score < 0 || score > 100) {
            toast('نمره باید بین ۰ تا ۱۰۰ باشد', 'error'); return;
          }

          const op = MOCK_OPERATORS.find(o => o.id === id);
          if (op) op.score = score;
          
          close();
          renderTable();
          updateSummary();
          toast('نمره با موفقیت ثبت شد', 'success');
      }}
    ]
  });
}

init();
