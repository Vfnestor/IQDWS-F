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

    const todayJalali = jalaali.toJalaali(new Date());

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

        // بررسی اینکه آیا این روز "امروز" هست یا نه
        const isToday = (todayJalali.jy === calYear && todayJalali.jm === calMonth && todayJalali.jd === i);

        // محاسبه تاریخ میلادی برای نمایش در زیر روز
        const gDate = jalaali.toGregorian(calYear, calMonth, i);
        const gDateStr = `${gDate.gm}/${gDate.gd}`; // فرمت ماه/روز

        let classes = 'cal-day-cell';
        if (isToday) classes += ' today';
        if (hasDeadline) classes += ' has-deadline';

        gridCells += `
            <div class="${classes}" onclick="showDayDetails(${calYear}, ${calMonth}, ${i})">
                <div class="cal-day-num">${i}</div>
                <div class="cal-day-greg">${gDateStr}</div>
            </div>
        `;
    }

    // محاسبه نام ماه میلادی برای سربرگ
    const gregMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const firstG = jalaali.toGregorian(calYear, calMonth, 1);
    const lastG = jalaali.toGregorian(calYear, calMonth, daysInMonth);
    const gregHeaderText = gregMonths[firstG.gm - 1] === gregMonths[lastG.gm - 1] 
        ? gregMonths[firstG.gm - 1] 
        : `${gregMonths[firstG.gm - 1]} - ${gregMonths[lastG.gm - 1]}`;

    // بررسی امکان تغییر ماه (فقط در سال جاری)
    const currentYear = todayJalali.jy;
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
                <div class="calendar-container">
                    <!-- هدر تقویم با استایل جدید -->
                    <div class="calendar-header">
                        <div class="gregorian-month">${gregHeaderText}</div>
                        <div>${monthNames[calMonth - 1]} ${calYear}</div>
                        <div style="display:flex; gap:5px;">
                            <button class="btn btn-sm" style="background:rgba(255,255,255,0.2); color:white; padding:2px 8px;" ${prevDisabled} onclick="changeMonth(-1)">‹</button>
                            <button class="btn btn-sm" style="background:rgba(255,255,255,0.2); color:white; padding:2px 8px;" ${nextDisabled} onclick="changeMonth(1)">›</button>
                        </div>
                    </div>
                    
                    <div class="calendar-body">
                        <div class="cal-weekdays">
                            <div>شنبه</div><div>یکشنبه</div><div>دوشنبه</div>
                            <div>سه شنبه</div><div>چهارشنبه</div><div>پنجشنبه</div><div>جمعه</div>
                        </div>
                        <div class="cal-grid">
                            ${gridCells}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}