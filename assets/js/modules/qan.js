async function openQANForm(defectCode) {
    const d = await OfflineDB.getDefectByCode(defectCode);
    if(!d) return Utils.toast('ایراد یافت نشد', 'error');

    const role = JSON.parse(localStorage.getItem('iqdws_session')).roleId;
    // مسول بخش نیاز به تایید خودش ندارد (استثنا)
    const initialStatus = role === 'dept_head' ? 'pending_office' : 'pending_dept';

    Utils.openModal(`
        <h3 style="color:var(--warning); margin-bottom:15px;">صدور اخطار کیفی برای ${d.defectCode}</h3>
        <div class="form-field">
            <label>عنوان ایراد (از ایراد خوانده شده)</label>
            <input type="text" class="form-control" value="${d.title}" readonly style="background:#f5f5f5;">
        </div>
        <div class="form-field">
            <label>سطح اخطار</label>
            <select id="q_level" class="form-control">
                <option value="L1">L1 - تذکر</option>
                <option value="L2" selected>L2 - اخطار کتبی</option>
                <option value="L3">L3 - جریمه</option>
            </select>
        </div>
        <div class="form-field">
            <label>جریمه (ریال)</label>
            <input type="number" id="q_penalty" class="form-control" value="50000000">
        </div>
        <div class="form-field">
            <label>توضیحات اخطار</label>
            <textarea id="q_desc" class="form-control">اخطار کیفی صادر شده برای کد ایراد ${d.defectCode}</textarea>
        </div>
        <button class="btn btn-warning" style="width:100%; margin-top:10px;" onclick="submitQAN('${d.defectCode}', '${initialStatus}')">
            ثبت و ارسال برای تایید
        </button>
    `);
}

async function submitQAN(defectCode, initialStatus) {
    const qanData = {
        qanId: 'QAN-' + Date.now(),
        defectCode: defectCode,
        title: 'اخطار مرتبط با ' + defectCode,
        level: document.getElementById('q_level').value,
        penalty: document.getElementById('q_penalty').value,
        desc: document.getElementById('q_desc').value,
        status: initialStatus,
        createdAt: new Date().toISOString()
    };

    await OfflineDB.saveQAN(qanData);
    await OfflineDB.addToQueue({ endpoint: '/qans', method: 'POST', data: qanData });

    // تغییر وضعیت ایراد
    const d = await OfflineDB.getDefectByCode(defectCode);
    d.status = 'qan_issued';
    await OfflineDB.saveDefect(d);

    Utils.closeModal();
    Utils.toast('اخطار با موفقیت صادر شد');
    navigate('qans');
}

async function renderQANList() {
    const content = document.getElementById('content-area');
    const role = JSON.parse(localStorage.getItem('iqdws_session')).roleId;
    const qans = await OfflineDB.getQANs();

    content.innerHTML = `
        <div class="card">
            <h2 class="card-title">اخطارهای کیفی</h2>
            <div class="table-wrapper">
                <table>
                    <thead><tr><th>شناسه</th><th>کد ایراد</th><th>سطح</th><th>وضعیت</th><th>عملیات</th></tr></thead>
                    <tbody>
                        ${qans.map(q => {
                            let actions = '';
                            if (role === 'dept_head' && q.status === 'pending_dept') {
                                actions = `
                                    <button class="btn btn-sm btn-success" onclick="updateQANStatus('${q.qanId}', 'pending_office')">تایید</button>
                                    <button class="btn btn-sm btn-danger" onclick="rejectQAN('${q.qanId}')">رد</button>
                                `;
                            } else if (role === 'office_head' && q.status === 'pending_office') {
                                actions = `
                                    <button class="btn btn-sm btn-success" onclick="updateQANStatus('${q.qanId}', 'approved')">تایید نهایی</button>
                                    <button class="btn btn-sm btn-danger" onclick="rejectQAN('${q.qanId}')">رد</button>
                                `;
                            } else {
                                actions = `<span class="text-muted" style="font-size:11px;">در انتظار بررسی</span>`;
                            }

                            return `
                                <tr>
                                    <td style="font-family:monospace;">${q.qanId.split('-')[1]}</td>
                                    <td style="color:var(--primary); font-weight:bold;">${q.defectCode}</td>
                                    <td>${q.level}</td>
                                    <td><span class="badge status-${q.status}">${q.status}</span></td>
                                    <td>${actions}</td>
                                </tr>
                            `;
                        }).join('') || '<tr><td colspan="5" style="text-align:center;">اخطاری یافت نشد</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

async function updateQANStatus(qanId, newStatus) {
    const qans = await OfflineDB.getQANs();
    const qan = qans.find(q => q.qanId === qanId);
    if(qan) {
        qan.status = newStatus;
        await OfflineDB.saveQAN(qan);
        Utils.toast('وضعیت اخطار به‌روزرسانی شد');
        renderQANList();
    }
}

async function rejectQAN(qanId) {
    const reason = prompt("لطفاً دلیل رد اخطار را وارد کنید:");
    if(reason === null) return; // کاربر لغو کرد
    if(!reason.trim()) return alert('وارد کردن دلیل الزامی است.');

    const qans = await OfflineDB.getQANs();
    const qan = qans.find(q => q.qanId === qanId);
    if(qan) {
        qan.status = 'rejected';
        qan.rejectReason = reason;
        await OfflineDB.saveQAN(qan);
        Utils.toast('اخطار رد شد', 'error');
        renderQANList();
    }
}