// درخواست حافظه دائمی از سیستم‌عامل گوشی
if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().then(granted => {
        if (granted) console.log("Persistent storage granted. Data will not be cleared automatically.");
        else console.log("Persistent storage denied. Data might be cleared if device storage is low.");
    });
}

const OfflineDB = {
    db: null,
    
    init: function() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open("IQDWS_OfflineDB", 6); 
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('defects')) db.createObjectStore('defects', { keyPath: 'defectCode' });
                if (!db.objectStoreNames.contains('qans')) db.createObjectStore('qans', { keyPath: 'qanId' });
                if (!db.objectStoreNames.contains('eightd')) db.createObjectStore('eightd', { keyPath: 'qanId' });
                if (!db.objectStoreNames.contains('claims')) db.createObjectStore('claims', { keyPath: 'claimId' });
                if (!db.objectStoreNames.contains('sync_queue')) db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
                if (!db.objectStoreNames.contains('analysis_tasks')) db.createObjectStore('analysis_tasks', { keyPath: 'taskId' });
                if (!db.objectStoreNames.contains('operator_errors')) db.createObjectStore('operator_errors', { keyPath: 'errorId' });
                if (!db.objectStoreNames.contains('audit_logs')) db.createObjectStore('audit_logs', { keyPath: 'logId', autoIncrement: true });
                if (!db.objectStoreNames.contains('notifications')) db.createObjectStore('notifications', { keyPath: 'notifId' });
            };
            request.onsuccess = (e) => { this.db = e.target.result; resolve(); };
            request.onerror = (e) => reject(e);
        });
    },

    // --- مدیریت ایرادها ---
    saveDefect: function(defect) { return new Promise((res, rej) => { const r = this.db.transaction(["defects"], "readwrite").objectStore("defects").put(defect); r.onsuccess = () => res(); r.onerror = (e) => rej(e); }); },
    getDefects: function() { return new Promise((res, rej) => { const r = this.db.transaction(["defects"], "readonly").objectStore("defects").getAll(); r.onsuccess = (e) => res(e.target.result.reverse()); r.onerror = (e) => rej(e); }); },
    getDefectByCode: function(code) { return new Promise((res, rej) => { const r = this.db.transaction(["defects"], "readonly").objectStore("defects").get(code); r.onsuccess = (e) => res(e.target.result); r.onerror = (e) => rej(e); }); },

    // --- مدیریت اخطارها ---
    saveQAN: function(qan) { return new Promise((res, rej) => { const r = this.db.transaction(["qans"], "readwrite").objectStore("qans").put(qan); r.onsuccess = () => res(); r.onerror = (e) => rej(e); }); },
    getQANs: function() { return new Promise((res, rej) => { const r = this.db.transaction(["qans"], "readonly").objectStore("qans").getAll(); r.onsuccess = (e) => res(e.target.result.reverse()); r.onerror = (e) => rej(e); }); },

    // --- مدیریت 8D ---
    save8D: function(data) { return new Promise((res, rej) => { const r = this.db.transaction(["eightd"], "readwrite").objectStore("eightd").put(data); r.onsuccess = () => res(); r.onerror = (e) => rej(e); }); },
    get8DByQAN: function(qanId) { return new Promise((res, rej) => { const r = this.db.transaction(["eightd"], "readonly").objectStore("eightd").get(qanId); r.onsuccess = (e) => res(e.target.result); r.onerror = (e) => rej(e); }); },

    // --- مدیریت کارت‌های کلیم ---
    saveClaim: function(claim) { return new Promise((res, rej) => { const r = this.db.transaction(["claims"], "readwrite").objectStore("claims").put(claim); r.onsuccess = () => res(); r.onerror = (e) => rej(e); }); },
    getClaims: function() { return new Promise((res, rej) => { const r = this.db.transaction(["claims"], "readonly").objectStore("claims").getAll(); r.onsuccess = (e) => res(e.target.result.reverse()); r.onerror = (e) => rej(e); }); },
    getClaimsByDefect: function(defectCode) { return new Promise((res, rej) => { const r = this.db.transaction(["claims"], "readonly").objectStore("claims").getAll(); r.onsuccess = (e) => res(e.target.result.filter(c => c.defectCode === defectCode)); r.onerror = (e) => rej(e); }); },

    // --- مدیریت تسک‌های آنالیز ---
    saveAnalysisTask: function(task) { return new Promise((res, rej) => { const r = this.db.transaction(["analysis_tasks"], "readwrite").objectStore("analysis_tasks").put(task); r.onsuccess = () => res(); r.onerror = (e) => rej(e); }); },
    getAnalysisTasks: function() { return new Promise((res, rej) => { const r = this.db.transaction(["analysis_tasks"], "readonly").objectStore("analysis_tasks").getAll(); r.onsuccess = (e) => res(e.target.result.reverse()); r.onerror = (e) => rej(e); }); },

    // --- مدیریت ایرادات اپراتوری ---
    saveOperatorError: function(error) { return new Promise((res, rej) => { const r = this.db.transaction(["operator_errors"], "readwrite").objectStore("operator_errors").put(error); r.onsuccess = () => res(); r.onerror = (e) => rej(e); }); },
    getOperatorErrors: function() { return new Promise((res, rej) => { const r = this.db.transaction(["operator_errors"], "readonly").objectStore("operator_errors").getAll(); r.onsuccess = (e) => res(e.target.result.reverse()); r.onerror = (e) => rej(e); }); },
    deleteOperatorError: function(errorId) { return new Promise((res, rej) => { const r = this.db.transaction(["operator_errors"], "readwrite").objectStore("operator_errors").delete(errorId); r.onsuccess = () => res(); r.onerror = (e) => rej(e); }); },

    // --- لاگ‌های حسابرسی ---
    addAuditLog: function(action, target, details, user) { return new Promise((res, rej) => { const log = { action, target, details, user, date: new Date().toISOString() }; const r = this.db.transaction(["audit_logs"], "readwrite").objectStore("audit_logs").add(log); r.onsuccess = () => res(); r.onerror = (e) => rej(e); }); },
    getAuditLogs: function() { return new Promise((res, rej) => { const r = this.db.transaction(["audit_logs"], "readonly").objectStore("audit_logs").getAll(); r.onsuccess = (e) => res(e.target.result.reverse()); r.onerror = (e) => rej(e); }); },

    // --- مدیریت نوتیفیکیشن‌ها ---
    addNotification: function(notif) { return new Promise((res, rej) => { const r = this.db.transaction(["notifications"], "readwrite").objectStore("notifications").put(notif); r.onsuccess = () => res(); r.onerror = (e) => rej(e); }); },
    getNotifications: function(username) { return new Promise((res, rej) => { const r = this.db.transaction(["notifications"], "readonly").objectStore("notifications").getAll(); r.onsuccess = (e) => res(e.target.result.filter(n => n.targetUser === username || n.targetUser === 'all').reverse()); r.onerror = (e) => rej(e); }); },
    markNotifRead: function(notifId) { return new Promise((res, rej) => { const tx = this.db.transaction(["notifications"], "readwrite"); const store = tx.objectStore("notifications"); const req = store.get(notifId); req.onsuccess = (e) => { const n = e.target.result; if(n) { n.isRead = true; store.put(n); } res(); }; req.onerror = (e) => rej(e); }); },

    // --- صف آپلود ---
    addToQueue: function(data) { return new Promise((res, rej) => { const r = this.db.transaction(["sync_queue"], "readwrite").objectStore("sync_queue").add(data); r.onsuccess = () => res(); r.onerror = (e) => rej(e); }); },
    getQueue: function() { return new Promise((res, rej) => { const r = this.db.transaction(["sync_queue"], "readonly").objectStore("sync_queue").getAll(); r.onsuccess = (e) => res(e.target.result); r.onerror = (e) => rej(e); }); },
    clearItem: function(id) { return new Promise((res, rej) => { const r = this.db.transaction(["sync_queue"], "readwrite").objectStore("sync_queue").delete(id); r.onsuccess = () => res(); r.onerror = (e) => rej(e); }); }
};