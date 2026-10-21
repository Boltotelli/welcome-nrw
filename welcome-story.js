/* Native scrolling illuminates a shared banner. All information exists without JS. */
(()=>{'use strict';
const scene=document.getElementById('alliance-story');if(!scene)return;
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),lines=[...scene.querySelectorAll('.story-line')],trace=scene.querySelector('.standard-trace'),banner=scene.querySelector('.story-standard>img');
let frame=0,active=false,keyboard=false;const running=new Map(),seen=new WeakSet();
const clamp=n=>Math.max(0,Math.min(1,n));
function settleScene(){lines.forEach(el=>{el.style.opacity='';el.style.transform='';});trace.style.strokeDashoffset='0';banner.style.transform='';}
function paint(){frame=0;if(reduced.matches||keyboard||document.hidden){settleScene();return;}const rect=scene.getBoundingClientRect(),travel=Math.max(1,innerHeight*.7+rect.height*.55),progress=clamp((innerHeight*.85-rect.top)/travel);
 lines.forEach((el,i)=>{const t=clamp((progress-i*.16)/.35);el.style.opacity=String(.52+.48*t);el.style.transform=`translate3d(0,${(1-t)*12}px,0)`;});trace.style.strokeDashoffset=String(1-progress);banner.style.transform=`translate3d(0,${(1-progress)*16}px,0) rotate(${(1-progress)*-4}deg)`;
 scene.dataset.scrollProgress=progress.toFixed(3);
}
function schedule(){if(active&&!frame&&!document.hidden&&!reduced.matches&&!keyboard)frame=requestAnimationFrame(paint);}
const observer=new IntersectionObserver(entries=>{active=entries[0].isIntersecting;if(active)schedule();},{rootMargin:'0px 0px 100px 0px'});observer.observe(scene);
window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});
function finish(el){seen.add(el);running.get(el)?.finish();running.delete(el);}
function reveal(el){if(seen.has(el))return;seen.add(el);if(reduced.matches||keyboard)return;const a=el.animate([{clipPath:'inset(0 0 100% 0)',transform:'translate3d(0,12px,0)'},{clipPath:'inset(0)',transform:'none'}],{duration:600,easing:'cubic-bezier(.23,1,.32,1)'});running.set(el,a);a.finished.catch(()=>{}).finally(()=>running.delete(el));}
const arrivals=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){reveal(e.target);arrivals.unobserve(e.target);}},{rootMargin:'0px 0px -8% 0px',threshold:.15});
document.querySelectorAll('.story-section h2,.story-section .section-head>h2').forEach(el=>{el.classList.add('scroll-arrival');arrivals.observe(el);});
function settleAll(){if(frame)cancelAnimationFrame(frame);frame=0;settleScene();running.forEach((a,el)=>finish(el));}
document.addEventListener('keydown',e=>{if(['Tab','Enter',' ','ArrowDown','ArrowUp','PageDown','PageUp','Home','End'].includes(e.key)){keyboard=true;settleAll();}},{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden)settleAll();else schedule();});
reduced.addEventListener('change',()=>{if(reduced.matches)settleAll();else schedule();});
window.addEventListener('nrw-lang-change',()=>{document.querySelectorAll('.scroll-arrival').forEach(el=>{if(el.getBoundingClientRect().top<innerHeight)finish(el);});schedule();});
window.NRW_SCROLL={revealTarget(target){target.querySelectorAll('.scroll-arrival').forEach(finish);target.closest('.scroll-arrival')&&finish(target.closest('.scroll-arrival'));if(target===scene)settleScene();},settle: settleAll};
if(reduced.matches)settleAll();
})();
