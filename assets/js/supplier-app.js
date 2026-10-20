const session = checkAuth('supplier');
if (session) {
    document.getElementById('user-name').innerText = session.roleName;
}

function navigate(view) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    event.target.classList.add('active');
    
    const content = document.getElementById('content-area');
    
    if (view === 'dashboard') {
        content.innerHTML = `
            <h2 class="card-title">داشبورد سازنده</h2>
            <div class="card" style="border-right: 4px solid var(--secondary);">
                <p>سامانه شما به سامانه مادر متصل است.</p>
                <p>نمره فعلی شما: <b style="color:var(--secondary); font-size:18px;">۸۲</b></p>
            </div>
        `;
    } else if (view === 'inspections') {
        content.innerHTML = `
            <div class="card">
                <h2 class="card-title">بازرسی قطعات پیش از ارسال</h2>
                <p>این بخش به زودی تکمیل می‌شود...</p>
            </div>
        `;
    } else if (view === 'qans') {
        content.innerHTML = `
            <div class="card">
                <h2 class="card-title">اخطارهای دریافتی از سامانه مادر</h2>
                ${db.qans.map(q => `
                    <div style="border:1px solid #eee; padding:10px; margin-bottom:10px; border-radius:6px;">
                        <h4>${q.id} - ${q.title}</h4>
                        <button class="btn btn-primary btn-sm" style="margin-top:10px;">پاسخ ۸D</button>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

window.onload = () => navigate('dashboard');