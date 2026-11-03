let currentImageBase64 = null;
let calYear, calMonth; // متغیرهای تقویم

// ==================== داشبورد (نمودار و تقویم) ====================
async function renderDashboard() {
    const content = document.getElementById('content-area');
    const defects = await OfflineDB.getDefects();
    const session = JSON.parse(localStorage.getItem('iqdws_session'));
    const notifs = await OfflineDB.getNotifications(session.username);

    const resolvedCount = defects.filter(d => d.status === 'closed').length;
    const unresolvedCount = defects.length - resolvedCount;
    const total = defects.length || 1;
    const resolvedDeg = (resolvedCount / total) * 360;

    // مقداردهی اولیه تقویم بر اساس تاریخ امروز
    if (!calYear || !calMonth) {
        const todayJalali = jalaali.toJalaali(new Date());
        calYear = todayJalali.jy;
        calMonth = todayJalali.jm;
    }

    // ساخت گرید تقویم
    const monthNames = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
    const daysInMonth = jalaali.jalaaliMonthLength(calYear, calMonth);
    
    // پیدا کردن روز شروع ماه (0=شنبه, 1=یکشنبه, ..., 6=جمعه)
    const firstDayG = jalaali.toGregorian(calYear, calMonth, 1);
    const startDay = (new Date(firstDayG.gy, firstDayG.gm - 1, firstDayG.gd).getDay() + 1) % 7;

    let gridCells = '';
    for (let i = 0; i < startDay; i++) gridCells += '<div></div>';
    
    for (let i = 1; i <= daysInMonth; i++) {
        // بررسی اینکه آیا این روز سررسید هست یا نه
        const hasDeadline = defects.some(d => {
            if (d.status === 'closed' || d.status === 'brand_analysis') return false;
            const dates = [d.slaReviewDate, d.slaSupplierDate, d.slaResolutionDate].filter(x => x);
            return dates.some(dateStr => {
                const jDate = jalaali.toJalaali(new Date(dateStr));
                return jDate.jy === calYear && jDate.jm === calMonth && jDate.jd === i;
            });
        });

        gridCells += `
            <div class="cal-day ${hasDeadline ? 'has-deadline' : ''}" onclick="showDayDetails(${calYear}, ${calMonth}, ${i})">
                ${i}
            </div>
        `;
    }

    // بررسی امکان تغییر ماه (فقط در سال جاری)
    const currentYear = jalaali.toJalaali(new Date()).jy;
    const prevDisabled = calMonth === 1 && calYear === currentYear ? 'disabled' : '';
    const nextDisabled = calMonth === 12 && calYear === currentYear ? 'disabled' : '';

    content.innerHTML = `
        <div class="form-row">
            <div class="form-col" style="flex:1;">
                <div class="card" style="text-align:center;">
                    <h3 class="card-title">وضعیت ایرادات</h3>
                    <div style="width:150px; height:150px; border-radius:50%; margin:20px auto; display:flex; align-items:center; justify-content:center;
                        background: conic-gradient(#2e7d32 ${resolvedDeg}deg, #c62828 0deg); box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                        <div style="width:100px; height:100px; background:#fff; border-radius:50%; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                            <span style="font-size:24px; font-weight:bold; color:#333;">${defects.length}</span>
                            <span style="font-size:10px; color:#666;">کل ایرادات</span>
                        </div>
                    </div>
                    <div style="display:flex; justify-content:center; gap:15px; font-size:12px;">
                        <div><span style="color:#2e7d32;">●</span> رفع شده (${resolvedCount})</div>
                        <div><span style="color:#c62828;">●</span> رفع نشده (${unresolvedCount})</div>
                    </div>
                </div>

                <div class="card">
                    <h3 class="card-title">📬 صندوق پیام‌ها (${notifs.filter(n=>!n.isRead).length} جدید)</h3>
                    ${notifs.slice(0, 5).map(n => `
                        <div style="padding:10px; border-bottom:1px solid #eee; background:${n.isRead ? '#fff' : '#e3f2fd'}; border-radius:4px; margin-bottom:5px; cursor:pointer;" onclick="OfflineDB.markNotifRead('${n.notifId}'); renderDashboard();">
                            <div style="font-size:12px; color:#333;">${n.text}</div>
                            <div style="font-size:10px; color:#888; margin-top:4px;">${Utils.formatDate(n.date)}</div>
                        </div>
                    `).join('') || '<p style="font-size:12px; color:#888;">پیامی وجود ندارد.</p>'}
                </div>
            </div>

            <div class="form-col" style="flex:2;">
                <div class="card">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                        <h3 class="card-title" style="border:none; margin:0; padding:0;">📅 تقویم مهلت‌ها</h3>
                        <div style="display:flex; gap:10px; align-items:center;">
                            <button class="btn btn-sm btn-outline" ${prevDisabled} onclick="changeMonth(-1)">ماه قبل</button>
                            <span style="font-weight:bold; font-size:15px; color:var(--primary);">${monthNames[calMonth - 1]} ${calYear}</span>
                            <button class="btn btn-sm btn-outline" ${nextDisabled} onclick="changeMonth(1)">ماه بعد</button>
                        </div>
                    </div>
                    
                    <div class="calendar-grid">
                        <div class="cal-header">ش</div><div class="cal-header">ی</div><div class="cal-header">د</div>
                        <div class="cal-header">س</div><div class="cal-header">چ</div><div class="cal-header">پ</div>
                        <div class="cal-header">ج</div>
                        ${gridCells}
                    </div>
                    <div style="font-size:11px; color:#888; margin-top:10px; text-align:left;">
                        <span style="color:#c62828; font-weight:bold;">*</span> روزهای دارای مهلت سررسید
                    </div>
                </div>
            </div>
        </div>
    `;
}

function changeMonth(delta) {
    const currentYear = jalaali.toJalaali(new Date()).jy;
    let newMonth = calMonth + delta;
    
    if (newMonth < 1) newMonth = 1;
    if (newMonth > 12) newMonth = 12;

    // اگر سال تغییر کرد و از سال جاری خارج شد، اجازه نده
    if (calYear !== currentYear) return;

    calMonth = newMonth;
    renderDashboard();
}

async function showDayDetails(jy, jm, jd) {
    const defects = await OfflineDB.getDefects();
    
    // فیلتر کردن ایراداتی که مهلتشان دقیقا این روز است
    const dayDefects = defects.filter(d => {
        if (d.status === 'closed' || d.status === 'brand_analysis') return false;
        const dates = [d.slaReviewDate, d.slaSupplierDate, d.slaResolutionDate].filter(x => x);
        return dates.some(dateStr => {
            const jDate = jalaali.toJalaali(new Date(dateStr));
            return jDate.jy === jy && jDate.jm === jm && jDate.jd === jd;
        });
    });

    if (dayDefects.length === 0) {
        return Utils.toast('هیچ مهلتی برای این روز ثبت نشده است.', 'info');
    }

    let rows = dayDefects.map(d => {
        let deadlineType = '';
        let targetDate = null;
        if (d.slaReviewDate && jalaali.toJalaali(new Date(d.slaReviewDate)).jd === jd) { deadlineType = 'مهلت بررسی کارشناس'; targetDate = d.slaReviewDate; }
        else if (d.slaSupplierDate && jalaali.toJalaali(new Date(d.slaSupplierDate)).jd === jd) { deadlineType = 'مهلت پاسخ سازنده'; targetDate = d.slaSupplierDate; }
        else if (d.slaResolutionDate && jalaali.toJalaali(new Date(d.slaResolutionDate)).jd === jd) { deadlineType = 'مهلت رفع 8D'; targetDate = d.slaResolutionDate; }

        const isLate = new Date(targetDate) < new Date();
        
        // آخرین آپدیت
        const lastUpdate = d.lastUpdatedBy ? `${d.lastUpdatedBy} (${Utils.formatDate(d.lastUpdatedAt)})` : `بازرس: ${d.createdByName} (${Utils.formatDate(d.createdAt)})`;

        return `
            <div style="border:1px solid #eee; padding:10px; margin-bottom:10px; border-radius:6px; border-right:4px solid ${isLate ? '#c62828' : '#2e7d32'};">
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <strong style="color:var(--primary);">${d.defectCode} - ${d.title}</strong>
                    <span class="badge sev-${d.severity}">${d.severity}</span>
                </div>
                <div style="font-size:12px; color:#333;">نوع مهلت: <b>${deadlineType}</b></div>
                <div style="font-size:12px; color:#333; margin-top:5px;">آخرین به‌روزرسانی: ${lastUpdate}</div>
                <div style="margin-top:8px;">
                    <button class="btn btn-sm btn-outline" onclick="Utils.closeModal(); navigate('defect-detail', '${d.defectCode}')">مشاهده جزئیات</button>
                </div>
            </div>
        `;
    }).join('');

    Utils.openModal(`
        <h3 style="color:var(--primary); margin-bottom:15px;">ایرادات دارای سررسید در این روز</h3>
        <div style="max-height:400px; overflow-y:auto;">
            ${rows}
        </div>
    `);
}

// ==================== ثبت ایراد ====================
function renderNewDefectForm() {
    const content = document.getElementById('content-area');
    currentImageBase64 = null;
    const titles = JSON.parse(localStorage.getItem('iqdws_defect_titles') || '[]');

    content.innerHTML = `
        <div class="card">
            <h2 class="card-title">ثبت ایراد جدید (بازرس خط)</h2>
            <form id="defect-form" onsubmit="submitDefectForm(event)">
                <div class="form-row">
                    <div class="form-col">
                        <div class="form-field">
                            <label>عنوان ایراد <span class="req">*</span></label>
                            <select id="d_title" class="form-control" required>
                                <option value="">— انتخاب کنید —</option>
                                ${titles.map(t => `<option value="${t}">${t}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="form-col"><div class="form-field"><label>شماره بدنه (VIN) <span class="req">*</span></label><input type="text" id="d_vin" class="form-control" required></div></div>
                </div>
                <div class="form-row">
                    <div class="form-col">
                        <div class="form-field">
                            <label>شدت ایراد <span class="req">*</span></label>
                            <select id="d_severity" class="form-control" required>
                                <option value="">— انتخاب کنید —</option>
                                <option value="S">S (ایمنی/مکانیک - بسیار بالا)</option>
                                <option value="P">P (پارک خودرو - بالا)</option>
                                <option value="A">A (مهم و تکراری)</option>
                                <option value="B">B (ظاهری/عملکردی - نیازمند ۳ قطعه)</option>
                                <option value="C">C (ظاهری/طراحی - کم)</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-col"><div class="form-field"><label>تعداد خودرو درگیر <span class="req">*</span></label><input type="number" id="d_qty" class="form-control" min="1" required></div></div>
                </div>
                <div class="form-field"><label>شرح کامل</label><textarea id="d_desc" class="form-control"></textarea></div>
                <div class="form-field" style="background:#f9f9f9; padding:15px; border-radius:8px; border:1px dashed #ccc;">
                    <label>📷 افزودن عکس (اختیاری)</label>
                    <input type="file" id="d_image" accept="image/*" class="form-control" onchange="handleImageUpload(event)">
                    <div id="image-preview" style="margin-top:10px; font-size:12px; color:#2e7d32;"></div>
                </div>
                <div style="margin-top: 20px;"><button type="submit" class="btn btn-primary" id="btn-submit-defect">ثبت ایراد و تولید کد</button></div>
            </form>
        </div>
    `;
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    ImageUtils.openCropModal(file, (base64) => {
        currentImageBase64 = base64;
        document.getElementById('image-preview').innerHTML = `✅ عکس آماده شد`;
    });
}

async function submitDefectForm(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-submit-defect');
    btn.disabled = true; btn.innerText = 'در حال ذخیره...';

    const title = document.getElementById('d_title').value;
    const severity = document.getElementById('d_severity').value;
    const isDuplicate = await SLAManager.checkDuplicate(title, 'P-UNKNOWN', 'SUP-001');
    
    const defectCode = Utils.generateDefectCode(severity);
    const session = JSON.parse(localStorage.getItem('iqdws_session'));
    const now = new Date();

    const defectData = {
        defectCode: defectCode,
        title: title,
        vin: document.getElementById('d_vin').value,
        severity: severity,
        qty: document.getElementById('d_qty').value,
        desc: document.getElementById('d_desc').value,
        imageBase64: currentImageBase64,
        status: 'registered',
        isDuplicate: !!isDuplicate,
        createdBy: session.username,
        createdByName: session.displayName,
        createdAt: now.toISOString(),
        // آخرین آپدیت
        lastUpdatedBy: session.displayName,
        lastUpdatedAt: now.toISOString(),
        reviewSteps: [],
        slaReviewDate: SLAManager.addDays(now, 1).toISOString(),
        expertRejectCount: 0,
        supplierRejectCount: 0
    };

    await OfflineDB.saveDefect(defectData);
    await OfflineDB.addToQueue({ endpoint: '/defects', method: 'POST', data: defectData });
    
    Utils.toast(`✅ ایراد با کد ${defectCode} ذخیره شد.`);
    navigate('defects');
}

// ... (بقیه توابع مانند renderDefectList، renderDefectDetail، renderExpertDefectDetail و... بدون تغییر باقی می‌مانند) ...
// برای جلوگیری از شلوغی، فقط بخش‌هایی که تغییر کرده‌اند را نوشتم. 
// لطفا از فایل قبلی برای بقیه توابع استفاده کنید یا کد زیر را کامل جایگزین کنید.

async function renderDefectList() {
    const content = document.getElementById('content-area');
    content.innerHTML = `<p>در حال خواندن...</p>`;
    const session = JSON.parse(localStorage.getItem('iqdws_session'));
    const role = session.roleId;
    
    try {
        const defects = await OfflineDB.getDefects();
        content.innerHTML = `
            <div class="card">
                <h2 class="card-title">لیست ایرادها</h2>
                <div class="table-wrapper">
                    <table>
                        <thead><tr><th>کد</th><th>عنوان</th><th>شدت</th><th>ثبت‌کننده</th><th>وضعیت</th><th>عملیات</th></tr></thead>
                        <tbody>
                            ${defects.map(d => `
                                <tr>
                                    <td style="font-family:monospace; font-weight:bold; color:var(--primary);">${d.defectCode}</td>
                                    <td>${d.title} ${d.isDuplicate ? '<span style="color:red; font-size:10px;">(تکراری)</span>' : ''}</td>
                                    <td><span class="badge sev-${d.severity}">${d.severity}</span></td>
                                    <td>${d.createdByName}</td>
                                    <td><span class="badge status-${d.status}">${d.status}</span></td>
                                    <td>
                                        <button class="btn btn-sm btn-outline" onclick="navigate('defect-detail', '${d.defectCode}')">مشاهده</button>
                                        ${role === 'expert' ? `<button class="btn btn-sm btn-primary" onclick="navigate('expert-defect-detail', '${d.defectCode}')">ورود (بررسی)</button>` : ''}
                                        ${(role === 'inspector') ? `<button class="btn btn-sm btn-warning" onclick="navigate('inspector-followup', '${d.defectCode}')">پیگیری ایراد</button>` : ''}
                                        ${role === 'inspector' ? `<button class="btn btn-sm btn-success" onclick="openClaimModal('${d.defectCode}')">ثبت کلیم</button>` : ''}
                                    </td>
                                </tr>
                            `).join('') || '<tr><td colspan="6" style="text-align:center;">ایرادی یافت نشد</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } catch (e) { content.innerHTML = `<p style="color:red;">خطا.</p>`; }
}

async function renderDefectDetail(code) {
    const content = document.getElementById('content-area');
    const d = await OfflineDB.getDefectByCode(code);
    if(!d) return content.innerHTML = '<p>یافت نشد.</p>';

    content.innerHTML = `
        <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding-bottom:15px; margin-bottom:15px;">
                <h2 class="card-title" style="margin:0; border:none;">جزئیات ایراد</h2>
                <div style="display:flex; gap:10px;">
                    <button class="btn btn-outline btn-sm" onclick="window.print()">🖨️ چاپ</button>
                    <span style="font-family:monospace; font-size:18px; font-weight:bold; color:var(--primary); background:#e3f2fd; padding:5px 15px; border-radius:8px;">${d.defectCode}</span>
                </div>
            </div>
            <div class="detail-row"><span class="lbl">عنوان</span><span class="val">${d.title}</span></div>
            <div class="detail-row"><span class="lbl">VIN</span><span class="val">${d.vin}</span></div>
            <div class="detail-row"><span class="lbl">شدت</span><span class="val"><span class="badge sev-${d.severity}">${d.severity}</span></span></div>
            <div class="detail-row"><span class="lbl">تعداد</span><span class="val">${d.qty}</span></div>
            <div class="detail-row"><span class="lbl">شرح</span><span class="val">${d.desc || '—'}</span></div>
            <div class="detail-row"><span class="lbl">ثبت‌کننده</span><span class="val">${d.createdByName} (${d.createdBy})</span></div>
            <div class="detail-row"><span class="lbl">آخرین به‌روزرسانی</span><span class="val">${d.lastUpdatedBy || d.createdByName} - ${Utils.formatDate(d.lastUpdatedAt || d.createdAt)}</span></div>
            ${d.imageBase64 ? `<div style="margin-top:15px;"><img src="${d.imageBase64}" style="max-width:100%; border-radius:8px; max-height:300px;"></div>` : ''}
            <div style="margin-top:20px;"><button class="btn btn-outline" onclick="navigate('defects')">← بازگشت به لیست</button></div>
        </div>
    `;
}

async function renderInspectorFollowup(code) {
    const content = document.getElementById('content-area');
    const d = await OfflineDB.getDefectByCode(code);
    if(!d) return content.innerHTML = '<p>یافت نشد.</p>';

    const qans = await OfflineDB.getQANs();
    const relatedQAN = qans.find(q => q.defectCode === code);
    const claims = await OfflineDB.getClaimsByDefect(code);

    content.innerHTML = `
        <div style="margin-bottom:15px; display:flex; justify-content:space-between;">
            <button class="btn btn-outline" onclick="navigate('defects')">← بازگشت</button>
            <div style="display:flex; gap:10px;">
                <button class="btn btn-outline" onclick="window.print()">🖨️ چاپ اطلاعات</button>
                <h2 style="color:var(--primary); margin:0;">پیگیری ایراد ${d.defectCode}</h2>
            </div>
        </div>

        <div class="card">
            <h3 class="card-title">۱. مراحل بررسی کارشناس قطعه</h3>
            <div class="table-wrapper">
                <table>
                    <thead><tr><th>تاریخ</th><th>توضیحات</th><th>ثبت‌کننده</th></tr></thead>
                    <tbody>
                        ${(d.reviewSteps || []).map(step => `
                            <tr><td>${step.date}</td><td>${step.desc}</td><td>${step.by}</td></tr>
                        `).join('') || '<tr><td colspan="3" style="text-align:center;">مرحله‌ای ثبت نشده است.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="card">
            <h3 class="card-title">۲. اطلاعات اخطار و 8D</h3>
            ${relatedQAN ? `
                <div class="detail-row"><span class="lbl">شناسه اخطار</span><span class="val">${relatedQAN.qanId}</span></div>
                <div class="detail-row"><span class="lbl">وضعیت اخطار</span><span class="val"><span class="badge status-${relatedQAN.status}">${relatedQAN.status}</span></span></div>
                <div class="detail-row"><span class="lbl">جریمه (SLA)</span><span class="val" style="color:red;">${parseInt(relatedQAN.penalty).toLocaleString()} ریال</span></div>
            ` : '<p style="color:#666;">اخطاری صادر نشده است.</p>'}
        </div>

        <div class="card">
            <h3 class="card-title">۳. کارت‌های کلیم صادرشده</h3>
            <div class="table-wrapper">
                <table>
                    <thead><tr><th>شماره کلیم</th><th>قطعه</th><th>تعداد</th><th>دلیل</th><th>VINها</th></tr></thead>
                    <tbody>
                        ${claims.map(c => `
                            <tr>
                                <td>${c.claimId}</td>
                                <td>${c.partName} (${c.partNo})</td>
                                <td>${c.qty}</td>
                                <td>${c.reason}</td>
                                <td>${c.vins}</td>
                            </tr>
                        `).join('') || '<tr><td colspan="5" style="text-align:center;">کلیمی ثبت نشده است.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

async function renderExpertDefectDetail(code) {
    const content = document.getElementById('content-area');
    const d = await OfflineDB.getDefectByCode(code);
    if(!d) return content.innerHTML = '<p>یافت نشد.</p>';
    
    const qans = await OfflineDB.getQANs();
    const relatedQAN = qans.find(q => q.defectCode === code);
    const claims = await OfflineDB.getClaimsByDefect(code);

    let actionButtons = '';
    if (d.status === 'registered') {
        actionButtons = `
            <div style="display:flex; gap:10px; margin-top:15px;">
                <button class="btn btn-success" style="flex:1;" onclick="acceptInitialReview('${d.defectCode}')">تایید اولیه و ارسال به سازنده</button>
                <button class="btn btn-danger" style="flex:1;" onclick="rejectInitialReview('${d.defectCode}')">رد کردن (ارجاع به کارشناس دیگر)</button>
            </div>
        `;
    } else if (d.status === 'pending_supplier') {
        actionButtons = `<div class="alert-box info">در انتظار پاسخ سازنده (مهلت ۳ روزه)...</div>`;
    } else if (d.status === 'supplier_responded') {
        actionButtons = `
            <div class="alert-box success">سازنده پاسخ داده است. لطفا بررسی کنید.</div>
            <div style="display:flex; gap:10px;">
                <button class="btn btn-success" style="flex:1;" onclick="approveSupplierResponse('${d.defectCode}')">تایید پاسخ سازنده</button>
                <button class="btn btn-danger" style="flex:1;" onclick="rejectSupplierResponse('${d.defectCode}')">رد پاسخ و اصلاح مجدد</button>
            </div>
        `;
    } else if (d.status === 'pending_8d') {
        actionButtons = `<div class="alert-box warning">سد کیفی اعمال شده. در انتظار فرم 8D سازنده (مهلت ۱۵ روزه)...</div>`;
    } else if (d.status === 'brand_analysis') {
        actionButtons = `<div class="alert-box danger">این ایراد به آنالیز برند ارجاع داده شده است و در انتظار نتیجه جلسه است.</div>`;
    }

    content.innerHTML = `
        <div style="margin-bottom:15px; display:flex; justify-content:space-between; align-items:center;">
            <button class="btn btn-outline" onclick="navigate('defects')">← بازگشت</button>
            <div style="display:flex; gap:10px;">
                <button class="btn btn-outline" onclick="window.print()">🖨️ چاپ اطلاعات</button>
                <div style="font-family:monospace; font-size:18px; font-weight:bold; color:var(--primary); background:#e3f2fd; padding:5px 15px; border-radius:8px;">کد: ${d.defectCode}</div>
            </div>
        </div>

        ${d.isDuplicate ? '<div class="alert-box danger" style="margin-bottom:15px;">⚠️ هشدار: این ایراد به عنوان ایراد تکراری (بر اساس قطعه و عنوان) تشخیص داده شده است.</div>' : ''}

        <div class="card" style="border-top:4px solid var(--primary);">
            <h3 class="card-title" style="color:var(--primary);">۱. اطلاعات اولیه و گردش‌کار</h3>
            <div class="form-row">
                <div class="form-col">
                    <div class="detail-row"><span class="lbl">عنوان</span><span class="val">${d.title}</span></div>
                    <div class="detail-row"><span class="lbl">VIN</span><span class="val" style="font-family:monospace;">${d.vin}</span></div>
                    <div class="detail-row"><span class="lbl">شدت</span><span class="val"><span class="badge sev-${d.severity}">${d.severity}</span></span></div>
                </div>
                <div class="form-col">
                    <div class="detail-row"><span class="lbl">ثبت‌کننده</span><span class="val">${d.createdByName}</span></div>
                    <div class="detail-row"><span class="lbl">تاریخ ثبت</span><span class="val">${Utils.formatDate(d.createdAt)}</span></div>
                    <div class="detail-row"><span class="lbl">آخرین به‌روزرسانی</span><span class="val">${d.lastUpdatedBy || d.createdByName} - ${Utils.formatDate(d.lastUpdatedAt || d.createdAt)}</span></div>
                </div>
            </div>
            ${actionButtons}
        </div>

        <div class="card" style="border-top:4px solid var(--warning);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <h3 class="card-title" style="border:none; margin:0; padding:0; color:var(--warning);">۲. مراحل بررسی و مستندات</h3>
                <button class="btn btn-sm btn-warning" onclick="openAddStepModal('${d.defectCode}')">➕ افزودن مرحله بررسی</button>
            </div>
            <div class="table-wrapper">
                <table>
                    <thead><tr><th>تاریخ</th><th>توضیحات</th><th>ثبت‌کننده</th><th>عملیات</th></tr></thead>
                    <tbody>
                        ${(d.reviewSteps || []).map((step, index) => `
                            <tr>
                                <td>${step.date}</td>
                                <td>${step.desc}</td>
                                <td>${step.by}</td>
                                <td>
                                    <button class="btn-icon edit" onclick="openEditStepModal('${d.defectCode}', ${index})">✏️ ویرایش</button>
                                    <button class="btn-icon delete" onclick="deleteReviewStep('${d.defectCode}', ${index})">🗑️ حذف</button>
                                </td>
                            </tr>
                        `).join('') || '<tr><td colspan="4" style="text-align:center;">مرحله‌ای ثبت نشده است.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="card" style="border-top:4px solid var(--danger);">
            <h3 class="card-title" style="color:var(--danger);">۳. اخطار و کارت‌های کلیم</h3>
            <div class="form-row">
                <div class="form-col">
                    <h4 style="color:#c62828; margin-bottom:10px;">⚠️ اخطار کیفی</h4>
                    ${relatedQAN ? `
                        <div class="detail-row"><span class="lbl">شناسه</span><span class="val">${relatedQAN.qanId}</span></div>
                        <div class="detail-row"><span class="lbl">جریمه</span><span class="val" style="color:#c62828; font-weight:bold;">${parseInt(relatedQAN.penalty).toLocaleString()} ریال</span></div>
                        <div class="detail-row"><span class="lbl">وضعیت</span><span class="val">${relatedQAN.status}</span></div>
                    ` : `
                        <button class="btn btn-sm btn-warning" onclick="openQANForm('${d.defectCode}')">صدور اخطار کیفی</button>
                    `}
                </div>
                <div class="form-col">
                    <h4 style="color:#2e7d32; margin-bottom:10px;">🧾 کارت‌های کلیم</h4>
                    <button class="btn btn-sm btn-success" onclick="openClaimModal('${d.defectCode}')">ثبت کلیم جدید</button>
                    ${claims.map(c => `<div style="font-size:11px; margin-top:5px; border-bottom:1px solid #eee; padding-bottom:3px;">${c.claimId} - ${c.partName} (${c.qty})</div>`).join('')}
                </div>
            </div>
        </div>
    `;
}

async function acceptInitialReview(code) {
    const d = await OfflineDB.getDefectByCode(code);
    d.status = 'pending_supplier';
    d.slaSupplierDate = SLAManager.addDays(new Date(), 3).toISOString();
    d.lastUpdatedAt = new Date().toISOString();
    d.lastUpdatedBy = JSON.parse(localStorage.getItem('iqdws_session')).displayName;
    await OfflineDB.saveDefect(d);
    Utils.toast('ایراد تایید شد و برای سازنده ارسال شد.');
    renderExpertDefectDetail(code);
}

async function rejectInitialReview(code) {
    const d = await OfflineDB.getDefectByCode(code);
    d.expertRejectCount = (d.expertRejectCount || 0) + 1;
    d.lastUpdatedAt = new Date().toISOString();
    d.lastUpdatedBy = JSON.parse(localStorage.getItem('iqdws_session')).displayName;

    if (d.expertRejectCount >= 3) {
        d.status = 'brand_analysis';
        await OfflineDB.saveAnalysisTask({
            taskId: 'ANL-' + Date.now(), defectCode: d.defectCode, level: 'brand', reason: 'رد سه باره توسط کارشناسان قطعه', status: 'pending', createdAt: new Date().toISOString()
        });
        Utils.toast('ایراد ۳ بار رد شد و به آنالیز برند ارجاع داده شد.', 'error');
    } else {
        d.status = 'registered';
        await SLAManager.sendNotif('inspector', `کارشناس ایراد ${d.defectCode} را رد کرد. لطفا به کارشناس دیگری ارجاع دهید.`, d.defectCode);
        Utils.toast('ایراد رد شد و به بازرس اطلاع داده شد.', 'error');
    }
    await OfflineDB.saveDefect(d);
    navigate('defects');
}

async function rejectSupplierResponse(code) {
    const d = await OfflineDB.getDefectByCode(code);
    d.supplierRejectCount = (d.supplierRejectCount || 0) + 1;
    d.lastUpdatedAt = new Date().toISOString();
    d.lastUpdatedBy = JSON.parse(localStorage.getItem('iqdws_session')).displayName;

    if (d.supplierRejectCount >= 3) {
        d.status = 'brand_analysis';
        await OfflineDB.saveAnalysisTask({
            taskId: 'ANL-' + Date.now(), defectCode: d.defectCode, level: 'brand', reason: 'رد سه باره پاسخ سازنده', status: 'pending', createdAt: new Date().toISOString()
        });
        Utils.toast('پاسخ سازنده ۳ بار رد شد و به آنالیز برند ارجاع داده شد.', 'error');
    } else {
        d.status = 'pending_supplier';
        d.slaSupplierDate = SLAManager.addDays(new Date(), 3).toISOString();
        Utils.toast('پاسخ سازنده رد شد و برای اصلاح بازگشت.', 'error');
    }
    await OfflineDB.saveDefect(d);
    renderExpertDefectDetail(code);
}

async function approveSupplierResponse(code) {
    const d = await OfflineDB.getDefectByCode(code);
    d.status = 'pending_8d';
    d.slaResolutionDate = SLAManager.addDays(new Date(), 15).toISOString();
    d.lastUpdatedAt = new Date().toISOString();
    d.lastUpdatedBy = JSON.parse(localStorage.getItem('iqdws_session')).displayName;
    await OfflineDB.saveDefect(d);
    Utils.toast('پاسخ سازنده تایید شد. مهلت ۱۵ روزه 8D آغاز شد.');
    renderExpertDefectDetail(code);
}

function openAddStepModal(defectCode) {
    Utils.openModal(`
        <h3 style="color:var(--warning); margin-bottom:15px;">افزودن مرحله بررسی</h3>
        <div class="form-field"><label>شرح بررسی</label><textarea id="step_desc" class="form-control" required></textarea></div>
        <button class="btn btn-warning" style="width:100%; margin-top:10px;" onclick="saveReviewStep('${defectCode}')">ثبت</button>
    `);
}
async function saveReviewStep(defectCode) {
    const desc = document.getElementById('step_desc').value.trim();
    if(!desc) return;
    const d = await OfflineDB.getDefectByCode(defectCode);
    const session = JSON.parse(localStorage.getItem('iqdws_session'));
    if(!d.reviewSteps) d.reviewSteps = [];
    d.reviewSteps.push({ date: new Date().toLocaleDateString('fa-IR'), desc, by: session.displayName });
    // آپدیت فیلدهای آخرین تغییر
    d.lastUpdatedAt = new Date().toISOString();
    d.lastUpdatedBy = session.displayName;
    
    await OfflineDB.saveDefect(d);
    Utils.closeModal(); renderExpertDefectDetail(defectCode);
}

async function openEditStepModal(defectCode, index) {
    const d = await OfflineDB.getDefectByCode(defectCode);
    Utils.openModal(`
        <h3 style="color:var(--warning); margin-bottom:15px;">ویرایش مرحله</h3>
        <div class="form-field"><label>شرح</label><textarea id="edit_step_desc" class="form-control" required>${d.reviewSteps[index].desc}</textarea></div>
        <button class="btn btn-warning" style="width:100%; margin-top:10px;" onclick="updateReviewStep('${defectCode}', ${index})">ذخیره</button>
    `);
}
async function updateReviewStep(defectCode, index) {
    const desc = document.getElementById('edit_step_desc').value.trim();
    if(!desc) return;
    const d = await OfflineDB.getDefectByCode(defectCode);
    d.reviewSteps[index].desc = desc;
    d.lastUpdatedAt = new Date().toISOString();
    d.lastUpdatedBy = JSON.parse(localStorage.getItem('iqdws_session')).displayName;
    await OfflineDB.saveDefect(d);
    Utils.closeModal(); renderExpertDefectDetail(defectCode);
}
async function deleteReviewStep(defectCode, index) {
    if(!confirm('حذف شود؟')) return;
    const d = await OfflineDB.getDefectByCode(defectCode);
    d.reviewSteps.splice(index, 1);
    d.lastUpdatedAt = new Date().toISOString();
    d.lastUpdatedBy = JSON.parse(localStorage.getItem('iqdws_session')).displayName;
    await OfflineDB.saveDefect(d);
    renderExpertDefectDetail(defectCode);
}

function openClaimModal(defectCode) {
    Utils.openModal(`
        <h3 style="color:var(--secondary); margin-bottom:15px;">ثبت کارت کلیم</h3>
        <input type="hidden" id="c_defectCode" value="${defectCode}">
        <div class="form-field"><label>شماره کلیم <span class="req">*</span></label><input type="text" id="c_claimId" class="form-control" required></div>
        <div class="form-field"><label>شماره فنی قطعه <span class="req">*</span></label><input type="text" id="c_partNo" class="form-control" required></div>
        <div class="form-field"><label>نام قطعه <span class="req">*</span></label><input type="text" id="c_partName" class="form-control" required></div>
        <div class="form-field"><label>سازنده <span class="req">*</span></label><input type="text" id="c_supplier" class="form-control" required></div>
        <div class="form-field"><label>تعداد کلیم <span class="req">*</span></label><input type="number" id="c_qty" class="form-control" min="1" required></div>
        <div class="form-field"><label>دلیل کلیم <span class="req">*</span></label><textarea id="c_reason" class="form-control" required></textarea></div>
        <div class="form-field"><label>VINها (با کاما جدا کنید) <span class="req">*</span></label><textarea id="c_vins" class="form-control" required></textarea></div>
        <button class="btn btn-success" style="width:100%; margin-top:10px;" onclick="saveClaim()">ثبت</button>
    `);
}
async function saveClaim() {
    const session = JSON.parse(localStorage.getItem('iqdws_session'));
    const claimData = {
        claimId: document.getElementById('c_claimId').value.trim(),
        defectCode: document.getElementById('c_defectCode').value,
        partNo: document.getElementById('c_partNo').value.trim(),
        partName: document.getElementById('c_partName').value.trim(),
        supplier: document.getElementById('c_supplier').value.trim(),
        qty: parseInt(document.getElementById('c_qty').value),
        reason: document.getElementById('c_reason').value.trim(),
        vins: document.getElementById('c_vins').value.trim(),
        createdBy: session.username,
        createdAt: new Date().toISOString()
    };
    if(!claimData.claimId || !claimData.partNo || !claimData.qty) return Utils.toast('اطلاعات ناقص', 'error');
    await OfflineDB.saveClaim(claimData);
    Utils.toast('کلیم ثبت شد'); Utils.closeModal(); navigate('defects');
}