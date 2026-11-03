const BackupManager = {
    // استخراج کل دیتابیس و ذخیره روی گوشی به صورت فایل JSON
    exportData: async function() {
        try {
            const data = {
                defects: await OfflineDB.getDefects(),
                qans: await OfflineDB.getQANs(),
                claims: await OfflineDB.getClaims(),
                analysis: await OfflineDB.getAnalysisTasks(),
                operator_errors: await OfflineDB.getOperatorErrors(),
                users: JSON.parse(localStorage.getItem('iqdws_users') || '[]'),
                defect_titles: JSON.parse(localStorage.getItem('iqdws_defect_titles') || '[]')
            };

            const dataStr = JSON.stringify(data, null, 2);
            const blob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `IQDWS_Backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            Utils.toast('فایل پشتیبان با موفقیت دانلود شد.');
        } catch (error) {
            Utils.toast('خطا در ایجاد فایل پشتیبان: ' + error.message, 'error');
        }
    },

    // بازگردانی دیتابیس از فایل JSON
    importData: function(file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if(!data.defects || !data.qans) throw new Error('ساختار فایل نامعتبر است.');

                // بازگردانی کاربران
                if(data.users) localStorage.setItem('iqdws_users', JSON.stringify(data.users));
                if(data.defect_titles) localStorage.setItem('iqdws_defect_titles', JSON.stringify(data.defect_titles));

                // بازگردانی دیتابیس محلی
                for (let d of (data.defects || [])) await OfflineDB.saveDefect(d);
                for (let q of (data.qans || [])) await OfflineDB.saveQAN(q);
                for (let c of (data.claims || [])) await OfflineDB.saveClaim(c);
                for (let a of (data.analysis || [])) await OfflineDB.saveAnalysisTask(a);
                for (let o of (data.operator_errors || [])) await OfflineDB.saveOperatorError(o);

                Utils.toast('اطلاعات با موفقیت بازگردانی شد. سیستم رفرش می‌شود.');
                setTimeout(() => window.location.reload(), 1500);
            } catch (error) {
                Utils.toast('خطا در خواندن فایل: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    }
};