function renderSupportPanel() {
    const content = document.getElementById('content-area');
    let titles = JSON.parse(localStorage.getItem('iqdws_defect_titles') || '[]');

    content.innerHTML = `
        <h2 class="page-title">پشتیبانی و تنظیمات (آفلاین)</h2>
        
        <div class="card" style="margin-bottom: 20px;">
            <div class="card-title">مدیریت عنوان‌های ایراد (فرم ثبت بازرس)</div>
            <div style="display:flex; gap:10px; margin-bottom:15px;">
                <input type="text" id="new_title" class="form-control" placeholder="عنوان جدید را وارد کنید...">
                <button class="btn btn-primary" style="background:#4a148c;" onclick="addDefectTitle()">افزودن</button>
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