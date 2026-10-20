let currentImageBase64 = null;

function renderNewDefectForm() {
    const content = document.getElementById('content-area');
    currentImageBase64 = null; // ریست کردن عکس

    content.innerHTML = `
        <div class="card">
            <h2 class="card-title">ثبت ایراد جدید</h2>
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

                <!-- بخش آپلود عکس -->
                <div class="form-field" style="background:#f9f9f9; padding:15px; border-radius:8px; border:1px dashed #ccc;">
                    <label>📷 افزودن عکس (اختیاری - با قابلیت برش و فشرده‌سازی)</label>
                    <input type="file" id="d_image" accept="image/*" class="form-control" onchange="handleImageUpload(event)">
                    <div id="image-preview" style="margin-top:10px; font-size:12px; color:#2e7d32;"></div>
                </div>

                <div style="margin-top: 20px;">
                    <button type="submit" class="btn btn-primary" id="btn-submit-defect">ثبت و ارسال</button>
                </div>
            </form>
        </div>
    `;
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // باز کردن مودال برش
    ImageUtils.openCropModal(file, (base64) => {
        currentImageBase64 = base64;
        document.getElementById('image-preview').innerHTML = `✅ عکس بهینه‌سازی شد (حجم: ${Math.round(base64.length / 1024)} کیلوبایت)`;
    });
}

async function submitDefectForm(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-submit-defect');
    btn.disabled = true;
    btn.innerText = 'در حال پردازش...';

    const defectData = {
        title: document.getElementById('d_title').value,
        vin: document.getElementById('d_vin').value,
        severity: document.getElementById('d_severity').value,
        qty: document.getElementById('d_qty').value,
        desc: document.getElementById('d_desc').value,
        imageBase64: currentImageBase64 // ارسال عکس فشرده‌شده
    };

    if (navigator.onLine) {
        // اگر آنلاین بود، مستقیم بفرست
        try {
            await API.createDefect(defectData);
            Utils.toast('ایراد با موفقیت در سرور ثبت شد');
            navigate('dashboard');
        } catch (error) {
            Utils.toast('خطا در سرور. به صف آفلاین منتقل شد.', 'error');
            await OfflineDB.addToQueue({ endpoint: '/defects', method: 'POST', data: defectData });
            navigate('dashboard');
        }
    } else {
        // اگر آفلاین بود، در صف ذخیره کن
        await OfflineDB.addToQueue({ endpoint: '/defects', method: 'POST', data: defectData });
        Utils.toast('⚠️ شما آفلاین هستید. ایراد در حافظه ذخیره شد و پس از اتصال ارسال می‌شود.');
        navigate('dashboard');
    }
}