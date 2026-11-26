import { WK } from '../core/wk.js';
export function init() {
  if (WK.motion) return WK.motion;
  const gsap = window.gsap; const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return null;
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia(); WK.motion = { gsap, ScrollTrigger, media };
  addEventListener('pagehide', () => { media.revert(); ScrollTrigger.getAll().forEach(trigger => trigger.kill()); });
  // Recreate the page after bfcache restoration so observers/triggers are not stale.
  addEventListener('pageshow', event => { if (event.persisted) location.reload(); });
  return WK.motion;
}
