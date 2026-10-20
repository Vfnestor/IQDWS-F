// مدیریت همگام‌سازی داده‌های آفلاین با سرور
const SyncManager = {
    init: async function() {
        await OfflineDB.init();
        window.addEventListener('online', () => this.processQueue());
        // بررسی دوره‌ای هر ۳۰ ثانیه
        setInterval(() => this.processQueue(), 30000);
        this.processQueue();
    },

    processQueue: async function() {
        if (!navigator.onLine) return;
        
        const queue = await OfflineDB.getQueue();
        if (queue.length === 0) return;

        console.log(`Syncing ${queue.length} offline items...`);

        for (let item of queue) {
            try {
                // ارسال داده به سرور
                const res = await fetch(`${API_BASE_URL}${item.endpoint}`, {
                    method: item.method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('iqdws_token')}`
                    },
                    body: JSON.stringify(item.data)
                });

                if (res.ok) {
                    // اگر موفق بود، از صف حذف کن
                    await OfflineDB.clearItem(item.id);
                    console.log(`Item ${item.id} synced successfully.`);
                } else if (res.status === 401) {
                    // اگر توکن منقضی شده بود، صف را نگه دار تا لاگین مجدد
                    break;
                }
            } catch (error) {
                console.error("Sync failed for item", item.id, error);
            }
        }
    }
};