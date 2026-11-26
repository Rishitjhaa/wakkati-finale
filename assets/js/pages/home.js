import '../components/layout.js';
import { WK, config, routes, imgPath, fallbackImage, prefersReducedMotion, emit, on, formatPrice } from '../core/wk.js';
import { getAll, getByTag, getColors, findVariant } from '../core/catalog.js';
import { renderProductCard, init as initCards } from '../components/product-card.js';
import { init as initTape } from '../components/tape-nav.js';
import { init as initLooks } from '../components/look-viewer.js';
import { init as initCurtain } from '../motion/curtain.js';
import { init as initThread } from '../motion/thread.js';
import { init as initReveal } from '../motion/reveal.js';

document.querySelectorAll('[data-source-folder]').forEach(source => { source.srcset = imgPath(source.dataset.sourceFolder, source.dataset.sourceFile); });
document.querySelectorAll('[data-image-folder]').forEach(image => { fallbackImage(image, image.dataset.ratio ?? '4x5'); image.src = imgPath(image.dataset.imageFolder, image.dataset.imageFile); });
document.querySelector('[data-js="hero-description"]').textContent = config.heroDescription;
document.querySelectorAll('[data-route-category]').forEach(a => { a.href = routes.shop({ cat: a.dataset.routeCategory }); });
document.querySelectorAll('[data-route-shop]').forEach(a => { a.href = routes.shop({ sort: 'new' }); });

/* ===== New Arrivals — digital fashion rack (Pass B) ===== */
const rail = document.querySelector('[data-js="arrivals"]'); const infoRoot = document.querySelector('[data-js="rack-info"]'); const filterRoot = document.querySelector('[data-js="rack-filters"]');
const previous = document.querySelector('[data-js="rail-prev"]'); const next = document.querySelector('[data-js="rail-next"]');
const ALL = getByTag('new', 8); const CATEGORY_LABEL = { kurtis: 'Kurtis', ethnic: 'Ethnic', western: 'Western', coords: 'Co-ords' };
const chosen = new Map(); let shown = ALL; let active = 0; let activeFilter = 'all';
const colorOf = product => findVariant(product, chosen.get(product.id));
const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
function setGarmentImage(img, product, color) { const file = color.images[0]; img.alt = ''; img.src = imgPath('products', file); img.srcset = `${imgPath('products', file.replace('.webp','-480.webp'))} 480w, ${imgPath('products', file)} 1200w`; img.sizes = '(min-width:1024px) 480px, 70vw'; }
function buildRack() {
  rail.replaceChildren();
  shown.forEach((product, i) => {
    const color = colorOf(product); const item = document.createElement('button'); item.type = 'button'; item.className = 'rack__item'; item.dataset.id = product.id; item.setAttribute('aria-pressed', 'false');
    item.innerHTML = `<span class="rack__thread" aria-hidden="true"></span><span class="rack__garment"><img width="1200" height="1500" loading="${i < 3 ? 'eager' : 'lazy'}"></span><span class="rack__no" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><span class="rack__dots" aria-hidden="true">${product.colors.slice(0, 5).map(c => `<i class="product-card__dot product-card__dot--${c.slug}"></i>`).join('')}</span>`;
    const img = item.querySelector('img'); fallbackImage(img); setGarmentImage(img, product, color);
    item.setAttribute('aria-label', `${product.name}, ${color.name}. ${product.colors.length} colours. Select to focus`);
    item.addEventListener('click', () => { if (drag?.moved) return; setActive(i, { scroll: true }); });
    rail.append(item);
  });
}
function renderInfo() {
  const product = shown[active]; if (!product) { infoRoot.replaceChildren(); return; } const color = colorOf(product); const saved = WK.wishlist?.has?.(product.id) ?? false;
  infoRoot.innerHTML = `<div class="rack__info-main"><p class="rack__count">No. ${String(active + 1).padStart(2, '0')} <span>/ ${String(shown.length).padStart(2, '0')}</span></p><p class="home-eyebrow rack__cat">${esc(CATEGORY_LABEL[product.category] ?? product.category)} · New</p><h3><a data-js="rack-link">${esc(product.name)}</a></h3><p class="rack__price">${formatPrice(product.price)}</p></div><div class="rack__info-colour"><p class="rack__colour-label">Colour <b data-js="rack-colour-name">${esc(color.name)}</b></p><div class="rack__swatches" role="group" aria-label="Choose colour for ${esc(product.name)}">${product.colors.map(c => `<button type="button" data-color="${c.slug}" aria-label="${esc(c.name)}" aria-pressed="${c.slug === color.slug}"><span class="product-card__dot product-card__dot--${c.slug}"></span></button>`).join('')}</div></div><div class="rack__info-actions"><button type="button" class="button" data-js="rack-add">${product.inStock ? 'Quick add' : 'Ask on WhatsApp'}</button><button type="button" class="button button--secondary" data-js="rack-quick">Quick view</button><button type="button" class="rack__heart" data-js="rack-save" aria-label="Save ${esc(product.name)}" aria-pressed="${saved}"><svg width="22" height="22" aria-hidden="true"><use href="/assets/icons/sprite.svg#heart"></use></svg></button></div>`;
  infoRoot.querySelector('[data-js="rack-link"]').href = routes.product(product.id, color.slug);
  infoRoot.querySelectorAll('.rack__swatches button').forEach(button => button.addEventListener('click', () => pickColor(product, button.dataset.color)));
  infoRoot.querySelector('[data-js="rack-add"]').addEventListener('click', () => emit('wk:cart:add', { id: product.id, color: colorOf(product).slug, size: null, qty: 1, source: 'product-card' }));
  infoRoot.querySelector('[data-js="rack-quick"]').addEventListener('click', () => emit('wk:quickview:open', { id: product.id }));
  infoRoot.querySelector('[data-js="rack-save"]').addEventListener('click', () => emit('wk:wishlist:toggle', { id: product.id }));
}
function pickColor(product, slug) {
  chosen.set(product.id, slug); const color = colorOf(product); const item = rail.querySelector(`[data-id="${product.id}"]`); const img = item.querySelector('img'); setGarmentImage(img, product, color);
  item.setAttribute('aria-label', `${product.name}, ${color.name}. ${product.colors.length} colours. Select to focus`);
  infoRoot.querySelectorAll('.rack__swatches button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.color === slug)));
  infoRoot.querySelector('[data-js="rack-colour-name"]').textContent = color.name; infoRoot.querySelector('[data-js="rack-link"]').href = routes.product(product.id, slug);
  if (window.gsap) { const calm = prefersReducedMotion() || innerWidth < 768; window.gsap.fromTo(img, calm ? { opacity: .6 } : { clipPath: 'circle(0% at 50% 60%)' }, calm ? { opacity: 1, duration: prefersReducedMotion() ? .15 : .3 } : { clipPath: 'circle(150% at 50% 60%)', duration: .65, ease: 'power3.inOut' }); if (!calm) window.gsap.fromTo(item.querySelector('.rack__garment'), { rotation: 2.5 }, { rotation: 0, duration: 1.1, ease: 'elastic.out(1,.45)', transformOrigin: '50% 0%' }); }
}
function centerOf(item) { return item.offsetLeft + item.offsetWidth / 2 - rail.clientWidth / 2; }
function setActive(index, { scroll = false } = {}) {
  index = Math.max(0, Math.min(shown.length - 1, index)); const changed = index !== active || !infoRoot.firstElementChild; active = index;
  [...rail.children].forEach((item, i) => item.setAttribute('aria-pressed', String(i === index)));
  if (scroll) rail.scrollTo({ left: centerOf(rail.children[index]), behavior: prefersReducedMotion() ? 'instant' : 'smooth' });
  if (changed) renderInfo(); railState();
}
function railState() { const max = rail.scrollWidth - rail.clientWidth; const progress = max > 0 ? rail.scrollLeft / max : 1; document.querySelector('[data-js="rail-progress"]').style.transform = `scaleX(${.12 + .88 * progress})`; document.querySelector('[data-js="rail-meter"]').setAttribute('aria-valuenow', Math.round(progress * 100)); previous.disabled = active <= 0; next.disabled = active >= shown.length - 1; }
let frame; function onScroll() { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => { let best = 0, gap = Infinity; [...rail.children].forEach((item, i) => { const d = Math.abs(centerOf(item) - rail.scrollLeft); if (d < gap) { gap = d; best = i; } }); if (best !== active) setActive(best); else railState(); }); }
previous.addEventListener('click', () => setActive(active - 1, { scroll: true })); next.addEventListener('click', () => setActive(active + 1, { scroll: true }));
rail.addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', () => setActive(active, { scroll: true }));
rail.addEventListener('keydown', event => { if (event.target !== rail) return; if (['ArrowLeft','ArrowRight'].includes(event.key)) { event.preventDefault(); setActive(active + (event.key === 'ArrowRight' ? 1 : -1), { scroll: true }); } });
on('wk:wishlist:changed', ({ detail }) => { const product = shown[active]; const heart = infoRoot.querySelector('[data-js="rack-save"]'); if (product && heart) heart.setAttribute('aria-pressed', String(detail.ids.includes(product.id))); });
let drag;
rail.addEventListener('pointerdown', event => { if (event.pointerType !== 'mouse' || event.button !== 0) return; drag = { x: event.clientX, left: rail.scrollLeft, moved: false }; });
rail.addEventListener('pointermove', event => { if (!drag) return; if (Math.abs(event.clientX - drag.x) > 6) { drag.moved = true; rail.style.scrollSnapType = 'none'; rail.scrollLeft = drag.left - (event.clientX - drag.x); } });
rail.addEventListener('dragstart', event => event.preventDefault());
addEventListener('pointerup', () => { if (drag?.moved) { rail.style.scrollSnapType = ''; onScroll(); } setTimeout(() => { drag = null; }, 0); });
function buildFilters() {
  const cats = ['all', ...new Set(ALL.map(p => p.category))];
  cats.forEach(cat => { const b = document.createElement('button'); b.type = 'button'; b.dataset.cat = cat; b.textContent = cat === 'all' ? 'All' : (CATEGORY_LABEL[cat] ?? cat); b.setAttribute('aria-pressed', String(cat === 'all')); b.addEventListener('click', () => { activeFilter = cat; shown = cat === 'all' ? ALL : ALL.filter(p => p.category === cat); active = 0; filterRoot.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.cat === cat))); buildRack(); rail.scrollLeft = 0; setActive(0); }); filterRoot.append(b); });
}
buildFilters(); buildRack(); setActive(0);

const colors = getColors(); const fan = document.querySelector('[data-js="colour-swatches"]'); const colorProducts = document.querySelector('[data-js="colour-products"]');
function selectColor(color) {
  fan.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.color === color.slug)));
  const matches = getAll().filter(p => p.colors.some(c => c.slug === color.slug)).slice(0,4);
  colorProducts.replaceChildren(...matches.map(p => renderProductCard(p, { colorSlug: color.slug, variant: 'grid' })));
  const link = document.querySelector('[data-js="colour-link"]'); link.href = routes.shop({ color: color.slug }); link.textContent = `See all in ${color.name}`;
  document.querySelector('[data-js="colour-status"]').textContent = `${color.name} · ${matches.length} pieces to explore`;
  if (window.gsap) window.gsap.fromTo(colorProducts, { opacity: .4 }, { opacity: 1, duration: prefersReducedMotion() ? .15 : .35 });
}
colors.forEach((color, index) => { const button = document.createElement('button'); button.className = `colour-fan__swatch colour-fan__swatch--${color.slug}`; button.dataset.color = color.slug; button.style.setProperty('--fan-angle', `${colors.length >= 6 ? -24 + index * 48 / (colors.length - 1) : 0}deg`); button.setAttribute('aria-label', `Explore ${color.name}`); const sample = document.createElement('span'); sample.className = 'colour-fan__sample'; sample.setAttribute('aria-hidden','true'); const label = document.createElement('span'); label.textContent = color.name; button.append(sample,label); button.addEventListener('click', () => selectColor(color)); fan.append(button); });
if (colors.length < 6) fan.classList.add('colour-fan__swatches--simple'); if (colors[0]) selectColor(colors[0]);

const chapters = document.querySelector('[data-js="chapters"]');
config.story.forEach((chapter, index) => {
  const article = document.createElement('article'); article.className = 'story__chapter'; article.dataset.js = 'chapter';
  const image = document.createElement('img'); image.width = 1200; image.height = 1800; image.loading = 'lazy'; image.alt = `${chapter.title} editorial photograph placeholder`; fallbackImage(image,'2x3'); image.src=imgPath('editorial',`ed-0${index+1}.webp`);
  const copy = document.createElement('div'); copy.className = 'story__copy'; const number = document.createElement('span'); number.className='story__number'; number.textContent=String(index+1).padStart(2,'0'); number.setAttribute('aria-hidden','true'); const h3=document.createElement('h3');h3.textContent=chapter.title;const p=document.createElement('p');p.textContent=chapter.text;const link=document.createElement('a');link.className='button button--text';link.href=routes.shop({cat:chapter.category});link.textContent='Shop this edit';copy.append(number,h3,p,link);article.append(image,copy);chapters.append(article);
});
document.querySelector('[data-js="instagram-link"]').href=config.instagramUrl;
const instagram=document.querySelector('[data-js="instagram-grid"]');
for(let i=0;i<6;i++){const a=document.createElement('a');a.href=config.instagramUrl;a.target='_blank';a.rel='noopener noreferrer';a.setAttribute('aria-label',`Visit WAKKATI on Instagram — preview ${i+1}`);const image=document.createElement('img');image.width=1200;image.height=1500;image.loading='lazy';image.alt=`Instagram photography placeholder ${i+1}`;image.dataset.reveal='image';fallbackImage(image);image.src=imgPath('editorial',`ed-0${i%3+1}.webp`);const badge=document.createElement('span');badge.innerHTML='<svg width="20" height="20" aria-hidden="true"><use href="/assets/icons/sprite.svg#instagram"></use></svg>';a.append(image,badge);instagram.append(a);}
initCards(); initTape(); initLooks(); initCurtain(); initReveal(); initThread();
