import { WK, emit, on } from '../core/wk.js';
import { init as initDialog, openDialog, closeDialog } from '../core/dialog.js';
export function init(root = document) {
  const header = root.querySelector('[data-component="site-header"]'); if (!header || header.dataset.wkInit) return; header.dataset.wkInit = 'true';
  const menu = root.querySelector('[data-js="mobile-menu"]'); const toggle = header.querySelector('[data-js="menu"]');
  initDialog(root);
  toggle.addEventListener('click', () => emit('wk:menu:toggle', { open: !menu.open }));
  on('wk:menu:toggle', ({ detail }) => { if (detail.open) openDialog(menu, toggle); else closeDialog(menu); toggle.setAttribute('aria-expanded', String(detail.open)); });
  menu.addEventListener('close', () => { toggle.setAttribute('aria-expanded', 'false'); });
  menu.querySelector('[data-js="menu-close"]').addEventListener('click', () => emit('wk:menu:toggle', { open: false }));
  menu.addEventListener('click', event => { if (event.target.closest('a')) emit('wk:menu:toggle', { open: false }); });
  header.querySelectorAll('[data-tab]').forEach(button => button.addEventListener('click', () => emit('wk:cart:open', { tab: button.dataset.tab })));
  const count = header.querySelector('[data-js="bag-count"]'); count.textContent = WK.cart?.count?.() ?? 0;
  on('wk:cart:changed', ({ detail }) => { count.textContent = detail.count; });
  on('wk:wishlist:changed', ({ detail }) => { header.querySelector('[data-tab="saved"]').setAttribute('aria-label', `Saved, ${detail.ids.length} items`); });
  const update = () => header.classList.toggle('is-scrolled', scrollY > 80); update(); addEventListener('scroll', update, { passive: true });
}
