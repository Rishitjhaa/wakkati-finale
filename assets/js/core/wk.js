import { config } from '../config.js';
export const qs = (selector, root = document) => root.querySelector(selector);
export const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];
export function emit(name, detail) { document.dispatchEvent(new CustomEvent(name, { detail })); }
export function on(name, fn) { document.addEventListener(name, fn); return () => document.removeEventListener(name, fn); }
const MEMORY = new Map();
export const storage = {
  get(key, fallback = null) { try { const raw = localStorage.getItem(key); return raw === null ? (MEMORY.get(key) ?? fallback) : JSON.parse(raw); } catch { return MEMORY.get(key) ?? fallback; } },
  set(key, value) { MEMORY.set(key, value); try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* memory remains available */ } }
};
export const formatPrice = n => n == null ? 'Price on request' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
export const imgPath = (folder, file) => `/assets/img/${folder}/${file}`;
export const slugify = str => String(str).normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const CATEGORIES = ['kurtis', 'ethnic', 'western', 'coords'];
function url(path, params) { const query = new URLSearchParams(params).toString(); return `/${path}.html${query ? `?${query}` : ''}`; }
export const routes = Object.freeze({
  home: () => '/index.html',
  shop: (params = {}) => { const valid = {}; if (CATEGORIES.includes(params.cat)) valid.cat = params.cat; if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(params.color ?? '')) valid.color = params.color; if (['new', 'price-asc', 'price-desc'].includes(params.sort)) valid.sort = params.sort; if (Number.isInteger(Number(params.page)) && Number(params.page) >= 1) valid.page = params.page; return url('shop', valid); },
  collections: () => '/collections.html', collection: slug => url('collection', { slug }),
  product: (id, colorSlug) => url('product', { id, ...(colorSlug ? { color: colorSlug } : {}) }),
  cart: () => '/cart.html',
  page: name => ['about', 'contact', 'shipping-policy', 'returns-policy', 'privacy-policy', 'terms'].includes(name) ? `/${name}.html` : '/index.html'
});
export const WK = window.WK ??= {};
Object.assign(WK, { emit, on, qs, qsa, storage, formatPrice, imgPath, slugify, prefersReducedMotion, routes, config });
export { config };
// Shared image recovery: clear srcset as well, so an unavailable candidate cannot win again.
export function fallbackImage(image, ratio = '4x5') {
  image.addEventListener('error', () => { image.removeAttribute('srcset'); image.removeAttribute('sizes'); image.closest('picture')?.querySelectorAll('source').forEach(source => source.remove()); image.src = imgPath('ui', `ph-${ratio}.svg`); }, { once: true });
}
