(function(){
  const STORAGE_KEY='nrw_redeemed_gift_codes_v1';
  const API_URL='/api/kingshot-codes';
  const REDEEM_URL='https://ks-giftcode.centurygame.com/';

  const copy={
    de:{eyebrow:'KOSTENLOSE BELOHNUNGEN',title:'Aktuelle Kingshot Codes',loading:'Codes werden aktualisiert …',auto:'Automatisch aus aktuellen Online-Quellen',available:n=>`${n} ${n===1?'Code':'Codes'} verfügbar`,none:'Aktuell wurden keine aktiven Codes gefunden.',unavailable:'Codes konnten gerade nicht aktualisiert werden. Bitte später erneut versuchen.',copy:'Kopieren',copied:'Kopiert!',redeemed:'Eingelöst',mark:'Als eingelöst markieren',open:'Einlösen ↗',updated:'Online geprüft'},
    en:{eyebrow:'FREE REWARDS',title:'Current Kingshot Codes',loading:'Updating codes …',auto:'Automatically fetched from current online sources',available:n=>`${n} ${n===1?'code':'codes'} available`,none:'No active codes were found right now.',unavailable:'Codes could not be updated right now. Please try again later.',copy:'Copy',copied:'Copied!',redeemed:'Redeemed',mark:'Mark as redeemed',open:'Redeem ↗',updated:'Checked online'},
    fr:{eyebrow:'RÉCOMPENSES GRATUITES',title:'Codes Kingshot actuels',loading:'Mise à jour des codes …',auto:'Récupérés automatiquement depuis des sources en ligne actuelles',available:n=>`${n} ${n===1?'code disponible':'codes disponibles'}`,none:'Aucun code actif n’a été trouvé pour le moment.',unavailable:'Impossible de mettre les codes à jour pour le moment. Réessaie plus tard.',copy:'Copier',copied:'Copié !',redeemed:'Utilisé',mark:'Marquer comme utilisé',open:'Utiliser ↗',updated:'Vérifié en ligne'}
  };

  let payload=null;
  let loading=true;
  let loadError=false;

  function lang(){
    const value=document.body?.dataset?.lang||document.documentElement.lang||'en';
    return copy[value]?value:'en';
  }

  function text(){return copy[lang()]}

  function readRedeemed(){
    try{
      const value=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');
      return value&&typeof value==='object'&&!Array.isArray(value)?value:{};
    }catch(_){return{}}
  }

  function writeRedeemed(value){
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(value))}catch(_){}
  }

  function isRedeemed(code){return Boolean(readRedeemed()[String(code).toUpperCase()])}

  function setRedeemed(code,state){
    const all=readRedeemed();
    const key=String(code).toUpperCase();
    if(state)all[key]=new Date().toISOString();else delete all[key];
    writeRedeemed(all);
  }

  function escapeHtml(value){
    return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }

  function injectStyles(){
    if(document.getElementById('giftCodeStyles'))return;
    const style=document.createElement('style');
    style.id='giftCodeStyles';
    style.textContent=`
      .gift-code-card{margin:0 0 18px;border:1px solid color-mix(in srgb,var(--gold) 32%,var(--line));border-radius:24px;background:linear-gradient(125deg,color-mix(in srgb,var(--surface) 93%,var(--gold) 7%),var(--surface));box-shadow:0 14px 42px rgba(0,0,0,.10);overflow:hidden;position:relative}
      .gift-code-card:before{content:"";position:absolute;width:210px;height:210px;border-radius:50%;right:-90px;top:-120px;background:radial-gradient(circle,color-mix(in srgb,var(--gold) 22%,transparent),transparent 68%);pointer-events:none}
      .gift-code-head{display:flex;align-items:center;gap:13px;padding:18px 20px 13px;position:relative;z-index:1}
      .gift-code-icon{width:43px;height:43px;border-radius:14px;display:grid;place-items:center;background:color-mix(in srgb,var(--gold) 15%,var(--surface2));font-size:22px;flex:0 0 auto}
      .gift-code-title{min-width:0;flex:1}.gift-code-title .eyebrow{color:var(--gold)}.gift-code-title h2{font-size:22px;letter-spacing:-.035em;margin:3px 0 0}
      .gift-code-meta{margin-left:auto;text-align:right;min-width:0}.gift-code-count{display:inline-flex;align-items:center;padding:6px 9px;border-radius:999px;background:color-mix(in srgb,var(--green) 12%,var(--surface2));color:var(--green);font-size:9px;font-weight:950;white-space:nowrap}.gift-code-meta small{display:block;margin-top:5px;color:var(--muted);font-size:8px;font-weight:800}
      .gift-code-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:9px;padding:0 20px 16px;position:relative;z-index:1}
      .gift-code-item{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;padding:12px 12px 11px;border:1px solid var(--line);border-radius:15px;background:color-mix(in srgb,var(--surface2) 72%,var(--surface));transition:opacity .18s,border-color .18s,transform .18s}
      .gift-code-item:hover{border-color:color-mix(in srgb,var(--brand) 45%,var(--line));transform:translateY(-1px)}.gift-code-item.is-redeemed{opacity:.58}.gift-code-item.is-redeemed .gift-code-value{text-decoration:line-through;text-decoration-thickness:1px}
      .gift-code-main{min-width:0}.gift-code-value{display:block;font-size:16px;font-weight:950;letter-spacing:.025em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.gift-code-confirm{display:block;margin-top:3px;color:var(--muted);font-size:8px;font-weight:800}
      .gift-code-actions{display:flex;align-items:center;gap:6px}.gift-copy{height:34px;border:1px solid var(--line);border-radius:10px;background:var(--surface);color:var(--ink);padding:0 9px;display:inline-flex;align-items:center;gap:6px;font-size:9px;font-weight:950;cursor:pointer;white-space:nowrap}.gift-copy:hover{border-color:var(--brand);color:var(--brand)}
      .gift-redeemed{width:34px;height:34px;border:1px solid var(--line);border-radius:10px;background:var(--surface);color:var(--muted);display:grid;place-items:center;cursor:pointer;transition:.15s;position:relative}.gift-redeemed input{position:absolute;opacity:0;pointer-events:none}.gift-redeemed span{width:17px;height:17px;border:2px solid currentColor;border-radius:50%;display:grid;place-items:center;font-size:11px;font-weight:950;line-height:1}.gift-redeemed input:checked+span{border-color:var(--green);background:var(--green);color:#07140e}.gift-redeemed input:checked+span:after{content:"✓"}.gift-redeemed:hover{color:var(--green);border-color:color-mix(in srgb,var(--green) 50%,var(--line))}
      .gift-code-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 20px;border-top:1px solid var(--line);background:color-mix(in srgb,var(--surface2) 34%,transparent);position:relative;z-index:1}.gift-code-footer p{margin:0;color:var(--muted);font-size:9px;line-height:1.4}.gift-code-redeem{font-size:9px;font-weight:950;color:var(--brand);white-space:nowrap}.gift-code-redeem:hover{text-decoration:underline}
      .gift-code-state{padding:2px 20px 17px;color:var(--muted);font-size:11px;font-weight:800;position:relative;z-index:1}.gift-code-state.error{color:var(--red)}
      @media(max-width:680px){.gift-code-card{margin-top:-10px;margin-bottom:14px;border-radius:18px}.gift-code-head{padding:13px 14px 10px;gap:10px}.gift-code-icon{width:36px;height:36px;border-radius:11px;font-size:19px}.gift-code-title h2{font-size:18px}.gift-code-title .eyebrow{font-size:8px}.gift-code-meta small{display:none}.gift-code-count{font-size:8px;padding:5px 7px}.gift-code-list{grid-template-columns:1fr;padding:0 14px 12px;gap:7px}.gift-code-item{padding:9px 9px 9px 11px;border-radius:13px}.gift-code-value{font-size:14px}.gift-code-confirm{display:none}.gift-copy{height:32px;padding:0 8px}.gift-redeemed{width:32px;height:32px}.gift-code-footer{padding:8px 14px}.gift-code-footer p{font-size:8px;max-width:72%}}
      @media(max-width:420px){.gift-code-meta{display:none}.gift-code-item{grid-template-columns:minmax(0,1fr) auto}.gift-copy .gift-copy-label{display:none}.gift-copy{width:32px;padding:0;justify-content:center}.gift-code-actions{gap:5px}}
    `;
    document.head.appendChild(style);
  }

  function ensureCard(){
    let card=document.getElementById('giftCodeCard');
    if(card)return card;
    const intro=document.querySelector('.intro');
    if(!intro)return null;
    card=document.createElement('section');
    card.className='gift-code-card';
    card.id='giftCodeCard';
    card.setAttribute('aria-live','polite');
    intro.insertAdjacentElement('afterend',card);
    return card;
  }

  function formatUpdated(value){
    if(!value)return'';
    const date=new Date(value);
    if(Number.isNaN(date.getTime()))return'';
    try{return new Intl.DateTimeFormat(copy[lang()]===copy.de?'de-DE':copy[lang()]===copy.fr?'fr-FR':'en-GB',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).format(date)}catch(_){return''}
  }

  function render(){
    injectStyles();
    const card=ensureCard();
    if(!card)return;
    const t=text();
    const codes=Array.isArray(payload?.codes)?payload.codes:[];
    const allRedeemed=!loading&&!loadError&&codes.length>0&&codes.every(item=>isRedeemed(typeof item==='string'?item:item.code));
    card.hidden=loading||allRedeemed;
    const sourceName=payload?.primarySource?.name||'';
    const updated=formatUpdated(payload?.updatedAt);

    const items=codes.map(item=>{
      const code=typeof item==='string'?item:item.code;
      const confirmations=typeof item==='object'&&item?Number(item.confirmations)||1:1;
      const redeemed=isRedeemed(code);
      const confirmText=confirmations>1
        ?(lang()==='de'?`${confirmations} Quellen bestätigen den Code`:lang()==='fr'?`${confirmations} sources confirment le code`:`Confirmed by ${confirmations} sources`)
        :(lang()==='de'?'Aktiver Online-Code':lang()==='fr'?'Code actif en ligne':'Active online code');
      return `<article class="gift-code-item${redeemed?' is-redeemed':''}" data-gift-code="${escapeHtml(code)}">
        <div class="gift-code-main"><code class="gift-code-value">${escapeHtml(code)}</code><small class="gift-code-confirm">${escapeHtml(confirmText)}</small></div>
        <div class="gift-code-actions">
          <button class="gift-copy" type="button" data-copy-code="${escapeHtml(code)}" aria-label="${escapeHtml(t.copy)} ${escapeHtml(code)}"><span aria-hidden="true">⧉</span><span class="gift-copy-label">${escapeHtml(t.copy)}</span></button>
          <label class="gift-redeemed" title="${escapeHtml(redeemed?t.redeemed:t.mark)}" aria-label="${escapeHtml(redeemed?t.redeemed:t.mark)}"><input type="checkbox" data-redeemed-code="${escapeHtml(code)}" ${redeemed?'checked':''}><span aria-hidden="true"></span></label>
        </div>
      </article>`;
    }).join('');

    let state='';
    if(loading)state=`<div class="gift-code-state">${escapeHtml(t.loading)}</div>`;
    else if(loadError)state=`<div class="gift-code-state error">${escapeHtml(t.unavailable)}</div>`;
    else if(!codes.length)state=`<div class="gift-code-state">${escapeHtml(t.none)}</div>`;

    card.innerHTML=`
      <div class="gift-code-head">
        <div class="gift-code-icon" aria-hidden="true">🎁</div>
        <div class="gift-code-title"><span class="eyebrow">${escapeHtml(t.eyebrow)}</span><h2>${escapeHtml(t.title)}</h2></div>
        ${!loading&&!loadError&&codes.length?`<div class="gift-code-meta"><span class="gift-code-count">${escapeHtml(t.available(codes.length))}</span>${updated?`<small>${escapeHtml(t.updated)} · ${escapeHtml(updated)}</small>`:''}</div>`:''}
      </div>
      ${items?`<div class="gift-code-list">${items}</div>`:''}
      ${state}
      <div class="gift-code-footer"><p>${escapeHtml(t.auto)}${sourceName?` · ${escapeHtml(sourceName)}`:''}</p><a class="gift-code-redeem" href="${REDEEM_URL}" target="_blank" rel="noopener">${escapeHtml(t.open)}</a></div>`;

    bindCard(card);
  }

  async function copyCode(code,button){
    let ok=false;
    try{await navigator.clipboard.writeText(code);ok=true}catch(_){
      try{
        const area=document.createElement('textarea');area.value=code;area.setAttribute('readonly','');area.style.position='fixed';area.style.opacity='0';document.body.appendChild(area);area.select();ok=document.execCommand('copy');area.remove();
      }catch(__){}
    }
    if(ok&&button){
      const label=button.querySelector('.gift-copy-label');
      const old=label?.textContent;
      if(label)label.textContent=text().copied;
      button.classList.add('copied');
      setTimeout(()=>{if(label)label.textContent=old||text().copy;button.classList.remove('copied')},1200);
    }
  }

  function bindCard(card){
    card.querySelectorAll('[data-copy-code]').forEach(button=>button.addEventListener('click',()=>copyCode(button.dataset.copyCode,button)));
    card.querySelectorAll('[data-redeemed-code]').forEach(input=>input.addEventListener('change',()=>{
      const code=input.dataset.redeemedCode;
      setRedeemed(code,input.checked);
      render();
    }));
  }

  async function load(){
    loading=true;loadError=false;render();
    try{
      const response=await fetch(API_URL,{headers:{'Accept':'application/json'},cache:'no-store'});
      if(!response.ok)throw new Error(`gift codes ${response.status}`);
      const data=await response.json();
      payload=data&&typeof data==='object'?data:{codes:[]};
      loadError=false;
    }catch(error){
      console.warn('Gift code feed unavailable',error);
      payload={codes:[]};loadError=true;
    }finally{loading=false;render()}
  }

  function init(){
    injectStyles();render();load();
    const observer=new MutationObserver(mutations=>{
      if(mutations.some(m=>m.type==='attributes'&&m.attributeName==='data-lang'))render();
    });
    observer.observe(document.body,{attributes:true,attributeFilter:['data-lang']});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
