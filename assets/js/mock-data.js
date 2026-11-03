/**
 * Mock Data — داده نمونه بر اساس مدل‌های بک‌اند فعلی (iqdws-b)
 * در فاز ۱۱ با اتصال به API واقعی جایگزین می‌شود.
 */

export const mock_defects = [
  { id: 'd-1001', code: 'DF-101', vin: 'IR-ABC-0001', severity: 'high', status: 'open',        station: 'Final Assembly', description: 'نقص در رنگ درب سمت راست', createdAt: '2025-09-14T10:20:00Z' },
  { id: 'd-1002', code: 'DF-102', vin: 'IR-ABC-0002', severity: 'medium', status: 'in_progress', station: 'Paint',           description: 'لکه رنگ در کاپوت',         createdAt: '2025-09-13T15:40:00Z' },
  { id: 'd-1003', code: 'DF-103', vin: 'IR-ABC-0003', severity: 'low',    status: 'closed',      station: 'Engine',          description: 'نشتی جزئی روغن',           createdAt: '2025-09-12T08:15:00Z' },
  { id: 'd-1004', code: 'DF-104', vin: 'IR-ABC-0004', severity: 'critical', status: 'open',      station: 'Final Assembly', description: 'عدم عملکرد صحیح ترمز',     createdAt: '2025-09-14T14:30:00Z' },
];

export const mock_qans = [
  { id: 'q-2001', title: 'هشدار کیفیت — رنگ بدنه', level: 'critical', status: 'active', penalty: 5000000, createdAt: '2025-09-14T09:00:00Z' },
  { id: 'q-2002', title: 'انحراف در فرآیند جوش',   level: 'warning',  status: 'active', penalty: 1000000, createdAt: '2025-09-13T11:30:00Z' },
  { id: 'q-2003', title: 'نوسان در تأمین قطعه',    level: 'info',     status: 'active', penalty: 0,       createdAt: '2025-09-12T16:00:00Z' },
];

export const mock_claims = [
  { id: 'c-3001', partName: 'دریچه بنزین', supplier: 'تأمین‌کننده الف', quantity: 120, reason: 'نشتی',     status: 'open',   createdAt: '2025-09-10T12:00:00Z' },
  { id: 'c-3002', partName: 'چراغ جلو',    supplier: 'تأمین‌کننده ب',   quantity: 45,  reason: 'نقص نور', status: 'closed', createdAt: '2025-09-08T16:20:00Z' },
];

export const mock_analysis_tasks = [
  { id: 'a-4001', level: 'root-cause',  reason: 'تکرار عیب DF-101', status: 'open',        createdAt: '2025-09-14T13:00:00Z' },
  { id: 'a-4002', level: 'corrective',  reason: 'اصلاح فرآیند رنگ', status: 'in_progress', createdAt: '2025-09-13T10:00:00Z' },
];

export const mock_operator_errors = [
  { id: 'o-5001', shift: 'A', location: 'Line 2', action: 'بارگذاری اشتباه قطعه', correctiveAction: 'آموزش مجدد', createdAt: '2025-09-14T07:30:00Z' },
];

export const mock_users = [
  { id: 'u-1', username: 'admin', name: 'مدیر سیستم', role: 'admin' },
  { id: 'u-2', username: 'qa1',   name: 'کارشناس تضمین کیفیت', role: 'qa' },
];

/* --- Dashboard --- */
export const mock_dashboard = {
  kpis: [
    { key: 'ftq',        label: 'FTQ (کیفیت اولین بار)', value: 94.2, unit: '٪',      trend: 'up',   trendValue: '+۱.۵٪', variant: 'success' },
    { key: 'dppm',       label: 'DPPM',                   value: 1240, unit: '',       trend: 'down', trendValue: '-۸٪',   variant: 'success' },
    { key: 'recurrence', label: 'نرخ تکرار عیب',          value: 3.2,  unit: '٪',      trend: 'down', trendValue: '-۰.۴٪', variant: 'warning' },
    { key: 'capa',       label: 'میانگین زمان بستن CAPA', value: 12,   unit: 'روز',    trend: 'up',   trendValue: '+۲ روز', variant: 'danger' },
    { key: 'warranty',   label: 'هزینه گارانتی',          value: 2.4,  unit: 'میلیارد', trend: 'flat', trendValue: '۰٪',    variant: '' },
  ],
  trend7d: {
    labels: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'],
    data:   [12, 18, 15, 9, 14, 8, 6],
  },
  severity: [
    { label: 'بحرانی', value: 4,  color: '#ef4444' },
    { label: 'بالا',   value: 8,  color: '#f59e0b' },
    { label: 'متوسط', value: 15, color: '#1a5fd9' },
    { label: 'پایین',  value: 22, color: '#10b981' },
  ],
};