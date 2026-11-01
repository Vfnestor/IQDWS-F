async function renderInspectorSearch() {
    const content = document.getElementById('content-area');
    content.innerHTML = `
        <div class="card">
            <h2 class="card-title">جستجوی پیشرفته</h2>
            <p style="font-size:12px; color:#666; margin-bottom:15px;">می‌توانید با شماره ایراد، شماره اخطار، شماره کلیم، VIN، عنوان یا شرح جستجو کنید.</p>
            <div class="form-row">
                <div class="form-col" style="flex:3;">
                    <input type="text" id="search_query" class="form-control" placeholder="مثال: CMC000001 یا IR-A-2026-1234">
                </div>
                <div class="form-col" style="flex:1;">
                    <button class="btn btn-primary" style="width:100%;" onclick="executeSearch()">جستجو</button>
                </div>
            </div>
        </div>
        <div id="search-results"></div>
    `;
}

async function executeSearch() {
    const query = document.getElementById('search_query').value.trim().toLowerCase();
    const resultsDiv = document.getElementById('search-results');
    if (!query) return resultsDiv.innerHTML = '<p style="color:red;">عبارت جستجو را وارد کنید.</p>';

    resultsDiv.innerHTML = '<p>در حال جستجو...</p>';

    try {
        const defects = await OfflineDB.getDefects();
        const qans = await OfflineDB.getQANs();
        const claims = await OfflineDB.getClaims();

        // پیدا کردن ارتباطات
        const foundDefects = defects.filter(d => 
            d.defectCode.toLowerCase().includes(query) || 
            d.vin.toLowerCase().includes(query) || 
            d.title.toLowerCase().includes(query) || 
            (d.desc && d.desc.toLowerCase().includes(query))
        );

        const foundQANs = qans.filter(q => 
            q.qanId.toLowerCase().includes(query) || 
            q.defectCode.toLowerCase().includes(query)
        );

        const foundClaims = claims.filter(c => 
            c.claimId.toLowerCase().includes(query) || 
            c.defectCode.toLowerCase().includes(query) || 
            c.vins.toLowerCase().includes(query) ||
            c.partNo.toLowerCase().includes(query)
        );

        // جمع‌آوری کدهای ایراد پیدا شده از اخطارها و کلیم‌ها
        const relatedDefectCodes = new Set([
            ...foundDefects.map(d => d.defectCode),
            ...foundQANs.map(q => q.defectCode),
            ...foundClaims.map(c => c.defectCode)
        ]);

        if (relatedDefectCodes.size === 0) {
            return resultsDiv.innerHTML = '<div class="alert-box warning">هیچ نتیجه‌ای یافت نشد.</div>';
        }

        let html = '<h3 style="margin-bottom:15px; color:var(--primary);">نتایج یافت‌شده:</h3>';

        for (let code of relatedDefectCodes) {
            const d = defects.find(x => x.defectCode === code);
            if (!d) continue;
            
            const qan = qans.find(q => q.defectCode === code);
            const relatedClaims = claims.filter(c => c.defectCode === code);

            html += `
                <div class="card" style="border-right:4px solid var(--primary);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                        <h4 style="color:var(--primary); margin:0;">کد ایراد: ${d.defectCode} | VIN: ${d.vin}</h4>
                        <span class="badge sev-${d.severity}">${d.severity}</span>
                    </div>
                    <div class="detail-row"><span class="lbl">عنوان</span><span class="val">${d.title}</span></div>
                    <div class="detail-row"><span class="lbl">شرح</span><span class="val">${d.desc || '—'}</span></div>
                    <div class="detail-row"><span class="lbl">ثبت‌کننده</span><span class="val">${d.createdByName}</span></div>
                    
                    ${qan ? `<div class="alert-box warning" style="margin-top:10px;">
                        <strong>اخطار کیفی ${qan.qanId}</strong> - جریمه: ${parseInt(qan.penalty).toLocaleString()} ریال
                    </div>` : ''}

                    ${relatedClaims.length > 0 ? `<div style="margin-top:10px; padding:10px; background:#e8f5e9; border-radius:6px;">
                        <strong>کارت‌های کلیم (${relatedClaims.length}):</strong>
                        <ul style="margin-right:20px; font-size:12px; margin-top:5px;">
                            ${relatedClaims.map(c => `<li>${c.claimId} - قطعه ${c.partNo} (تعداد: ${c.qty})</li>`).join('')}
                        </ul>
                    </div>` : ''}
                    
                    <div style="margin-top:15px;">
                        <button class="btn btn-sm btn-outline" onclick="navigate('defect-detail', '${d.defectCode}')">مشاهده جزئیات کامل</button>
                    </div>
                </div>
            `;
        }

        resultsDiv.innerHTML = html;
    } catch (e) {
        resultsDiv.innerHTML = `<p style="color:red;">خطا در جستجو: ${e.message}</p>`;
    }
}