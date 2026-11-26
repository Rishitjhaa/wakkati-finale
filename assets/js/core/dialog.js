const OPEN = new Map();
let previousOverflow = '';
export function openDialog(dialog, trigger = document.activeElement) {
  if (dialog.open) return;
  if (!OPEN.size) { previousOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; }
  OPEN.set(dialog, trigger); dialog.showModal();
  dialog.querySelector('button, a, input, select, [tabindex="0"]')?.focus();
}
export function closeDialog(dialog) { if (dialog.open) dialog.close(); }
export function init(root = document) {
  root.querySelectorAll('dialog[data-component="dialog"]').forEach(dialog => {
    if (dialog.dataset.wkInit) return; dialog.dataset.wkInit = 'true';
    dialog.addEventListener('click', event => { if (event.target.closest('[data-js="dialog-close"]')) closeDialog(dialog); if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closeDialog(dialog); } });
    dialog.addEventListener('close', () => { const trigger = OPEN.get(dialog); OPEN.delete(dialog); if (!OPEN.size) document.body.style.overflow = previousOverflow; if (trigger?.isConnected) trigger.focus(); });
    // Native modal dialog supplies focus containment, background inertness and Escape.
  });
}
