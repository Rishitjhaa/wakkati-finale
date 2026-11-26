import { getLooks, getById, findVariant } from '../core/catalog.js';
import { imgPath, routes, formatPrice, emit, fallbackImage, prefersReducedMotion } from '../core/wk.js';
import { init as initDialog, openDialog, closeDialog } from '../core/dialog.js';
// Pass B: hotspots sit on garment anchors of the placeholder silhouette (neckline / waist / hem) so they land on the garment.
// looks.js (Profile 03-owned, frozen schema) coordinates are generic; set USE_DATA_PINS = true once real photography + coordinates exist.
const USE_DATA_PINS = false; const PIN_ANCHORS = [{ x: 50, y: 33 }, { x: 60, y: 53 }, { x: 42, y: 74 }];
const pinPosition = (pin, i) => (USE_DATA_PINS ? null : PIN_ANCHORS[i]) ?? { x: pin.x, y: pin.y };
export function init(root = document) {
  root.querySelectorAll('[data-component="look-viewer"]').forEach(viewer => {
    if (viewer.dataset.wkInit) return; viewer.dataset.wkInit = 'true';
    const looks = getLooks(); const n = looks.length; let index = 0; let activePin = null; const sizes = new Map();
    const q = name => viewer.querySelector(`[data-js="${name}"]`);
    const lineup = q('lineup'), tag = q('look-tag'), sheet = q('look-sheet'), sheetBody = q('sheet-body'), line = q('look-thread'), selector = q('look-selector'), list = q('look-list');
    const isDesktop = () => matchMedia('(min-width:1024px)').matches; initDialog(viewer);
    /* ---- stage: one standing figure per outfit ---- */
    const figures = looks.map((look, i) => {
      const el = document.createElement('div'); el.className = 'look-viewer__figure';
      const img = document.createElement('img'); img.width = 1500; img.height = 2000; img.loading = i === 0 ? 'eager' : 'lazy'; fallbackImage(img, '3x4'); img.src = imgPath('looks', look.image); img.alt = `${look.title} — placeholder full-body outfit`;
      const wrap = document.createElement('div'); wrap.className = 'look-viewer__pins';
      const buttons = look.pins.map((pin, k) => {
        const product = getById(pin.productId); const pos = pinPosition(pin, k); const b = document.createElement('button'); b.type = 'button'; b.className = 'look-viewer__pin';
        b.style.left = `${pos.x}%`; b.style.top = `${pos.y}%`; b.textContent = k + 1; b.setAttribute('aria-label', `Explore ${product.name}`); b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', () => showPin(pin, b)); b.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse' && isDesktop()) showPin(pin, b); }); wrap.append(b); return b;
      });
      const pick = document.createElement('button'); pick.type = 'button'; pick.className = 'look-viewer__figure-pick'; pick.setAttribute('aria-label', `Show outfit ${i + 1}: ${look.title}`); pick.addEventListener('click', () => setLook(i));
      el.append(img, wrap, pick); lineup.append(el); return { el, wrap, buttons, pick };
    });
    function place() { figures.forEach((f, i) => { const d = ((i - index + 1 + n) % n) - 1; const on = d === 0; f.el.style.setProperty('--d', d); f.el.dataset.state = on ? 'active' : 'side'; f.wrap.hidden = !on; f.pick.hidden = on; }); }
    /* ---- garment information panel (desktop tag / mobile bottom sheet) ---- */
    function buildPanel(target, product, color) {
      target.replaceChildren(); const thumb = document.createElement('img'); thumb.className = 'look-viewer__thumbnail'; thumb.width = 80; thumb.height = 100; thumb.loading = 'lazy'; thumb.alt = `${product.name} in ${color.name}`; fallbackImage(thumb); thumb.src = imgPath('products', color.images[0].replace('.webp', '-480.webp'));
      const meta = document.createElement('div'); meta.className = 'look-viewer__meta'; const kicker = document.createElement('p'); kicker.className = 'look-viewer__kicker'; kicker.textContent = `${product.category} · ${color.name}`; const title = document.createElement('h3'); title.textContent = product.name; const price = document.createElement('p'); price.textContent = formatPrice(product.price); const view = document.createElement('a'); view.href = routes.product(product.id, color.slug); view.className = 'button button--text'; view.textContent = 'View piece'; meta.append(kicker, title, price, view);
      const label = document.createElement('label'); label.textContent = 'Size (to be confirmed)'; const select = document.createElement('select'); select.setAttribute('aria-label', `Size for ${product.name}`); select.add(new Option('Confirm on WhatsApp', '')); product.sizes.forEach(size => select.add(new Option(size, size))); select.value = sizes.get(product.id) ?? ''; select.addEventListener('change', () => sizes.set(product.id, select.value || null)); label.append(select);
      const add = document.createElement('button'); add.className = 'button'; add.textContent = 'Add to bag'; add.addEventListener('click', () => emit('wk:cart:add', { id: product.id, color: color.slug, size: sizes.get(product.id) ?? null, qty: 1, source: 'shop-the-look' }));
      const head = document.createElement('div'); head.className = 'look-viewer__panel-head'; head.append(thumb, meta); target.append(head, label, add);
    }
    function connect(pinButton) {
      const grid = q('look-grid'); const a = pinButton.getBoundingClientRect(); const b = tag.getBoundingClientRect(); const g = grid.getBoundingClientRect();
      line.parentElement.setAttribute('viewBox', `0 0 ${g.width} ${g.height}`); line.setAttribute('d', `M ${a.x + a.width / 2 - g.x} ${a.y + a.height / 2 - g.y} C ${b.x - g.x - 80} ${a.y - g.y}, ${b.x - g.x - 60} ${b.y - g.y + 35}, ${b.x - g.x} ${b.y - g.y + 35}`);
      if (window.gsap && !prefersReducedMotion()) { const length = line.getTotalLength(); window.gsap.fromTo(line, { strokeDasharray: length, strokeDashoffset: length }, { strokeDashoffset: 0, duration: .35 }); }
    }
    function showPin(pin, pinButton, { open = true, delay = 0 } = {}) {
      activePin = pin; figures[index].buttons.forEach(b => b.setAttribute('aria-pressed', String(b === pinButton)));
      list.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.product === pin.productId)));
      const product = getById(pin.productId); const color = findVariant(product, pin.colorSlug); const desktop = isDesktop();
      buildPanel(desktop ? tag : sheetBody, product, color);
      if (desktop) { closeDialog(sheet); tag.classList.add('is-active'); if (delay) { setTimeout(() => { if (activePin === pin) connect(pinButton); }, delay); } else connect(pinButton); } else { tag.classList.remove('is-active'); if (open) openDialog(sheet, pinButton); }
    }
    /* ---- outfit-level rendering ---- */
    function setLook(i, { initial = false } = {}) {
      index = (i + n) % n; const look = looks[index]; closeDialog(sheet); tag.classList.remove('is-active'); line.setAttribute('d', ''); activePin = null; place();
      q('look-title').textContent = look.title; q('look-numeral').textContent = String(index + 1).padStart(2, '0'); list.replaceChildren();
      look.pins.forEach((pin, k) => {
        const product = getById(pin.productId); const color = findVariant(product, pin.colorSlug); const li = document.createElement('li'); const row = document.createElement('button'); row.type = 'button'; row.className = 'look-viewer__row'; row.dataset.product = pin.productId; row.setAttribute('aria-pressed', 'false');
        const image = document.createElement('img'); image.width = 52; image.height = 65; image.loading = 'lazy'; image.alt = ''; fallbackImage(image); image.src = imgPath('products', color.images[0].replace('.webp', '-480.webp'));
        const text = document.createElement('span'); const name = document.createElement('span'); name.className = 'look-viewer__row-name'; name.textContent = product.name; const small = document.createElement('small'); small.textContent = `${color.name} · ${formatPrice(product.price)}`; text.append(name, small);
        const num = document.createElement('i'); num.textContent = k + 1; num.setAttribute('aria-hidden', 'true'); row.append(num, image, text); row.addEventListener('click', () => showPin(pin, figures[index].buttons[k], { open: true })); li.append(row); list.append(li);
      });
      const prices = look.pins.map(p => getById(p.productId).price); q('look-total').textContent = formatPrice(prices.some(p => p == null) ? null : prices.reduce((a, b) => a + b, 0));
      selector.querySelectorAll('[data-look]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.look === look.id)));
      if (isDesktop()) showPin(look.pins[0], figures[index].buttons[0], { open: false, delay: initial ? 0 : 900 });
      if (!initial && window.gsap && !prefersReducedMotion()) window.gsap.fromTo(figures[index].el.querySelector('img'), { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: .7, ease: 'power3.inOut' });
    }
    looks.forEach((item, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'look-viewer__selector-item'; b.style.backgroundImage = `url(${imgPath('looks', item.image)})`; const badge = document.createElement('span'); badge.textContent = String(i + 1).padStart(2, '0'); badge.setAttribute('aria-hidden', 'true'); b.append(badge);
      b.dataset.look = item.id; b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', `Outfit ${i + 1}: ${item.title}`); b.addEventListener('click', () => setLook(i)); selector.append(b);
    });
    selector.addEventListener('keydown', e => { if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return; e.preventDefault(); setLook(index + (e.key === 'ArrowRight' ? 1 : -1)); selector.querySelector('[aria-pressed="true"]')?.focus(); });
    q('add-look').addEventListener('click', () => emit('wk:cart:add-many', { items: looks[index].pins.map(pin => ({ id: pin.productId, color: pin.colorSlug, size: sizes.get(pin.productId) ?? null, qty: 1 })), source: 'shop-the-look' }));
    addEventListener('resize', () => { if (activePin) { tag.classList.remove('is-active'); line.setAttribute('d', ''); closeDialog(sheet); activePin = null; figures[index].buttons.forEach(b => b.setAttribute('aria-pressed', 'false')); } });
    setLook(0, { initial: true });
  });
}
