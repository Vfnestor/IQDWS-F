function renderSupportPanel() {
    const content = document.getElementById('content-area');
    let titles = JSON.parse(localStorage.getItem('iqdws_defect_titles') || '[]');

    content.innerHTML = `
        <h2 class="page-title">تنظیمات و پشتیبانی</h2>
        
        <!-- بخش پشتیبان‌گیری -->
        <div class="card" style="border-right:4px solid var(--primary); margin-bottom: 20px;">
            <h3 class="card-title" style="color:var(--primary);">💾 پشتیبان‌گیری و بازیابی دیتابیس</h3>
            <p style="font-size:12px; color:#666; margin-bottom:15px;">اطلاعات شما به صورت دائمی در حافظه گوشی/کامپیوتر ذخیره می‌شود. اما برای امنیت بیشتر می‌توانید یک نسخه پشتیبان روی گوشی خود دانلود کنید.</p>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
                <button class="btn btn-primary" onclick="BackupManager.exportData()">⬇️ دانلود فایل پشتیبان (Export)</button>
                
                <label class="btn btn-warning" style="cursor:pointer; color:#fff; background:#ef6c00;">
                    ⬆️ بازیابی از فایل (Import)
                    <input type="file" accept=".json" style="display:none;" onchange="if(this.files[0]) BackupManager.importData(this.files[0])">
                </label>
            </div>
        </div>

        <!-- مدیریت عنوان‌های ایراد -->
        <div class="card" style="margin-bottom: 20px;">
            <h3 class="card-title">📝 مدیریت عنوان‌های ایراد</h3>
            <div style="display:flex; gap:10px; margin-bottom:15px;">
                <input type="text" id="new_title" class="form-control" placeholder="عنوان جدید را وارد کنید...">
                <button class="btn btn-primary" style="background:#4a148c; white-space:nowrap;" onclick="addDefectTitle()">افزودن</button>
            </div>
            <div class="table-wrapper">
                <table>
                    <thead><tr><th>عنوان</th><th>عملیات</th></tr></thead>
                    <tbody>
                        ${titles.map((t, i) => `
                            <tr>
                                <td>${t}</td>
                                <td><button class="btn-icon delete" onclick="deleteDefectTitle(${i})">حذف</button></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function addDefectTitle() {
    const val = document.getElementById('new_title').value.trim();
    if(!val) return;
    let titles = JSON.parse(localStorage.getItem('iqdws_defect_titles') || '[]');
    if(!titles.includes(val)) {
        titles.push(val);
        localStorage.setItem('iqdws_defect_titles', JSON.stringify(titles));
        renderSupportPanel();
        Utils.toast('عنوان اضافه شد');
    }
}

function deleteDefectTitle(index) {
    if(!confirm('حذف شود؟')) return;
    let titles = JSON.parse(localStorage.getItem('iqdws_defect_titles') || '[]');
    titles.splice(index, 1);
    localStorage.setItem('iqdws_defect_titles', JSON.stringify(titles));
    renderSupportPanel();
    Utils.toast('عنوان حذف شد');
}