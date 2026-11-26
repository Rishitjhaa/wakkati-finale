import { imgPath, fallbackImage, prefersReducedMotion } from '../core/wk.js';
export function init(root = document) {
  root.querySelectorAll('[data-component="tape-nav"]').forEach(nav => {
    if (nav.dataset.wkInit) return; nav.dataset.wkInit = 'true';
    const ticks = nav.querySelector('[data-js="ticks"]');
    for (let i = 0; i < 80; i++) ticks.append(document.createElement('i'));
    const preview = nav.querySelector('[data-js="preview"]'); fallbackImage(preview, '3x4'); preview.src=imgPath('categories','cat-kurtis.webp');
    nav.querySelectorAll('[data-category]').forEach(link => {
      link.addEventListener('pointerenter', event => { if (event.pointerType !== 'mouse' || innerWidth < 1024) return; preview.src = imgPath('categories', `cat-${link.dataset.category}.webp`); preview.classList.add('is-active'); });
      link.addEventListener('pointermove', event => { if (event.pointerType !== 'mouse' || innerWidth < 1024) return; const x = Math.min(event.clientX + 18, innerWidth - 170); const y = Math.min(event.clientY + 25, innerHeight - 220); if (window.gsap && !prefersReducedMotion()) window.gsap.to(preview, { x, y, duration: .3, overwrite: true }); else preview.style.transform = `translate(${x}px,${y}px)`; const bounds = ticks.getBoundingClientRect(); [...ticks.children].forEach((tick, i) => { tick.style.transform = `scaleY(${Math.abs(bounds.left + bounds.width * i / 80 - event.clientX) < 40 ? 1.7 : 1})`; }); });
      link.addEventListener('pointerleave', () => { preview.classList.remove('is-active'); [...ticks.children].forEach(t => t.style.transform = ''); });
    });
  });
}
