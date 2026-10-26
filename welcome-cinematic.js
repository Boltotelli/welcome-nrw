/* One authored scene, bounded pointer depth, and interruptible view changes. */
(()=>{'use strict';
const hero=document.getElementById('welcome-home'),back=hero?.querySelector('.scene-backdrop'),figure=hero?.querySelector('.figure-depth'),ambience=document.querySelector('.path-ambience');if(!hero)return;
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover: hover) and (pointer: fine)');
let introPlayed=false,frame=0,last=0,x=0,y=0,vx=0,vy=0,tx=0,ty=0,inside=true,transition=null;
function reset(){if(frame)cancelAnimationFrame(frame);frame=0;last=0;x=y=vx=vy=tx=ty=0;back.style.transform='';figure.style.transform='';}
function allowed(){return !reduced.matches&&fine.matches&&!hero.hidden&&inside&&!document.hidden&&document.hasFocus();}
function step(now){if(!allowed()){reset();return;}const dt=Math.min((now-last)/1000||.016,.032);last=now;vx+=(-100*(x-tx)-10*vx)*dt;vy+=(-100*(y-ty)-10*vy)*dt;x+=vx*dt;y+=vy*dt;
 back.style.transform=`translate3d(${-x*6}px,${-y*4}px,0) scale(1.04)`;figure.style.transform=`translate3d(${x*12}px,${y*8}px,0) rotateY(${x*1.5}deg)`;
 if(Math.abs(x-tx)+Math.abs(y-ty)+Math.abs(vx)+Math.abs(vy)>.004){frame=requestAnimationFrame(step);}else{frame=0;last=0;}}
function tick(){if(!frame&&allowed())frame=requestAnimationFrame(step);}
hero.addEventListener('pointermove',e=>{if(!allowed()||e.pointerType==='touch')return;const box=hero.getBoundingClientRect();tx=Math.max(-1,Math.min(1,(e.clientX-box.left)/box.width*2-1));ty=Math.max(-1,Math.min(1,(e.clientY-box.top)/box.height*2-1));tick();},{passive:true});
hero.addEventListener('pointerleave',()=>{tx=ty=0;tick();});
new IntersectionObserver(entries=>{inside=entries[0].isIntersecting;if(!inside)reset();},{threshold:.05}).observe(hero);
document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();});window.addEventListener('blur',reset);document.addEventListener('keydown',reset,{passive:true});
reduced.addEventListener('change',()=>{reset();if(reduced.matches){hero.classList.remove('scene-intro');transition?.skipTransition();}});fine.addEventListener('change',reset);
function setView(view){ambience.hidden=view==='landing';if(view!=='landing'){reset();hero.classList.remove('scene-intro');}else if(!introPlayed&&!reduced.matches){introPlayed=true;requestAnimationFrame(()=>{if(!hero.hidden)hero.classList.add('scene-intro');});}}
function navigate(update,keyboard=false){reset();transition?.skipTransition();if(keyboard||reduced.matches){update();return;}
 if(document.startViewTransition){transition=document.startViewTransition(update);const current=transition;current.finished.catch(()=>{}).finally(()=>{if(transition===current)transition=null;});return;}
 update();document.querySelector('main').animate([{opacity:.5,transform:'translate3d(0,12px,0)'},{opacity:1,transform:'none'}],{duration:220,easing:'cubic-bezier(.23,1,.32,1)'});
}
window.NRW_MOTION={setView,navigate};
})();
