async function openQANForm(defectCode) {
    const d = await OfflineDB.getDefectByCode(defectCode);
    if(!d) return Utils.toast('ایراد یافت نشد', 'error');

    // قانون B: حداقل 3 قطعه
    if (d.severity === 'B' && parseInt(d.qty) < 3) {
        return alert('برای شدت B، تعداد قطعات ایراددار باید حداقل ۳ عدد باشد تا امکان صدور اخطار وجود داشته باشد.');
    }

    const session = JSON.parse(localStorage.getItem('iqdws_session'));
    const initialStatus = session.roleId === 'dept_head' ? 'pending_office' : 'pending_dept';

    Utils.openModal(`
        <h3 style="color:var(--warning); margin-bottom:15px;">صدور اخطار کیفی برای ${d.defectCode}</h3>
        <div class="form-field"><label>شدت ایراد</label><input type="text" class="form-control" value="${d.severity}" readonly style="background:#f5f5f5;"></div>
        <div class="form-field"><label>سطح اخطار</label>
            <select id="q_level" class="form-control">
                <option value="L1">L1 - تذکر</option>
                <option value="L2" selected>L2 - اخطار کتبی</option>
                <option value="L3">L3 - جریمه</option>
            </select>
        </div>
        <div class="form-field"><label>جریمه پیشنهادی (ریال)</label><input type="number" id="q_penalty" class="form-control"></div>
        <div class="form-field"><label>توضیحات اخطار</label><textarea id="q_desc" class="form-control"></textarea></div>
        <button class="btn btn-warning" style="width:100%; margin-top:10px;" onclick="submitQAN('${d.defectCode}', '${initialStatus}')">ثبت اخطار</button>
    `);

    // محاسبه خودکار جریمه پیشنهادی بر اساس قوانین جدید
    setTimeout(async () => {
        const claims = await OfflineDB.getClaimsByDefect(defectCode);
        let totalClaimQty = claims.reduce((sum, c) => sum + c.qty, 0);
        // هر قطعه کلیم 2 برابر حساب می‌شود
        let claimPenaltyFactor = totalClaimQty * 2;

        let base = 0;
        if(d.severity === 'S') base = 500000000;
        else if(d.severity === 'P') base = 400000000;
        else if(d.severity === 'A') base = 200000000;
        else if(d.severity === 'B') base = 100000000;
        else base = 50000000;

        // فرمول ساده: پایه * تعداد خودرو + (کلیم * 2 * پایه)
        let finalPenalty = (base * d.qty) + (claimPenaltyFactor * base);
        document.getElementById('q_penalty').value = finalPenalty;
    }, 100);
}

async function submitQAN(defectCode, initialStatus) {
    const session = JSON.parse(localStorage.getItem('iqdws_session'));
    const qanData = {
        qanId: 'QAN-' + Date.now(),
        defectCode: defectCode,
        title: 'اخطار مرتبط با ' + defectCode,
        level: document.getElementById('q_level').value,
        penalty: document.getElementById('q_penalty').value,
        desc: document.getElementById('q_desc').value,
        status: initialStatus,
        createdBy: session.username,
        createdByName: session.displayName,
        createdAt: new Date().toISOString()
    };

    await OfflineDB.saveQAN(qanData);
    await OfflineDB.addToQueue({ endpoint: '/qans', method: 'POST', data: qanData });

    const d = await OfflineDB.getDefectByCode(defectCode);
    d.status = 'qan_issued';
    await OfflineDB.saveDefect(d);

    Utils.closeModal();
    Utils.toast('اخطار صادر شد');
    navigate('qans');
}

async function renderQANList() {
    const content = document.getElementById('content-area');
    const session = JSON.parse(localStorage.getItem('iqdws_session'));
    const qans = await OfflineDB.getQANs();

    content.innerHTML = `
        <div class="card">
            <h2 class="card-title">اخطارهای کیفی</h2>
            <div class="table-wrapper">
                <table>
                    <thead><tr><th>شناسه</th><th>کد ایراد</th><th>سطح</th><th>جریمه (ریال)</th><th>وضعیت</th><th>عملیات</th></tr></thead>
                    <tbody>
                        ${qans.map(q => {
                            let actions = '';
                            if (session.roleId === 'dept_head' && q.status === 'pending_dept') {
                                actions = `<button class="btn btn-sm btn-success" onclick="updateQANStatus('${q.qanId}', 'pending_office')">تایید</button>`;
                            } else if (session.roleId === 'office_head' && q.status === 'pending_office') {
                                actions = `<button class="btn btn-sm btn-success" onclick="updateQANStatus('${q.qanId}', 'approved')">تایید نهایی</button>`;
                            } else { actions = `<span style="font-size:11px; color:#888;">در انتظار</span>`; }

                            return `
                                <tr>
                                    <td style="font-family:monospace;">${q.qanId.split('-')[1]}</td>
                                    <td style="color:var(--primary); font-weight:bold;">${q.defectCode}</td>
                                    <td>${q.level}</td>
                                    <td style="color:#c62828; font-weight:bold;">${parseInt(q.penalty).toLocaleString()}</td>
                                    <td><span class="badge status-${q.status}">${q.status}</span></td>
                                    <td>${actions}</td>
                                </tr>
                            `;
                        }).join('') || '<tr><td colspan="6" style="text-align:center;">اخطاری یافت نشد</td></tr>'}
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
        Utils.toast('وضعیت به‌روزرسانی شد');
        renderQANList();
    }
}