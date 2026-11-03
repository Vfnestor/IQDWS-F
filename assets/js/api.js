/**
 * API Layer — لایه انتزاعی بین UI و بک‌اند
 * - MODE = 'mock' → از mock-data.js می‌خواند (کاملاً آفلاین)
 * - MODE = 'real' → به iqdws-b وصل می‌شود (فاز ۱۱)
 * - در حالت آفلاین، نوشتن‌ها به صف می‌روند
 */
import { store } from './store.js';
import { offline } from './offline.js';
import * as mock from './mock-data.js';

const CONFIG = {
  mode: 'mock',
  baseUrl: 'http://localhost:3000/api',
  timeout: 15000,
};

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

class ApiClient {
  constructor() { this.token = localStorage.getItem('iqdws_token') || null; }

  setToken(t) {
    this.token = t;
    if (t) localStorage.setItem('iqdws_token', t);
    else localStorage.removeItem('iqdws_token');
  }

  async request(method, path, body = null, options = {}) {
    if (!offline.isOnline() && method !== 'GET') {
      const item = {
        id: crypto.randomUUID(),
        method, path, body,
        createdAt: new Date().toISOString(),
        resource: options.resource || path.split('/').filter(Boolean)[0],
      };
      await store.enqueue(item);
      return { data: { ...body, _pending: true, _localId: item.id }, _offline: true };
    }
    if (CONFIG.mode === 'mock') return this.mockRequest(method, path, body);
    return this.realRequest(method, path, body);
  }

  async realRequest(method, path, body) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), CONFIG.timeout);
    try {
      const res = await fetch(`${CONFIG.baseUrl}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: ctrl.signal,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new ApiError(data.message || 'خطا در ارتباط با سرور', res.status, data);
      return { data };
    } finally { clearTimeout(timer); }
  }

  async mockRequest(method, path, body) {
    await new Promise(r => setTimeout(r, 150));
    const parts = path.split('/').filter(Boolean);
    const resource = parts[0];
    const key = 'mock_' + resource.replace(/-/g, '_');
    const data = mock[key] || [];

    if (method === 'GET') {
      if (parts.length === 1) return { data, _mock: true };
      const id = parts[1];
      return { data: data.find(d => d.id === id || d._id === id) || null, _mock: true };
    }
    if (method === 'POST') return { data: { ...body, id: crypto.randomUUID(), _mock: true }, _mock: true };
    if (method === 'PUT')    return { data: { ...body }, _mock: true };
    if (method === 'DELETE') return { data: { ok: true }, _mock: true };
    throw new ApiError('متد پشتیبانی نمی‌شود', 405);
  }

  async cachedGet(path, params = {}) {
    const key = `${path}?${new URLSearchParams(params)}`;
    if (!offline.isOnline()) {
      const cached = await store.getCache(key);
      return { data: cached ?? [], _offline: true };
    }
    try {
      const res = await this.request('GET', path);
      if (res?.data) await store.setCache(key, res.data);
      return res;
    } catch (e) {
      const cached = await store.getCache(key);
      if (cached) return { data: cached, _stale: true };
      throw e;
    }
  }

  /* --- Auth --- */
  async login(username, password) {
    const res = await this.request('POST', '/auth/login', { username, password });
    if (res.data?.token) this.setToken(res.data.token);
    return res.data;
  }
  async logout() { this.setToken(null); await store.clearSession(); }

  /* --- Defects (پایه فعلی) --- */
  listDefects(p)      { return this.cachedGet('/defects', p); }
  getDefect(id)       { return this.request('GET', `/defects/${id}`); }
  createDefect(d)     { return this.request('POST', '/defects', d, { resource: 'defects' }); }
  updateDefect(id, d) { return this.request('PUT', `/defects/${id}`, d, { resource: 'defects' }); }

  /* --- QAN --- */
  listQANs(p)         { return this.cachedGet('/qans', p); }
  createQAN(d)        { return this.request('POST', '/qans', d, { resource: 'qans' }); }

  /* --- Claims --- */
  listClaims(p)       { return this.cachedGet('/claims', p); }
  createClaim(d)      { return this.request('POST', '/claims', d, { resource: 'claims' }); }

  /* --- Analysis Tasks --- */
  listAnalysisTasks(p){ return this.cachedGet('/analysis-tasks', p); }

  /* --- Operator Errors --- */
  listOperatorErrors(p){ return this.cachedGet('/operator-errors', p); }

  /* --- Users (admin) --- */
  listUsers(p)        { return this.cachedGet('/users', p); }

  /* --- Dashboard --- */
  async getDashboard() {
    if (CONFIG.mode === 'mock') {
      await new Promise(r => setTimeout(r, 200));
      return { data: mock.mock_dashboard, _mock: true };
    }
    return this.cachedGet('/dashboard');
  }
}

export const api = new ApiClient();
export { ApiError, CONFIG as API_CONFIG };