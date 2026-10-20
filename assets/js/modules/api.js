const getToken = () => localStorage.getItem('iqdws_token');
const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
});

async function handleResponse(res) {
    if (res.status === 401) {
        alert('نشست شما منقضی شده است. لطفا دوباره وارد شوید.');
        localStorage.removeItem('iqdws_token');
        localStorage.removeItem('iqdws_session');
        window.location.href = 'index.html';
        throw new Error('Unauthorized');
    }
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `کد خطا: ${res.status}`);
    }
    return await res.json();
}

const API = {
    createDefect: async (data) => {
        try {
            const res = await fetch(`${window.API_BASE_URL}/defects`, {
                method: 'POST', headers: getHeaders(), body: JSON.stringify(data)
            });
            return handleResponse(res);
        } catch (e) {
            if (e.message.includes('Failed to fetch')) {
                throw new Error('سرور Render در حال بیدار شدن است یا اینترنت شما قطع است. لطفاً ۴۰ ثانیه صبر کنید و مجدداً تلاش کنید.');
            }
            throw e;
        }
    },
    // ... (بقیه توابع قبلی بدون تغییر)
    getDefects: async () => {
        try {
            const res = await fetch(`${window.API_BASE_URL}/defects`, { headers: getHeaders() });
            return handleResponse(res);
        } catch (e) {
            if (e.message.includes('Failed to fetch')) throw new Error('عدم برقراری ارتباط با سرور (در حال بیدار شدن است)');
            throw e;
        }
    },
    getQANs: async () => {
        try {
            const res = await fetch(`${window.API_BASE_URL}/qans`, { headers: getHeaders() });
            return handleResponse(res);
        } catch (e) {
            if (e.message.includes('Failed to fetch')) throw new Error('عدم برقراری ارتباط با سرور');
            throw e;
        }
    },
    createQAN: async (data) => {
        const res = await fetch(`${window.API_BASE_URL}/qans`, {
            method: 'POST', headers: getHeaders(), body: JSON.stringify(data)
        });
        return handleResponse(res);
    },
    updateQANStatus: async (id, status) => {
        const res = await fetch(`${window.API_BASE_URL}/qans/${id}/status`, {
            method: 'PUT', headers: getHeaders(), body: JSON.stringify({ status })
        });
        return handleResponse(res);
    },
    get8DByQAN: async (qanId) => {
        const res = await fetch(`${window.API_BASE_URL}/eightd/qan/${qanId}`, { headers: getHeaders() });
        if (res.status === 404) return null;
        return handleResponse(res);
    },
    save8D: async (data) => {
        const res = await fetch(`${window.API_BASE_URL}/eightd`, {
            method: 'POST', headers: getHeaders(), body: JSON.stringify(data)
        });
        return handleResponse(res);
    }
};