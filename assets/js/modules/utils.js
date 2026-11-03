const Utils = {
    generateDefectCode: (severity) => {
        const currentYear = new Date().getFullYear() % 100;
        const yearLetter = String.fromCharCode(65 + (currentYear % 26)); 
        const sevMap = { 'critical': 'S', 'major': 'A', 'minor': 'B', 'cosmetic': 'C', 'P': 'P' };
        const sevLetter = sevMap[severity] || 'X';
        let overflowCount = parseInt(localStorage.getItem('defect_overflow') || '0');
        const overflowLetter = String.fromCharCode(65 + (overflowCount % 26));
        let currentSeq = parseInt(localStorage.getItem('defect_seq') || '0');
        currentSeq++;
        if (currentSeq > 999999) {
            currentSeq = 1;
            overflowCount++;
            localStorage.setItem('defect_overflow', overflowCount);
        }
        localStorage.setItem('defect_seq', currentSeq);
        return `${yearLetter}${sevLetter}${overflowLetter}${currentSeq.toString().padStart(6, '0')}`;
    },

    formatDate: (dateString) => {
        if (!dateString) return '—';
        const d = new Date(dateString);
        return d.toLocaleDateString('fa-IR') + ' ' + d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    },

    toast: (message, type = 'success') => {
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.style.cssText = 'position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#333; color:#fff; padding:12px 24px; border-radius:30px; font-size:13px; z-index:9999; transition:0.3s; opacity:0;';
            document.body.appendChild(toast);
        }
        toast.innerText = message;
        toast.style.background = type === 'error' ? '#c62828' : (type === 'success' ? '#2e7d32' : '#333');
        toast.style.opacity = '1';
        setTimeout(() => { toast.style.opacity = '0'; }, 3000);
    },

    openModal: (html) => {
        let modal = document.getElementById('global-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'global-modal';
            modal.style.cssText = 'position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:1000; padding:20px;';
            modal.onclick = (e) => { if(e.target === modal) Utils.closeModal(); };
            document.body.appendChild(modal);
        }
        modal.innerHTML = `
            <div style="background:#fff; border-radius:10px; padding:20px; width:100%; max-width:600px; max-height:90vh; overflow-y:auto; position:relative;">
                <button onclick="Utils.closeModal()" style="position:absolute; top:10px; left:10px; background:none; border:none; font-size:20px; cursor:pointer; color:#c62828; font-weight:bold; z-index:10;">✖</button>
                <div id="global-modal-content" style="margin-top:15px;">${html}</div>
            </div>
        `;
    },
    
    closeModal: () => {
        const modal = document.getElementById('global-modal');
        if (modal) modal.remove();
    }
};