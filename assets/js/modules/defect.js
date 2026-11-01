let currentImageBase64 = null;

// ==================== ثبت ایراد (بازرس) ====================
function renderNewDefectForm() {
    const content = document.getElementById('content-area');
    currentImageBase64 = null;
    const titles = JSON.parse(localStorage.getItem('iqdws_defect_titles') || '[]');

    content.innerHTML = `
        <div class="card">
            <h2 class="card-title">ثبت ایراد جدید (بازرس خط)</h2>
            <form id="defect-form" onsubmit="submitDefectForm(event)">
                <div class="form-row">
                    <div class="form-col">
                        <div class="form-field">
                            <label>عنوان ایراد <span class="req">*</span></label>
                            <select id="d_title" class="form-control" required>
                                <option value="">— انتخاب کنید —</option>
                                ${titles.map(t => `<option value="${t}">${t}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="form-col"><div class="form-field"><label>شماره بدنه (VIN) <span class="req">*</span></label><input type="text" id="d_vin" class="form-control" required></div></div>
                </div>
                <div class="form-row">
                    <div class="form-col">
                        <div class="form-field">
                            <label>شدت ایراد <span class="req">*</span></label>
                            <select id="d_severity" class="form-control" required>
                                <option value="">— انتخاب کنید —</option>
                                <option value="S">S (ایمنی/مکانیک - بسیار بالا)</option>
                                <option value="P">P (پارک خودرو - بالا)</option>
                                <option value="A">A (مهم و تکراری)</option>
                                <option value="B">B (ظاهری/عملکردی - نیازمند ۳ قطعه)</option>
                                <option value="C">C (ظاهری/طراحی - کم)</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-col"><div class="form-field"><label>تعداد خودرو/قطعه درگیر <span class="req">*</span></label><input type="number" id="d_qty" class="form-control" min="1" required></div></div>
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
        document.getElementById('image-preview').innerHTML = `✅ عکس آماده شد`;
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
        reviewSteps: []
    };

    await OfflineDB.saveDefect(defectData);
    await OfflineDB.addToQueue({ endpoint: '/defects', method: 'POST', data: defectData });
    
    Utils.toast(`✅ ایراد با کد ${defectCode} ذخیره شد.`);
    navigate('defects');
}

// ==================== لیست ایرادها (بازرس و کارشناس) ====================
async function renderDefectList() {
    const content = document.getElementById('content-area');
    content.innerHTML = `<p>در حال خواندن...</p>`;
    const session = JSON.parse(localStorage.getItem('iqdws_session'));
    const role = session.roleId;
    
    try {
        const defects = await OfflineDB.getDefects();
        content.innerHTML = `
            <div class="card">
                <h2 class="card-title">لیست ایرادها</h2>
                <div class="table-wrapper">
                    <table>
                        <thead><tr><th>کد</th><th>عنوان</th><th>شدت</th><th>ثبت‌کننده</th><th>وضعیت</th><th>عملیات</th></tr></thead>
                        <tbody>
                            ${defects.map(d => `
                                <tr>
                                    <td style="font-family:monospace; font-weight:bold; color:var(--primary);">${d.defectCode}</td>
                                    <td>${d.title}</td>
                                    <td><span class="badge sev-${d.severity}">${d.severity}</span></td>
                                    <td>${d.createdByName}</td>
                                    <td><span class="badge status-${d.status}">${d.status}</span></td>
                                    <td>
                                        <button class="btn btn-sm btn-outline" onclick="navigate('defect-detail', '${d.defectCode}')">مشاهده</button>
                                        ${role === 'expert' ? `<button class="btn btn-sm btn-primary" onclick="navigate('expert-defect-detail', '${d.defectCode}')">ورود (بررسی)</button>` : ''}
                                        ${(role === 'inspector') ? `<button class="btn btn-sm btn-warning" onclick="navigate('inspector-followup', '${d.defectCode}')">پیگیری ایراد</button>` : ''}
                                        ${role === 'inspector' ? `<button class="btn btn-sm btn-success" onclick="openClaimModal('${d.defectCode}')">ثبت کلیم</button>` : ''}
                                    </td>
                                </tr>
                            `).join('') || '<tr><td colspan="6" style="text-align:center;">ایرادی یافت نشد</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } catch (e) { content.innerHTML = `<p style="color:red;">خطا.</p>`; }
}

// ==================== مشاهده پیگیری (فقط خواندنی برای بازرس) ====================
async function renderInspectorFollowup(code) {
    const content = document.getElementById('content-area');
    const d = await OfflineDB.getDefectByCode(code);
    if(!d) return content.innerHTML = '<p>یافت نشد.</p>';

    const qans = await OfflineDB.getQANs();
    const relatedQAN = qans.find(q => q.defectCode === code);
    const claims = await OfflineDB.getClaimsByDefect(code);

    content.innerHTML = `
        <div style="margin-bottom:15px; display:flex; justify-content:space-between;">
            <button class="btn btn-outline" onclick="navigate('defects')">← بازگشت</button>
            <h2 style="color:var(--primary); margin:0;">پیگیری ایراد ${d.defectCode}</h2>
        </div>

        <div class="card">
            <h3 class="card-title">۱. مراحل بررسی کارشناس قطعه</h3>
            <div class="table-wrapper">
                <table>
                    <thead><tr><th>تاریخ</th><th>توضیحات</th><th>ثبت‌کننده</th></tr></thead>
                    <tbody>
                        ${(d.reviewSteps || []).map(step => `
                            <tr><td>${step.date}</td><td>${step.desc}</td><td>${step.by}</td></tr>
                        `).join('') || '<tr><td colspan="3" style="text-align:center;">مرحله‌ای ثبت نشده است.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="card">
            <h3 class="card-title">۲. اطلاعات اخطار و 8D</h3>
            ${relatedQAN ? `
                <div class="detail-row"><span class="lbl">شناسه اخطار</span><span class="val">${relatedQAN.qanId}</span></div>
                <div class="detail-row"><span class="lbl">وضعیت اخطار</span><span class="val"><span class="badge status-${relatedQAN.status}">${relatedQAN.status}</span></span></div>
                <div class="detail-row"><span class="lbl">جریمه (SLA)</span><span class="val" style="color:red;">${relatedQAN.penalty.toLocaleString()} ریال</span></div>
            ` : '<p style="color:#666;">اخطاری صادر نشده است.</p>'}
        </div>

        <div class="card">
            <h3 class="card-title">۳. کارت‌های کلیم صادرشده</h3>
            <div class="table-wrapper">
                <table>
                    <thead><tr><th>شماره کلیم</th><th>قطعه</th><th>تعداد</th><th>دلیل</th><th>VINها</th></tr></thead>
                    <tbody>
                        ${claims.map(c => `
                            <tr>
                                <td>${c.claimId}</td>
                                <td>${c.partName} (${c.partNo})</td>
                                <td>${c.qty}</td>
                                <td>${c.reason}</td>
                                <td>${c.vins}</td>
                            </tr>
                        `).join('') || '<tr><td colspan="5" style="text-align:center;">کلیمی ثبت نشده است.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// ==================== فرم ثبت کارت کلیم ====================
function openClaimModal(defectCode) {
    Utils.openModal(`
        <h3 style="color:var(--secondary); margin-bottom:15px;">ثبت کارت کلیم قطعه</h3>
        <input type="hidden" id="c_defectCode" value="${defectCode}">
        <div class="form-field"><label>شماره کارت کلیم <span class="req">*</span></label><input type="text" id="c_claimId" class="form-control" required></div>
        <div class="form-field"><label>شماره فنی قطعه (Part No) <span class="req">*</span></label><input type="text" id="c_partNo" class="form-control" required></div>
        <div class="form-field"><label>نام قطعه <span class="req">*</span></label><input type="text" id="c_partName" class="form-control" required></div>
        <div class="form-field"><label>سازنده قطعه <span class="req">*</span></label><input type="text" id="c_supplier" class="form-control" required></div>
        <div class="form-field"><label>تعداد کلیم <span class="req">*</span></label><input type="number" id="c_qty" class="form-control" min="1" required></div>
        <div class="form-field"><label>دلیل کلیم <span class="req">*</span></label><textarea id="c_reason" class="form-control" required></textarea></div>
        <div class="form-field"><label>VIN خودروهای درگیر (با کاما جدا کنید) <span class="req">*</span></label><textarea id="c_vins" class="form-control" required></textarea></div>
        <button class="btn btn-success" style="width:100%; margin-top:10px;" onclick="saveClaim()">ثبت کلیم</button>
    `);
}

async function saveClaim() {
    const session = JSON.parse(localStorage.getItem('iqdws_session'));
    const claimData = {
        claimId: document.getElementById('c_claimId').value.trim(),
        defectCode: document.getElementById('c_defectCode').value,
        partNo: document.getElementById('c_partNo').value.trim(),
        partName: document.getElementById('c_partName').value.trim(),
        supplier: document.getElementById('c_supplier').value.trim(),
        qty: parseInt(document.getElementById('c_qty').value),
        reason: document.getElementById('c_reason').value.trim(),
        vins: document.getElementById('c_vins').value.trim(),
        createdBy: session.username,
        createdAt: new Date().toISOString()
    };

    if(!claimData.claimId || !claimData.partNo || !claimData.qty) return Utils.toast('اطلاعات ناقص است', 'error');

    await OfflineDB.saveClaim(claimData);
    Utils.toast('کارت کلیم ثبت شد');
    Utils.closeModal();
    navigate('defects');
}