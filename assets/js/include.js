<script>
(function () {
  if (window.__EPT_HEADER_INIT__) return; // éviter double init si script chargé 2x
  window.__EPT_HEADER_INIT__ = true;

  const root = document.documentElement;
  const body = document.body;
  const $  = (sel, ctx=document) => ctx.querySelector(sel);
  const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
  const metaTheme = $('meta[name="theme-color"]');

  /* ========== MENU MOBILE ========== */
  const menuBtn = document.getElementById('menu-toggle');
  const nav = document.getElementById('primary-nav');
  if (menuBtn && nav) {
    // état initial
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-controls', 'primary-nav');
    if (!nav.hasAttribute('hidden')) nav.setAttribute('hidden', '');

    menuBtn.addEventListener('click', () => {
      const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', String(!expanded));
      menuBtn.setAttribute('aria-label', expanded ? 'Ouvrir le menu' : 'Fermer le menu');
      nav.toggleAttribute('hidden');
      if (!expanded) nav.querySelector('a')?.focus();
    });

    // Fermer avec Echap
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
        menuBtn.click();
        menuBtn.focus();
      }
    });
  }

  /* ========== LIEN ACTIF (aria-current) ========== */
  try {
    const path = location.pathname.split('/').pop() || 'index.html';
    $$('#primary-nav a').forEach(a => {
      const href = a.getAttribute('href') || '';
      if (href.endsWith(path)) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  } catch {}

  /* ========== THÈME CLAIR/SOMBRE (persistant) ========== */
  const themeBtn = document.getElementById('theme-toggle');

  function applyTheme(mode, persist) {
    root.setAttribute('data-theme', mode);
    const dark = mode === 'dark';
    if (themeBtn) {
      themeBtn.setAttribute('aria-pressed', String(dark));
      themeBtn.setAttribute('aria-label', dark ? 'Désactiver le mode sombre' : 'Activer le mode sombre');
      themeBtn.setAttribute('title',     dark ? 'Désactiver le mode sombre' : 'Activer le mode sombre');
    }
    if (metaTheme) metaTheme.setAttribute('content', dark ? '#0a6a47' : '#0b8457');
    if (persist) localStorage.setItem('theme', mode);
  }

  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme  = localStorage.getItem('theme');
  applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'), false);

  themeBtn?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next, true);
  });

  // Suivre le système si l’utilisateur n’a pas choisi
  if (!savedTheme && window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      applyTheme(e.matches ? 'dark' : 'light', false);
    });
  }

  /* ========== ACCESSIBILITÉ VISUELLE (persistante) ========== */
  // On utilise --font-scale (plus standard) ; ton CSS doit faire: html{font-size:calc(1rem*var(--font-scale,1));}
  if (!getComputedStyle(root).getPropertyValue('--font-scale')) {
    root.style.setProperty('--font-scale', '1');
  }

  // Restaurer préférences
  const savedPrefs = JSON.parse(localStorage.getItem('accessPrefs') || '{}');
  if (savedPrefs.fontScale) root.style.setProperty('--font-scale', savedPrefs.fontScale);
  if (savedPrefs.contrast)  body.classList.add('high-contrast');
  if (savedPrefs.spacing)   body.classList.add('wide-spacing');

  function savePrefs() {
    localStorage.setItem('accessPrefs', JSON.stringify({
      fontScale: root.style.getPropertyValue('--font-scale'),
      contrast:  body.classList.contains('high-contrast'),
      spacing:   body.classList.contains('wide-spacing')
    }));
  }

  const actionMap = {
    'font+': () => {
      let cur = parseFloat(getComputedStyle(root).getPropertyValue('--font-scale')) || 1;
      if (cur < 1.6) { cur = +(cur + 0.1).toFixed(2); root.style.setProperty('--font-scale', String(cur)); savePrefs(); }
    },
    'font-': () => {
      let cur = parseFloat(getComputedStyle(root).getPropertyValue('--font-scale')) || 1;
      if (cur > 0.8) { cur = +(cur - 0.1).toFixed(2); root.style.setProperty('--font-scale', String(cur)); savePrefs(); }
    },
    'contrast': () => { body.classList.toggle('high-contrast'); savePrefs(); },
    'spacing':  () => { body.classList.toggle('wide-spacing');  savePrefs(); },
    'reset':    () => {
      root.style.setProperty('--font-scale', '1');
      body.classList.remove('high-contrast','wide-spacing');
      localStorage.removeItem('accessPrefs');
    }
  };

  document.querySelectorAll('.access-btn[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');
      actionMap[action]?.();
    });
  });

  // Raccourcis clavier (Alt + -, Alt + =, Alt + C, Alt + S, Alt + 0, Alt + D pour thème)
  document.addEventListener('keydown', (e) => {
    if (e.altKey) {
      const k = e.key.toLowerCase();
      if (k === '-')  { e.preventDefault(); actionMap['font-'](); }
      if (k === '=')  { e.preventDefault(); actionMap['font+'](); }
      if (k === 'c')  { e.preventDefault(); actionMap['contrast'](); }
      if (k === 's')  { e.preventDefault(); actionMap['spacing'](); }
      if (k === '0')  { e.preventDefault(); actionMap['reset'](); }
      if (k === 'd')  { e.preventDefault(); themeBtn?.click(); }
    }
  });

/* =========================
   TOGGLE BARRE TTS (avec transition)
========================= */
(function ttsToggleAnimated(){
  const toggle = document.getElementById('tts-toggle');
  const bar = document.querySelector('.tts-bar');
  if (!toggle || !bar) return;

  // État initial selon la mémoire utilisateur (localStorage)
  const saved = localStorage.getItem('ttsVisible'); // 'shown' | 'hidden' | null
  const shouldShow = saved ? (saved === 'shown') : true; // visible par défaut
  // On enlève l'attribut hidden pour permettre la transition CSS, puis on applique l'état visuel
  bar.removeAttribute('hidden');
  if (shouldShow) {
    bar.classList.add('is-visible');
    toggle.setAttribute('aria-pressed', 'true');
  } else {
    bar.classList.remove('is-visible');
    toggle.setAttribute('aria-pressed', 'false');
  }

  function showBar() {
    // s’assure que l’élément est affichable
    bar.classList.add('is-visible');
    toggle.setAttribute('aria-pressed', 'true');
    localStorage.setItem('ttsVisible', 'shown');
  }

  function hideBar() {
    // lance l’animation de sortie puis, après transition, rend l’élément “vraiment” caché pour SR si tu veux
    bar.classList.remove('is-visible');
    toggle.setAttribute('aria-pressed', 'false');
    localStorage.setItem('ttsVisible', 'hidden');
  }

  toggle.addEventListener('click', () => {
    const visible = bar.classList.contains('is-visible');
    if (visible) hideBar(); else showBar();
  });
})();

</script>

  <script>
(function(){
  const toggle = document.getElementById('tts-toggle');
  const bar = document.querySelector('.tts-bar');
  const btns = document.querySelectorAll('.tts-btn');
  if (!bar) return;

  // ---- Apparition fluide + mémoire ----
  bar.removeAttribute('hidden');
  const saved = localStorage.getItem('ttsVisible');
  const shouldShow = saved ? (saved === 'shown') : true;
  if (shouldShow) {
    bar.classList.add('is-visible');
    bar.removeAttribute('aria-hidden');
    toggle?.setAttribute('aria-pressed', 'true');
  } else {
    bar.classList.remove('is-visible');
    bar.setAttribute('aria-hidden', 'true');
    toggle?.setAttribute('aria-pressed', 'false');
  }

  function showBar(){
    bar.classList.add('is-visible');
    bar.removeAttribute('aria-hidden');
    toggle?.setAttribute('aria-pressed','true');
    localStorage.setItem('ttsVisible','shown');
  }
  function hideBar(){
    bar.classList.remove('is-visible');
    bar.setAttribute('aria-hidden','true');
    toggle?.setAttribute('aria-pressed','false');
    localStorage.setItem('ttsVisible','hidden');
  }

  toggle?.addEventListener('click',()=>{
    const visible = bar.classList.contains('is-visible');
    visible ? hideBar() : showBar();
  });

  // ---- Effet rebond ----
  function bounce(el){
    el.classList.remove('tts-animate');
    void el.offsetWidth;
    el.classList.add('tts-animate');
    setTimeout(()=>el.classList.remove('tts-animate'),220);
  }
  btns.forEach(btn=>{
    btn.addEventListener('click',()=>bounce(btn));
    btn.addEventListener('keydown',e=>{
      if(e.key===' '||e.key==='Enter') bounce(btn);
    });
  });

  // ---- Halo vert actif ----
  btns.forEach(btn=>{
    btn.addEventListener('click',()=>{
      btns.forEach(b=>b.classList.remove('tts-active'));
      if(!btn.id.includes('stop')) btn.classList.add('tts-active');
    });
  });
  document.getElementById('tts-stop')?.addEventListener('click',()=>{
    btns.forEach(b=>b.classList.remove('tts-active'));
  });
})();
</script>
