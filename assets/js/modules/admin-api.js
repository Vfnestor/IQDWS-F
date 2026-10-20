const AdminAPI = {
    getToken: () => localStorage.getItem('iqdws_token'),
    getHeaders: function() { 
        return { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${this.getToken()}` 
        }; 
    },
    
    getStats: async () => {
        const [resDefects, resQANs, resBugs] = await Promise.all([
            fetch(`${API_BASE_URL}/defects`, { headers: AdminAPI.getHeaders() }),
            fetch(`${API_BASE_URL}/qans`, { headers: AdminAPI.getHeaders() }),
            fetch(`${API_BASE_URL}/bugs`, { headers: AdminAPI.getHeaders() })
        ]);
        return { 
            defects: await resDefects.json(), 
            qans: await resQANs.json(),
            bugs: await resBugs.json()
        };
    },

    getBugs: async () => {
        const res = await fetch(`${API_BASE_URL}/bugs`, { headers: AdminAPI.getHeaders() });
        return await res.json();
    },

    createBug: async (title, priority) => {
        const res = await fetch(`${API_BASE_URL}/bugs`, {
            method: 'POST',
            headers: AdminAPI.getHeaders(),
            body: JSON.stringify({ title, priority })
        });
        return await res.json();
    },

    resolveBug: async (id) => {
        const res = await fetch(`${API_BASE_URL}/bugs/${id}/resolve`, {
            method: 'PUT',
            headers: AdminAPI.getHeaders()
        });
        return await res.json();
    },

    getSystemHealth: async () => {
        const res = await fetch(`${API_BASE_URL}/settings/health`, { headers: AdminAPI.getHeaders() });
        return await res.json();
    }
};