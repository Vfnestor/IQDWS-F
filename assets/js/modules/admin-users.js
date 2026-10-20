// وضعیت‌های صفحه مدیریت کاربران
let adminUserView = 'list'; // 'list' | 'create' | 'activity'
let activityTargetUser = null;
let currentSearchFilter = { role: '', username: '', defectCode: '' };

async function renderUserManagement() {
    const content = document.getElementById('content-area');
    
    if (adminUserView === 'create') {
        renderCreateUserForm(content);
        return;
    }

    if (adminUserView === 'activity' && activityTargetUser) {
        renderUserActivityLog(content, activityTargetUser);
        return;
    }

    // حالت لیست
    const users = JSON.parse(localStorage.getItem('iqdws_users'));
    const defects = await OfflineDB.getDefects();
    const qans = await OfflineDB.getQANs();

    // اعمال فیلترها
    let filteredUsers = users.filter(u => {
        const matchRole = currentSearchFilter.role ? u.role === currentSearchFilter.role : true;
        const matchUsername = currentSearchFilter.username ? (u.username.includes(currentSearchFilter.username) || (u.firstName && u.firstName.includes(currentSearchFilter.username)) || (u.lastName && u.lastName.includes(currentSearchFilter.username))) : true;
        
        // اگر کد ایراد سرچ شده باشد، باید ببینیم این کاربر آن ایراد را ثبت کرده یا نه
        let matchDefect = true;
        if (currentSearchFilter.defectCode) {
            const targetDefect = defects.find(d => d.defectCode === currentSearchFilter.defectCode);
            if (targetDefect) {
                matchDefect = (u.username === targetDefect.createdBy) || qans.some(q => q.createdBy === u.username && q.defectCode === targetDefect.defectCode);
            } else {
                matchDefect = false;
            }
        }

        return matchRole && matchUsername && matchDefect;
    });

    content.innerHTML = `
        <!-- پنل جستجوی پیشرفته -->
        <div class="card" style="background:#f8f9fa; border-right:4px solid var(--primary);">
            <h3 style="margin-bottom:15px; color:var(--primary); font-size:14px;">جستجوی پیشرفته</h3>
            <div class="form-row">
                <div class="form-col">
                    <div class="form-field">
                        <label>نام کاربری / نام</label>
                        <input type="text" id="search_username" class="form-control" value="${currentSearchFilter.username}" placeholder="مثال: 101">
                    </div>
                </div>
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
                <div class="form-col">
                    <div class="form-field">
                        <label>کد ایراد (مشخصاً)</label>
                        <input type="text" id="search_defect" class="form-control" value="${currentSearchFilter.defectCode}" placeholder="مثال: CMC000001">
                    </div>
                </div>
            </div>
            <div style="display:flex; gap:10px;">
                <button class="btn btn-primary" onclick="applyUserSearch()">اعمال فیلتر</button>
                <button class="btn btn-outline" onclick="resetUserSearch()">حذف فیلترها</button>
            </div>
        </div>

        <!-- هدر لیست و دکمه ایجاد -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
            <h2 style="color:var(--primary); font-size:16px;">لیست کاربران (${filteredUsers.length} نفر)</h2>
            <button class="btn btn-primary" style="background-color:#4a148c;" onclick="openCreateUserForm()">➕ ایجاد کاربر جدید</button>
        </div>

        <div class="card">
            <div class="table-wrapper">
                <table>
                    <thead><tr><th>نام کاربری</th><th>نام / شرکت</th><th>نقش</th><th>وضعیت رمز</th><th>عملیات</th></tr></thead>
                    <tbody>
                        ${filteredUsers.map(u => {
                            const displayName = u.role === 'supplier' ? u.companyName : `${u.firstName} ${u.lastName}`;
                            return `
                            <tr>
                                <td style="font-family:monospace; font-weight:bold;">${u.username}</td>
                                <td>${displayName}</td>
                                <td>${roleNames[u.role] || u.role}</td>
                                <td>${u.isFirstLogin ? '<span style="color:#c62828;">در انتظار تغییر</span>' : '<span style="color:#2e7d32;">فعال</span>'}</td>
                                <td>
                                    <button class="btn btn-sm btn-outline" onclick="viewUserActivity('${u.username}')">📈 مشاهده عملکرد</button>
                                </td>
                            </tr>
                        `}).join('') || '<tr><td colspan="5" style="text-align:center;">کاربری با این فیلترها یافت نشد</td></tr>'}
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
        defectCode: document.getElementById('search_defect').value.trim()
    };
    renderUserManagement();
}

function resetUserSearch() {
    currentSearchFilter = { role: '', username: '', defectCode: '' };
    renderUserManagement();
}

function openCreateUserForm() {
    adminUserView = 'create';
    renderUserManagement();
}

function viewUserActivity(username) {
    activityTargetUser = username;
    adminUserView = 'activity';
    renderUserManagement();
}

// ==================== بخش ایجاد کاربر ====================
function renderCreateUserForm(content) {
    content.innerHTML = `
        <div style="margin-bottom:15px;">
            <button class="btn btn-outline" onclick="adminUserView='list'; renderUserManagement();">← بازگشت به لیست</button>
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
    adminUserView = 'list';
    renderUserManagement();
}

// ==================== بخش گزارش عملکرد ====================
async function renderUserActivityLog(content, username) {
    const users = JSON.parse(localStorage.getItem('iqdws_users'));
    const user = users.find(u => u.username === username);
    if (!user) return content.innerHTML = '<p>کاربر یافت نشد.</p>';

    const displayName = user.role === 'supplier' ? user.companyName : `${user.firstName} ${user.lastName}`;
    
    // واکشی داده‌ها
    const defects = await OfflineDB.getDefects();
    const qans = await OfflineDB.getQANs();

    // فیلتر بر اساس کاربر
    const userDefects = defects.filter(d => d.createdBy === username);
    const userQANs = qans.filter(q => q.createdBy === username);

    content.innerHTML = `
        <div style="margin-bottom:15px;">
            <button class="btn btn-outline" onclick="adminUserView='list'; renderUserManagement();">← بازگشت به لیست</button>
        </div>

        <div class="card" style="border-top:4px solid #4a148c;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h2 style="color:#4a148c; margin:0;">گزارش عملکرد: ${displayName}</h2>
                    <p style="color:#666; font-size:12px; margin-top:5px;">نام کاربری: <b>${user.username}</b> | نقش: <b>${roleNames[user.role]}</b></p>
                </div>
                <div style="text-align:center;">
                    <div style="font-size:24px; font-weight:bold; color:var(--primary);">${userDefects.length + userQANs.length}</div>
                    <div style="font-size:10px; color:#666;">کل فعالیت‌ها</div>
                </div>
            </div>
        </div>

        ${userDefects.length > 0 ? `
        <div class="card">
            <h3 class="card-title" style="color:var(--primary);">🛠️ ایرادهای ثبت‌شده (${userDefects.length})</h3>
            <div class="table-wrapper">
                <table>
                    <thead><tr><th>کد ایراد</th><th>عنوان</th><th>شدت</th><th>تاریخ ثبت</th><th>وضعیت</th></tr></thead>
                    <tbody>
                        ${userDefects.map(d => `
                            <tr>
                                <td style="font-family:monospace; font-weight:bold;">${d.defectCode}</td>
                                <td>${d.title}</td>
                                <td><span class="badge sev-${d.severity}">${d.severity}</span></td>
                                <td>${Utils.formatDate(d.createdAt)}</td>
                                <td><span class="badge status-${d.status}">${d.status}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        ` : ''}

        ${userQANs.length > 0 ? `
        <div class="card">
            <h3 class="card-title" style="color:var(--warning);">⚠️ اخطارهای صادرشده (${userQANs.length})</h3>
            <div class="table-wrapper">
                <table>
                    <thead><tr><th>شناسه</th><th>برای ایراد</th><th>سطح</th><th>تاریخ</th><th>وضعیت</th></tr></thead>
                    <tbody>
                        ${userQANs.map(q => `
                            <tr>
                                <td style="font-family:monospace;">${q.qanId.split('-')[1]}</td>
                                <td style="color:var(--primary); font-weight:bold;">${q.defectCode}</td>
                                <td>${q.level}</td>
                                <td>${Utils.formatDate(q.createdAt)}</td>
                                <td><span class="badge status-${q.status}">${q.status}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        ` : ''}

        ${userDefects.length === 0 && userQANs.length === 0 ? `
        <div class="card" style="text-align:center; padding:40px;">
            <p style="color:#888;">این کاربر تاکنون هیچ فعالیتی ثبت نکرده است.</p>
        </div>
        ` : ''}
    `;
}