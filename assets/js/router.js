/**
 * Router — مسیریابی hash-based بین ماژول‌ها
 * مثال: #/qc/ncr  →  modules/qc/ncr.html
 */
class Router {
  constructor() {
    this.routes = new Map();
    this.current = null;
    window.addEventListener('hashchange', () => this.handle());
  }

  register(path, loader) { this.routes.set(path, loader); return this; }

  navigate(path) {
    if (location.hash === `#${path}`) return;
    location.hash = path;
  }

  getPath() {
    const h = location.hash.replace(/^#/, '') || '/';
    return h;
  }

  async handle() {
    const path = this.getPath();
    this.current = path;
    const loader = this.routes.get(path);
    if (loader) {
      try { await loader(path); }
      catch (e) { console.error('[router]', e); }
    }
    document.dispatchEvent(new CustomEvent('route:change', { detail: { path } }));
  }

  start() { return this.handle(); }
}

export const router = new Router();