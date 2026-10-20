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
    // اصلاح باگ: استفاده از تگ option برای ساخت صحیح لیست کشویی
    roleSelect.innerHTML = roles[appName].map(r => `<option value="${r.id}">${r.name}</option>`).join('');
    
    document.getElementById('login-btn').disabled = false;
}

function handleLogin() {
    const roleId = document.getElementById('role-select').value;
    const roleName = roles[selectedApp].find(r => r.id === roleId).name;
    
    // ذخیره سشن (برای نسخه اولیه از توکن ساده استفاده می‌کنیم)
    localStorage.setItem('iqdws_session', JSON.stringify({
        app: selectedApp,
        roleId: roleId,
        roleName: roleName
    }));
    
    if (selectedApp === 'main') window.location.href = 'main.html';
    else if (selectedApp === 'supplier') window.location.href = 'supplier.html';
    else if (selectedApp === 'admin') window.location.href = 'admin.html';
}

function checkAuth(expectedApp) {
    const sessionStr = localStorage.getItem('iqdws_session');
    if (!sessionStr) {
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
    window.location.href = 'index.html';
}