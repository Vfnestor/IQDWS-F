/**
 * Store — state محلی، کش GET، صف سینک، session
 * از IndexedDB بدون کتابخانه خارجی استفاده می‌کند.
 */
const DB_NAME = 'iqdws';
const DB_VERSION = 1;
const STORES = ['cache', 'queue', 'session'];

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      for (const name of STORES) {
        if (!db.objectStoreNames.contains(name)) db.createObjectStore(name);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

async function idbGet(store, key) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const r = db.transaction(store, 'readonly').objectStore(store).get(key);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
async function idbSet(store, key, value) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).put(value, key);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}
async function idbDelete(store, key) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).delete(key);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}
async function idbGetAll(store) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const r = db.transaction(store, 'readonly').objectStore(store).getAll();
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
async function idbClear(store) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).clear();
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}

class Store {
  constructor() { this.state = {}; this.listeners = new Map(); }
  get(key) { return this.state[key]; }
  set(key, value) { this.state[key] = value; this.emit(key, value); }
  on(key, fn) {
    if (!this.listeners.has(key)) this.listeners.set(key, new Set());
    this.listeners.get(key).add(fn);
    return () => this.listeners.get(key)?.delete(fn);
  }
  emit(key, value) {
    this.listeners.get(key)?.forEach(fn => { try { fn(value); } catch (e) { console.error(e); } });
  }

  async getCache(key) { const entry = await idbGet('cache', key); return entry?.value; }
  async setCache(key, value) { return idbSet('cache', key, { value, updatedAt: Date.now() }); }
  async clearCache() { return idbClear('cache'); }

  async enqueue(item) { await idbSet('queue', item.id, item); this.emit('queue:changed', await this.getQueue()); }
  async getQueue() { return idbGetAll('queue'); }
  async removeFromQueue(id) { await idbDelete('queue', id); this.emit('queue:changed', await this.getQueue()); }
  async clearQueue() { return idbClear('queue'); }

  async setSession(data) { return idbSet('session', 'current', data); }
  async getSession() { return idbGet('session', 'current'); }
  async clearSession() { return idbDelete('session', 'current'); }
}

export const store = new Store();