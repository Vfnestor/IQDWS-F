/**
 * charts.js — نمودارهای سبک SVG بدون وابستگی خارجی
 * برای آفلاین‌بودن کامل و کاهش حجم، از Chart.js استفاده نمی‌کنیم.
 * هر تابع یک SVG داخل container می‌سازد.
 */

const PALETTE = {
  brand:   '#1a5fd9',
  success: '#10b981',
  warning: '#f59e0b',
  danger:  '#ef4444',
  gray:    '#94a3b8',
};

const fmt = (n) => new Intl.NumberFormat('fa-IR').format(n);

/* --- Line / Area Chart --- */
export function lineChart(container, {
  data = [],
  labels = [],
  color = PALETTE.brand,
  fillColor = 'rgba(26, 95, 217, 0.08)',
  height = 220,
  yFormat = fmt,
} = {}) {
  const W = 800, H = height;
  const pad = { top: 20, right: 16, bottom: 36, left: 56 };
  const cW = W - pad.left - pad.right;
  const cH = H - pad.top - pad.bottom;

  if (data.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state-title">داده‌ای نیست</div></div>`;
    return;
  }

  const max = Math.max(...data, 1) * 1.15;
  const points = data.map((v, i) => ({
    x: pad.left + (cW / Math.max(data.length - 1, 1)) * i,
    y: pad.top + cH - (v / max) * cH,
    v,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaD = `${pathD} L${points[points.length - 1].x},${pad.top + cH} L${points[0].x},${pad.top + cH} Z`;

  const grid = [];
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (cH / 4) * i;
    const val = max - (max / 4) * i;
    grid.push(`<line x1="${pad.left}" y1="${y}" x2="${W - pad.right}" y2="${y}" stroke="#e2e8f0" stroke-dasharray="3 3"/>`);
    grid.push(`<text x="${pad.left - 8}" y="${y + 4}" text-anchor="end" font-size="10" fill="#94a3b8">${yFormat(Math.round(val))}</text>`);
  }

  const xLabels = labels.map((l, i) => {
    const x = pad.left + (cW / Math.max(labels.length - 1, 1)) * i;
    return `<text x="${x}" y="${H - 12}" text-anchor="middle" font-size="11" fill="#64748b">${l}</text>`;
  }).join('');

  const dots = points.map(p =>
    `<circle cx="${p.x}" cy="${p.y}" r="3.5" fill="white" stroke="${color}" stroke-width="2"/>`
  ).join('');

  container.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" preserveAspectRatio="xMidYMid meet" style="direction:ltr;display:block;">
      ${grid.join('')}
      <path d="${areaD}" fill="${fillColor}"/>
      <path d="${pathD}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      ${dots}
      ${xLabels}
    </svg>
  `;
}

/* --- Donut Chart --- */
export function donutChart(container, {
  segments = [],
  size = 200,
  thickness = 26,
} = {}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  if (total === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state-title">داده‌ای نیست</div></div>`;
    return;
  }

  const r = (size - thickness) / 2;
  const cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  const arcs = segments.map(seg => {
    const frac = seg.value / total;
    const dash = frac * circ;
    const gap = circ - dash;
    const arc = `<circle
      cx="${cx}" cy="${cy}" r="${r}"
      fill="none"
      stroke="${seg.color}"
      stroke-width="${thickness}"
      stroke-dasharray="${dash} ${gap}"
      stroke-dashoffset="${-offset}"
      transform="rotate(-90 ${cx} ${cy})"
    />`;
    offset += dash;
    return arc;
  }).join('');

  const legend = segments.map(seg => `
    <div class="donut-legend-item">
      <span class="donut-legend-dot" style="background:${seg.color}"></span>
      <span class="donut-legend-label">${seg.label}</span>
      <span class="donut-legend-value">${fmt(seg.value)}</span>
      <span class="donut-legend-pct">${Math.round((seg.value / total) * 100)}٪</span>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="donut-wrapper">
      <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" style="display:block;">
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#f1f5f9" stroke-width="${thickness}"/>
        ${arcs}
        <text x="${cx}" y="${cy - 4}" text-anchor="middle" font-size="22" font-weight="700" fill="#0f172a">${fmt(total)}</text>
        <text x="${cx}" y="${cy + 16}" text-anchor="middle" font-size="11" fill="#64748b">کل</text>
      </svg>
      <div class="donut-legend">${legend}</div>
    </div>
  `;
}

/* --- Bar Chart --- */
export function barChart(container, {
  data = [],
  labels = [],
  colors = [],
  height = 200,
  yFormat = fmt,
} = {}) {
  const W = 800, H = height;
  const pad = { top: 20, right: 16, bottom: 40, left: 56 };
  const cW = W - pad.left - pad.right;
  const cH = H - pad.top - pad.bottom;

  if (data.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state-title">داده‌ای نیست</div></div>`;
    return;
  }

  const max = Math.max(...data, 1) * 1.15;
  const slot = cW / data.length;
  const barW = Math.min(slot * 0.6, 48);

  const grid = [];
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (cH / 4) * i;
    const val = max - (max / 4) * i;
    grid.push(`<line x1="${pad.left}" y1="${y}" x2="${W - pad.right}" y2="${y}" stroke="#e2e8f0" stroke-dasharray="3 3"/>`);
    grid.push(`<text x="${pad.left - 8}" y="${y + 4}" text-anchor="end" font-size="10" fill="#94a3b8">${yFormat(Math.round(val))}</text>`);
  }

  const bars = data.map((v, i) => {
    const x = pad.left + slot * i + (slot - barW) / 2;
    const h = (v / max) * cH;
    const y = pad.top + cH - h;
    const color = colors[i] || PALETTE.brand;
    return `<rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="4" fill="${color}"/>`;
  }).join('');

  const xLabels = labels.map((l, i) => {
    const x = pad.left + slot * i + slot / 2;
    return `<text x="${x}" y="${H - 12}" text-anchor="middle" font-size="11" fill="#64748b">${l}</text>`;
  }).join('');

  container.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" preserveAspectRatio="xMidYMid meet" style="direction:ltr;display:block;">
      ${grid.join('')}
      ${bars}
      ${xLabels}
    </svg>
  `;
}

export { PALETTE, fmt };