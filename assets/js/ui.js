/**
 * UI — توابع مشترک: Toast، Modal، Confirm، Table، Loading، Empty، Formatters
 */

/* --- Toast --- */
function ensureToastContainer() {
  let c = document.querySelector('.toast-container');
  if (!c) { c = document.createElement('div'); c.className = 'toast-container'; document.body.appendChild(c); }
  return c;
}
export function toast(message, type = '', duration = 3500) {
  const container = ensureToastContainer();
  const el = document.createElement('div');
  el.className = `toast${type ? ' toast-' + type : ''}`;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0'; el.style.transition = 'opacity 200ms';
    setTimeout(() => el.remove(), 200);
  }, duration);
}

/* --- Modal --- */
export function openModal({ title, content, actions = [], size = 'md', onClose }) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  const modal = document.createElement('div');
  modal.className = `modal modal-${size}`;

  const header = document.createElement('div');
  header.className = 'modal-header';
  header.innerHTML = `<h3 class="modal-title"></h3>`;
  header.querySelector('.modal-title').textContent = title;
  const closeBtn = document.createElement('button');
  closeBtn.className = 'btn btn-ghost btn-icon btn-sm';
  closeBtn.textContent = '✕';
  closeBtn.onclick = () => close();
  header.appendChild(closeBtn);

  const body = document.createElement('div');
  body.className = 'modal-body';
  if (typeof content === 'string') body.innerHTML = content;
  else if (content instanceof Node) body.appendChild(content);

  const footer = document.createElement('div');
  footer.className = 'modal-footer';
  actions.forEach(a => {
    const btn = document.createElement('button');
    btn.className = `btn ${a.variant ? 'btn-' + a.variant : 'btn-secondary'}`;
    btn.textContent = a.label;
    btn.onclick = () => a.onClick?.({ close });
    footer.appendChild(btn);
  });

  modal.append(header, body, footer);
  backdrop.appendChild(modal);
  backdrop.onclick = (e) => { if (e.target === backdrop) close(); };
  document.body.appendChild(backdrop);

  function close() { backdrop.remove(); onClose?.(); }
  return { close, element: modal };
}

export function confirm({ title = 'تأیید', message, confirmLabel = 'تأیید', cancelLabel = 'انصراف', danger = false }) {
  return new Promise((resolve) => {
    let done = false;
    openModal({
      title,
      content: `<p>${message}</p>`,
      actions: [
        { label: cancelLabel, variant: 'secondary', onClick: ({ close }) => { done = true; close(); resolve(false); } },
        { label: confirmLabel, variant: danger ? 'danger' : 'primary', onClick: ({ close }) => { done = true; close(); resolve(true); } },
      ],
      size: 'sm',
      onClose: () => { if (!done) resolve(false); },
    });
  });
}

/* --- Table --- */
export function renderTable(container, { columns, rows, emptyText = 'داده‌ای برای نمایش نیست', onRowClick }) {
  if (!rows || rows.length === 0) {
    container.innerHTML = '';
    container.appendChild(emptyState(emptyText));
    return;
  }
  const wrapper = document.createElement('div');
  wrapper.className = 'table-wrapper';
  const table = document.createElement('table');
  table.className = 'table';

  const thead = document.createElement('thead');
  const trh = document.createElement('tr');
  columns.forEach(c => {
    const th = document.createElement('th');
    th.textContent = c.label;
    if (c.width) th.style.width = c.width;
    trh.appendChild(th);
  });
  thead.appendChild(trh);

  const tbody = document.createElement('tbody');
  rows.forEach(row => {
    const tr = document.createElement('tr');
    columns.forEach(c => {
      const td = document.createElement('td');
      const val = c.render ? c.render(row) : row[c.key];
      if (val instanceof Node) td.appendChild(val);
      else td.textContent = val ?? '—';
      tr.appendChild(td);
    });
    if (onRowClick) { tr.style.cursor = 'pointer'; tr.onclick = () => onRowClick(row); }
    tbody.appendChild(tr);
  });

  table.append(thead, tbody);
  wrapper.appendChild(table);
  container.innerHTML = '';
  container.appendChild(wrapper);
}

/* --- Loading / Empty --- */
export function loadingBlock(text = 'در حال بارگذاری...') {
  const el = document.createElement('div');
  el.className = 'loading-block';
  el.innerHTML = `<div class="spinner"></div><span>${text}</span>`;
  return el;
}

export function emptyState(title, desc = '') {
  const el = document.createElement('div');
  el.className = 'empty-state';
  el.innerHTML = `
    <div class="empty-state-icon">📭</div>
    <div class="empty-state-title">${title}</div>
    ${desc ? `<div class="empty-state-desc">${desc}</div>` : ''}
  `;
  return el;
}

/* --- Formatters --- */
export function formatDate(value) {
  if (!value) return '—';
  try { return new Intl.DateTimeFormat('fa-IR').format(new Date(value)); }
  catch { return value; }
}
export function formatDateTime(value) {
  if (!value) return '—';
  try { return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)); }
  catch { return value; }
}
export function formatNumber(value) {
  if (value == null) return '—';
  return new Intl.NumberFormat('fa-IR').format(value);
}

/* --- Badge helper --- */
export function badge(text, variant = 'neutral') {
  const el = document.createElement('span');
  el.className = `badge badge-${variant}`;
  el.textContent = text;
  return el;
}