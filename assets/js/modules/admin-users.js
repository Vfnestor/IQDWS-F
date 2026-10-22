let adminUserView = 'list';
let activityTargetUser = null;
let currentSearchFilter = { role: '', username: '', defectCode: '' };

async function renderUserManagement() {
    const content = document.getElementById('content-area');
    
    if (adminUserView === 'create') return renderCreateUserForm(content);
    if (adminUserView === 'activity' && activityTargetUser) return renderUserActivityLog(content, activityTargetUser);

    const users = await AdminAPI.getUsers();

    let filteredUsers = users.filter(u => {
        const matchRole = currentSearchFilter.role ? u.role === currentSearchFilter.role : true;
        const matchUsername = currentSearchFilter.username ? (u.username.includes(currentSearchFilter.username) || (u.firstName && u.firstName.includes(currentSearchFilter.username)) || (u.companyName && u.companyName.includes(currentSearchFilter.username))) : true;
        return matchRole && matchUsername;
    });

    content.innerHTML = `
        <div class="card" style="background:#f8f9fa; border-right:4px solid var(--primary);">
            <h3 style="margin-bottom:15px; color:var(--primary); font-size:14px;">جستجوی پیشرفته</h3>
            <div class="form-row">
                <div class="form-col"><div class="form-field"><label>نام کاربری / نام</label><input type="text" id="search_username" class="form-control" value="${currentSearchFilter.username}"></div></div>
                <div class="form-col">
                    <div class="form-field">
                        <label>نقش کاربری</label>
                        <select id="search_role" class="form-control">
                            <option value="">همه نقش‌ها</option>
                            <option value="inspector" ${currentSearchFilter.role === 'inspector' ? 'selected' : ''}>بازرس خط</option>
                            <option value="expert" ${currentSearchFilter.role === 'expert' ? 'selected' : ''}>کارشناس قطعه</option>
                            <option value="dept_head" ${currentSearchFilter.role === 'dept_head' ? 'selected' : ''}>مسول بخش</option>
                            <option value="office_head" ${currentSearchFilter.role === 'office_head' ? 'selected' : ''}>رئیس اداره</option>
                            <option value="supplier" ${currentSearchFilter.role === 'supplier' ? 'selected' : ''}>سازنده</option>
                        </select>
                    </div>
                </div>
            </div>
            <div style="display:flex; gap:10px;">
                <button class="btn btn-primary" onclick="applyUserSearch()">اعمال فیلتر</button>
                <button class="btn btn-outline" onclick="resetUserSearch()">حذف فیلترها</button>
            </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
            <h2 style="color:var(--primary); font-size:16px;">لیست کاربران (${filteredUsers.length} نفر)</h2>
            <button class="btn btn-primary" style="background-color:#4a148c;" onclick="openCreateUserForm()">➕ ایجاد کاربر جدید</button>
        </div>

        <div class="card">
            <div class="table-wrapper">
                <table>
                    <thead><tr><th>نام کاربری</th><th>نام / شرکت</th><th>نقش</th><th>وضعیت</th><th>عملیات</th></tr></thead>
                    <tbody>
                        ${filteredUsers.map(u => {
                            const displayName = u.role === 'supplier' ? u.companyName : `${u.firstName} ${u.lastName}`;
                            return `
                            <tr>
                                <td style="font-family:monospace; font-weight:bold;">${u.username}</td>
                                <td>${displayName}</td>
                                <td>${roleNames[u.role] || u.role}</td>
                                <td>${u.isFirstLogin ? '<span style="color:#c62828;">در انتظار تغییر</span>' : '<span style="color:#2e7d32;">فعال</span>'}</td>
                                <td><button class="btn btn-sm btn-outline" onclick="viewUserActivity('${u.username}')">📈 مشاهده عملکرد</button></td>
                            </tr>
                        `}).join('') || '<tr><td colspan="5" style="text-align:center;">کاربری یافت نشد</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function applyUserSearch() {
    currentSearchFilter = {
        role: document.getElementById('search_role').value,
        username: document.getElementById('search_username').value.trim(),
        defectCode: ''
    };
    renderUserManagement();
}

function resetUserSearch() {
    currentSearchFilter = { role: '', username: '', defectCode: '' };
    renderUserManagement();
}

function openCreateUserForm() { adminUserView = 'create'; renderUserManagement(); }
function viewUserActivity(username) { activityTargetUser = username; adminUserView = 'activity'; renderUserManagement(); }

function renderCreateUserForm(content) {
    content.innerHTML = `
        <div style="margin-bottom:15px;"><button class="btn btn-outline" onclick="adminUserView='list'; renderUserManagement();">← بازگشت</button></div>
        <div class="card">
            <h2 class="card-title">ایجاد کاربر جدید</h2>
            <form onsubmit="createInternalUser(event)">
                <div class="form-row">
                    <div class="form-col"><div class="form-field"><label>نام کاربری <span class="req">*</span></label><input type="text" id="u_username" class="form-control" required></div></div>
                    <div class="form-col"><div class="form-field"><label>رمز عبور <span class="req">*</span></label><input type="text" id="u_password" class="form-control" value="123456" required></div></div>
                </div>
                <div class="form-row">
                    <div class="form-col"><div class="form-field"><label>نام</label><input type="text" id="u_firstname" class="form-control"></div></div>
                    <div class="form-col"><div class="form-field"><label>نام خانوادگی</label><input type="text" id="u_lastname" class="form-control"></div></div>
                </div>
                <div class="form-row">
                    <div class="form-col">
                        <div class="form-field">
                            <label>نقش</label>
                            <select id="u_role" class="form-control" required onchange="document.getElementById('company_field').style.display = this.value === 'supplier' ? 'block' : 'none'">
                                <option value="inspector">بازرس خط</option>
                                <option value="expert">کارشناس قطعه</option>
                                <option value="dept_head">مسول بخش</option>
                                <option value="office_head">رئیس اداره</option>
                                <option value="supplier">سازنده</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-col" id="company_field" style="display:none;">
                        <div class="form-field"><label>نام شرکت سازنده</label><input type="text" id="u_company" class="form-control"></div>
                    </div>
                </div>
                <button type="submit" class="btn btn-primary" style="margin-top:15px; background-color:#4a148c;">ایجاد کاربر</button>
            </form>
        </div>
    `;
}

async function createInternalUser(e) {
    e.preventDefault();
    let users = JSON.parse(localStorage.getItem('iqdws_users'));
    const username = document.getElementById('u_username').value.trim();
    if (users.find(u => u.username === username)) return alert('نام کاربری تکراری است.');

    const role = document.getElementById('u_role').value;
    users.push({
        username,
        password: document.getElementById('u_password').value,
        firstName: document.getElementById('u_firstname').value.trim(),
        lastName: document.getElementById('u_lastname').value.trim(),
        companyName: document.getElementById('u_company') ? document.getElementById('u_company').value.trim() : '',
        role: role,
        isFirstLogin: true
    });

    localStorage.setItem('iqdws_users', JSON.stringify(users));
    Utils.toast('کاربر ایجاد شد');
    adminUserView = 'list';
    renderUserManagement();
}

async function renderUserActivityLog(content, username) {
    const users = await AdminAPI.getUsers();
    const user = users.find(u => u.username === username);
    if (!user) return content.innerHTML = '<p>کاربر یافت نشد.</p>';

    const displayName = user.role === 'supplier' ? user.companyName : `${user.firstName} ${user.lastName}`;
    const activity = await AdminAPI.getUserActivity(username);

    content.innerHTML = `
        <div style="margin-bottom:15px;"><button class="btn btn-outline" onclick="adminUserView='list'; renderUserManagement();">← بازگشت</button></div>
        <div class="card" style="border-top:4px solid #4a148c;">
            <h2 style="color:#4a148c; margin:0;">گزارش عملکرد: ${displayName}</h2>
            <p style="color:#666; font-size:12px;">کد پرسنلی: <b>${user.username}</b> | نقش: <b>${roleNames[user.role]}</b></p>
        </div>

        ${activity.defects.length > 0 ? `
        <div class="card">
            <h3 class="card-title">🛠️ ایرادهای ثبت‌شده (${activity.defects.length})</h3>
            <table class="table-wrapper">
                <thead><tr><th>کد ایراد</th><th>عنوان</th><th>شدت</th><th>تاریخ</th></tr></thead>
                <tbody>${activity.defects.map(d => `<tr><td>${d.defectCode}</td><td>${d.title}</td><td>${d.severity}</td><td>${Utils.formatDate(d.createdAt)}</td></tr>`).join('')}</tbody>
            </table>
        </div>` : ''}

        ${activity.qans.length > 0 ? `
        <div class="card">
            <h3 class="card-title">⚠️ اخطارهای صادرشده (${activity.qans.length})</h3>
            <table class="table-wrapper">
                <thead><tr><th>شناسه</th><th>برای ایراد</th><th>سطح</th><th>تاریخ</th></tr></thead>
                <tbody>${activity.qans.map(q => `<tr><td>${q.qanId.split('-')[1]}</td><td>${q.defectCode}</td><td>${q.level}</td><td>${Utils.formatDate(q.createdAt)}</td></tr>`).join('')}</tbody>
            </table>
        </div>` : ''}
        
        ${activity.defects.length === 0 && activity.qans.length === 0 ? '<div class="card" style="text-align:center; padding:30px; color:#888;">فعالیتی یافت نشد.</div>' : ''}
    `;
}