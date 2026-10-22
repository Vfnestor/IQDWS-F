const AdminAPI = {
    getStats: async () => {
        // خواندن داده‌ها از حافظه محلی (IndexedDB و localStorage)
        const defects = await OfflineDB.getDefects();
        const qans = await OfflineDB.getQANs();
        const users = JSON.parse(localStorage.getItem('iqdws_users') || '[]');
        const bugs = JSON.parse(localStorage.getItem('iqdws_bugs') || '[]');
        
        return { defects, qans, users, bugs };
    },
    getUsers: async () => {
        return JSON.parse(localStorage.getItem('iqdws_users') || '[]');
    },
    getUserActivity: async (username) => {
        const defects = await OfflineDB.getDefects();
        const qans = await OfflineDB.getQANs();
        return {
            defects: defects.filter(d => d.createdBy === username),
            qans: qans.filter(q => q.createdBy === username)
        };
    },
    createBug: async (title, priority) => {
        let bugs = JSON.parse(localStorage.getItem('iqdws_bugs') || '[]');
        bugs.unshift({ id: 'BUG-' + Date.now(), title, priority, status: 'open', reportedBy: 'sys_admin', date: new Date().toLocaleDateString('fa-IR') });
        localStorage.setItem('iqdws_bugs', JSON.stringify(bugs));
    },
    resolveBug: async (id) => {
        let bugs = JSON.parse(localStorage.getItem('iqdws_bugs') || '[]');
        const bug = bugs.find(b => b.id === id);
        if (bug) { bug.status = 'resolved'; localStorage.setItem('iqdws_bugs', JSON.stringify(bugs)); }
    },
    getSystemHealth: async () => {
        return { status: 'online (local mode)', version: '1.0.0-beta', database: 'IndexedDB + LocalStorage', uptime: 120 };
    }
};