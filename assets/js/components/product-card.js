import { WK, emit, on, routes, imgPath, formatPrice, fallbackImage, prefersReducedMotion } from '../core/wk.js';
import { findVariant } from '../core/catalog.js';
import { initSwatches } from './swatches.js';
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
export function renderProductCard(product, { colorSlug, variant = 'grid' } = {}) {
  let color = findVariant(product, colorSlug);
  const card = document.createElement('article'); card.className = `product-card product-card--${variant}`; card.dataset.component = 'product-card'; card.dataset.id = product.id;
  card.innerHTML = `<div class="product-card__media"><a data-js="product-link"><img data-js="image" width="1200" height="1500" loading="lazy"><img class="product-card__alternate" data-js="alternate" width="1200" height="1500" loading="lazy" alt=""></a><button class="product-card__heart" data-js="save" aria-label="Save ${escape(product.name)}" aria-pressed="${WK.wishlist?.has?.(product.id) ?? false}"><svg width="20" height="20" aria-hidden="true"><use href="/assets/icons/sprite.svg#heart"></use></svg></button><button class="product-card__quick" data-js="quickview">Quick view</button><span class="product-card__sample">Collection preview</span></div><div class="product-card__tag"><h3><a data-js="product-link">${escape(product.name)}</a></h3><p>${formatPrice(product.price)}</p><div class="product-card__swatches" data-component="swatches" aria-label="Choose colour">${product.colors.slice(0,5).map(c => `<button data-color="${c.slug}" aria-label="${escape(c.name)}" aria-pressed="${c.slug === color.slug}"><span class="product-card__dot product-card__dot--${c.slug}"></span></button>`).join('')}</div><button class="product-card__add" data-js="add">${product.inStock ? 'Quick add' : 'Ask on WhatsApp'} <span aria-hidden="true">+</span></button></div>`;
  const primary = card.querySelector('[data-js="image"]'); const alternate = card.querySelector('[data-js="alternate"]');
  const update = () => { card.querySelectorAll('[data-js="product-link"]').forEach(a => a.href = routes.product(product.id, color.slug)); primary.alt = `${product.name} in ${color.name}`; primary.src = imgPath('products', color.images[0]); primary.srcset = `${imgPath('products', color.images[0].replace('.webp','-480.webp'))} 480w, ${primary.src} 1200w`; primary.sizes = '(min-width: 1280px) 300px, (min-width: 768px) 28vw, 76vw'; alternate.src = imgPath('products', color.images[1] ?? color.images[0]); };
  fallbackImage(primary); fallbackImage(alternate); update();
  initSwatches(card.querySelector('[data-component="swatches"]'), { onChange: slug => { color = findVariant(product, slug); update(); if (window.gsap) window.gsap.fromTo(primary, (prefersReducedMotion() || innerWidth < 768) ? { opacity: .65 } : { clipPath: 'circle(0% at 50% 85%)' }, (prefersReducedMotion() || innerWidth < 768) ? { opacity: 1, duration: prefersReducedMotion() ? .15 : .3 } : { clipPath: 'circle(150% at 50% 85%)', duration: .6, ease: 'power3.inOut' }); } });
  card.querySelector('[data-js="save"]').addEventListener('click', () => emit('wk:wishlist:toggle', { id: product.id }));
  card.querySelector('[data-js="quickview"]').addEventListener('click', () => emit('wk:quickview:open', { id: product.id }));
  card.querySelector('[data-js="add"]').addEventListener('click', () => emit('wk:cart:add', { id: product.id, color: color.slug, size: null, qty: 1, source: 'product-card' }));
  card.dataset.wkInit = 'true'; return card;
}
export function init(root = document) {
  const mount = root.documentElement ?? root; if (mount.dataset.wkCardsInit) return; mount.dataset.wkCardsInit = 'true';
  on('wk:wishlist:changed', ({ detail }) => root.querySelectorAll('[data-component="product-card"]').forEach(card => card.querySelector('[data-js="save"]').setAttribute('aria-pressed', String(detail.ids.includes(card.dataset.id)))));
}
