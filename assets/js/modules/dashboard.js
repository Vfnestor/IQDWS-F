function renderDashboard() {
    const content = document.getElementById('content-area');
    const defects = API.getDefects();
    const qans = API.getQANs();
    
    const openDefects = defects.filter(d => d.status !== 'closed').length;
    const criticalDefects = defects.filter(d => d.severity === 'critical' && d.status !== 'closed').length;

    content.innerHTML = `
        <h2 class="page-title">داشبورد مدیریت</h2>
        <div class="kpi-grid">
            <div class="kpi-card">
                <div class="kpi-title">کل ایرادهای باز</div>
                <div class="kpi-value">${openDefects}</div>
            </div>
            <div class="kpi-card" style="border-right-color: var(--danger);">
                <div class="kpi-title">ایرادهای بحرانی</div>
                <div class="kpi-value" style="color: var(--danger);">${criticalDefects}</div>
            </div>
            <div class="kpi-card" style="border-right-color: var(--warning);">
                <div class="kpi-title">اخطارهای کیفی</div>
                <div class="kpi-value" style="color: var(--warning);">${qans.length}</div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-title">آخرین ایرادهای ثبت‌شده</div>
            <div class="table-wrapper">
                <table>
                    <thead><tr><th>شناسه</th><th>عنوان</th><th>شدت</th><th>وضعیت</th></tr></thead>
                    <tbody>
                        ${defects.slice(-5).reverse().map(d => `
                            <tr>
                                <td>${d.id}</td>
                                <td>${d.title}</td>
                                <td><span class="badge sev-${d.severity}">${d.severity}</span></td>
                                <td><span class="badge status-${d.status}">${d.status}</span></td>
                            </tr>
                        `).join('') || '<tr><td colspan="4" style="text-align:center;">داده‌ای یافت نشد</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}