// ذخیره‌سازی داده‌ها در حافظه مرورگر (localStorage)
const defaultData = {
    defects: [
        { id: 'DEF-1001', title: 'نشتی چراغ جلو', vin: 'IR-A-2026-1234', part: 'چراغ جلو', severity: 'major', status: 'registered', date: '1403/08/01' }
    ],
    qans: [
        { id: 'QAN-2001', defectId: 'DEF-1001', title: 'نشتی چراغ', level: 'L2', status: 'sent', penalty: 50000000 }
    ],
    inspections: [],
    eightD: []
};

let db = JSON.parse(localStorage.getItem('iqdws_db'));

if (!db) {
    db = defaultData;
    localStorage.setItem('iqdws_db', JSON.stringify(db));
}

function saveDB() {
    localStorage.setItem('iqdws_db', JSON.stringify(db));
}