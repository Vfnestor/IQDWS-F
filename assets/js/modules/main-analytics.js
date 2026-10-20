async function renderMainAnalytics() {
    const content = document.getElementById('content-area');
    content.innerHTML = `<p>در حال دریافت امتیازات سازندگان از سرور ابری...</p>`;
    
    try {
        const res = await fetch(`${API_BASE_URL}/suppliers`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('iqdws_token')}` }
        });
        const suppliers = await res.json();

        content.innerHTML = `
            <h2 class="page-title">عملکرد و نمره‌دهی سازندگان</h2>
            <div class="kpi-grid">
                ${suppliers.map(s => `
                    <div class="kpi-card" style="text-align:center; border-right-color: ${s.tier === 'A' ? '#2e7d32' : s.tier === 'B' ? '#1a5a99' : '#c62828'};">
                        <div class="kpi-title" style="font-size:14px; font-weight:bold; color:#333;">${s.name}</div>
                        <div style="font-size:36px; font-weight:bold; color:var(--primary); margin:10px 0;">${s.score}</div>
                        <div style="font-size:12px; color:#666;">سطح ${s.tier}</div>
                        <div style="font-size:11px; margin-top:10px; color:#888;">تیر ${s.tier === 'A' ? '۱ (راهبردی)' : '۲'}</div>
                    </div>
                `).join('')}
            </div>
        `;
    } catch(e) {
        content.innerHTML = `<p style="color:red;">خطا در اتصال به بک‌اند ابری</p>`;
    }
}