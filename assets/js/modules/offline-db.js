const OfflineDB = {
    db: null,
    
    init: function() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open("IQDWS_OfflineDB", 4); // نسخه 4
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('defects')) db.createObjectStore('defects', { keyPath: 'defectCode' });
                if (!db.objectStoreNames.contains('qans')) db.createObjectStore('qans', { keyPath: 'qanId' });
                if (!db.objectStoreNames.contains('eightd')) db.createObjectStore('eightd', { keyPath: 'qanId' });
                if (!db.objectStoreNames.contains('sync_queue')) db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
                if (!db.objectStoreNames.contains('claims')) db.createObjectStore('claims', { keyPath: 'claimId' }); // فروشگاه جدید کارت کلیم
            };
            request.onsuccess = (e) => { this.db = e.target.result; resolve(); };
            request.onerror = (e) => reject(e);
        });
    },

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
            request.onsuccess = (e) => {
                const all = e.target.result;
                resolve(all.filter(c => c.defectCode === defectCode));
            };
            request.onerror = (e) => reject(e);
        });
    },

    addToQueue: function(data) {
        return new Promise((resolve, reject) => {
            const request = this.db.transaction(["sync_queue"], "readwrite").objectStore("sync_queue").add(data);
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e);
        });
    },
    getQueue: function() {
        return new Promise((resolve, reject) => {
            const request = this.db.transaction(["sync_queue"], "readonly").objectStore("sync_queue").getAll();
            request.onsuccess = (e) => resolve(e.target.result);
            request.onerror = (e) => reject(e);
        });
    },
    clearItem: function(id) {
        return new Promise((resolve, reject) => {
            const request = this.db.transaction(["sync_queue"], "readwrite").objectStore("sync_queue").delete(id);
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e);
        });
    }
};

// مدیریت عنوان‌های ایراد در LocalStorage
if (!localStorage.getItem('iqdws_defect_titles')) {
    const defaultTitles = ['عدم عملکرد', 'عملکرد نادرست', 'صدای اضافی', 'ایراد ظاهری', 'ایراد رنگ', 'ایراد بدنه', 'ایراد بسته بندی', 'عدم قابلیت مونتاژ'];
    localStorage.setItem('iqdws_defect_titles', JSON.stringify(defaultTitles));
}