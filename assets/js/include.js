/* assets/js/include.js — Élan pour tous */
(function () {
  if (window.__EPT_INIT__) return; window.__EPT_INIT__ = true;
  const root=document.documentElement, body=document.body;
  const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>Array.from(c.querySelectorAll(s));

  (function(){
    const menuBtn=$('#menu-toggle'), nav=$('#primary-nav');
    if(!menuBtn||!nav) return;
    menuBtn.setAttribute('aria-expanded','false'); menuBtn.setAttribute('aria-controls','primary-nav');
    if(!nav.hasAttribute('hidden')) nav.setAttribute('hidden','');
    menuBtn.addEventListener('click',()=>{
      const expanded=menuBtn.getAttribute('aria-expanded')==='true';
      menuBtn.setAttribute('aria-expanded',String(!expanded));
      menuBtn.setAttribute('aria-label',expanded?'Ouvrir le menu':'Fermer le menu');
      nav.toggleAttribute('hidden'); if(!expanded) nav.querySelector('a')?.focus();
    });
    document.addEventListener('keydown',(e)=>{
      if(e.key==='Escape' && menuBtn.getAttribute('aria-expanded')==='true'){ menuBtn.click(); menuBtn.focus(); }
    });
  })();

  (function(){
    try{ const path=location.pathname.split('/').pop()||'index.html';
      $$('#primary-nav a').forEach(a=>{ const href=a.getAttribute('href')||''; href.endsWith(path)?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current'); });
    }catch(_){}
  })();

  (function(){
    if(!getComputedStyle(root).getPropertyValue('--font-scale')) root.style.setProperty('--font-scale','1');
    const saved=JSON.parse(localStorage.getItem('accessPrefs')||'{}');
    if(saved.fontScale) root.style.setProperty('--font-scale',saved.fontScale);
    if(saved.contrast) body.classList.add('high-contrast');
    if(saved.spacing)  body.classList.add('wide-spacing');
    function save(){ localStorage.setItem('accessPrefs', JSON.stringify({
      fontScale: root.style.getPropertyValue('--font-scale'),
      contrast: body.classList.contains('high-contrast'),
      spacing:  body.classList.contains('wide-spacing')
    })); }
    const actions={
      'font+':()=>{ let v=parseFloat(getComputedStyle(root).getPropertyValue('--font-scale'))||1; if(v<1.6){ v=+(v+0.1).toFixed(2); root.style.setProperty('--font-scale',String(v)); save(); } },
      'font-':()=>{ let v=parseFloat(getComputedStyle(root).getPropertyValue('--font-scale'))||1; if(v>0.8){ v=+(v-0.1).toFixed(2); root.style.setProperty('--font-scale',String(v)); save(); } },
      'contrast':()=>{ body.classList.toggle('high-contrast'); save(); },
      'spacing': ()=>{ body.classList.toggle('wide-spacing'); save(); },
      'reset':   ()=>{ root.style.setProperty('--font-scale','1'); body.classList.remove('high-contrast','wide-spacing'); localStorage.removeItem('accessPrefs'); }
    };
    $$('.access-btn[data-action]').forEach(btn=>{
      const a=btn.getAttribute('data-action'); btn.addEventListener('click',(e)=>{ e.preventDefault(); actions[a]?.(); });
    });
    document.addEventListener('keydown',(e)=>{
      if(!e.altKey) return; const k=e.key.toLowerCase();
      if(k==='-'){ e.preventDefault(); actions['font-'](); }
      if(k==='='){ e.preventDefault(); actions['font+'](); }
      if(k==='c'){ e.preventDefault(); actions['contrast'](); }
      if(k==='s'){ e.preventDefault(); actions['spacing'](); }
      if(k==='0'){ e.preventDefault(); actions['reset'](); }
    });
  })();

  (function(){
    const themeBtn=$('#theme-toggle'), metaTheme=$('meta[name="theme-color"]');
    const prefersDark=window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const saved=localStorage.getItem('theme'); const initial=saved||(prefersDark?'dark':'light');
    apply(initial,false);
    themeBtn?.addEventListener('click',()=>{
      const next=root.getAttribute('data-theme')==='dark'?'light':'dark'; apply(next,true);
    });
    if(!saved && window.matchMedia){
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',(e)=>apply(e.matches?'dark':'light',false));
    }
    function apply(mode,persist){
      root.setAttribute('data-theme',mode); const dark=mode==='dark';
      if(themeBtn){ themeBtn.setAttribute('aria-pressed',String(dark)); themeBtn.setAttribute('aria-label',dark?'Désactiver le mode sombre':'Activer le mode sombre'); themeBtn.setAttribute('title',dark?'Désactiver le mode sombre':'Activer le mode sombre'); }
      if(metaTheme) metaTheme.setAttribute('content', dark ? '#0a6a47' : '#0b8457');
      if(persist) localStorage.setItem('theme',mode);
    }
  })();

  (function(){
    const toggle=document.getElementById('tts-toggle'), bar=document.querySelector('.tts-bar');
    if(!toggle||!bar) return;
    bar.removeAttribute('hidden');
    const saved=localStorage.getItem('ttsVisible'); const show=saved ? (saved==='shown') : true;
    if(show){ bar.classList.add('is-visible'); bar.removeAttribute('aria-hidden'); toggle.setAttribute('aria-pressed','true'); }
    else   { bar.classList.remove('is-visible'); bar.setAttribute('aria-hidden','true'); toggle.setAttribute('aria-pressed','false'); }
    function on(){ bar.classList.add('is-visible'); bar.removeAttribute('aria-hidden'); toggle.setAttribute('aria-pressed','true'); localStorage.setItem('ttsVisible','shown'); }
    function off(){ bar.classList.remove('is-visible'); bar.setAttribute('aria-hidden','true'); toggle.setAttribute('aria-pressed','false'); localStorage.setItem('ttsVisible','hidden'); }
    toggle.addEventListener('click',()=>{ bar.classList.contains('is-visible')?off():on(); });
  })();
})();
