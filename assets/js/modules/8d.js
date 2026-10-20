async function renderSupplierQANs() {
    const content = document.getElementById('content-area');
    content.innerHTML = `<p>در حال دریافت اخطارها...</p>`;
    
    const qans = await API.getQANs();
    
    // در نسخه واقعی، شناسه سازنده از توکن خوانده می‌شود. فعلاً فرض می‌کنیم این سازنده شناسه SUP-001 را دارد
    const MY_SUPPLIER_ID = 'SUP-001'; 
    const sentQANs = qans.filter(q => q.supplierId === MY_SUPPLIER_ID && (q.status === 'sent' || q.status === 'responded'));
    
    content.innerHTML = `
        <div class="card">
            <h2 class="card-title">اخطارهای دریافتی از سامانه مادر</h2>
            ${sentQANs.length === 0 ? '<p>هیچ اخطار جدیدی برای شما وجود ندارد.</p>' : ''}
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
// بقیه کدهای open8DForm و submit8D بدون تغییر باقی می‌مانند...
function open8DForm(qanId) {
    Utils.openModal(`
        <h3 style="color:var(--secondary); margin-bottom:15px;">پاسخ ۸D به اخطار</h3>
        <div class="form-field"><label>D1 - تیم (Team)</label><input type="text" id="d1" class="form-control" required></div>
        <div class="form-field"><label>D2 - توصیف مسئله (Problem)</label><textarea id="d2" class="form-control" required></textarea></div>
        <div class="form-field"><label>D3 - اقدام مهار موقت (Containment)</label><textarea id="d3" class="form-control" required></textarea></div>
        <div class="form-field"><label>D4 - تحلیل ریشه‌ای (Root Cause)</label><textarea id="d4" class="form-control" required></textarea></div>
        <div class="form-field"><label>D5 - اقدامات اصلاحی (CAPA)</label><textarea id="d5" class="form-control" required></textarea></div>
        <div class="form-field"><label>D6 - اجرا (Implementation)</label><textarea id="d6" class="form-control"></textarea></div>
        <div class="form-field"><label>D7 - پیشگیری (Prevention)</label><textarea id="d7" class="form-control"></textarea></div>
        <div class="form-field"><label>D8 - درس‌آموخته (Lesson Learned)</label><textarea id="d8" class="form-control"></textarea></div>
        <button class="btn btn-success" style="width:100%; margin-top:10px;" onclick="submit8D('${qanId}')">ارسال به سامانه مادر</button>
    `);
}
async function submit8D(qanId) {
    const d2 = document.getElementById('d2').value;
    if(d2.length < 10) return Utils.toast('توضیحات D2 (مسئله) خیلی کوتاه است', 'error');
    await API.save8D({
        qanId: qanId, d1_team: document.getElementById('d1').value, d2_problem: d2,
        d3_containment: document.getElementById('d3').value, d4_root_cause: document.getElementById('d4').value,
        d5_capa: document.getElementById('d5').value, d6_implementation: document.getElementById('d6').value,
        d7_prevention: document.getElementById('d7').value, d8_lesson: document.getElementById('d8').value
    });
    Utils.closeModal();
    Utils.toast('پاسخ ۸D با موفقیت به سامانه مادر ارسال شد');
    renderSupplierQANs();
}