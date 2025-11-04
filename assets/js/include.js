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

  /* ========== TOGGLE BARRE TTS (footer) ========== */
  const ttsToggle = document.getElementById('tts-toggle');
  const ttsBar = document.querySelector('.tts-bar');
  if (ttsToggle && ttsBar) {
    ttsToggle.addEventListener('click', () => {
      const willShow = ttsBar.hasAttribute('hidden');
      ttsBar.toggleAttribute('hidden');
      ttsToggle.setAttribute('aria-pressed', String(willShow));
    });
  }
})();
</script>
