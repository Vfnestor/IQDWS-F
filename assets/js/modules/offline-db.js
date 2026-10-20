const OfflineDB = {
    db: null,
    
    init: function() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open("IQDWS_OfflineDB", 2); // نسخه 2 برای تغییر ساختار
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('defects')) {
                    db.createObjectStore('defects', { keyPath: 'defectCode' });
                }
                if (!db.objectStoreNames.contains('qans')) {
                    db.createObjectStore('qans', { keyPath: 'qanId' });
                }
                if (!db.objectStoreNames.contains('sync_queue')) {
                    db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
                }
            };
            request.onsuccess = (e) => {
                this.db = e.target.result;
                resolve();
            };
            request.onerror = (e) => reject(e);
        });
    },

    // --- مدیریت ایرادها ---
    saveDefect: function(defect) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(["defects"], "readwrite");
            const store = tx.objectStore("defects");
            const request = store.put(defect);
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e);
        });
    },

    getDefects: function() {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(["defects"], "readonly");
            const store = tx.objectStore("defects");
            const request = store.getAll();
            request.onsuccess = (e) => resolve(e.target.result.reverse());
            request.onerror = (e) => reject(e);
        });
    },

    getDefectByCode: function(code) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(["defects"], "readonly");
            const store = tx.objectStore("defects");
            const request = store.get(code);
            request.onsuccess = (e) => resolve(e.target.result);
            request.onerror = (e) => reject(e);
        });
    },

    // --- مدیریت اخطارها ---
    saveQAN: function(qan) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(["qans"], "readwrite");
            const store = tx.objectStore("qans");
            const request = store.put(qan);
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e);
        });
    },

    getQANs: function() {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(["qans"], "readonly");
            const store = tx.objectStore("qans");
            const request = store.getAll();
            request.onsuccess = (e) => resolve(e.target.result.reverse());
            request.onerror = (e) => reject(e);
        });
    },

    // --- مدیریت صف آپلود ---
    addToQueue: function(data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(["sync_queue"], "readwrite");
            const store = transaction.objectStore("sync_queue");
            const request = store.add(data);
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e);
        });
    },
    getQueue: function() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(["sync_queue"], "readonly");
            const store = transaction.objectStore("sync_queue");
            const request = store.getAll();
            request.onsuccess = (e) => resolve(e.target.result);
            request.onerror = (e) => reject(e);
        });
    },
    clearItem: function(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(["sync_queue"], "readwrite");
            const store = transaction.objectStore("sync_queue");
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e);
        });
    }
};