const OfflineDB = {
    db: null,
    
    init: function() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open("IQDWS_OfflineDB", 1);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
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
    },
    
    // دریافت لیست ایرادهای ذخیره شده محلی برای نمایش در لیست
    getLocalDefects: async function() {
        const queue = await this.getQueue();
        return queue.filter(item => item.endpoint === '/defects').map(item => ({
            ...item.data,
            id: 'LOCAL-' + item.id, // شناسه موقت برای حالت آفلاین
            status: 'pending_upload',
            isLocal: true
        }));
    }
};