import { prefersReducedMotion } from '../core/wk.js';
import { init as motion } from './gsap-init.js';
export function init(root = document) {
  const svg=root.querySelector('[data-js="thread"]');if(!svg||svg.dataset.wkInit)return;svg.dataset.wkInit='true';
  const path=svg.querySelector('path');const dot=svg.querySelector('circle');const animation=motion();let trigger;let raf;
  function draw(){
    trigger?.kill();const height=Math.ceil(document.querySelector('#wk-footer').getBoundingClientRect().bottom+scrollY);const width=document.documentElement.clientWidth;svg.setAttribute('viewBox',`0 ${scrollY} ${width} ${innerHeight}`);svg.style.height='100vh';
    const anchors=[...root.querySelectorAll('[data-thread-anchor]')]; const points=anchors.map(anchor=>{const rect=anchor.getBoundingClientRect();return {x:width<768?12:Math.max(20,rect.left-24),y:rect.top+scrollY};});
    if(!points.length)return;let d=`M ${points[0].x} ${points[0].y}`;points.slice(1).forEach((point,i)=>{const previous=points[i];const mid=(point.y+previous.y)/2;d+=` C ${previous.x} ${mid}, ${point.x} ${mid}, ${point.x} ${point.y}`;});if(width>=768)d+=` H ${width-points.at(-1).x}`;path.setAttribute('d',d);const length=path.getTotalLength();path.style.strokeDasharray=length;
    const update=progress=>{path.style.strokeDashoffset=length*(1-progress);const p=path.getPointAtLength(length*progress);dot.setAttribute('cx',p.x);dot.setAttribute('cy',p.y);};
    if(prefersReducedMotion()||!animation){update(1);return;}
    update(0);const tween=animation.gsap.to(path,{strokeDashoffset:0,ease:'none',scrollTrigger:{start:0,end:()=>height-innerHeight,scrub:.6},onUpdate:()=>{const progress=1-parseFloat(path.style.strokeDashoffset)/length;const p=path.getPointAtLength(length*progress);dot.setAttribute('cx',p.x);dot.setAttribute('cy',p.y);}});trigger=tween.scrollTrigger;
  }
  const schedule=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(draw);};
  addEventListener('scroll',()=>svg.setAttribute('viewBox',`0 ${scrollY} ${document.documentElement.clientWidth} ${innerHeight}`),{passive:true});document.fonts.ready.then(schedule);addEventListener('resize',schedule);addEventListener('load',schedule,{once:true});
  const observer=new ResizeObserver(schedule);observer.observe(document.querySelector('#main'));observer.observe(document.querySelector('#wk-footer'));
  addEventListener('pagehide',()=>observer.disconnect(),{once:true});animation?.ScrollTrigger.addEventListener('refresh',schedule);matchMedia('(prefers-reduced-motion:reduce)').addEventListener('change',schedule);draw();
}
