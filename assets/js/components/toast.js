import { on } from '../core/wk.js';
export function init(root = document) {
  const mount = root.querySelector('#wk-toast-root'); if (!mount || mount.dataset.wkInit) return; mount.dataset.wkInit = 'true';
  mount.setAttribute('aria-live', 'polite'); mount.setAttribute('aria-atomic', 'true');
  let timer;
  on('wk:toast', ({ detail }) => { clearTimeout(timer); const item = document.createElement('p'); item.className = 'toast'; item.dataset.type = detail.type; item.textContent = detail.message; mount.replaceChildren(item); timer = setTimeout(() => mount.replaceChildren(), 6000); });
}
