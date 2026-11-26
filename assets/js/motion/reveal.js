import { init as motion } from './gsap-init.js';
export function init(root = document) {
  const animation=motion(); if(!animation)return; const {gsap,ScrollTrigger,media}=animation;
  root.querySelectorAll('[data-reveal="lines"]').forEach(el=>{if(el.dataset.wkLines||el.textContent.trim().split(/\s+/).length>8)return;el.dataset.wkLines='true';const lines=el.innerHTML.split(/<br\s*\/?\s*>/i);el.replaceChildren();lines.forEach(html=>{const mask=document.createElement('span');mask.className='reveal__line';const inner=document.createElement('span');inner.dataset.js='reveal-line';inner.innerHTML=html;mask.append(inner);el.append(mask);});});
  media.add({all:'all',desktop:'(min-width:1024px)',reduce:'(prefers-reduced-motion:reduce)'},context=>{
    const {desktop,reduce}=context.conditions;
    const revealElement=el=>{
      const image=el.dataset.reveal==='image';
      const delay=el.id==='hero-title'&&!root.querySelector('[data-js="curtain"]').hidden?(innerWidth<768?1.05:1.55):0;
      const lines=el.querySelectorAll('[data-js="reveal-line"]');if(lines.length){gsap.fromTo(lines,{yPercent:110},{yPercent:0,delay,duration:.9,stagger:.08,ease:'expo.out',scrollTrigger:{trigger:el,start:'top 92%',once:true}});return;}
      gsap.fromTo(el,image&&desktop?{clipPath:'inset(0 0 100% 0)',opacity:1}:{y:24,opacity:0}, {...(image&&desktop?{clipPath:'inset(0 0 0% 0)'}:{}),y:0,opacity:1,duration:image&&desktop?1:.8,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 92%',once:true}});
    };
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){observer.unobserve(entry.target);context.add(()=>revealElement(entry.target));}}),{rootMargin:'100% 0px'});
    if(!reduce)root.querySelectorAll('[data-reveal]').forEach(el=>observer.observe(el));
    const hero=root.querySelector('[data-js="hero-image"]');if(hero&&desktop&&!reduce)gsap.fromTo(hero,{scale:1},{scale:1.05,duration:20,ease:'none'});
    const story=root.querySelector('[data-js="story"]');
    if(story&&desktop&&!reduce){story.classList.add('is-pinned');const chapters=[...story.querySelectorAll('[data-js="chapter"]')];chapters.forEach((chapter,i)=>{chapter.inert=i!==0;});const timeline=gsap.timeline({scrollTrigger:{trigger:story,start:'top top',end:'+=180%',pin:true,scrub:.6,invalidateOnRefresh:true},onUpdate:()=>{const active=timeline.time()<1.3?0:timeline.time()<2.3?1:2;chapters.forEach((chapter,i)=>{chapter.inert=i!==active;});}});chapters.slice(1).forEach((chapter,i)=>{timeline.to(chapters[i],{opacity:0,duration:.4},i+1).fromTo(chapter,{opacity:0},{opacity:1,duration:.6,onStart:()=>{chapter.style.visibility='visible';}},i+1);});}
    const fill=root.querySelector('[data-js="wordmark-fill"]');if(fill&&!reduce)gsap.to(fill,{opacity:.6,duration:1.6,scrollTrigger:{trigger:fill,start:'top 95%',once:true}});const wordmark=root.querySelector('[data-js="footer-wordmark"]');if(wordmark&&!reduce)gsap.fromTo(wordmark,{opacity:.25},{opacity:1,duration:1.6,scrollTrigger:{trigger:wordmark,start:'top 95%',once:true}});
    return ()=>{observer.disconnect();story?.classList.remove('is-pinned');story?.querySelectorAll('[data-js="chapter"]').forEach(chapter=>{chapter.style.removeProperty('visibility');chapter.inert=false;});};
  });
  const marquee=root.querySelector('[data-component="marquee"]');if(marquee){const observer=new IntersectionObserver(([entry])=>marquee.classList.toggle('is-active',entry.isIntersecting));observer.observe(marquee);addEventListener('pagehide',()=>observer.disconnect(),{once:true});}
  document.fonts.ready.then(()=>ScrollTrigger.refresh());
}
