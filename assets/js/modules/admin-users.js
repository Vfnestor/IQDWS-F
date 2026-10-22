let adminUserView = 'list';
let activityTargetUser = null;
let currentSearchFilter = { role: '', username: '' };

async function renderUserManagement() {
    const content = document.getElementById('content-area');
    
    if (adminUserView === 'create') return renderCreateUserForm(content);
    if (adminUserView === 'edit') return renderEditUserForm(content, activityTargetUser);
    if (adminUserView === 'activity' && activityTargetUser) return renderUserProfile(content, activityTargetUser);

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
                            <td><span class="badge" style="background:#e1bee7; color:#4a148c;">${roleNames[u.role] || u.role}</span></td>
                            <td>${u.isFirstLogin ? '<span style="color:#c62828; font-size:11px;">در انتظار تغییر رمز</span>' : '<span style="color:#2e7d32; font-size:11px;">فعال</span>'}</td>
                            <td>
                                <div class="action-btns">
                                    <button class="btn-icon view" onclick="viewUserActivity('${u.username}')" title="مشاهده پروفایل">👁️ پروفایل</button>
                                    <button class="btn-icon edit" onclick="openEditUserForm('${u.username}')" title="ویرایش">✏️ ویرایش</button>
                                    <button class="btn-icon delete" onclick="deleteUser('${u.username}')" title="حذف">🗑️ حذف</button>
                                </div>
                            </td>
                        </tr>
                    `}).join('') || '<tr><td colspan="5" style="text-align:center;">کاربری یافت نشد</td></tr>'}
                </tbody>
            </table>
        </div>
    `;
}

// --- عملیات جستجو ---
function applyUserSearch() {
    currentSearchFilter = { role: document.getElementById('search_role').value, username: document.getElementById('search_username').value.trim() };
    renderUserManagement();
}
function resetUserSearch() { currentSearchFilter = { role: '', username: '' }; renderUserManagement(); }
function openCreateUserForm() { adminUserView = 'create'; renderUserManagement(); }
function viewUserActivity(username) { activityTargetUser = username; adminUserView = 'activity'; renderUserManagement(); }
function openEditUserForm(username) { activityTargetUser = username; adminUserView = 'edit'; renderUserManagement(); }

// --- ایجاد کاربر ---
function renderCreateUserForm(content) {
    content.innerHTML = `
        <div style="margin-bottom:15px;"><button class="btn btn-outline" onclick="adminUserView='list'; renderUserManagement();">← بازگشت</button></div>
        <div class="card">
            <h2 class="card-title">ایجاد کاربر جدید</h2>
            <form onsubmit="saveNewUser(event)">
                <div class="form-row">
                    <div class="form-col"><div class="form-field"><label>نام کاربری (کد پرسنلی) <span class="req">*</span></label><input type="text" id="u_username" class="form-control" required></div></div>
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

async function saveNewUser(e) {
    e.preventDefault();
    let users = JSON.parse(localStorage.getItem('iqdws_users'));
    const username = document.getElementById('u_username').value.trim();
    if (users.find(u => u.username === username)) return alert('نام کاربری تکراری است.');

    const role = document.getElementById('u_role').value;
    users.push({
        username, password: document.getElementById('u_password').value,
        firstName: document.getElementById('u_firstname').value.trim(),
        lastName: document.getElementById('u_lastname').value.trim(),
        companyName: document.getElementById('u_company') ? document.getElementById('u_company').value.trim() : '',
        role: role, isFirstLogin: true
    });

    localStorage.setItem('iqdws_users', JSON.stringify(users));
    Utils.toast('کاربر ایجاد شد');
    adminUserView = 'list';
    renderUserManagement();
}

// --- ویرایش کاربر ---
function renderEditUserForm(content, username) {
    const users = JSON.parse(localStorage.getItem('iqdws_users'));
    const user = users.find(u => u.username === username);
    if(!user) return content.innerHTML = '<p>یافت نشد</p>';

    content.innerHTML = `
        <div style="margin-bottom:15px;"><button class="btn btn-outline" onclick="adminUserView='list'; renderUserManagement();">← بازگشت</button></div>
        <div class="card">
            <h2 class="card-title">ویرایش کاربر: ${user.username}</h2>
            <form onsubmit="saveEditUser(event, '${user.username}')">
                <div class="form-row">
                    <div class="form-col"><div class="form-field"><label>نام</label><input type="text" id="e_firstname" class="form-control" value="${user.firstName || ''}"></div></div>
                    <div class="form-col"><div class="form-field"><label>نام خانوادگی</label><input type="text" id="e_lastname" class="form-control" value="${user.lastName || ''}"></div></div>
                </div>
                ${user.role === 'supplier' ? `<div class="form-field"><label>نام شرکت</label><input type="text" id="e_company" class="form-control" value="${user.companyName || ''}"></div>` : ''}
                <div class="form-row">
                    <div class="form-col"><div class="form-field"><label>رمز عبور جدید (برای تغییر پر کنید)</label><input type="text" id="e_password" class="form-control" placeholder="خالی بگذارید تا تغییر نکند"></div></div>
                </div>
                <button type="submit" class="btn btn-warning" style="margin-top:15px;">ذخیره تغییرات</button>
            </form>
        </div>
    `;
}

function saveEditUser(e, username) {
    e.preventDefault();
    let users = JSON.parse(localStorage.getItem('iqdws_users'));
    const idx = users.findIndex(u => u.username === username);
    
    users[idx].firstName = document.getElementById('e_firstname').value;
    users[idx].lastName = document.getElementById('e_lastname').value;
    if(document.getElementById('e_company')) users[idx].companyName = document.getElementById('e_company').value;
    
    const newPass = document.getElementById('e_password').value;
    if(newPass) users[idx].password = newPass;

    localStorage.setItem('iqdws_users', JSON.stringify(users));
    Utils.toast('تغییرات ذخیره شد');
    adminUserView = 'list';
    renderUserManagement();
}

// --- حذف کاربر ---
function deleteUser(username) {
    if(!confirm('آیا از حذف این کاربر مطمئن هستید؟')) return;
    let users = JSON.parse(localStorage.getItem('iqdws_users'));
    users = users.filter(u => u.username !== username);
    localStorage.setItem('iqdws_users', JSON.stringify(users));
    Utils.toast('کاربر حذف شد');
    renderUserManagement();
}

// --- پروفایل کامل و تایم‌لاین کاربر ---
async function renderUserProfile(content, username) {
    const users = await AdminAPI.getUsers();
    const user = users.find(u => u.username === username);
    if (!user) return content.innerHTML = '<p>کاربر یافت نشد.</p>';

    const displayName = user.role === 'supplier' ? user.companyName : `${user.firstName} ${user.lastName}`;
    const activity = await AdminAPI.getUserActivity(username);
    const tasks = JSON.parse(localStorage.getItem(`tasks_${username}`) || '[]');

    // محاسبه آمار برای نمودار
    const criticalCount = activity.defects.filter(d => d.severity === 'critical').length;
    const majorCount = activity.defects.filter(d => d.severity === 'major').length;
    const minorCount = activity.defects.filter(d => d.severity === 'minor').length;

    content.innerHTML = `
        <div style="margin-bottom:15px;"><button class="btn btn-outline" onclick="adminUserView='list'; renderUserManagement();">← بازگشت به لیست</button></div>
        
        <!-- هدر پروفایل -->
        <div class="profile-header">
            <div class="profile-avatar">${displayName.charAt(0)}</div>
            <div class="profile-info">
                <h2>${displayName}</h2>
                <p>کد پرسنلی: <b>${user.username}</b> | نقش: <b>${roleNames[user.role]}</b></p>
                <p>وضعیت حساب: ${user.isFirstLogin ? '⚠️ نیازمند تغییر رمز' : '✅ فعال'}</p>
            </div>
            <div style="margin-right:auto; text-align:center;">
                <div style="font-size:24px; font-weight:bold; color:#4a148c;">${activity.defects.length + activity.qans.length}</div>
                <div style="font-size:11px; color:#666;">کل فعالیت‌ها</div>
            </div>
        </div>

        <div class="form-row">
            <!-- ستون راست: آمار و نمودار -->
            <div class="form-col" style="flex: 2;">
                <div class="card">
                    <h3 class="card-title">📊 نمودار ایرادهای ثبت‌شده</h3>
                    <div class="chart-container">
                        <div class="chart-bar" style="height: ${Math.max((criticalCount/10)*100, 5)}%; background:#ef5350;">
                            <span class="chart-val">${criticalCount}</span>
                            <span class="chart-lbl">بحرانی</span>
                        </div>
                        <div class="chart-bar" style="height: ${Math.max((majorCount/10)*100, 5)}%; background:#ffa726;">
                            <span class="chart-val">${majorCount}</span>
                            <span class="chart-lbl">ماژور</span>
                        </div>
                        <div class="chart-bar" style="height: ${Math.max((minorCount/10)*100, 5)}%; background:#66bb6a;">
                            <span class="chart-val">${minorCount}</span>
                            <span class="chart-lbl">مینور</span>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <h3 class="card-title">📋 تاریخچه فعالیت‌ها (Timeline)</h3>
                    <div class="timeline">
                        ${activity.defects.map(d => `
                            <div class="timeline-item">
                                <div class="timeline-date">${Utils.formatDate(d.createdAt)}</div>
                                <div class="timeline-content">ثبت ایراد <b>${d.defectCode}</b> (${d.title})</div>
                            </div>
                        `).join('')}
                        ${activity.qans.map(q => `
                            <div class="timeline-item">
                                <div class="timeline-date">${Utils.formatDate(q.createdAt)}</div>
                                <div class="timeline-content">صدور اخطار <b>${q.qanId.split('-')[1]}</b> برای ایراد ${q.defectCode}</div>
                            </div>
                        `).join('')}
                        ${activity.defects.length === 0 && activity.qans.length === 0 ? '<p style="color:#888; font-size:12px;">فعالیتی ثبت نشده است.</p>' : ''}
                    </div>
                </div>
            </div>

            <!-- ستون چپ: تسک‌ها و درخواست‌ها -->
            <div class="form-col" style="flex: 1;">
                <div class="card">
                    <h3 class="card-title">📝 ارسال درخواست / تسک جدید</h3>
                    <form onsubmit="assignTask(event, '${user.username}')">
                        <div class="form-field">
                            <textarea id="task_desc" class="form-control" placeholder="شرح درخواست..." required style="min-height:80px;"></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width:100%; background:#4a148c;">ثبت تسک</button>
                    </form>
                </div>

                <div class="card">
                    <h3 class="card-title">📬 تسک‌های فعال</h3>
                    ${tasks.map((t, i) => `
                        <div class="task-card">
                            <div style="font-size:11px; color:#e65100; font-weight:bold;">${t.date}</div>
                            <div style="font-size:13px; margin-top:4px;">${t.desc}</div>
                        </div>
                    `).join('') || '<p style="color:#888; font-size:12px;">تسکی وجود ندارد.</p>'}
                </div>
            </div>
        </div>
    `;
}

function assignTask(e, username) {
    e.preventDefault();
    const desc = document.getElementById('task_desc').value.trim();
    if(!desc) return;

    let tasks = JSON.parse(localStorage.getItem(`tasks_${username}`) || '[]');
    tasks.unshift({ desc, date: new Date().toLocaleDateString('fa-IR'), status: 'pending' });
    localStorage.setItem(`tasks_${username}`, JSON.stringify(tasks));

    Utils.toast('تسک با موفقیت برای کاربر ثبت شد');
    renderUserProfile(document.getElementById('content-area'), username);
}