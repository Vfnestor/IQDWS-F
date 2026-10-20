function render8DForm() {
    const content = document.getElementById('content-area');
    content.innerHTML = `
        <div class="card">
            <h2 class="card-title">پاسخ به اخطار کیفی (8D)</h2>
            <form onsubmit="submit8DForm(event)">
                <div class="form-field">
                    <label>D1 - تیم پاسخ‌دهنده</label>
                    <input type="text" id="d1" class="form-control" required>
                </div>
                <div class="form-field">
                    <label>D2 - توصیف مسئله (5W2H)</label>
                    <textarea id="d2" class="form-control" required></textarea>
                </div>
                <div class="form-field">
                    <label>D3 - اقدام مهار موقت</label>
                    <textarea id="d3" class="form-control" required></textarea>
                </div>
                <div class="form-field">
                    <label>D4 - تحلیل ریشه‌ای (پنج چرا)</label>
                    <textarea id="d4" class="form-control" required></textarea>
                </div>
                <div class="form-field">
                    <label>D5 - اقدامات اصلاحی (CAPA)</label>
                    <textarea id="d5" class="form-control" required></textarea>
                </div>
                <button type="submit" class="btn btn-success" style="margin-top:15px;">ارسال به سامانه مادر</button>
            </form>
        </div>
    `;
}

function submit8DForm(e) {
    e.preventDefault();
    // اعتبارسنجی ساده هوشمند
    const d2 = document.getElementById('d2').value;
    if(d2.length < 20) {
        Utils.toast('توصیف مسئله بسیار کوتاه است. سیستم پاسخ‌های مبهم را رد می‌کند.', 'error');
        return;
    }
    
    API.save8D({
        qanId: 'QAN-TEST',
        d1: document.getElementById('d1').value,
        d2: d2,
        d3: document.getElementById('d3').value,
        d4: document.getElementById('d4').value,
        d5: document.getElementById('d5').value
    });
    
    Utils.toast('پاسخ ۸D با موفقیت ارسال شد');
    navigate('dashboard');
}