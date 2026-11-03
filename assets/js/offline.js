/**
 * Offline — تشخیص آنلاین/آفلاین، رویدادها، تلاش دوره‌ای برای سینک
 */
import { store } from './store.js';

class OfflineManager {
  constructor() {
    this.online = navigator.onLine;
    this.listeners = new Set();
    this.syncing = false;

    window.addEventListener('online', () => this.setStatus(true));
    window.addEventListener('offline', () => this.setStatus(false));

    setInterval(() => this.trySync(), 30000);
  }

  isOnline() { return this.online; }

  setStatus(online) {
    if (this.online === online) return;
    this.online = online;
    this.emit({ online });
    if (online) this.trySync();
  }

  onChange(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  emit(payload) {
    this.listeners.forEach(fn => { try { fn(payload); } catch (e) { console.error(e); } });
  }

  async trySync() {
    if (!this.online || this.syncing) return;
    this.syncing = true;
    try {
      const queue = await store.getQueue();
      if (queue.length === 0) { this.emit({ synced: true, count: 0 }); return; }
      this.emit({ syncing: true, count: queue.length });
      // موتور سینک واقعی در فاز ۹ تکمیل می‌شود
    } finally {
      this.syncing = false;
    }
  }
}

export const offline = new OfflineManager();