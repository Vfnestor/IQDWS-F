async function renderAdminDashboard() {
    const content = document.getElementById('content-area');
    content.innerHTML = `<p>در حال برقراری ارتباط با هسته سیستم...</p>`;
    
    try {
        const data = await AdminAPI.getStats();
        const health = await AdminAPI.getSystemHealth();
        
        content.innerHTML = `
            <h2 class="page-title">داشبورد مدیریت اکوسیستم</h2>
            
            <div class="kpi-grid">
                <div class="kpi-card" style="border-right-color: #4a148c;">
                    <div class="kpi-title">کل ایرادها</div>
                    <div class="kpi-value" style="color: #4a148c;">${data.defects.length}</div>
                </div>
                <div class="kpi-card" style="border-right-color: var(--warning);">
                    <div class="kpi-title">اخطارهای کیفی</div>
                    <div class="kpi-value" style="color: var(--warning);">${data.qans.length}</div>
                </div>
                <div class="kpi-card" style="border-right-color: var(--danger);">
                    <div class="kpi-title">باگ‌های باز</div>
                    <div class="kpi-value" style="color: var(--danger);">${data.bugs.filter(b => b.status === 'open').length}</div>
                </div>
                <div class="kpi-card" style="border-right-color: var(--secondary);">
                    <div class="kpi-title">وضعیت سرور</div>
                    <div class="kpi-value" style="color: var(--secondary); font-size: 18px;">${health.status === 'online' ? '✅ آنلاین' : 'قطع'}</div>
                </div>
            </div>

            <div class="card">
                <div class="card-title">اطلاعات فنی سیستم</div>
                <table>
                    <tr><td>نسخه نرم‌افزار</td><td>${health.version}</td></tr>
                    <tr><td>وضعیت دیتابیس</td><td>${health.database}</td></tr>
                    <tr><td>مدت زمان فعالیت (Uptime)</td><td>${Math.floor(health.uptime)} ثانیه</td></tr>
                </table>
            </div>
        `;
    } catch (error) {
        content.innerHTML = `<div class="alert-box" style="background:#ffebee; color:#c62828;">خطا در اتصال به بک‌اند: لطفا سرور را روشن کنید.</div>`;
    }
}