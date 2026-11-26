import { prefersReducedMotion } from '../core/wk.js';
import { init as motion } from './gsap-init.js';
export function init(root = document) {
  const curtain=root.querySelector('[data-js="curtain"]'); if(!curtain||curtain.dataset.wkInit)return; curtain.dataset.wkInit='true';
  let seen=false;try{seen=sessionStorage.getItem('wakkati.curtain.v1')==='seen';sessionStorage.setItem('wakkati.curtain.v1','seen');}catch{/* still usable with storage blocked */}
  const animation=motion();if(seen||prefersReducedMotion()||!animation){curtain.hidden=true;return;}
  curtain.hidden=false;
  const dismiss=()=>{curtain.hidden=true;}; const safety=setTimeout(dismiss,2400);
  document.addEventListener('keydown',dismiss,{once:true});
  animation.gsap.timeline({onComplete:()=>{clearTimeout(safety);dismiss();}}).to(curtain.querySelector('[data-js="curtain-logo"]'),{opacity:0,duration:.3}).to(curtain.querySelector('[data-js="curtain-left"]'),{xPercent:-100,duration:innerWidth<768?.9:1.4,ease:'power3.inOut'},.15).to(curtain.querySelector('[data-js="curtain-right"]'),{xPercent:100,duration:innerWidth<768?.9:1.4,ease:'power3.inOut'},.15);
}
