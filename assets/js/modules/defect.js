let currentImageBase64 = null;

function renderNewDefectForm() {
    const content = document.getElementById('content-area');
    currentImageBase64 = null;
    content.innerHTML = `
        <div class="card">
            <h2 class="card-title">ثبت ایراد جدید (حالت آفلاین)</h2>
            <form id="defect-form" onsubmit="submitDefectForm(event)">
                <div class="form-row">
                    <div class="form-col">
                        <div class="form-field">
                            <label>عنوان ایراد <span class="req">*</span></label>
                            <input type="text" id="d_title" class="form-control" required>
                        </div>
                    </div>
                    <div class="form-col">
                        <div class="form-field">
                            <label>شماره بدنه (VIN) <span class="req">*</span></label>
                            <input type="text" id="d_vin" class="form-control" required>
                        </div>
                    </div>
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
                    <div class="form-col">
                        <div class="form-field">
                            <label>تعداد خودرو</label>
                            <input type="number" id="d_qty" class="form-control" min="1" required>
                        </div>
                    </div>
                </div>
                <div class="form-field">
                    <label>شرح کامل</label>
                    <textarea id="d_desc" class="form-control"></textarea>
                </div>

                <div class="form-field" style="background:#f9f9f9; padding:15px; border-radius:8px; border:1px dashed #ccc;">
                    <label>📷 افزودن عکس (اختیاری)</label>
                    <input type="file" id="d_image" accept="image/*" class="form-control" onchange="handleImageUpload(event)">
                    <div id="image-preview" style="margin-top:10px; font-size:12px; color:#2e7d32;"></div>
                </div>

                <div style="margin-top: 20px;">
                    <button type="submit" class="btn btn-primary" id="btn-submit-defect">ثبت ایراد و تولید کد</button>
                </div>
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
    btn.disabled = true;
    btn.innerText = 'در حال ذخیره...';

    const severity = document.getElementById('d_severity').value;
    const defectCode = Utils.generateDefectCode(severity);

    const defectData = {
        defectCode: defectCode,
        title: document.getElementById('d_title').value,
        vin: document.getElementById('d_vin').value,
        severity: severity,
        qty: document.getElementById('d_qty').value,
        desc: document.getElementById('d_desc').value,
        imageBase64: currentImageBase64,
        status: 'registered',
        createdBy: JSON.parse(localStorage.getItem('iqdws_session')).roleName,
        createdAt: new Date().toISOString()
    };

    await OfflineDB.saveDefect(defectData);
    await OfflineDB.addToQueue({ endpoint: '/defects', method: 'POST', data: defectData });
    
    Utils.toast(`✅ ایراد با کد ${defectCode} ذخیره شد.`);
    navigate('defects');
}

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
                        <thead><tr><th>کد ایراد</th><th>عنوان</th><th>شدت</th><th>وضعیت</th><th>عملیات</th></tr></thead>
                        <tbody>
                            ${defects.map(d => `
                                <tr>
                                    <td style="font-family:monospace; font-weight:bold; color:var(--primary);">${d.defectCode}</td>
                                    <td>${d.title}</td>
                                    <td><span class="badge sev-${d.severity}">${d.severity}</span></td>
                                    <td><span class="badge status-${d.status}">${d.status}</span></td>
                                    <td>
                                        <button class="btn btn-sm btn-outline" onclick="navigate('defect-detail', '${d.defectCode}')">مشاهده</button>
                                        ${(role === 'expert' || role === 'dept_head') && d.status === 'registered' ? 
                                            `<button class="btn btn-sm btn-warning" onclick="openQANForm('${d.defectCode}')">صدور اخطار</button>` : ''}
                                    </td>
                                </tr>
                            `).join('') || '<tr><td colspan="5" style="text-align:center;">ایرادی یافت نشد</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } catch (e) {
        content.innerHTML = `<p style="color:red;">خطا در خواندن حافظه.</p>`;
    }
}

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
            <div class="detail-row"><span class="lbl">ثبت‌کننده</span><span class="val">${d.createdBy}</span></div>
            ${d.imageBase64 ? `<div style="margin-top:15px;"><img src="${d.imageBase64}" style="max-width:100%; border-radius:8px;"></div>` : ''}
            <div style="margin-top:20px;">
                <button class="btn btn-outline" onclick="navigate('defects')">← بازگشت به لیست</button>
            </div>
        </div>
    `;
}