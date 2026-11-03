/**
 * Mock Data — داده نمونه بر اساس مدل‌های بک‌اند فعلی (iqdws-b)
 * در فاز ۱۱ با اتصال به API واقعی جایگزین می‌شود.
 */

export const mock_defects = [
  {
    id: 'd-1001', code: 'DF-101', vin: 'IR-ABC-0001', severity: 'high',
    status: 'open', station: 'Final Assembly',
    description: 'نقص در رنگ درب سمت راست',
    createdAt: '2025-09-14T10:20:00Z',
  },
  {
    id: 'd-1002', code: 'DF-102', vin: 'IR-ABC-0002', severity: 'medium',
    status: 'in_progress', station: 'Paint',
    description: 'لکه رنگ در کاپوت',
    createdAt: '2025-09-13T15:40:00Z',
  },
  {
    id: 'd-1003', code: 'DF-103', vin: 'IR-ABC-0003', severity: 'low',
    status: 'closed', station: 'Engine',
    description: 'نشتی جزئی روغن',
    createdAt: '2025-09-12T08:15:00Z',
  },
];

export const mock_qans = [
  { id: 'q-2001', title: 'هشدار کیفیت — رنگ بدنه', level: 'critical', status: 'active', penalty: 5000000, createdAt: '2025-09-14T09:00:00Z' },
  { id: 'q-2002', title: 'انحراف در فرآیند جوش', level: 'warning', status: 'active', penalty: 1000000, createdAt: '2025-09-13T11:30:00Z' },
];

export const mock_claims = [
  { id: 'c-3001', partName: 'دریچه بنزین', supplier: 'تأمین‌کننده الف', quantity: 120, reason: 'نشتی', status: 'open', createdAt: '2025-09-10T12:00:00Z' },
  { id: 'c-3002', partName: 'چراغ جلو', supplier: 'تأمین‌کننده ب', quantity: 45, reason: 'نقص نور', status: 'closed', createdAt: '2025-09-08T16:20:00Z' },
];

export const mock_analysis_tasks = [
  { id: 'a-4001', level: 'root-cause', reason: 'تکرار عیب DF-101', status: 'open', createdAt: '2025-09-14T13:00:00Z' },
  { id: 'a-4002', level: 'corrective', reason: 'اصلاح فرآیند رنگ', status: 'in_progress', createdAt: '2025-09-13T10:00:00Z' },
];

export const mock_operator_errors = [
  { id: 'o-5001', shift: 'A', location: 'Line 2', action: 'بارگذاری اشتباه قطعه', correctiveAction: 'آموزش مجدد', createdAt: '2025-09-14T07:30:00Z' },
];

export const mock_users = [
  { id: 'u-1', username: 'admin', name: 'مدیر سیستم', role: 'admin' },
  { id: 'u-2', username: 'qa1', name: 'کارشناس تضمین کیفیت', role: 'qa' },
];