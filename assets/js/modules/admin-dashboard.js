async function renderAdminDashboard() {
    const content = document.getElementById('content-area');
    content.innerHTML = `<p>در حال دریافت اطلاعات از سرور ابری...</p>`;
    
    try {
        const token = localStorage.getItem('iqdws_token');
        
        // اگر توکن آفلاین باشد، یعنی از سرور لاگین نگرفته‌ایم
        if (!token || token.includes('offline_token')) {
            throw new Error('شما با حالت آفلاین وارد شده‌اید. لطفاً یک بار خارج شده و با اتصال به اینترنت مجدداً وارد شوید.');
        }

        // درخواست به سرور
        const res = await fetch(`${window.API_BASE_URL}/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 401) {
            throw new Error('خطای احراز هویت (401). لطفاً از سیستم خارج شده و مجدداً لاگین کنید.');
        }

        if (!res.ok) {
            throw new Error(`سرور پاسخ خطا داد (${res.status}). لطفاً لاگ‌های رندر را بررسی کنید.`);
        }

        const users = await res.json();

        // اگر به اینجا رسیدیم یعنی اتصال برقرار است
        content.innerHTML = `
            <h2 class="page-title">داشبورد مدیریت اکوسیستم</h2>
            
            <div class="kpi-grid">
                <div class="kpi-card" style="border-right-color: #4a148c;">
                    <div class="kpi-title">کل کاربران سیستم</div>
                    <div class="kpi-value" style="color: #4a148c;">${users.length || 0}</div>
                </div>
            </div>

            <div class="card">
                <div class="card-title">وضعیت سیستم</div>
                <p style="color:green; font-weight:bold;">✅ اتصال به دیتابیس MongoDB Atlas برقرار است.</p>
                <p style="font-size:12px; margin-top:10px;">شما در حال مشاهده داده‌های واقعی از سرور Render هستید.</p>
            </div>
        `;
    } catch (error) {
        // نمایش خطای دقیق به جای پیام کلی
        content.innerHTML = `
            <div class="alert-box" style="background:#ffebee; color:#c62828; border-right:4px solid #c62828;">
                <strong style="display:block; margin-bottom:10px; font-size:15px;">خطا در اتصال به بک‌اند</strong>
                <div style="font-size:13px; line-height:1.6;">${error.message}</div>
                <br>
                <button class="btn btn-sm btn-outline" style="color:#c62828; border-color:#c62828;" onclick="logout()">خروج و لاگین مجدد</button>
            </div>
        `;
    }
}