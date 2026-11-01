let editingOperatorErrorId = null;

async function renderOperatorErrors() {
    const content = document.getElementById('content-area');
    const errors = await OfflineDB.getOperatorErrors();

    content.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <h2 class="card-title" style="margin:0; border:none;">گزارش‌های ایراد اپراتوری</h2>
            <button class="btn btn-primary" style="background:#d32f2f;" onclick="openOperatorErrorModal()">➕ ثبت گزارش جدید</button>
        </div>
        
        <div class="card">
            <div class="table-wrapper">
                <table>
                    <thead><tr><th>شناسه</th><th>نام اپراتور</th><th>محل کار</th><th>شرح تخلف</th><th>تاریخ</th><th>عملیات</th></tr></thead>
                    <tbody>
                        ${errors.map(err => `
                            <tr>
                                <td style="font-family:monospace;">${err.errorId.split('-')[1]}</td>
                                <td>${err.operatorName} (${err.personnelId})</td>
                                <td>${err.location}</td>
                                <td>${err.violation}</td>
                                <td>${err.date}</td>
                                <td>
                                    <div class="action-btns">
                                        <button class="btn-icon view" onclick="viewOperatorError('${err.errorId}')">👁️ مشاهده</button>
                                        <button class="btn-icon edit" onclick="openOperatorErrorModal('${err.errorId}')">✏️ ویرایش</button>
                                        <button class="btn-icon delete" onclick="deleteOperatorError('${err.errorId}')">🗑️ حذف</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('') || '<tr><td colspan="6" style="text-align:center;">گزارشی ثبت نشده است.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function openOperatorErrorModal(errorId = null) {
    editingOperatorErrorId = errorId;
    let err = { operatorName: '', personnelId: '', location: '', violation: '', severity: 'medium', shift: 'morning', correctiveAction: '' };

    if (errorId) {
        // در حالت واقعی باید از دیتابیس خوانده شود، برای سادگی فعلا از دکمه ارسال می‌کنیم
        // اما چون async است، مجبوریم فعلا مقادیر را از جدول بگیریم یا دوباره بخوانیم
        OfflineDB.getOperatorErrors().then(errors => {
            const found = errors.find(e => e.errorId === errorId);
            if (found) err = found;
            showOperatorModal(err, errorId);
        });
    } else {
        showOperatorModal(err, null);
    }
}

function showOperatorModal(data, errorId) {
    Utils.openModal(`
        <h3 style="color:#d32f2f; margin-bottom:15px;">${errorId ? 'ویرایش' : 'ثبت'} گزارش ایراد اپراتوری</h3>
        <form onsubmit="saveOperatorError(event, '${errorId || ''}')">
            <div class="form-row">
                <div class="form-col"><div class="form-field"><label>نام اپراتور <span class="req">*</span></label><input type="text" id="o_name" class="form-control" value="${data.operatorName}" required></div></div>
                <div class="form-col"><div class="form-field"><label>شماره پرسنلی <span class="req">*</span></label><input type="text" id="o_pid" class="form-control" value="${data.personnelId}" required></div></div>
            </div>
            <div class="form-row">
                <div class="form-col"><div class="form-field"><label>محل کار <span class="req">*</span></label><input type="text" id="o_loc" class="form-control" value="${data.location}" required></div></div>
                <div class="form-col">
                    <div class="form-field">
                        <label>شیفت کاری</label>
                        <select id="o_shift" class="form-control">
                            <option value="morning" ${data.shift === 'morning' ? 'selected' : ''}>صبح</option>
                            <option value="evening" ${data.shift === 'evening' ? 'selected' : ''}>عصر</option>
                            <option value="night" ${data.shift === 'night' ? 'selected' : ''}>شب</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="form-field"><label>شرح تخلف <span class="req">*</span></label><textarea id="o_violation" class="form-control" required>${data.violation}</textarea></div>
            <div class="form-row">
                <div class="form-col">
                    <div class="form-field">
                        <label>شدت تخلف</label>
                        <select id="o_severity" class="form-control">
                            <option value="low" ${data.severity === 'low' ? 'selected' : ''}>کم</option>
                            <option value="medium" ${data.severity === 'medium' ? 'selected' : ''}>متوسط</option>
                            <option value="high" ${data.severity === 'high' ? 'selected' : ''}>زیاد (منجر به توقف خط)</option>
                        </select>
                    </div>
                </div>
                <div class="form-col"><div class="form-field"><label>اقدام اصلاحی / تذکر</label><input type="text" id="o_action" class="form-control" value="${data.correctiveAction || ''}"></div></div>
            </div>
            <button type="submit" class="btn btn-danger" style="width:100%; margin-top:15px;">ذخیره گزارش</button>
        </form>
    `);
}

async function saveOperatorError(e, existingId) {
    e.preventDefault();
    const session = JSON.parse(localStorage.getItem('iqdws_session'));

    const errorData = {
        errorId: existingId || 'ERR-' + Date.now(),
        operatorName: document.getElementById('o_name').value,
        personnelId: document.getElementById('o_pid').value,
        location: document.getElementById('o_loc').value,
        shift: document.getElementById('o_shift').value,
        violation: document.getElementById('o_violation').value,
        severity: document.getElementById('o_severity').value,
        correctiveAction: document.getElementById('o_action').value,
        date: new Date().toLocaleDateString('fa-IR'),
        createdBy: session.username
    };

    await OfflineDB.saveOperatorError(errorData);
    
    if (existingId) {
        await OfflineDB.addAuditLog('EDIT_OPERATOR_ERROR', existingId, 'ویرایش گزارش اپراتوری', session.displayName);
        Utils.toast('گزارش ویرایش شد (در لاگ ثبت شد)');
    } else {
        Utils.toast('گزارش جدید ثبت شد');
    }

    Utils.closeModal();
    renderOperatorErrors();
}

async function deleteOperatorError(errorId) {
    if(!confirm('آیا از حذف این گزارش مطمئن هستید؟ (این عمل در لاگ‌ها ثبت می‌شود)')) return;
    
    const session = JSON.parse(localStorage.getItem('iqdws_session'));
    await OfflineDB.deleteOperatorError(errorId);
    await OfflineDB.addAuditLog('DELETE_OPERATOR_ERROR', errorId, 'حذف گزارش اپراتوری', session.displayName);
    
    Utils.toast('گزارش حذف شد', 'error');
    renderOperatorErrors();
}

async function viewOperatorError(errorId) {
    const errors = await OfflineDB.getOperatorErrors();
    const err = errors.find(e => e.errorId === errorId);
    if(!err) return;

    Utils.openModal(`
        <h3 style="color:#d32f2f; margin-bottom:15px;">جزئیات گزارش اپراتوری</h3>
        <div class="detail-row"><span class="lbl">اپراتور</span><span class="val">${err.operatorName} (${err.personnelId})</span></div>
        <div class="detail-row"><span class="lbl">محل کار</span><span class="val">${err.location}</span></div>
        <div class="detail-row"><span class="lbl">شیفت</span><span class="val">${err.shift === 'morning' ? 'صبح' : err.shift === 'evening' ? 'عصر' : 'شب'}</span></div>
        <div class="detail-row"><span class="lbl">شرح تخلف</span><span class="val">${err.violation}</span></div>
        <div class="detail-row"><span class="lbl">شدت</span><span class="val">${err.severity === 'high' ? 'زیاد' : err.severity === 'medium' ? 'متوسط' : 'کم'}</span></div>
        <div class="detail-row"><span class="lbl">اقدام اصلاحی</span><span class="val">${err.correctiveAction || '—'}</span></div>
        <div class="detail-row"><span class="lbl">ثبت‌کننده</span><span class="val">${err.createdBy}</span></div>
        <div class="detail-row"><span class="lbl">تاریخ</span><span class="val">${err.date}</span></div>
        <button class="btn btn-outline" style="width:100%; margin-top:15px;" onclick="Utils.closeModal()">بستن</button>
    `);
}