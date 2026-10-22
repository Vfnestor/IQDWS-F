function renderSupportPanel() {
    const content = document.getElementById('content-area');
    let bugs = JSON.parse(localStorage.getItem('iqdws_bugs')) || [
        { id: 'BUG-101', title: 'مشکل نمایش تاریخ در فایرفاکس', priority: 'medium', status: 'open', date: '1403/08/01' }
    ];

    content.innerHTML = `
        <h2 class="page-title">پشتیبانی و رفع باگ (حالت محلی)</h2>
        
        <div class="card" style="margin-bottom: 20px;">
            <div class="card-title">ثبت گزارش جدید</div>
            <div class="form-row">
                <div class="form-col"><input type="text" id="bug_title" class="form-control" placeholder="عنوان مشکل..."></div>
                <div class="form-col">
                    <select id="bug_priority" class="form-control">
                        <option value="low">اولویت کم</option>
                        <option value="medium">متوسط</option>
                        <option value="high">بحرانی</option>
                    </select>
                </div>
            </div>
            <button class="btn btn-primary" style="margin-top: 10px; background-color: #4a148c;" onclick="submitBug()">ثبت باگ</button>
        </div>

        <div class="card">
            <div class="card-title">لیست باگ‌ها</div>
            <div id="bug-list">
                ${bugs.map(b => `
                    <div class="bug-card ${b.status === 'resolved' ? 'resolved' : ''}">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div>
                                <strong style="color:#4a148c;">${b.id}</strong> - ${b.title}
                            </div>
                            <div>
                                ${b.status === 'open' 
                                    ? `<button class="btn btn-sm btn-success" onclick="resolveBug('${b.id}')">حل شد</button>` 
                                    : `<span class="badge status-closed">حل شده</span>`}
                            </div>
                        </div>
                    </div>
                `).join('') || '<p>باگی ثبت نشده است.</p>'}
            </div>
        </div>
    `;
}

function submitBug() {
    const title = document.getElementById('bug_title').value;
    const priority = document.getElementById('bug_priority').value;
    if(!title) return Utils.toast('عنوان را وارد کنید', 'error');

    let bugs = JSON.parse(localStorage.getItem('iqdws_bugs')) || [];
    bugs.unshift({ id: 'BUG-' + Math.floor(Math.random() * 900 + 100), title, priority, status: 'open', date: new Date().toLocaleDateString('fa-IR') });
    localStorage.setItem('iqdws_bugs', JSON.stringify(bugs));
    Utils.toast('باگ ثبت شد');
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