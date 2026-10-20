async function renderSupportPanel() {
    const content = document.getElementById('content-area');
    content.innerHTML = `<p>در حال دریافت لیست باگ‌ها از سرور...</p>`;
    
    try {
        const bugs = await AdminAPI.getBugs();

        content.innerHTML = `
            <h2 class="page-title">پشتیبانی و رفع باگ (متصل به سرور)</h2>
            
            <div class="card" style="margin-bottom: 20px;">
                <div class="card-title">ثبت گزارش جدید</div>
                <div class="form-row">
                    <div class="form-col">
                        <input type="text" id="bug_title" class="form-control" placeholder="عنوان مشکل یا پیشنهاد...">
                    </div>
                    <div class="form-col">
                        <select id="bug_priority" class="form-control">
                            <option value="low">اولویت کم</option>
                            <option value="medium">اولویت متوسط</option>
                            <option value="high">اولویت بالا (بحرانی)</option>
                        </select>
                    </div>
                </div>
                <button class="btn btn-primary" style="margin-top: 10px; background-color: #4a148c;" onclick="submitBug()">ارسال به سرور</button>
            </div>

            <div class="card">
                <div class="card-title">لیست باگ‌ها</div>
                <div id="bug-list">
                    ${bugs.map(b => `
                        <div class="bug-card ${b.status === 'resolved' ? 'resolved' : ''}">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <div>
                                    <strong style="color:#4a148c;">${b.id}</strong> - ${b.title}
                                    <div style="font-size:11px; color:#666; margin-top:5px;">ثبت توسط: ${b.reportedBy}</div>
                                </div>
                                <div>
                                    <span class="badge ${b.priority === 'high' ? 'sev-critical' : b.priority === 'medium' ? 'sev-major' : 'sev-minor'}">
                                        ${b.priority === 'high' ? 'بحرانی' : b.priority === 'medium' ? 'متوسط' : 'کم'}
                                    </span>
                                    ${b.status === 'open' 
                                        ? `<button class="btn btn-sm btn-success" onclick="resolveBug('${b.id}')">حل شد</button>` 
                                        : `<span class="badge status-closed" style="margin-right:5px;">حل شده</span>`}
                                </div>
                            </div>
                        </div>
                    `).join('') || '<p>هیچ باگی ثبت نشده است.</p>'}
                </div>
            </div>
        `;
    } catch (e) {
        content.innerHTML = `<p style="color:red;">خطا در اتصال به سرور</p>`;
    }
}

async function submitBug() {
    const title = document.getElementById('bug_title').value;
    const priority = document.getElementById('bug_priority').value;
    if(!title) return Utils.toast('عنوان را وارد کنید', 'error');

    await AdminAPI.createBug(title, priority);
    Utils.toast('باگ با موفقیت به سرور ارسال شد');
    renderSupportPanel();
}

async function resolveBug(id) {
    await AdminAPI.resolveBug(id);
    Utils.toast('باگ در سرور حل‌شده علامت‌گذاری شد');
    renderSupportPanel();
}