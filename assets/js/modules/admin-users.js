function renderUserManagement() {
    const content = document.getElementById('content-area');
    const users = JSON.parse(localStorage.getItem('iqdws_users'));

    content.innerHTML = `
        <div class="card" style="margin-bottom: 20px;">
            <h2 class="card-title">ایجاد حساب کاربری جدید</h2>
            <form onsubmit="createUser(event)">
                <div class="form-row">
                    <div class="form-col">
                        <div class="form-field">
                            <label>نام کاربری (کد پرسنلی) <span class="req">*</span></label>
                            <input type="text" id="u_username" class="form-control" required>
                        </div>
                    </div>
                    <div class="form-col">
                        <div class="form-field">
                            <label>رمز عبور اولیه <span class="req">*</span></label>
                            <input type="text" id="u_password" class="form-control" value="123456" required>
                        </div>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-col">
                        <div class="form-field">
                            <label>نام <span class="req">*</span></label>
                            <input type="text" id="u_firstname" class="form-control" required>
                        </div>
                    </div>
                    <div class="form-col">
                        <div class="form-field">
                            <label>نام خانوادگی <span class="req">*</span></label>
                            <input type="text" id="u_lastname" class="form-control" required>
                        </div>
                    </div>
                </div>
                <div class="form-field">
                    <label>نقش <span class="req">*</span></label>
                    <select id="u_role" class="form-control" required>
                        <option value="inspector">بازرس خط</option>
                        <option value="expert">کارشناس قطعه</option>
                        <option value="dept_head">مسول بخش</option>
                        <option value="office_head">رئیس اداره</option>
                        <option value="manager">مدیر کیفیت (ناظر)</option>
                        <option value="s_inspector">بازرس سازنده</option>
                        <option value="s_engineer">مهندس سازنده</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary" style="margin-top:15px; background-color:#4a148c;">ایجاد کاربر</button>
            </form>
        </div>

        <div class="card">
            <h2 class="card-title">لیست کاربران سیستم</h2>
            <div class="table-wrapper">
                <table>
                    <thead><tr><th>کد پرسنلی</th><th>نام و نام خانوادگی</th><th>نقش</th><th>وضعیت رمز</th></tr></thead>
                    <tbody>
                        ${users.map(u => `
                            <tr>
                                <td style="font-family:monospace; font-weight:bold;">${u.username}</td>
                                <td>${u.firstName} ${u.lastName}</td>
                                <td>${roleNames[u.role] || u.role}</td>
                                <td>${u.isFirstLogin ? '<span style="color:#c62828;">در انتظار تغییر</span>' : '<span style="color:#2e7d32;">فعال</span>'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function createUser(e) {
    e.preventDefault();
    const username = document.getElementById('u_username').value.trim();
    const password = document.getElementById('u_password').value;
    const firstName = document.getElementById('u_firstname').value.trim();
    const lastName = document.getElementById('u_lastname').value.trim();
    const role = document.getElementById('u_role').value;

    let users = JSON.parse(localStorage.getItem('iqdws_users'));

    if (users.find(u => u.username === username)) {
        return alert('این نام کاربری (کد پرسنلی) قبلاً ثبت شده است.');
    }

    users.push({
        username, password, firstName, lastName, role,
        isFirstLogin: true // اجبار به تغییر رمز در اولین ورود
    });

    localStorage.setItem('iqdws_users', JSON.stringify(users));
    Utils.toast('کاربر جدید با موفقیت ایجاد شد');
    renderUserManagement();
}