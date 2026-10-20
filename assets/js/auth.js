const roleNames = {
    'inspector': 'بازرس خط', 'expert': 'کارشناس قطعه', 'dept_head': 'مسول بخش',
    'office_head': 'رئیس اداره', 'manager': 'مدیر کیفیت',
    'sys_admin': 'مدیر سیستم', 'support': 'پشتیبان',
    's_inspector': 'بازرس سازنده', 's_engineer': 'مهندس سازنده'
};

// مقداردهی اولیه دیتابیس کاربران (برای تست آفلاین)
function initUsersDB() {
    if (!localStorage.getItem('iqdws_users')) {
        const defaultUsers = [
            { username: 'admin', password: 'admin', firstName: 'وحید', lastName: 'فدایی', role: 'sys_admin', isFirstLogin: false },
            { username: '101', password: '123456', firstName: 'رضا', lastName: 'رضایی', role: 'inspector', isFirstLogin: true },
            { username: '102', password: '123456', firstName: 'محمد', lastName: 'محمدی', role: 'expert', isFirstLogin: true },
            { username: '103', password: '123456', firstName: 'حسین', lastName: 'حسینی', role: 'dept_head', isFirstLogin: true },
            { username: '104', password: '123456', firstName: 'علی', lastName: 'کریمی', role: 'office_head', isFirstLogin: true },
            { username: '105', password: '123456', firstName: 'سعید', lastName: 'احمدی', role: 's_inspector', isFirstLogin: true }
        ];
        localStorage.setItem('iqdws_users', JSON.stringify(defaultUsers));
    }
}
initUsersDB();

async function handleLogin(e) {
    e.preventDefault();
    const userIn = document.getElementById('login-username').value.trim();
    const passIn = document.getElementById('login-password').value;
    const btn = document.getElementById('login-btn');

    btn.disabled = true;
    btn.innerText = 'در حال بررسی...';

    // شبیه‌سازی تاخیر شبکه
    setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('iqdws_users'));
        const user = users.find(u => u.username === userIn && u.password === passIn);

        if (!user) {
            alert('نام کاربری یا رمز عبور اشتباه است.');
            btn.disabled = false;
            btn.innerText = 'ورود به سامانه';
            return;
        }

        if (user.isFirstLogin) {
            // درخواست تغییر رمز
            Utils.openModal(`
                <h3 style="color:var(--primary); margin-bottom:15px;">تغییر رمز عبور (اجباری)</h3>
                <p style="font-size:12px; color:#666; margin-bottom:15px;">از آنجا که این اولین ورود شماست، لطفاً رمز عبور خود را تغییر دهید.</p>
                <div class="form-field">
                    <label>رمز عبور جدید</label>
                    <input type="password" id="new-password" class="form-control" required>
                </div>
                <button class="btn btn-primary" style="width:100%; margin-top:10px;" onclick="changeFirstPassword('${userIn}')">ذخیره و ورود</button>
            `);
            btn.disabled = false;
            btn.innerText = 'ورود به سامانه';
            return;
        }

        loginSuccess(user);
    }, 500);
}

function changeFirstPassword(username) {
    const newPass = document.getElementById('new-password').value;
    if(newPass.length < 4) return alert('رمز عبور باید حداقل ۴ کاراکتر باشد.');

    let users = JSON.parse(localStorage.getItem('iqdws_users'));
    const userIndex = users.findIndex(u => u.username === username);
    
    users[userIndex].password = newPass;
    users[userIndex].isFirstLogin = false;
    localStorage.setItem('iqdws_users', JSON.stringify(users));

    Utils.closeModal();
    loginSuccess(users[userIndex]);
}

function loginSuccess(user) {
    localStorage.setItem('iqdws_token', 'offline_token_' + Date.now());
    localStorage.setItem('iqdws_session', JSON.stringify({
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        roleId: user.role,
        roleName: roleNames[user.role]
    }));

    // هدایت بر اساس نقش
    if (['inspector', 'expert', 'dept_head', 'office_head', 'manager'].includes(user.role)) {
        window.location.href = 'main.html';
    } else if (['s_inspector', 's_engineer'].includes(user.role)) {
        window.location.href = 'supplier.html';
    } else if (['sys_admin', 'support'].includes(user.role)) {
        window.location.href = 'admin.html';
    }
}

function checkAuth() {
    const sessionStr = localStorage.getItem('iqdws_session');
    const token = localStorage.getItem('iqdws_token');
    
    if (!sessionStr || !token) {
        window.location.href = 'index.html';
        return null;
    }
    return JSON.parse(sessionStr);
}

function logout() {
    localStorage.removeItem('iqdws_session');
    localStorage.removeItem('iqdws_token');
    window.location.href = 'index.html';
}