async function renderDefectList() {
    const content = document.getElementById('content-area');
    content.innerHTML = `<p>در حال دریافت اطلاعات...</p>`;
    
    const defects = await API.getDefects();
    
    content.innerHTML = `
        <div class="card">
            <h2 class="card-title">لیست ایرادها</h2>
            <div class="table-wrapper">
                <table>
                    <thead><tr><th>شناسه</th><th>عنوان</th><th>شدت</th><th>وضعیت</th><th>عملیات</th></tr></thead>
                    <tbody>
                        ${defects.map(d => `
                            <tr>
                                <td>${d.id.substring(0,8)}...</td>
                                <td>${d.title}</td>
                                <td><span class="badge sev-${d.severity}">${d.severity}</span></td>
                                <td><span class="badge status-${d.status}">${d.status}</span></td>
                                <td>
                                    ${!d.qanId ? `<button class="btn btn-sm btn-warning" onclick="openQANModal('${d.id}', '${d.title}')">صدور اخطار</button>` : `<span style="color:green;">اخطار صادر شده</span>`}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function openQANModal(defectId, title) {
    Utils.openModal(`
        <h3 style="color:var(--primary); margin-bottom:15px;">صدور اخطار کیفی (QAN)</h3>
        <div class="form-field">
            <label>عنوان اخطار</label>
            <input type="text" id="q_title" class="form-control" value="${title}" readonly>
        </div>
        <div class="form-row">
            <div class="form-col">
                <div class="form-field">
                    <label>سطح اخطار</label>
                    <select id="q_level" class="form-control">
                        <option value="L1">L1 - تذکر</option>
                        <option value="L2" selected>L2 - اخطار کتبی</option>
                        <option value="L3">L3 - جریمه</option>
                    </select>
                </div>
            </div>
            <div class="form-col">
                <div class="form-field">
                    <label>جریمه (ریال)</label>
                    <input type="number" id="q_penalty" class="form-control" value="50000000">
                </div>
            </div>
        </div>
        <button class="btn btn-warning" style="width:100%; margin-top:10px;" onclick="submitQAN('${defectId}')">ثبت و ارسال به مسول بخش</button>
    `);
}

async function submitQAN(defectId) {
    await API.createQAN({
        defectId: defectId,
        title: document.getElementById('q_title').value,
        level: document.getElementById('q_level').value,
        penalty: document.getElementById('q_penalty').value
    });
    Utils.closeModal();
    Utils.toast('اخطار صادر شد و در انتظار تایید مسول بخش است');
    renderDefectList();
}