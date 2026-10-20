const session = checkAuth('main');
if (session) {
    document.getElementById('user-name').innerText = session.roleName;
}

function navigate(view) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    event.target.classList.add('active');
    
    const content = document.getElementById('content-area');
    
    if (view === 'dashboard') {
        content.innerHTML = `
            <h2 class="card-title">داشبورد سامانه مادر</h2>
            <div class="card">
                <p>خوش آمدید، <b>${session.roleName}</b></p>
                <div style="display:flex; gap:15px; margin-top:15px;">
                    <div class="card" style="flex:1; background:#e3f2fd;">
                        <h3>ایرادهای باز</h3>
                        <p style="font-size:24px; color:var(--primary); font-weight:bold;">${db.defects.length}</p>
                    </div>
                    <div class="card" style="flex:1; background:#fff8e1;">
                        <h3>اخطارها</h3>
                        <p style="font-size:24px; color:var(--warning); font-weight:bold;">${db.qans.length}</p>
                    </div>
                </div>
            </div>
        `;
    } else if (view === 'new-defect') {
        content.innerHTML = `
            <div class="card">
                <h2 class="card-title">ثبت ایراد جدید</h2>
                <div class="form-group">
                    <label>عنوان ایراد</label>
                    <input type="text" id="d_title" class="form-control">
                </div>
                <div class="form-group">
                    <label>شماره بدنه (VIN)</label>
                    <input type="text" id="d_vin" class="form-control">
                </div>
                <button class="btn btn-primary" onclick="submitDefect()">ثبت ایراد</button>
            </div>
        `;
    } else if (view === 'defects') {
        content.innerHTML = `
            <div class="card">
                <h2 class="card-title">لیست ایرادها</h2>
                <div class="table-responsive">
                    <table>
                        <tr><th>شناسه</th><th>عنوان</th><th>شدت</th><th>وضعیت</th></tr>
                        ${db.defects.map(d => `<tr><td>${d.id}</td><td>${d.title}</td><td>${d.severity}</td><td>${d.status}</td></tr>`).join('')}
                    </table>
                </div>
            </div>
        `;
    }
}

function submitDefect() {
    const title = document.getElementById('d_title').value;
    const vin = document.getElementById('d_vin').value;
    if(!title || !vin) return alert('عنوان و VIN الزامی است');
    
    db.defects.push({
        id: 'DEF-' + Math.floor(Math.random()*9000+1000),
        title: title, vin: vin, part: 'نامشخص', severity: 'major', status: 'registered', date: 'امروز'
    });
    saveDB();
    alert('ایراد با موفقیت ثبت شد');
    navigate('dashboard');
}

// لود اولیه
window.onload = () => navigate('dashboard');