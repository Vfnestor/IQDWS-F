let currentImageBase64 = null;

function renderNewDefectForm() {
    // ... (کدهای ساخت فرم دقیقاً مثل قبل باشند، این بخش تغییری نکرده)
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
                    <button type="submit" class="btn btn-primary" id="btn-submit-defect">ذخیره در حافظه محلی</button>
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

    const defectData = {
        title: document.getElementById('d_title').value,
        vin: document.getElementById('d_vin').value,
        severity: document.getElementById('d_severity').value,
        qty: document.getElementById('d_qty').value,
        desc: document.getElementById('d_desc').value,
        imageBase64: currentImageBase64
    };

    // همیشه در حافظه محلی ذخیره می‌کنیم (بدون نیاز به اینترنت)
    await OfflineDB.addToQueue({ endpoint: '/defects', method: 'POST', data: defectData });
    
    Utils.toast('✅ ایراد در حافظه محلی ذخیره شد. برای ارسال، دکمه آپلود را بزنید.');
    navigate('defects'); // رفتن به لیست ایرادها
}

async function renderDefectList() {
    const content = document.getElementById('content-area');
    content.innerHTML = `<p>در حال خواندن از حافظه محلی...</p>`;
    
    try {
        // خواندن ایرادهای ذخیره‌شده در حافظه محلی
        const localDefects = await OfflineDB.getLocalDefects();
        
        content.innerHTML = `
            <div class="card">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                    <h2 class="card-title" style="margin:0; border:none;">لیست ایرادهای آفلاین (ذخیره‌شده)</h2>
                    <span class="badge status-pending_upload" style="background:#fff3e0; color:#e65100;">در انتظار آپلود</span>
                </div>
                <div class="table-wrapper">
                    <table>
                        <thead><tr><th>عنوان</th><th>VIN</th><th>شدت</th><th>وضعیت</th></tr></thead>
                        <tbody>
                            ${localDefects.map(d => `
                                <tr>
                                    <td>${d.title}</td>
                                    <td>${d.vin}</td>
                                    <td><span class="badge sev-${d.severity}">${d.severity}</span></td>
                                    <td><span style="color:#e65100;">آماده ارسال به سرور</span></td>
                                </tr>
                            `).join('') || '<tr><td colspan="4" style="text-align:center;">هیچ ایرادی در حافظه محلی وجود ندارد.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } catch (e) {
        content.innerHTML = `<p style="color:red;">خطا در خواندن حافظه محلی.</p>`;
    }
}