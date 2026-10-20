// سیستم پشتیبانی و ثبت باگ (داده‌ها فعلاً در حافظه لوکال مرورگر برای تست هستند)
function renderSupportPanel() {
    const content = document.getElementById('content-area');
    let bugs = JSON.parse(localStorage.getItem('iqdws_bugs')) || [
        { id: 'BUG-101', title: 'مشکل در ثبت VIN با حروف کوچک', priority: 'high', status: 'open', date: '1403/08/10' }
    ];

    content.innerHTML = `
        <h2 class="page-title">پشتیبانی و رفع باگ</h2>
        
        <div class="card" style="margin-bottom: 20px;">
            <div class="card-title">ثبت باگ یا درخواست ارتقا جدید</div>
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
            <button class="btn btn-primary" style="margin-top: 10px; background-color: #4a148c;" onclick="submitBug()">ثبت در سیستم</button>
        </div>

        <div class="card">
            <div class="card-title">لیست باگ‌ها و درخواست‌ها</div>
            <div id="bug-list">
                ${bugs.map(b => `
                    <div class="bug-card ${b.status === 'resolved' ? 'resolved' : ''}">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div>
                                <strong style="color:#4a148c;">${b.id}</strong> - ${b.title}
                                <div style="font-size:11px; color:#666; margin-top:5px;">تاریخ ثبت: ${b.date}</div>
                            </div>
                            <div>
                                <span class="badge ${b.priority === 'high' ? 'sev-critical' : b.priority === 'medium' ? 'sev-major' : 'sev-minor'}">
                                    ${b.priority === 'high' ? 'بحرانی' : b.priority === 'medium' ? 'متوسط' : 'کم'}
                                </span>
                                ${b.status === 'open' 
                                    ? `<button class="btn btn-sm btn-success" onclick="resolveBug('${b.id}')">حل شد</button>` 
                                    : `<span class="badge status-closed">حل شده</span>`}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function submitBug() {
    const title = document.getElementById('bug_title').value;
    const priority = document.getElementById('bug_priority').value;
    if(!title) return Utils.toast('عنوان را وارد کنید', 'error');

    let bugs = JSON.parse(localStorage.getItem('iqdws_bugs')) || [];
    bugs.unshift({
        id: 'BUG-' + Math.floor(Math.random() * 900 + 100),
        title: title,
        priority: priority,
        status: 'open',
        date: new Date().toLocaleDateString('fa-IR')
    });

    localStorage.setItem('iqdws_bugs', JSON.stringify(bugs));
    Utils.toast('باگ جدید ثبت شد');
    renderSupportPanel();
}

function resolveBug(id) {
    let bugs = JSON.parse(localStorage.getItem('iqdws_bugs')) || [];
    const bug = bugs.find(b => b.id === id);
    if(bug) {
        bug.status = 'resolved';
        localStorage.setItem('iqdws_bugs', JSON.stringify(bugs));
        Utils.toast('باگ حل‌شده علامت‌گذاری شد');
        renderSupportPanel();
    }
}