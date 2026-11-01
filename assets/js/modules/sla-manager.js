const SLAManager = {
    // محاسبه تاریخ با اضافه کردن روز کاری (فعلا روزهای عادی محاسبه می‌شود)
    addDays: function(date, days) {
        let result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    },

    // بررسی وضعیت ایرادات و ارسال نوتیفیکیشن در زمان مقرر
    checkDeadlines: async function() {
        const defects = await OfflineDB.getDefects();
        const now = new Date();
        
        for (let d of defects) {
            // اگر ایراد بسته شده یا در وضعیت آنالیز است، چک نکن
            if (d.status === 'closed' || d.status === 'brand_analysis') continue;

            // ۱. SLA مهلت بررسی کارشناس (۱ روز)
            if (d.status === 'registered' && d.slaReviewDate) {
                if (now > new Date(d.slaReviewDate) && !d.notifiedSlaReview) {
                    await this.sendNotif('all', `مهلت بررسی ایراد ${d.defectCode} به پایان رسید.`, d.defectCode);
                    d.notifiedSlaReview = true;
                    await OfflineDB.saveDefect(d);
                }
            }
            
            // ۲. SLA مهلت پاسخ سازنده (۳ روز)
            if (d.status === 'pending_supplier' && d.slaSupplierDate) {
                if (now > new Date(d.slaSupplierDate) && !d.notifiedSlaSupplier) {
                    await this.sendNotif('expert', `مهلت ۳ روزه پاسخ سازنده برای ${d.defectCode} تمام شد.`, d.defectCode);
                    d.notifiedSlaSupplier = true;
                    await OfflineDB.saveDefect(d);
                }
            }

            // ۳. SLA مهلت ۱۵ روزه 8D و رفع ایراد
            if (d.status === 'pending_8d' && d.slaResolutionDate) {
                if (now > new Date(d.slaResolutionDate) && !d.notifiedSlaResolution) {
                    await this.sendNotif('all', `مهلت ۱۵ روزه رفع ایراد ${d.defectCode} تمام شد.`, d.defectCode);
                    d.notifiedSlaResolution = true;
                    await OfflineDB.saveDefect(d);
                }
            }
        }
    },

    sendNotif: async function(user, text, defectCode) {
        const notif = {
            notifId: 'NTF-' + Date.now() + Math.floor(Math.random()*100),
            targetUser: user,
            text: text,
            defectCode: defectCode,
            isRead: false,
            date: new Date().toISOString()
        };
        await OfflineDB.addNotification(notif);
    },

    // تشخیص ایراد تکراری
    checkDuplicate: async function(title, partNo, supplier) {
        const defects = await OfflineDB.getDefects();
        // اگر ایرادی با همین عنوان، قطعه و سازنده در ۳۰ روز اخیر ثبت شده باشد
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        return defects.find(d => 
            d.title === title && 
            d.partNo === partNo && 
            d.supplier === supplier && 
            new Date(d.createdAt) > thirtyDaysAgo
        );
    }
};