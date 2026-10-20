const roleNames = {
    'inspector': 'بازرس خط', 'expert': 'کارشناس قطعه', 'dept_head': 'مسول بخش',
    'office_head': 'رئیس اداره', 'manager': 'مدیر کیفیت',
    'sys_admin': 'مدیر سیستم', 'support': 'پشتیبان',
    'supplier': 'تأمین‌کننده (سازنده)' // نقش جدید
};

function initUsersDB() {
    if (!localStorage.getItem('iqdws_users')) {
        const defaultUsers = [
            { username: 'admin', password: 'admin', firstName: 'وحید', lastName: 'فدایی', role: 'sys_admin', isFirstLogin: false },
            { username: '101', password: '123456', firstName: 'رضا', lastName: 'رضایی', role: 'inspector', isFirstLogin: true },
            { username: '102', password: '123456', firstName: 'محمد', lastName: 'محمدی', role: 'expert', isFirstLogin: true },
            { username: '103', password: '123456', firstName: 'حسین', lastName: 'حسینی', role: 'dept_head', isFirstLogin: true },
            { username: '104', password: '123456', firstName: 'علی', lastName: 'کریمی', role: 'office_head', isFirstLogin: true },
            // کاربر سازنده نمونه (نام کاربری بر اساس شرکت)
            { username: 'pars_elec', password: '123456', companyName: 'الکترونیک پارس', role: 'supplier', isFirstLogin: true }
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
    
    // ساخت شیء سشن
    const sessionData = {
        username: user.username,
        roleId: user.role,
        roleName: roleNames[user.role]
    };

    // اگر کاربر سازنده بود، نام شرکت را ذخیره کن، در غیر این صورت نام و نام خانوادگی
    if (user.role === 'supplier') {
        sessionData.displayName = user.companyName;
    } else {
        sessionData.displayName = `${user.firstName} ${user.lastName}`;
    }

    localStorage.setItem('iqdws_session', JSON.stringify(sessionData));

    // هدایت بر اساس نقش
    if (user.role === 'supplier') {
        window.location.href = 'supplier.html';
    } else if (['sys_admin', 'support'].includes(user.role)) {
        window.location.href = 'admin.html';
    } else {
        window.location.href = 'main.html'; // بازرس، کارشناس، مدیر و...
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