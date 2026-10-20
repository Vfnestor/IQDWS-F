function renderUserManagement() {
    const content = document.getElementById('content-area');
    const users = JSON.parse(localStorage.getItem('iqdws_users'));
    
    // جدا کردن کاربران داخلی از سازندگان
    const internalUsers = users.filter(u => u.role !== 'supplier');
    const supplierUsers = users.filter(u => u.role === 'supplier');

    content.innerHTML = `
        <div style="display:flex; gap:15px; margin-bottom:20px;">
            <button class="btn btn-outline" onclick="renderUserManagement()" style="border-color:#4a148c; color:#4a148c;">کاربران داخلی</button>
            <button class="btn btn-primary" onclick="renderSupplierManagement()" style="background:#4a148c;">مدیریت سازندگان</button>
        </div>

        <div class="card" style="margin-bottom: 20px;">
            <h2 class="card-title">ایجاد حساب کاربری جدید (کارمندان)</h2>
            <form onsubmit="createInternalUser(event)">
                <div class="form-row">
                    <div class="form-col">
                        <div class="form-field"><label>نام کاربری (کد پرسنلی) <span class="req">*</span></label><input type="text" id="u_username" class="form-control" required></div>
                    </div>
                    <div class="form-col">
                        <div class="form-field"><label>رمز عبور اولیه <span class="req">*</span></label><input type="text" id="u_password" class="form-control" value="123456" required></div>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-col"><div class="form-field"><label>نام <span class="req">*</span></label><input type="text" id="u_firstname" class="form-control" required></div></div>
                    <div class="form-col"><div class="form-field"><label>نام خانوادگی <span class="req">*</span></label><input type="text" id="u_lastname" class="form-control" required></div></div>
                </div>
                <div class="form-field">
                    <label>نقش <span class="req">*</span></label>
                    <select id="u_role" class="form-control" required>
                        <option value="inspector">بازرس خط</option>
                        <option value="expert">کارشناس قطعه</option>
                        <option value="dept_head">مسول بخش</option>
                        <option value="office_head">رئیس اداره</option>
                        <option value="manager">مدیر کیفیت (ناظر)</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary" style="margin-top:15px; background-color:#4a148c;">ایجاد کاربر</button>
            </form>
        </div>

        <div class="card">
            <h2 class="card-title">لیست کاربران داخلی</h2>
            <div class="table-wrapper">
                <table>
                    <thead><tr><th>کد پرسنلی</th><th>نام و نام خانوادگی</th><th>نقش</th><th>وضعیت رمز</th></tr></thead>
                    <tbody>
                        ${internalUsers.map(u => `
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

function renderSupplierManagement() {
    const content = document.getElementById('content-area');
    const users = JSON.parse(localStorage.getItem('iqdws_users'));
    const supplierUsers = users.filter(u => u.role === 'supplier');

    content.innerHTML = `
        <div style="display:flex; gap:15px; margin-bottom:20px;">
            <button class="btn btn-outline" onclick="renderUserManagement()" style="border-color:#4a148c; color:#4a148c;">کاربران داخلی</button>
            <button class="btn btn-primary" onclick="renderSupplierManagement()" style="background:#4a148c;">مدیریت سازندگان</button>
        </div>

        <div class="card" style="margin-bottom: 20px;">
            <h2 class="card-title">ایجاد اکانت برای سازنده جدید</h2>
            <form onsubmit="createSupplierUser(event)">
                <div class="form-row">
                    <div class="form-col">
                        <div class="form-field"><label>نام شرکت (نام کاربری) <span class="req">*</span></label><input type="text" id="s_username" class="form-control" placeholder="مثال: pars_elec" required></div>
                    </div>
                    <div class="form-col">
                        <div class="form-field"><label>رمز عبور اولیه <span class="req">*</span></label><input type="text" id="s_password" class="form-control" value="123456" required></div>
                    </div>
                </div>
                <div class="form-field">
                    <label>نام کامل شرکت (نمایش در سیستم) <span class="req">*</span></label>
                    <input type="text" id="s_company_name" class="form-control" placeholder="مثال: الکترونیک پارس" required>
                </div>
                <button type="submit" class="btn btn-primary" style="margin-top:15px; background-color:#4a148c;">ایجاد اکانت سازنده</button>
            </form>
        </div>

        <div class="card">
            <h2 class="card-title">لیست اکانت‌های سازندگان</h2>
            <div class="table-wrapper">
                <table>
                    <thead><tr><th>نام کاربری</th><th>نام شرکت</th><th>نقش</th><th>وضعیت رمز</th></tr></thead>
                    <tbody>
                        ${supplierUsers.map(u => `
                            <tr>
                                <td style="font-family:monospace; font-weight:bold;">${u.username}</td>
                                <td>${u.companyName}</td>
                                <td>${roleNames[u.role]}</td>
                                <td>${u.isFirstLogin ? '<span style="color:#c62828;">در انتظار تغییر</span>' : '<span style="color:#2e7d32;">فعال</span>'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function createInternalUser(e) {
    e.preventDefault();
    let users = JSON.parse(localStorage.getItem('iqdws_users'));
    const username = document.getElementById('u_username').value.trim();

    if (users.find(u => u.username === username)) return alert('این نام کاربری قبلاً ثبت شده است.');

    users.push({
        username,
        password: document.getElementById('u_password').value,
        firstName: document.getElementById('u_firstname').value.trim(),
        lastName: document.getElementById('u_lastname').value.trim(),
        role: document.getElementById('u_role').value,
        isFirstLogin: true
    });

    localStorage.setItem('iqdws_users', JSON.stringify(users));
    Utils.toast('کاربر داخلی ایجاد شد');
    renderUserManagement();
}

function createSupplierUser(e) {
    e.preventDefault();
    let users = JSON.parse(localStorage.getItem('iqdws_users'));
    const username = document.getElementById('s_username').value.trim();

    if (users.find(u => u.username === username)) return alert('این نام کاربری قبلاً ثبت شده است.');

    users.push({
        username,
        password: document.getElementById('s_password').value,
        companyName: document.getElementById('s_company_name').value.trim(),
        role: 'supplier',
        isFirstLogin: true
    });

    localStorage.setItem('iqdws_users', JSON.stringify(users));
    Utils.toast('اکانت سازنده ایجاد شد');
    renderSupplierManagement();
}