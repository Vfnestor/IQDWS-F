let currentImageBase64 = null;
let currentReviewCode = null; // برای نگه داشتن کد ایراد در فرم‌های مودال

// ==================== ثبت ایراد ====================
function renderNewDefectForm() {
    const content = document.getElementById('content-area');
    currentImageBase64 = null;

    content.innerHTML = `
        <div class="card">
            <h2 class="card-title">ثبت ایراد جدید (حالت آفلاین)</h2>
            <form id="defect-form" onsubmit="submitDefectForm(event)">
                <div class="form-row">
                    <div class="form-col"><div class="form-field"><label>عنوان ایراد <span class="req">*</span></label><input type="text" id="d_title" class="form-control" required></div></div>
                    <div class="form-col"><div class="form-field"><label>شماره بدنه (VIN) <span class="req">*</span></label><input type="text" id="d_vin" class="form-control" required></div></div>
                </div>
                <div class="form-row">
                    <div class="form-col">
                        <div class="form-field">
                            <label>شدت ایراد</label>
                            <select id="d_severity" class="form-control" required>
                                <option value="critical">بحرانی</option>
                                <option value="major">ماژور</option>
                                <option value="minor">مینور</option>
                                <option value="cosmetic">کازمتیک</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-col"><div class="form-field"><label>تعداد خودرو</label><input type="number" id="d_qty" class="form-control" min="1" required></div></div>
                </div>
                <div class="form-field"><label>شرح کامل</label><textarea id="d_desc" class="form-control"></textarea></div>
                <div class="form-field" style="background:#f9f9f9; padding:15px; border-radius:8px; border:1px dashed #ccc;">
                    <label>📷 افزودن عکس (اختیاری)</label>
                    <input type="file" id="d_image" accept="image/*" class="form-control" onchange="handleImageUpload(event)">
                    <div id="image-preview" style="margin-top:10px; font-size:12px; color:#2e7d32;"></div>
                </div>
                <div style="margin-top: 20px;"><button type="submit" class="btn btn-primary" id="btn-submit-defect">ثبت ایراد و تولید کد</button></div>
            </form>
        </div>
    `;
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    ImageUtils.openCropModal(file, (base64) => {
        currentImageBase64 = base64;
        document.getElementById('image-preview').innerHTML = `✅ عکس آماده شد (حجم: ${Math.round(base64.length / 1024)} کیلوبایت)`;
    });
}

async function submitDefectForm(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-submit-defect');
    btn.disabled = true; btn.innerText = 'در حال ذخیره...';

    const severity = document.getElementById('d_severity').value;
    const defectCode = Utils.generateDefectCode(severity);
    const session = JSON.parse(localStorage.getItem('iqdws_session'));

    const defectData = {
        defectCode: defectCode,
        title: document.getElementById('d_title').value,
        vin: document.getElementById('d_vin').value,
        severity: severity,
        qty: document.getElementById('d_qty').value,
        desc: document.getElementById('d_desc').value,
        imageBase64: currentImageBase64,
        status: 'registered',
        createdBy: session.username,
        createdByName: session.displayName,
        createdAt: new Date().toISOString(),
        reviewSteps: [] // آرایه‌ای برای ذخیره مراحل بررسی کارشناس
    };

    await OfflineDB.saveDefect(defectData);
    await OfflineDB.addToQueue({ endpoint: '/defects', method: 'POST', data: defectData });
    
    Utils.toast(`✅ ایراد با کد ${defectCode} ذخیره شد.`);
    navigate('defects');
}

// ==================== لیست ایرادها ====================
async function renderDefectList() {
    const content = document.getElementById('content-area');
    content.innerHTML = `<p>در حال خواندن از حافظه...</p>`;
    const role = JSON.parse(localStorage.getItem('iqdws_session')).roleId;
    
    try {
        const defects = await OfflineDB.getDefects();
        content.innerHTML = `
            <div class="card">
                <h2 class="card-title">لیست ایرادها</h2>
                <div class="table-wrapper">
                    <table>
                        <thead><tr><th>کد ایراد</th><th>عنوان</th><th>شدت</th><th>ثبت‌کننده</th><th>وضعیت</th><th>عملیات</th></tr></thead>
                        <tbody>
                            ${defects.map(d => `
                                <tr>
                                    <td style="font-family:monospace; font-weight:bold; color:var(--primary);">${d.defectCode}</td>
                                    <td>${d.title}</td>
                                    <td><span class="badge sev-${d.severity}">${d.severity}</span></td>
                                    <td>${d.createdByName} <span style="font-size:10px; color:#888;">(${d.createdBy})</span></td>
                                    <td><span class="badge status-${d.status}">${d.status}</span></td>
                                    <td>
                                        <button class="btn btn-sm btn-outline" onclick="navigate('defect-detail', '${d.defectCode}')">مشاهده</button>
                                        ${role === 'expert' ? `<button class="btn btn-sm btn-primary" onclick="navigate('expert-defect-detail', '${d.defectCode}')">ورود (بررسی)</button>` : ''}
                                        ${(role === 'expert' || role === 'dept_head') && d.status === 'registered' ? `<button class="btn btn-sm btn-warning" onclick="openQANForm('${d.defectCode}')">صدور اخطار</button>` : ''}
                                    </td>
                                </tr>
                            `).join('') || '<tr><td colspan="6" style="text-align:center;">ایرادی یافت نشد</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } catch (e) {
        content.innerHTML = `<p style="color:red;">خطا در خواندن حافظه.</p>`;
    }
}

// ==================== مشاهده جزئیات (ساده) ====================
async function renderDefectDetail(code) {
    const content = document.getElementById('content-area');
    const d = await OfflineDB.getDefectByCode(code);
    if(!d) return content.innerHTML = '<p>یافت نشد.</p>';

    content.innerHTML = `
        <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding-bottom:15px; margin-bottom:15px;">
                <h2 class="card-title" style="margin:0; border:none;">جزئیات ایراد</h2>
                <span style="font-family:monospace; font-size:18px; font-weight:bold; color:var(--primary); background:#e3f2fd; padding:5px 15px; border-radius:8px;">${d.defectCode}</span>
            </div>
            <div class="detail-row"><span class="lbl">عنوان</span><span class="val">${d.title}</span></div>
            <div class="detail-row"><span class="lbl">VIN</span><span class="val">${d.vin}</span></div>
            <div class="detail-row"><span class="lbl">شدت</span><span class="val"><span class="badge sev-${d.severity}">${d.severity}</span></span></div>
            <div class="detail-row"><span class="lbl">تعداد</span><span class="val">${d.qty}</span></div>
            <div class="detail-row"><span class="lbl">شرح</span><span class="val">${d.desc || '—'}</span></div>
            <div class="detail-row"><span class="lbl">ثبت‌کننده</span><span class="val">${d.createdByName} (${d.createdBy})</span></div>
            <div class="detail-row"><span class="lbl">تاریخ ثبت</span><span class="val">${Utils.formatDate(d.createdAt)}</span></div>
            ${d.imageBase64 ? `<div style="margin-top:15px;"><img src="${d.imageBase64}" style="max-width:100%; border-radius:8px;"></div>` : ''}
            <div style="margin-top:20px;"><button class="btn btn-outline" onclick="navigate('defects')">← بازگشت به لیست</button></div>
        </div>
    `;
}

// ==================== صفحه اختصاصی کارشناس (بررسی ایراد) ====================
async function renderExpertDefectDetail(code) {
    const content = document.getElementById('content-area');
    const d = await OfflineDB.getDefectByCode(code);
    if(!d) return content.innerHTML = '<p>یافت نشد.</p>';

    // دریافت اطلاعات اخطار و 8D مرتبط
    const qans = await OfflineDB.getQANs();
    const relatedQAN = qans.find(q => q.defectCode === code);
    let related8D = null;
    if (relatedQAN) {
        related8D = await OfflineDB.get8DByQAN(relatedQAN.qanId);
    }

    // اگر آرایه مراحل وجود نداشت، ایجاد کن
    if (!d.reviewSteps) d.reviewSteps = [];

    content.innerHTML = `
        <div style="margin-bottom:15px; display:flex; justify-content:space-between; align-items:center;">
            <button class="btn btn-outline" onclick="navigate('defects')">← بازگشت به لیست</button>
            <div style="font-family:monospace; font-size:18px; font-weight:bold; color:var(--primary); background:#e3f2fd; padding:5px 15px; border-radius:8px;">کد ایراد: ${d.defectCode}</div>
        </div>

        <!-- بخش ۱: اطلاعات ثبت‌کننده و ایراد -->
        <div class="card" style="border-top: 4px solid var(--primary);">
            <h3 class="card-title" style="color:var(--primary);">۱. اطلاعات اولیه (ثبت‌شده توسط بازرس)</h3>
            <div class="form-row">
                <div class="form-col">
                    <div class="detail-row"><span class="lbl">عنوان ایراد</span><span class="val" style="font-weight:bold;">${d.title}</span></div>
                    <div class="detail-row"><span class="lbl">شماره بدنه (VIN)</span><span class="val" style="font-family:monospace;">${d.vin}</span></div>
                    <div class="detail-row"><span class="lbl">شدت ایراد</span><span class="val"><span class="badge sev-${d.severity}">${d.severity}</span></span></div>
                    <div class="detail-row"><span class="lbl">تعداد خودرو درگیر</span><span class="val">${d.qty}</span></div>
                </div>
                <div class="form-col">
                    <div class="detail-row"><span class="lbl">ثبت‌کننده</span><span class="val">${d.createdByName} (${d.createdBy})</span></div>
                    <div class="detail-row"><span class="lbl">تاریخ ثبت</span><span class="val">${Utils.formatDate(d.createdAt)}</span></div>
                    <div class="detail-row"><span class="lbl">شرح کامل</span><span class="val">${d.desc || '—'}</span></div>
                    ${d.imageBase64 ? `<img src="${d.imageBase64}" style="max-width:100%; border-radius:8px; margin-top:10px; max-height:150px;">` : ''}
                </div>
            </div>
        </div>

        <!-- بخش ۲: مراحل بررسی -->
        <div class="card" style="border-top: 4px solid var(--warning);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <h3 class="card-title" style="border:none; margin:0; padding:0; color:var(--warning);">۲. مراحل بررسی و مستندات</h3>
                <button class="btn btn-sm btn-warning" onclick="openAddStepModal('${d.defectCode}')">➕ افزودن مرحله بررسی</button>
            </div>
            
            <div class="table-wrapper">
                <table>
                    <thead><tr><th>تاریخ</th><th>توضیحات بررسی / مستندات</th><th>ثبت‌کننده</th><th>عملیات</th></tr></thead>
                    <tbody>
                        ${d.reviewSteps.map((step, index) => `
                            <tr>
                                <td style="white-space:nowrap;">${step.date}</td>
                                <td>${step.desc}</td>
                                <td>${step.by}</td>
                                <td>
                                    <button class="btn-icon edit" onclick="openEditStepModal('${d.defectCode}', ${index})">✏️ ویرایش</button>
                                    <button class="btn-icon delete" onclick="deleteReviewStep('${d.defectCode}', ${index})">🗑️ حذف</button>
                                </td>
                            </tr>
                        `).join('') || '<tr><td colspan="4" style="text-align:center; color:#888;">مرحله‌ای ثبت نشده است.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- بخش ۳: اطلاعات SLA، اخطار و 8D -->
        <div class="card" style="border-top: 4px solid var(--danger);">
            <h3 class="card-title" style="color:var(--danger);">۳. اطلاعات SLA و پاسخ سازنده</h3>
            
            <div class="form-row">
                <!-- ستون اخطار (QAN) -->
                <div class="form-col">
                    <h4 style="color:#c62828; margin-bottom:10px;">⚠️ اخطار کیفی (QAN)</h4>
                    ${relatedQAN ? `
                        <div class="detail-row"><span class="lbl">شناسه اخطار</span><span class="val">${relatedQAN.qanId}</span></div>
                        <div class="detail-row"><span class="lbl">سطح اخطار</span><span class="val">${relatedQAN.level}</span></div>
                        <div class="detail-row"><span class="lbl">جریمه (SLA)</span><span class="val" style="color:#c62828; font-weight:bold;">${relatedQAN.penalty.toLocaleString()} ریال</span></div>
                        <div class="detail-row"><span class="lbl">وضعیت</span><span class="val"><span class="badge status-${relatedQAN.status}">${relatedQAN.status}</span></span></div>
                        ${relatedQAN.rejectReason ? `<div class="detail-row"><span class="lbl">دلیل رد</span><span class="val" style="color:#c62828;">${relatedQAN.rejectReason}</span></div>` : ''}
                    ` : `
                        <div style="padding:15px; background:#fff3e0; border-radius:8px; text-align:center;">
                            <p style="color:#e65100; font-size:12px;">هنوز اخطار کیفی برای این ایراد صادر نشده است.</p>
                            <button class="btn btn-sm btn-warning" style="margin-top:10px;" onclick="openQANForm('${d.defectCode}')">صدور اخطار کیفی</button>
                        </div>
                    `}
                </div>

                <!-- ستون پاسخ سازنده (8D) -->
                <div class="form-col">
                    <h4 style="color:#2e7d32; margin-bottom:10px;">🛠️ پاسخ سازنده (8D)</h4>
                    ${related8D ? `
                        <div class="detail-row"><span class="lbl">تیم بررسی</span><span class="val">${related8D.d1_team || '—'}</span></div>
                        <div class="detail-row"><span class="lbl">ریشه یابی (D4)</span><span class="val">${related8D.d4_root_cause || '—'}</span></div>
                        <div class="detail-row"><span class="lbl">اقدام اصلاحی (D5)</span><span class="val">${related8D.d5_capa || '—'}</span></div>
                    ` : `
                        <div style="padding:15px; background:#e8f5e9; border-radius:8px; text-align:center;">
                            <p style="color:#2e7d32; font-size:12px;">سازنده هنوز پاسخی ارسال نکرده است.</p>
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;
}

// ==================== مدیریت مودال مراحل بررسی ====================
function openAddStepModal(defectCode) {
    currentReviewCode = defectCode;
    Utils.openModal(`
        <h3 style="color:var(--warning); margin-bottom:15px;">افزودن مرحله بررسی</h3>
        <div class="form-field">
            <label>شرح بررسی / مستندات</label>
            <textarea id="step_desc" class="form-control" placeholder="مثال: بررسی خودرو در پارکینگ، ارسال عکس به تأمین‌کننده..." required></textarea>
        </div>
        <button class="btn btn-warning" style="width:100%; margin-top:10px;" onclick="saveReviewStep('${defectCode}')">ثبت مرحله</button>
    `);
}

async function saveReviewStep(defectCode) {
    const desc = document.getElementById('step_desc').value.trim();
    if(!desc) return Utils.toast('توضیحات الزامی است', 'error');

    const d = await OfflineDB.getDefectByCode(defectCode);
    const session = JSON.parse(localStorage.getItem('iqdws_session'));
    
    if(!d.reviewSteps) d.reviewSteps = [];
    
    d.reviewSteps.push({
        date: new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR', {hour: '2-digit', minute:'2-digit'}),
        desc: desc,
        by: session.displayName
    });

    await OfflineDB.saveDefect(d);
    Utils.closeModal();
    Utils.toast('مرحله بررسی اضافه شد');
    renderExpertDefectDetail(defectCode);
}

async function openEditStepModal(defectCode, index) {
    const d = await OfflineDB.getDefectByCode(defectCode);
    const step = d.reviewSteps[index];
    
    Utils.openModal(`
        <h3 style="color:var(--warning); margin-bottom:15px;">ویرایش مرحله بررسی</h3>
        <div class="form-field">
            <label>شرح بررسی</label>
            <textarea id="edit_step_desc" class="form-control" required>${step.desc}</textarea>
        </div>
        <button class="btn btn-warning" style="width:100%; margin-top:10px;" onclick="updateReviewStep('${defectCode}', ${index})">ذخیره تغییرات</button>
    `);
}

async function updateReviewStep(defectCode, index) {
    const desc = document.getElementById('edit_step_desc').value.trim();
    if(!desc) return Utils.toast('توضیحات الزامی است', 'error');

    const d = await OfflineDB.getDefectByCode(defectCode);
    d.reviewSteps[index].desc = desc;
    
    await OfflineDB.saveDefect(d);
    Utils.closeModal();
    Utils.toast('تغییرات ذخیره شد');
    renderExpertDefectDetail(defectCode);
}

async function deleteReviewStep(defectCode, index) {
    if(!confirm('آیا از حذف این مرحله مطمئن هستید؟')) return;
    const d = await OfflineDB.getDefectByCode(defectCode);
    d.reviewSteps.splice(index, 1);
    await OfflineDB.saveDefect(d);
    Utils.toast('مرحله حذف شد');
    renderExpertDefectDetail(defectCode);
}