function renderQANList() {
    const content = document.getElementById('content-area');
    const qans = API.getQANs();
    
    content.innerHTML = `
        <div class="card">
            <h2 class="card-title">اخطارهای کیفی صادر شده</h2>
            <div class="table-wrapper">
                <table>
                    <thead><tr><th>شناسه</th><th>عنوان</th><th>سطح</th><th>وضعیت</th><th>عملیات</th></tr></thead>
                    <tbody>
                        ${qans.map(q => `
                            <tr>
                                <td>${q.id}</td>
                                <td>${q.title}</td>
                                <td>${q.level}</td>
                                <td><span class="badge status-qan">${q.status}</span></td>
                                <td><button class="btn btn-sm btn-primary" onclick="approveQAN('${q.id}')">تأیید (تست)</button></td>
                            </tr>
                        `).join('') || '<tr><td colspan="5" style="text-align:center;">اخطاری ثبت نشده است</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function approveQAN(qanId) {
    let qans = API.getQANs();
    let q = qans.find(x => x.id === qanId);
    if(q) {
        q.status = 'sent';
        localStorage.setItem('iqdws_qans', JSON.stringify(qans));
        Utils.toast('اخطار تأیید و به سازنده ارسال شد');
        renderQANList();
    }
}