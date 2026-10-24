let adminUserView = 'list';
let activityTargetUser = null;
let currentSearchFilter = { role: '', username: '' };

async function renderUserManagement() {
    const content = document.getElementById('content-area');
    
    try {
        if (adminUserView === 'create') return renderCreateUserForm(content);
        if (adminUserView === 'edit') return renderEditUserForm(content, activityTargetUser);
        if (adminUserView === 'profile') {
            content.innerHTML = `<p style="text-align:center; padding:20px;">در حال بارگذاری پروفایل...</p>`;
            return await renderUserProfile(content, activityTargetUser);
        }

        // حالت لیست کاربران
        const users = await AdminAPI.getUsers();

        let filteredUsers = users.filter(u => {
            const matchRole = currentSearchFilter.role ? u.role === currentSearchFilter.role : true;
            const matchUsername = currentSearchFilter.username ? 
                (u.username.includes(currentSearchFilter.username) || 
                (u.firstName && u.firstName.includes(currentSearchFilter.username)) || 
                (u.lastName && u.lastName.includes(currentSearchFilter.username)) || 
                (u.companyName && u.companyName.includes(currentSearchFilter.username))) : true;
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
                            let displayName = u.username;
                            if (u.role === 'supplier') displayName = u.companyName || 'شرکت بدون نام';
                            else displayName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'کارمند بدون نام';
                            
                            return `
                            <tr>
                                <td style="font-family:monospace; font-weight:bold;">${u.username}</td>
                                <td>${displayName}</td>
                                <td><span class="badge" style="background:#e1bee7; color:#4a148c;">${roleNames[u.role] || u.role}</span></td>
                                <td>${u.isFirstLogin ? '<span style="color:#c62828; font-size:11px;">در انتظار تغییر رمز</span>' : '<span style="color:#2e7d32; font-size:11px;">فعال</span>'}</td>
                                <td>
                                    <div class="action-btns">
                                        <button class="btn-icon view" onclick="openUserProfile('${u.username}')">👁️ پروفایل</button>
                                        <button class="btn-icon edit" onclick="openEditUserForm('${u.username}')">✏️ ویرایش</button>
                                        <button class="btn-icon delete" onclick="deleteUser('${u.username}')">🗑️ حذف</button>
                                    </div>
                                </td>
                            </tr>
                        `}).join('') || '<tr><td colspan="5" style="text-align:center;">کاربری یافت نشد</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
    } catch (err) {
        content.innerHTML = `<div class="alert-box" style="background:#ffebee; color:#c62828;">خطا در بارگذاری لیست: ${err.message}</div>`;
    }
}

// --- توابع ناوبری ---
function applyUserSearch() { currentSearchFilter = { role: document.getElementById('search_role').value, username: document.getElementById('search_username').value.trim() }; renderUserManagement(); }
function resetUserSearch() { currentSearchFilter = { role: '', username: '' }; renderUserManagement(); }
function openCreateUserForm() { adminUserView = 'create'; renderUserManagement(); }
function openUserProfile(username) { 
    try {
        console.log("Opening profile for:", username);
        activityTargetUser = username; 
        adminUserView = 'profile'; 
        renderUserManagement(); 
    } catch(e) {
        alert("خطا در باز کردن پروفایل: " + e.message);
    }
}
function openEditUserForm(username) { activityTargetUser = username; adminUserView = 'edit'; renderUserManagement(); }

// --- ایجاد کاربر جدید ---
function renderCreateUserForm(content) {
    content.innerHTML = `
        <div style="margin-bottom:15px;"><button class="btn btn-outline" onclick="adminUserView='list'; renderUserManagement();">← بازگشت</button></div>
        <div class="card">
            <h2 class="card-title">ایجاد کاربر جدید</h2>
            <form onsubmit="saveNewUser(event)">
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

// --- ویرایش کامل کاربر ---
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
                
                <div class="form-row">
                    <div class="form-col">
                        <div class="form-field">
                            <label>نقش</label>
                            <select id="e_role" class="form-control" required onchange="document.getElementById('e_company_field').style.display = this.value === 'supplier' ? 'block' : 'none'">
                                <option value="inspector" ${user.role === 'inspector' ? 'selected' : ''}>بازرس خط</option>
                                <option value="expert" ${user.role === 'expert' ? 'selected' : ''}>کارشناس قطعه</option>
                                <option value="dept_head" ${user.role === 'dept_head' ? 'selected' : ''}>مسول بخش</option>
                                <option value="office_head" ${user.role === 'office_head' ? 'selected' : ''}>رئیس اداره</option>
                                <option value="supplier" ${user.role === 'supplier' ? 'selected' : ''}>سازنده</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-col" id="e_company_field" style="display:${user.role === 'supplier' ? 'block' : 'none'};">
                        <div class="form-field"><label>نام شرکت سازنده</label><input type="text" id="e_company" class="form-control" value="${user.companyName || ''}"></div>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-col"><div class="form-field"><label>رمز عبور جدید (برای تغییر پر کنید)</label><input type="text" id="e_password" class="form-control" placeholder="خالی بگذارید تا تغییر نکند"></div></div>
                    <div class="form-col">
                        <div class="form-field">
                            <label>وضعیت حساب</label>
                            <select id="e_isFirstLogin" class="form-control">
                                <option value="false" ${!user.isFirstLogin ? 'selected' : ''}>فعال</option>
                                <option value="true" ${user.isFirstLogin ? 'selected' : ''}>اجبار به تغییر رمز در ورود بعدی</option>
                            </select>
                        </div>
                    </div>
                </div>
                <button type="submit" class="btn btn-warning" style="margin-top:15px;">ذخیره تغییرات کامل</button>
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
    users[idx].role = document.getElementById('e_role').value;
    users[idx].isFirstLogin = document.getElementById('e_isFirstLogin').value === 'true';
    
    if(document.getElementById('e_company')) users[idx].companyName = document.getElementById('e_company').value;
    const newPass = document.getElementById('e_password').value;
    if(newPass) users[idx].password = newPass;

    localStorage.setItem('iqdws_users', JSON.stringify(users));
    Utils.toast('تغییرات کامل ذخیره شد');
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

// --- پروفایل کامل و هوشمند (بر اساس نقش) ---
async function renderUserProfile(content, username) {
    try {
        const users = await AdminAPI.getUsers();
        const user = users.find(u => u.username === username);
        if (!user) {
            content.innerHTML = '<div class="card" style="text-align:center;"><p>کاربر یافت نشد.</p><button class="btn btn-outline" onclick="adminUserView=\'list\'; renderUserManagement();">بازگشت</button></div>';
            return;
        }

        // گرفتن نام نمایشی با مدیریت خطای احتمالی
        let displayName = user.username;
        if (user.role === 'supplier') displayName = user.companyName || 'شرکت بدون نام';
        else displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'کارمند بدون نام';
        
        // گرفتن حرف اول برای آواتار
        const firstChar = displayName ? displayName.charAt(0) : 'U';

        // دریافت داده‌ها
        const defects = await OfflineDB.getDefects();
        const qans = await OfflineDB.getQANs();
        
        let tasks = [];
        try { tasks = JSON.parse(localStorage.getItem(`tasks_${username}`)) || []; } catch(e) { tasks = []; }

        // فیلتر کردن داده‌ها
        const myDefects = defects.filter(d => d.createdBy === username);
        const myQANs = qans.filter(q => q.createdBy === username);

        const chartData = getLast7DaysData(myDefects, myQANs, user.role);

        let stats = [];
        if (user.role === 'inspector') {
            stats = [
                { label: 'کل ایرادات ثبت‌شده', value: myDefects.length },
                { label: 'ایرادات در حال پیگیری', value: myDefects.filter(d => d.status !== 'closed').length },
                { label: 'ایرادات رفع‌شده', value: myDefects.filter(d => d.status === 'closed').length }
            ];
        } else if (user.role === 'expert') {
            stats = [
                { label: 'اخطارهای صادرشده', value: myQANs.length },
                { label: 'اخطارهای تایید شده', value: myQANs.filter(q => q.status === 'approved').length },
                { label: 'اخطارهای رد شده', value: myQANs.filter(q => q.status === 'rejected').length }
            ];
        } else if (user.role === 'dept_head' || user.role === 'office_head') {
            stats = [
                { label: 'تاییدیه‌های صادرشده', value: myQANs.filter(q => q.status === 'approved').length },
                { label: 'ردیه‌های صادرشده', value: myQANs.filter(q => q.status === 'rejected').length }
            ];
        } else if (user.role === 'supplier') {
            stats = [
                { label: 'اخطارهای دریافتی', value: qans.length },
                { label: 'پاسخ‌های 8D ارسالی', value: 0 } 
            ];
        }

        content.innerHTML = `
            <div style="margin-bottom:15px;"><button class="btn btn-outline" onclick="adminUserView='list'; renderUserManagement();">← بازگشت به لیست</button></div>
            
            <div class="profile-header-card">
                <div class="profile-avatar">${firstChar}</div>
                <div class="profile-details">
                    <h2>${displayName}</h2>
                    <p>کد پرسنلی / نام کاربری: <b>${user.username}</b></p>
                    <p>وضعیت: ${user.isFirstLogin ? '⚠️ نیازمند تغییر رمز' : '✅ فعال'}</p>
                    <span class="profile-badge">${roleNames[user.role] || user.role}</span>
                </div>
            </div>

            <div class="stats-grid">
                ${stats.map(s => `
                    <div class="stat-card">
                        <div class="stat-val">${s.value}</div>
                        <div class="stat-lbl">${s.label}</div>
                    </div>
                `).join('')}
            </div>

            <div class="chart-wrap">
                <h3 style="font-size:14px; color:#4a148c; margin-bottom:15px;">📈 نمودار فعالیت ۷ روز اخیر</h3>
                <div class="chart-area">
                    ${chartData.map(d => `
                        <div class="chart-column">
                            <div class="chart-bar ${d.colorClass}" style="height: ${d.percent}%;">
                                <span class="chart-val">${d.count}</span>
                            </div>
                            <span class="chart-lbl">${d.dayName}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="card">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                    <h3 class="card-title" style="border:none; margin:0; padding:0;">📋 تسک‌های کاربر</h3>
                    <button class="btn btn-sm btn-primary" style="background:#4a148c;" onclick="openAddTaskModal('${username}')">➕ تسک جدید</button>
                </div>
                
                <div class="table-wrapper">
                    <table>
                        <thead><tr><th>شرح تسک</th><th>تاریخ ثبت</th><th>وضعیت</th><th>عملیات</th></tr></thead>
                        <tbody>
                            ${tasks.map((t, i) => `
                                <tr>
                                    <td>${t.desc}</td>
                                    <td>${t.date}</td>
                                    <td>
                                        <span class="task-badge ${t.status === 'done' ? 'task-done' : 'task-pending'}" onclick="toggleTaskStatus('${username}', ${i})">
                                            ${t.status === 'done' ? '✅ انجام شده' : '⏳ در انتظار'}
                                        </span>
                                    </td>
                                    <td><button class="btn-icon delete" onclick="deleteTask('${username}', ${i})">حذف</button></td>
                                </tr>
                            `).join('') || '<tr><td colspan="4" style="text-align:center;">تسکی ثبت نشده است</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } catch (error) {
        content.innerHTML = `
            <div class="card" style="color:red;">
                <h3>خطا در بارگذاری پروفایل</h3>
                <p>${error.message}</p>
                <button class="btn btn-outline" onclick="adminUserView='list'; renderUserManagement();">بازگشت</button>
            </div>
        `;
    }
}

// --- محاسبه داده‌های نمودار ۷ روز اخیر ---
function getLast7DaysData(defects, qans, role) {
    const days = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];
    const result = [];
    let maxCount = 1;

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayName = days[d.getDay()];

        let count = 0;
        if (role === 'inspector') {
            count = defects.filter(x => x.createdAt && x.createdAt.startsWith(dateStr)).length;
        } else {
            count = qans.filter(x => x.createdAt && x.createdAt.startsWith(dateStr)).length;
        }

        if (count > maxCount) maxCount = count;
        result.push({ dayName, count, dateStr });
    }

    return result.map(x => ({
        ...x,
        percent: Math.max((x.count / maxCount) * 100, 4),
        colorClass: role === 'inspector' ? '' : (role === 'expert' ? 'orange' : 'green')
    }));
}

// --- مدیریت تسک‌ها ---
function openAddTaskModal(username) {
    Utils.openModal(`
        <h3 style="color:#4a148c; margin-bottom:15px;">افزودن تسک جدید</h3>
        <div class="form-field">
            <label>شرح تسک</label>
            <textarea id="new_task_desc" class="form-control" required></textarea>
        </div>
        <button class="btn btn-primary" style="width:100%; margin-top:10px; background:#4a148c;" onclick="saveNewTask('${username}')">ثبت تسک</button>
    `);
}

function saveNewTask(username) {
    const desc = document.getElementById('new_task_desc').value.trim();
    if(!desc) return Utils.toast('شرح تسک الزامی است', 'error');

    let tasks = [];
    try { tasks = JSON.parse(localStorage.getItem(`tasks_${username}`)) || []; } catch(e) { tasks = []; }
    
    tasks.unshift({ desc, date: new Date().toLocaleDateString('fa-IR'), status: 'pending' });
    localStorage.setItem(`tasks_${username}`, JSON.stringify(tasks));

    Utils.closeModal();
    Utils.toast('تسک ثبت شد');
    renderUserProfile(document.getElementById('content-area'), username);
}

function toggleTaskStatus(username, index) {
    let tasks = [];
    try { tasks = JSON.parse(localStorage.getItem(`tasks_${username}`)) || []; } catch(e) { return; }
    
    if(tasks[index]) {
        tasks[index].status = tasks[index].status === 'done' ? 'pending' : 'done';
        localStorage.setItem(`tasks_${username}`, JSON.stringify(tasks));
        renderUserProfile(document.getElementById('content-area'), username);
    }
}

function deleteTask(username, index) {
    if(!confirm('حذف این تسک؟')) return;
    let tasks = [];
    try { tasks = JSON.parse(localStorage.getItem(`tasks_${username}`)) || []; } catch(e) { return; }
    
    tasks.splice(index, 1);
    localStorage.setItem(`tasks_${username}`, JSON.stringify(tasks));
    renderUserProfile(document.getElementById('content-area'), username);
}