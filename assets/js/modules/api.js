// این فایل شبیه‌ساز بک‌اند است. در مرحله بعد، فقط این فایل را با fetch() به سرور واقعی تغییر می‌دهیم.
const API = {
    // دریافت داده‌ها
    getDefects: () => {
        return JSON.parse(localStorage.getItem('iqdws_defects')) || [];
    },
    
    createDefect: (data) => {
        let defects = API.getDefects();
        const newDefect = {
            id: Utils.generateId('DEF'),
            ...data,
            status: 'registered',
            createdAt: new Date().toISOString()
        };
        defects.push(newDefect);
        localStorage.setItem('iqdws_defects', JSON.stringify(defects));
        return newDefect;
    },

    getQANs: () => {
        return JSON.parse(localStorage.getItem('iqdws_qans')) || [];
    },

    createQAN: (data) => {
        let qans = API.getQANs();
        const newQAN = {
            id: Utils.generateId('QAN'),
            ...data,
            status: 'pending_dept',
            createdAt: new Date().toISOString()
        };
        qans.push(newQAN);
        localStorage.setItem('iqdws_qans', JSON.stringify(qans));
        return newQAN;
    },

    save8D: (data) => {
        let eightDs = JSON.parse(localStorage.getItem('iqdws_8d')) || [];
        eightDs.push({ ...data, createdAt: new Date().toISOString() });
        localStorage.setItem('iqdws_8d', JSON.stringify(eightDs));
        return true;
    }
};