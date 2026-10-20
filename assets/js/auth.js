const roles = {
    main: [
        { id: 'inspector', name: 'بازرس خط' },
        { id: 'expert', name: 'کارشناس قطعه' },
        { id: 'dept_head', name: 'مسول بخش' },
        { id: 'office_head', name: 'رئیس اداره' },
        { id: 'manager', name: 'مدیر کیفیت (ناظر)' }
    ],
    supplier: [
        { id: 's_inspector', name: 'بازرس سازنده' },
        { id: 's_engineer', name: 'مهندس سازنده' }
    ],
    admin: [
        { id: 'sys_admin', name: 'مدیر سیستم' },
        { id: 'support', name: 'پشتیبان نرم‌افزار' }
    ]
};

let selectedApp = null;

function selectApp(appName) {
    selectedApp = appName;
    document.querySelectorAll('.app-tile').forEach(el => el.classList.remove('selected'));
    document.getElementById(`tile-${appName}`).classList.add('selected');
    
    const roleContainer = document.getElementById('role-container');
    const roleSelect = document.getElementById('role-select');
    
    roleContainer.style.display = 'block';
    roleSelect.innerHTML = roles[appName].map(r => `<option value="${r.id}">${r.name}</option>`).join('');
    
    document.getElementById('login-btn').disabled = false;
}

async function handleLogin() {
    const roleId = document.getElementById('role-select').value;
    const roleName = roles[selectedApp].find(r => r.id === roleId).name;
    const loginBtn = document.getElementById('login-btn');
    
    loginBtn.disabled = true;
    loginBtn.innerText = 'در حال اتصال به سرور...';

    try {
        const targetURL = `${window.API_BASE_URL}/auth/login`;
        console.log("Connecting to:", targetURL); // برای دیباگ در کنسول

        const res = await fetch(targetURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: roleId, app: selectedApp })
        });

        if (!res.ok) throw new Error(`سرور پاسخ خطا داد: ${res.status}`);
        
        const data = await res.json();

        localStorage.setItem('iqdws_token', data.token);
        localStorage.setItem('iqdws_session', JSON.stringify({
            app: selectedApp,
            roleId: roleId,
            roleName: roleName
        }));
        
        if (selectedApp === 'main') window.location.href = 'main.html';
        else if (selectedApp === 'supplier') window.location.href = 'supplier.html';
        else if (selectedApp === 'admin') window.location.href = 'admin.html';

    } catch (error) {
        // نمایش دقیق خطا برای فهمیدن مشکل
        alert('خطای اتصال: ' + error.message + '\n\nمطمئن شوید آدرس بک‌اند در config.js درست است.');
        loginBtn.disabled = false;
        loginBtn.innerText = 'ورود به سامانه';
    }
}

function checkAuth(expectedApp) {
    const sessionStr = localStorage.getItem('iqdws_session');
    const token = localStorage.getItem('iqdws_token');
    
    if (!sessionStr || !token) {
        window.location.href = 'index.html';
        return null;
    }
    
    const session = JSON.parse(sessionStr);
    if (session.app !== expectedApp) {
        window.location.href = 'index.html';
        return null;
    }
    return session;
}

function logout() {
    localStorage.removeItem('iqdws_session');
    localStorage.removeItem('iqdws_token');
    window.location.href = 'index.html';
}