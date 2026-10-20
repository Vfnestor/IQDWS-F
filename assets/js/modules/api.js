const API_BASE_URL = 'http://localhost:3000/api';

const getToken = () => localStorage.getItem('iqdws_token');
const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
});

const API = {
    // --- ایرادها ---
    getDefects: async () => {
        const res = await fetch(`${API_BASE_URL}/defects`, { headers: getHeaders() });
        if (!res.ok) throw new Error('خطا در دریافت ایرادها');
        return await res.json();
    },
    createDefect: async (data) => {
        const res = await fetch(`${API_BASE_URL}/defects`, {
            method: 'POST', headers: getHeaders(), body: JSON.stringify(data)
        });
        return await res.json();
    },

    // --- اخطارها ---
    getQANs: async () => {
        const res = await fetch(`${API_BASE_URL}/qans`, { headers: getHeaders() });
        if (!res.ok) throw new Error('خطا در دریافت اخطارها');
        return await res.json();
    },
    createQAN: async (data) => {
        const res = await fetch(`${API_BASE_URL}/qans`, {
            method: 'POST', headers: getHeaders(), body: JSON.stringify(data)
        });
        return await res.json();
    },
    updateQANStatus: async (id, status) => {
        const res = await fetch(`${API_BASE_URL}/qans/${id}/status`, {
            method: 'PUT', headers: getHeaders(), body: JSON.stringify({ status })
        });
        return await res.json();
    },

    // --- 8D ---
    get8DByQAN: async (qanId) => {
        const res = await fetch(`${API_BASE_URL}/eightd/qan/${qanId}`, { headers: getHeaders() });
        if (!res.ok) return null; // یعنی هنوز پاسخی ثبت نشده
        return await res.json();
    },
    save8D: async (data) => {
        const res = await fetch(`${API_BASE_URL}/eightd`, {
            method: 'POST', headers: getHeaders(), body: JSON.stringify(data)
        });
        return await res.json();
    }
};