async function renderSupplierPerformance() {
    const content = document.getElementById('content-area');
    content.innerHTML = `<p>در حال محاسبه عملکرد...</p>`;
    
    try {
        const res = await fetch('http://localhost:3000/api/suppliers', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('iqdws_token')}` }
        });
        const suppliers = await res.json();
        const me = suppliers[0]; // فرض می‌کنیم کاربر با سازنده اول لاگین کرده است

        const scoreClass = me.score >= 90 ? 'excellent' : me.score >= 75 ? 'good' : me.score >= 60 ? 'warning' : 'danger';

        content.innerHTML = `
            <div class="card" style="max-width: 500px; margin: 0 auto; text-align: center;">
                <h2 style="color:var(--secondary); margin-bottom:20px;">کارنامه کیفیت شما</h2>
                
                <div class="score-circle ${scoreClass}">
                    ${me.score}
                </div>
                <h3 style="margin-top:15px; color:#333;">سطح ${me.tier}</h3>
                <p style="color:#666; font-size:12px; margin-top:5px;">این نمره در سامانه مادر قابل مشاهده است</p>
                
                <div style="margin-top:30px; text-align:right; background:#f9f9f9; padding:15px; border-radius:8px;">
                    <h4 style="font-size:13px; margin-bottom:10px;">اثر اخطارهای فعال:</h4>
                    <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:5px;">
                        <span>کسر امتیاز بابت اخطارها</span>
                        <span style="color:var(--danger); font-weight:bold;">-${95 - me.score} امتیاز</span>
                    </div>
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill" style="width: ${(95 - me.score) * 2}%; background: var(--danger);"></div>
                    </div>
                    <p style="font-size:11px; color:#888; margin-top:10px;">با رفع سریع اخطارها و ارسال ۸D صحیح، نمره شما افزایش می‌یابد.</p>
                </div>
            </div>
        `;
    } catch(e) {
        content.innerHTML = `<p style="color:red;">خطا در اتصال به بک‌اند</p>`;
    }
}