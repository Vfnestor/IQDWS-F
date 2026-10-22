async function renderAdminDashboard() {
    const content = document.getElementById('content-area');
    content.innerHTML = `<p>در حال خواندن اطلاعات از حافظه محلی...</p>`;
    
    try {
        const data = await AdminAPI.getStats();
        
        content.innerHTML = `
            <h2 class="page-title">داشبورد مدیریت اکوسیستم (حالت آفلاین)</h2>
            <div class="kpi-grid">
                <div class="kpi-card" style="border-right-color: #4a148c;">
                    <div class="kpi-title">کل کاربران</div>
                    <div class="kpi-value" style="color: #4a148c;">${data.users.length}</div>
                </div>
                <div class="kpi-card" style="border-right-color: var(--warning);">
                    <div class="kpi-title">کل ایرادها</div>
                    <div class="kpi-value" style="color: var(--warning);">${data.defects.length}</div>
                </div>
                <div class="kpi-card" style="border-right-color: var(--danger);">
                    <div class="kpi-title">اخطارها</div>
                    <div class="kpi-value" style="color: var(--danger);">${data.qans.length}</div>
                </div>
            </div>

            <div class="card">
                <div class="card-title">اطلاعات فنی</div>
                <table>
                    <tr><td>وضعیت سیستم</td><td><span style="color:#2e7d32; font-weight:bold;">✅ آفلاین (متصل به حافظه محلی)</span></td></tr>
                    <tr><td>حافظه کاربران</td><td>LocalStorage</td></tr>
                    <tr><td>حافظه ایرادها و اخطارها</td><td>IndexedDB</td></tr>
                </table>
            </div>
        `;
    } catch (error) {
        content.innerHTML = `<div class="alert-box" style="background:#ffebee; color:#c62828;">خطا: ${error.message}</div>`;
    }
}