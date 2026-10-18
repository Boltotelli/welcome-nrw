
(function(){
 const root=document.documentElement, body=document.body;
 const savedTheme=localStorage.getItem('nrw_theme') || (matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
 root.dataset.theme=savedTheme;
 const themeBtn=document.getElementById('themeBtn');
 function themeIcon(){ if(themeBtn) themeBtn.textContent=root.dataset.theme==='dark'?'☀':'☾'; }
 themeIcon();
 themeBtn?.addEventListener('click',()=>{root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';localStorage.setItem('nrw_theme',root.dataset.theme);themeIcon();});
 const savedLang=localStorage.getItem('nrw_page_lang')||'en';
 body.dataset.lang=savedLang;document.documentElement.lang=savedLang;
 document.querySelectorAll('[data-lang-btn]').forEach(b=>{
   b.classList.toggle('active',b.dataset.langBtn===savedLang);
   b.addEventListener('click',()=>{
     body.dataset.lang=b.dataset.langBtn;document.documentElement.lang=b.dataset.langBtn;localStorage.setItem('nrw_page_lang',b.dataset.langBtn);
     document.querySelectorAll('[data-lang-btn]').forEach(x=>x.classList.toggle('active',x===b));
     window.dispatchEvent(new CustomEvent('nrw-lang-change',{detail:b.dataset.langBtn}));
   });
 });
})();

// All law content is retrieved from the published AllianceOS server-law endpoint.
