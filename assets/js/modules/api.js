// آدرس بک‌اند (در حالت لوکال 3000 است، بعداً به آدرس سرور ابری تغییر می‌کند)
const API_BASE_URL = 'http://localhost:3000/api';

// ذخیره توکن کاربر پس از ورود
const getToken = () => localStorage.getItem('iqdws_token');

const API = {
    // ورود به سامانه
    login: async (role, app) => {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role, app })
        });
        const data = await res.json();
        if (res.ok) localStorage.setItem('iqdws_token', data.token);
        return data;
    },

    // دریافت لیست ایرادها
    getDefects: async () => {
        const res = await fetch(`${API_BASE_URL}/defects`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        if (!res.ok) throw new Error('خطا در دریافت اطلاعات');
        return await res.json();
    },
    
    // ثبت ایراد جدید
    createDefect: async (data) => {
        const res = await fetch(`${API_BASE_URL}/defects`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('خطا در ثبت اطلاعات');
        return await res.json();
    },

    // دریافت اخطارها
    getQANs: async () => {
        const res = await fetch(`${API_BASE_URL}/defects`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        return await res.json(); // فعلاً برای تست از همان دیتای ایرادها استفاده می‌کنیم
    }
};