async function renderSupplierQANs() {
    const content = document.getElementById('content-area');
    content.innerHTML = `<p>در حال دریافت اخطارها...</p>`;
    
    const qans = await API.getQANs();
    // سازنده فقط اخطارهایی را می‌بیند که به او ارسال شده است
    const sentQANs = qans.filter(q => q.status === 'sent' || q.status === 'responded');
    
    content.innerHTML = `
        <div class="card">
            <h2 class="card-title">اخطارهای دریافتی از سامانه مادر</h2>
            ${sentQANs.length === 0 ? '<p>هیچ اخطار جدیدی وجود ندارد.</p>' : ''}
            ${sentQANs.map(q => `
                <div style="border:1px solid #eee; padding:15px; margin-bottom:10px; border-radius:8px; border-right:4px solid var(--warning);">
                    <div style="display:flex; justify-content:space-between;">
                        <div>
                            <strong>${q.id.substring(0,8)}... - ${q.title}</strong>
                            <div style="font-size:12px; color:#666; margin-top:5px;">سطح: ${q.level} | جریمه: ${q.penalty.toLocaleString()} ریال</div>
                        </div>
                        <div>
                            ${q.status === 'sent' ? `<button class="btn btn-sm btn-warning" onclick="open8DForm('${q.id}')">ثبت پاسخ ۸D</button>` : `<span class="badge status-closed">پاسخ ارسال شده</span>`}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function open8DForm(qanId) {
    Utils.openModal(`
        <h3 style="color:var(--secondary); margin-bottom:15px;">پاسخ ۸D به اخطار</h3>
        <div class="form-field">
            <label>D2 - توصیف مسئله</label>
            <textarea id="d2" class="form-control" required></textarea>
        </div>
        <div class="form-field">
            <label>D3 - اقدام مهار موقت</label>
            <textarea id="d3" class="form-control" required></textarea>
        </div>
        <div class="form-field">
            <label>D4 - تحلیل ریشه‌ای</label>
            <textarea id="d4" class="form-control" required></textarea>
        </div>
        <div class="form-field">
            <label>D5 - اقدامات اصلاحی (CAPA)</label>
            <textarea id="d5" class="form-control" required></textarea>
        </div>
        <button class="btn btn-success" style="width:100%; margin-top:10px;" onclick="submit8D('${qanId}')">ارسال به سامانه مادر</button>
    `);
}

async function submit8D(qanId) {
    const d2 = document.getElementById('d2').value;
    if(d2.length < 10) return Utils.toast('توضیحات خیلی کوتاه است', 'error');

    await API.save8D({
        qanId: qanId,
        d1_team: 'تیم کیفیت سازنده',
        d2_problem: d2,
        d3_containment: document.getElementById('d3').value,
        d4_root_cause: document.getElementById('d4').value,
        d5_capa: document.getElementById('d5').value
    });
    
    Utils.closeModal();
    Utils.toast('پاسخ ۸D با موفقیت به سامانه مادر ارسال شد');
    renderSupplierQANs();
}