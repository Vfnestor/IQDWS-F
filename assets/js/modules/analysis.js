async function renderAnalysisRequest() {
    const content = document.getElementById('content-area');
    const defects = await OfflineDB.getDefects();
    const tasks = await OfflineDB.getAnalysisTasks();

    content.innerHTML = `
        <div class="card">
            <h2 class="card-title">درخواست آنالیز ایراد</h2>
            <div class="alert-box warning" style="margin-bottom:20px;">
                <strong>توجه:</strong> ارجاع به آنالیز برند یا مرکزی هزینه دارد و از سازنده دریافت می‌شود. نظر کارشناس آنالیز قطعی است.
            </div>
            <form onsubmit="submitAnalysisRequest(event)">
                <div class="form-row">
                    <div class="form-col">
                        <div class="form-field">
                            <label>انتخاب ایراد <span class="req">*</span></label>
                            <select id="a_defectCode" class="form-control" required>
                                <option value="">— انتخاب کنید —</option>
                                ${defects.filter(d => d.status !== 'closed').map(d => `<option value="${d.defectCode}">${d.defectCode} - ${d.title}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="form-col">
                        <div class="form-field">
                            <label>سطح آنالیز <span class="req">*</span></label>
                            <select id="a_level" class="form-control" required>
                                <option value="brand">آنالیز برند (Brand Analysis)</option>
                                <option value="central">آنالیز مرکزی (Central Analysis)</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="form-field">
                    <label>دلیل ارجاع به آنالیز <span class="req">*</span></label>
                    <textarea id="a_reason" class="form-control" required placeholder="چرا کارشناس قطعه نتوانست ایراد را رفع کند؟"></textarea>
                </div>
                <button type="submit" class="btn btn-primary" style="margin-top:15px; background:#e65100;">ایجاد تسک آنالیز</button>
            </form>
        </div>

        <div class="card">
            <h2 class="card-title">تاریخچه تسک‌های آنالیز</h2>
            <div class="table-wrapper">
                <table>
                    <thead><tr><th>شناسه تسک</th><th>کد ایراد</th><th>سطح</th><th>وضعیت</th><th>تاریخ ثبت</th></tr></thead>
                    <tbody>
                        ${tasks.map(t => `
                            <tr>
                                <td style="font-family:monospace;">${t.taskId}</td>
                                <td style="color:var(--primary); font-weight:bold;">${t.defectCode}</td>
                                <td>${t.level === 'brand' ? 'آنالیز برند' : 'آنالیز مرکزی'}</td>
                                <td><span class="badge status-${t.status === 'resolved' ? 'closed' : 'investigating'}">${t.status === 'resolved' ? 'نتیجه اعلام شد' : 'در حال بررسی'}</span></td>
                                <td>${Utils.formatDate(t.createdAt).split(' ')[0]}</td>
                            </tr>
                        `).join('') || '<tr><td colspan="5" style="text-align:center;">تسکی ثبت نشده است.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

async function submitAnalysisRequest(e) {
    e.preventDefault();
    const session = JSON.parse(localStorage.getItem('iqdws_session'));
    const taskData = {
        taskId: 'ANL-' + Date.now(),
        defectCode: document.getElementById('a_defectCode').value,
        level: document.getElementById('a_level').value,
        reason: document.getElementById('a_reason').value,
        status: 'pending', // pending -> analyzing -> resolved
        createdBy: session.username,
        createdByName: session.displayName,
        createdAt: new Date().toISOString(),
        analystComment: null // این فیلد بعدا توسط آنالیزور پر میشود
    };

    await OfflineDB.saveAnalysisTask(taskData);
    Utils.toast('درخواست آنالیز با موفقیت ثبت شد');
    renderAnalysisRequest();
}