export function initSwatches(root, { onChange } = {}) {
  if (root.dataset.wkInit) return; root.dataset.wkInit = 'true';
  root.addEventListener('click', event => { const button = event.target.closest('[data-color]'); if (!button || !root.contains(button)) return; root.querySelectorAll('[data-color]').forEach(b => b.setAttribute('aria-pressed', String(b === button))); onChange?.(button.dataset.color, button); });
}
export function init(root = document) { root.querySelectorAll('[data-component="swatches"]').forEach(el => initSwatches(el)); }
