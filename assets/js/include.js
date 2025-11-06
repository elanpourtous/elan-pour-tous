/* assets/js/include.js — Élan pour tous (unifié, multi-navigateurs) */
(function () {
  if (window.__EPT_INIT__) return; window.__EPT_INIT__ = true;

  const root = document.documentElement;
  const body = document.body;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* =========================
     MENU MOBILE (accessible)
  ==========================*/
  (function(){
    const menuBtn = $('#menu-toggle'), nav = $('#primary-nav');
    if (!menuBtn || !nav) return;

    // État initial
    menuBtn.setAttribute('type','button');
    menuBtn.setAttribute('aria-expanded','false');
    menuBtn.setAttribute('aria-controls','primary-nav');
    if (!nav.hasAttribute('hidden')) nav.setAttribute('hidden','');

    // Toggle
    menuBtn.addEventListener('click', () => {
      const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', String(!expanded));
      menuBtn.setAttribute('aria-label', expanded ? 'Ouvrir le menu' : 'Fermer le menu');
      nav.toggleAttribute('hidden');
      if (!expanded) nav.querySelector('a')?.focus();
    });

    // Fermeture avec Échap
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
        menuBtn.click(); menuBtn.focus();
      }
    });
  })();

  /* =========================
     aria-current auto
  ==========================*/
  (function(){
    try {
      const path = location.pathname.split('/').pop() || 'index.html';
      $$('#primary-nav a').forEach(a => {
        const href = a.getAttribute('href') || '';
        if (href.endsWith(path)) a.setAttribute('aria-current','page');
        else a.removeAttribute('aria-current');
      });
    } catch {}
  })();

  /* ==========================================
     A− / A+ / Contraste / Espaces / Reset (a11y)
     — multi-navigateurs + persistance
  ===========================================*/
  (function(){
    const LS = 'accessPrefs';

    // Init variable d’échelle
    if (!getComputedStyle(root).getPropertyValue('--font-scale')) {
      root.style.setProperty('--font-scale','1');
    }

    // Restaurer préférences
    try {
      const saved = JSON.parse(localStorage.getItem(LS) || '{}');
      if (saved.fontScale) root.style.setProperty('--font-scale', saved.fontScale);
      if (saved.contrast)  body.classList.add('high-contrast');
      if (saved.spacing)   body.classList.add('wide-spacing');
    } catch {}

    const clamp = (v,min,max)=>Math.min(max,Math.max(min,v));
    function save() {
      try {
        localStorage.setItem(LS, JSON.stringify({
          fontScale: root.style.getPropertyValue('--font-scale'),
          contrast:  body.classList.contains('high-contrast'),
          spacing:   body.classList.contains('wide-spacing')
        }));
      } catch {}
    }

    const actions = {
      'font+': () => {
        let v = parseFloat(getComputedStyle(root).getPropertyValue('--font-scale')) || 1;
        v = clamp(+(v + 0.1).toFixed(2), 0.8, 1.8);
        root.style.setProperty('--font-scale', String(v));
        save();
      },
      'font-': () => {
        let v = parseFloat(getComputedStyle(root).getPropertyValue('--font-scale')) || 1;
        v = clamp(+(v - 0.1).toFixed(2), 0.8, 1.8);
        root.style.setProperty('--font-scale', String(v));
        save();
      },
      'contrast': () => { body.classList.toggle('high-contrast'); save(); },
      'spacing':  () => { body.classList.toggle('wide-spacing');  save(); },
      'reset':    () => {
        root.style.setProperty('--font-scale','1');
        body.classList.remove('high-contrast','wide-spacing');
        localStorage.removeItem(LS);
      }
    };

    // Binding des boutons (anti double-bind)
    function bindAccessButtons(ctx = document) {
      ctx.querySelectorAll('.access-btn[data-action]').forEach(btn => {
        if (btn.__bound) return;
        btn.type = btn.type || 'button';
        const act = btn.getAttribute('data-action');
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          actions[act]?.();
        });
        btn.__bound = true;
      });
    }
    bindAccessButtons();

    // Observer : header/footer injectés après coup
    const mo = new MutationObserver(muts => {
      for (const m of muts) {
        if (m.type === 'childList') {
          m.addedNodes.forEach(n => {
            if (n.nodeType === 1) bindAccessButtons(n);
          });
        }
      }
    });
    mo.observe(document.documentElement, { childList:true, subtree:true });

    // Raccourcis clavier universels (FR/US + pavé numérique)
    document.addEventListener('keydown', (e) => {
      if (!e.altKey) return;
      const k = e.key?.toLowerCase?.() || '';
      const code = e.code || '';

      // A− : Alt + -  (Minus / NumpadSubtract)
      if (k === '-' || code === 'Minus' || code === 'NumpadSubtract') {
        e.preventDefault(); actions['font-'](); return;
      }
      // A+ : Alt + = ou Alt + + (Equal / NumpadAdd)
      if (k === '=' || k === '+' || code === 'Equal' || code === 'NumpadAdd') {
        e.preventDefault(); actions['font+'](); return;
      }
      // Contraste : Alt + C
      if (k === 'c') { e.preventDefault(); actions['contrast'](); return; }
      // Espacement : Alt + S
      if (k === 's') { e.preventDefault(); actions['spacing'](); return; }
      // Reset : Alt + 0 (rangée ou pavé)
      if (k === '0' || code === 'Digit0' || code === 'Numpad0') {
        e.preventDefault(); actions['reset'](); return;
      }
    });
  })();

  /* =========================
     Thème clair/sombre
  ==========================*/
  (function(){
    const themeBtn = $('#theme-toggle'), metaTheme = $('meta[name="theme-color"]');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const saved = localStorage.getItem('theme');
    const initial = saved || (prefersDark ? 'dark' : 'light');

    apply(initial, false);

    themeBtn?.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      apply(next, true);
    });

    if (!saved && window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', (e) => apply(e.matches ? 'dark' : 'light', false));
    }

    function apply(mode, persist) {
      root.setAttribute('data-theme', mode);
      const dark = mode === 'dark';
      if (themeBtn) {
        themeBtn.setAttribute('aria-pressed', String(dark));
        themeBtn.setAttribute('aria-label', dark ? 'Désactiver le mode sombre' : 'Activer le mode sombre');
        themeBtn.setAttribute('title', dark ? 'Désactiver le mode sombre' : 'Activer le mode sombre');
      }
      if (metaTheme) metaTheme.setAttribute('content', dark ? '#0a6a47' : '#0b8457');
      if (persist) localStorage.setItem('theme', mode);
    }
  })();

  /* =========================
     Toggle barre TTS globale
  ==========================*/
  (function(){
    const toggle = $('#tts-toggle'), bar = $('.tts-bar');
    if (!toggle || !bar) return;

    // Toujours contrôlable
    bar.removeAttribute('hidden');

    // État mémorisé (visible par défaut)
    const saved = localStorage.getItem('ttsVisible');
    const show  = saved ? (saved === 'shown') : true;

    function on()  { bar.classList.add('is-visible'); bar.removeAttribute('aria-hidden'); toggle.setAttribute('aria-pressed','true');  localStorage.setItem('ttsVisible','shown'); }
    function off() { bar.classList.remove('is-visible'); bar.setAttribute('aria-hidden','true'); toggle.setAttribute('aria-pressed','false'); localStorage.setItem('ttsVisible','hidden'); }

    show ? on() : off();
    toggle.addEventListener('click', () => { bar.classList.contains('is-visible') ? off() : on(); });
  })();
})();
