// اتصال به APIهای بک‌اند
const AdminAPI = {
    getToken: () => localStorage.getItem('iqdws_token'),
    getHeaders: function() { return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.getToken()}` }; },
    
    getStats: async () => {
        const [resDefects, resQANs, resBugs] = await Promise.all([
            fetch('http://localhost:3000/api/defects', { headers: AdminAPI.getHeaders() }),
            fetch('http://localhost:3000/api/qans', { headers: AdminAPI.getHeaders() }),
            fetch('http://localhost:3000/api/bugs', { headers: AdminAPI.getHeaders() })
        ]);
        return { 
            defects: await resDefects.json(), 
            qans: await resQANs.json(),
            bugs: await resBugs.json()
        };
    },

    getBugs: async () => {
        const res = await fetch('http://localhost:3000/api/bugs', { headers: AdminAPI.getHeaders() });
        return await res.json();
    },

    createBug: async (title, priority) => {
        const res = await fetch('http://localhost:3000/api/bugs', {
            method: 'POST',
            headers: AdminAPI.getHeaders(),
            body: JSON.stringify({ title, priority })
        });
        return await res.json();
    },

    resolveBug: async (id) => {
        const res = await fetch(`http://localhost:3000/api/bugs/${id}/resolve`, {
            method: 'PUT',
            headers: AdminAPI.getHeaders()
        });
        return await res.json();
    },

    getSystemHealth: async () => {
        const res = await fetch('http://localhost:3000/api/settings/health', { headers: AdminAPI.getHeaders() });
        return await res.json();
    }
};