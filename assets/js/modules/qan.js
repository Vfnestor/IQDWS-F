async function renderQANList() {
    const content = document.getElementById('content-area');
    content.innerHTML = `<p>در حال دریافت اخطارها...</p>`;
    
    const qans = await API.getQANs();
    const session = JSON.parse(localStorage.getItem('iqdws_session'));
    const role = session.roleId;
    
    content.innerHTML = `
        <div class="card">
            <h2 class="card-title">اخطارهای کیفی</h2>
            <div class="table-wrapper">
                <table>
                    <thead><tr><th>شناسه</th><th>عنوان</th><th>سطح</th><th>وضعیت</th><th>عملیات</th></tr></thead>
                    <tbody>
                        ${qans.map(q => `
                            <tr>
                                <td>${q.id.substring(0,8)}...</td>
                                <td>${q.title}</td>
                                <td>${q.level}</td>
                                <td><span class="badge status-qan">${q.status}</span></td>
                                <td>
                                    ${q.status === 'pending_dept' && role === 'dept_head' 
                                        ? `<button class="btn btn-sm btn-success" onclick="approveQAN('${q.id}', 'pending_office')">تأیید (مسول بخش)</button>` : ''}
                                    
                                    ${q.status === 'pending_office' && role === 'office_head' 
                                        ? `<button class="btn btn-sm btn-success" onclick="approveQAN('${q.id}', 'sent')">تأیید نهایی (رئیس اداره)</button>` : ''}
                                    
                                    ${q.status === 'responded' && role === 'expert' 
                                        ? `<button class="btn btn-sm btn-primary" onclick="approveQAN('${q.id}', 'closed')">تایید 8D و بستن اخطار</button>` : ''}
                                        
                                    ${q.status === 'responded' && role !== 'expert' 
                                        ? `<span style="color:green; font-size:11px;">پاسخ ۸D دریافت شد (در انتظار کارشناس)</span>` : ''}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

async function approveQAN(qanId, nextStatus) {
    await API.updateQANStatus(qanId, nextStatus);
    Utils.toast('وضعیت اخطار به‌روزرسانی شد');
    renderQANList();
}