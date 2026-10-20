// اتصال به APIهای بک‌اند مخصوص ادمین
const AdminAPI = {
    getToken: () => localStorage.getItem('iqdws_token'),
    
    getStats: async () => {
        const token = AdminAPI.getToken();
        // گرفتن اطلاعات از چند مسیر
        const [resDefects, resQANs] = await Promise.all([
            fetch('http://localhost:3000/api/defects', { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch('http://localhost:3000/api/qans', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        const defects = await resDefects.json();
        const qans = await resQANs.json();
        
        return { defects, qans };
    }
};