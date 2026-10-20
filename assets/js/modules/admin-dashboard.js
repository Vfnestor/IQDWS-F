async function renderAdminDashboard() {
    const content = document.getElementById('content-area');
    content.innerHTML = `<p>در حال دریافت آمار از سرور...</p>`;
    
    try {
        const data = await AdminAPI.getStats();
        
        content.innerHTML = `
            <h2 class="page-title">آمار کلی اکوسیستم</h2>
            <div class="kpi-grid">
                <div class="kpi-card" style="border-right-color: #4a148c;">
                    <div class="kpi-title">کل ایرادهای ثبت‌شده</div>
                    <div class="kpi-value" style="color: #4a148c;">${data.defects.length}</div>
                </div>
                <div class="kpi-card" style="border-right-color: var(--warning);">
                    <div class="kpi-title">اخطارهای کیفی صادرشده</div>
                    <div class="kpi-value" style="color: var(--warning);">${data.qans.length}</div>
                </div>
                <div class="kpi-card" style="border-right-color: var(--secondary);">
                    <div class="kpi-title">سیستم‌های متصل</div>
                    <div class="kpi-value" style="color: var(--secondary);">۲</div>
                </div>
            </div>

            <div class="card">
                <div class="card-title">آخرین فعالیت‌ها در سامانه مادر</div>
                <div class="table-wrapper">
                    <table>
                        <thead><tr><th>نوع</th><th>شناسه</th><th>عنوان</th><th>وضعیت</th></tr></thead>
                        <tbody>
                            ${data.defects.slice(0, 5).map(d => `
                                <tr>
                                    <td><span class="badge status-registered">ایراد</span></td>
                                    <td>${d.id.substring(0,8)}...</td>
                                    <td>${d.title}</td>
                                    <td>${d.status}</td>
                                </tr>
                            `).join('') || '<tr><td colspan="4" style="text-align:center;">داده‌ای یافت نشد</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } catch (error) {
        content.innerHTML = `<p style="color:red;">خطا در اتصال به بک‌اند: ${error.message}</p>`;
    }
}