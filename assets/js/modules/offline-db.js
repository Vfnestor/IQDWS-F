const OfflineDB = {
    db: null,
    
    init: function() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open("IQDWS_OfflineDB", 5); // نسخه 5
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('defects')) db.createObjectStore('defects', { keyPath: 'defectCode' });
                if (!db.objectStoreNames.contains('qans')) db.createObjectStore('qans', { keyPath: 'qanId' });
                if (!db.objectStoreNames.contains('eightd')) db.createObjectStore('eightd', { keyPath: 'qanId' });
                if (!db.objectStoreNames.contains('claims')) db.createObjectStore('claims', { keyPath: 'claimId' });
                if (!db.objectStoreNames.contains('sync_queue')) db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
                // فروشگاه‌های جدید
                if (!db.objectStoreNames.contains('analysis_tasks')) db.createObjectStore('analysis_tasks', { keyPath: 'taskId' });
                if (!db.objectStoreNames.contains('operator_errors')) db.createObjectStore('operator_errors', { keyPath: 'errorId' });
                if (!db.objectStoreNames.contains('audit_logs')) db.createObjectStore('audit_logs', { keyPath: 'logId', autoIncrement: true });
            };
            request.onsuccess = (e) => { this.db = e.target.result; resolve(); };
            request.onerror = (e) => reject(e);
        });
    },

    // --- مدیریت ایرادها ---
    saveDefect: function(defect) {
        return new Promise((resolve, reject) => {
            const request = this.db.transaction(["defects"], "readwrite").objectStore("defects").put(defect);
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e);
        });
    },
    getDefects: function() {
        return new Promise((resolve, reject) => {
            const request = this.db.transaction(["defects"], "readonly").objectStore("defects").getAll();
            request.onsuccess = (e) => resolve(e.target.result.reverse());
            request.onerror = (e) => reject(e);
        });
    },
    getDefectByCode: function(code) {
        return new Promise((resolve, reject) => {
            const request = this.db.transaction(["defects"], "readonly").objectStore("defects").get(code);
            request.onsuccess = (e) => resolve(e.target.result);
            request.onerror = (e) => reject(e);
        });
    },

    // --- مدیریت اخطارها ---
    saveQAN: function(qan) {
        return new Promise((resolve, reject) => {
            const request = this.db.transaction(["qans"], "readwrite").objectStore("qans").put(qan);
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e);
        });
    },
    getQANs: function() {
        return new Promise((resolve, reject) => {
            const request = this.db.transaction(["qans"], "readonly").objectStore("qans").getAll();
            request.onsuccess = (e) => resolve(e.target.result.reverse());
            request.onerror = (e) => reject(e);
        });
    },

    // --- مدیریت 8D ---
    save8D: function(data) {
        return new Promise((resolve, reject) => {
            const request = this.db.transaction(["eightd"], "readwrite").objectStore("eightd").put(data);
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e);
        });
    },
    get8DByQAN: function(qanId) {
        return new Promise((resolve, reject) => {
            const request = this.db.transaction(["eightd"], "readonly").objectStore("eightd").get(qanId);
            request.onsuccess = (e) => resolve(e.target.result);
            request.onerror = (e) => reject(e);
        });
    },

    // --- مدیریت کارت‌های کلیم ---
    saveClaim: function(claim) {
        return new Promise((resolve, reject) => {
            const request = this.db.transaction(["claims"], "readwrite").objectStore("claims").put(claim);
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e);
        });
    },
    getClaims: function() {
        return new Promise((resolve, reject) => {
            const request = this.db.transaction(["claims"], "readonly").objectStore("claims").getAll();
            request.onsuccess = (e) => resolve(e.target.result.reverse());
            request.onerror = (e) => reject(e);
        });
    },
    getClaimsByDefect: function(defectCode) {
        return new Promise((resolve, reject) => {
            const request = this.db.transaction(["claims"], "readonly").objectStore("claims").getAll();
            request.onsuccess = (e) => resolve(e.target.result.filter(c => c.defectCode === defectCode));
            request.onerror = (e) => reject(e);
        });
    },

    // --- مدیریت تسک‌های آنالیز ---
    saveAnalysisTask: function(task) {
        return new Promise((resolve, reject) => {
            const request = this.db.transaction(["analysis_tasks"], "readwrite").objectStore("analysis_tasks").put(task);
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e);
        });
    },
    getAnalysisTasks: function() {
        return new Promise((resolve, reject) => {
            const request = this.db.transaction(["analysis_tasks"], "readonly").objectStore("analysis_tasks").getAll();
            request.onsuccess = (e) => resolve(e.target.result.reverse());
            request.onerror = (e) => reject(e);
        });
    },

    // --- مدیریت ایرادات اپراتوری ---
    saveOperatorError: function(error) {
        return new Promise((resolve, reject) => {
            const request = this.db.transaction(["operator_errors"], "readwrite").objectStore("operator_errors").put(error);
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e);
        });
    },
    getOperatorErrors: function() {
        return new Promise((resolve, reject) => {
            const request = this.db.transaction(["operator_errors"], "readonly").objectStore("operator_errors").getAll();
            request.onsuccess = (e) => resolve(e.target.result.reverse());
            request.onerror = (e) => reject(e);
        });
    },
    deleteOperatorError: function(errorId) {
        return new Promise((resolve, reject) => {
            const request = this.db.transaction(["operator_errors"], "readwrite").objectStore("operator_errors").delete(errorId);
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e);
        });
    },

    // --- لاگ‌های حسابرسی ---
    addAuditLog: function(action, target, details, user) {
        return new Promise((resolve, reject) => {
            const log = { action, target, details, user, date: new Date().toISOString() };
            const request = this.db.transaction(["audit_logs"], "readwrite").objectStore("audit_logs").add(log);
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e);
        });
    },
    getAuditLogs: function() {
        return new Promise((resolve, reject) => {
            const request = this.db.transaction(["audit_logs"], "readonly").objectStore("audit_logs").getAll();
            request.onsuccess = (e) => resolve(e.target.result.reverse());
            request.onerror = (e) => reject(e);
        });
    }
};