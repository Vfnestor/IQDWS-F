const SyncManager = {
    init: async function() {
        await OfflineDB.init();
        // ما دیگر به صورت خودکار آپلود نمی‌کنیم. فقط کاربر با دکمه این کار را می‌کند.
    },

    processQueue: async function() {
        if (!navigator.onLine) {
            alert('شما به اینترنت متصل نیستید.');
            return;
        }
        
        const queue = await OfflineDB.getQueue();
        if (queue.length === 0) {
            alert('هیچ داده جدیدی برای ارسال به سرور وجود ندارد.');
            return;
        }

        let successCount = 0;
        const syncBtn = document.getElementById('sync-btn');
        if (syncBtn) syncBtn.innerText = 'در حال ارسال...';

        for (let item of queue) {
            try {
                const res = await fetch(`${window.API_BASE_URL}${item.endpoint}`, {
                    method: item.method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('iqdws_token')}`
                    },
                    body: JSON.stringify(item.data)
                });

                if (res.ok) {
                    await OfflineDB.clearItem(item.id);
                    successCount++;
                }
            } catch (error) {
                console.error("Sync failed for item", item.id, error);
            }
        }
        
        if (syncBtn) syncBtn.innerText = '☁️ آپلود به سرور';
        
        if (successCount > 0) {
            alert(`${successCount} مورد با موفقیت به سرور ارسال شد.`);
            if (typeof renderDefectList === 'function') renderDefectList(); // رفرش لیست
            if (typeof renderDashboard === 'function') renderDashboard(); // رفرش داشبورد
        } else {
            alert('ارسال به سرور با خطا مواجه شد. (سرور ممکن است خواب باشد)');
        }
    }
};