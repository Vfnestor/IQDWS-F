function renderNewDefectForm() {
    const content = document.getElementById('content-area');
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
                            <label>شدت ایراد <span class="req">*</span></label>
                            <select id="d_severity" class="form-control" required>
                                <option value="critical">بحرانی</option>
                                <option value="major">ماژور</option>
                                <option value="minor">مینور</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-col">
                        <div class="form-field">
                            <label>تعداد خودرو درگیر <span class="req">*</span></label>
                            <input type="number" id="d_qty" class="form-control" min="1" required>
                        </div>
                    </div>
                </div>
                <div class="form-field">
                    <label>شرح کامل</label>
                    <textarea id="d_desc" class="form-control"></textarea>
                </div>

                <div class="smart-box">
                    <div class="smart-title">🤖 دستیار هوشمند</div>
                    <div class="smart-hint"><strong>H1 (طبقه‌بندی):</strong> پیشنهاد: شدت ماژور (۸۷٪) بر اساس عنوان.</div>
                    <div class="smart-hint"><strong>H2 (تکرار):</strong> ۲ ایراد مشابه در ۳۰ روز گذشته یافت شد.</div>
                    <div class="smart-hint"><strong>H3 (ریسک):</strong> امتیاز ریسک: ۷۸/۱۰۰ (نیاز به بررسی فوری).</div>
                </div>

                <div style="margin-top: 20px;">
                    <button type="submit" class="btn btn-primary">ثبت و ارسال به کارتابل</button>
                </div>
            </form>
        </div>
    `;
}

function submitDefectForm(e) {
    e.preventDefault();
    const newDefect = API.createDefect({
        title: document.getElementById('d_title').value,
        vin: document.getElementById('d_vin').value,
        severity: document.getElementById('d_severity').value,
        qty: document.getElementById('d_qty').value,
        desc: document.getElementById('d_desc').value
    });
    
    Utils.toast('ایراد با شناسه ' + newDefect.id + ' ثبت شد');
    navigate('dashboard');
}