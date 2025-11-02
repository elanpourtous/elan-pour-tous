/*
  Élan pour tous — Accessibilité : menu mobile + thème clair/sombre + annonces vocales
  RGAA 4.1 / WCAG 2.2 AA
*/
(function () {
  const THEME_KEY = 'pref-theme';
  const root = document.documentElement;

  // ---------- Live region (lecteurs d’écran) ----------
  const live = document.createElement('div');
  live.setAttribute('role','status');
  live.setAttribute('aria-live','polite');
  live.className = 'visually-hidden';
  document.body.appendChild(live);

  let liveT;
  const announce = (msg)=>{
    clearTimeout(liveT);
    liveT = setTimeout(()=> { live.textContent = msg; }, 50);
  };

  // ---------- Thème clair / sombre ----------
  const mqDark = window.matchMedia('(prefers-color-scheme: dark)');
  const saved = localStorage.getItem(THEME_KEY);
  setTheme(saved || (mqDark.matches ? 'dark' : 'light'), false);

  function onSystemThemeChange(e){
    const userSet = localStorage.getItem(THEME_KEY);
    if (!userSet) setTheme(e.matches ? 'dark' : 'light', false);
  }
  mqDark.addEventListener?.('change', onSystemThemeChange);

  function setTheme(mode, persist = true){
    const m = (mode === 'dark') ? 'dark' : 'light';
    root.setAttribute('data-theme', m);
    if (persist) localStorage.setItem(THEME_KEY, m);
    const btnTheme = document.querySelector('[data-theme-toggle]');
    if (btnTheme){
      btnTheme.setAttribute('aria-pressed', String(m === 'dark'));
      btnTheme.setAttribute('title', m === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre');
      btnTheme.setAttribute('aria-label', m === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre');
    }
    if (persist) announce(m === 'dark' ? 'Mode sombre activé' : 'Mode clair activé');
  }

  // ⚠️ Attendre que le header soit injecté avant d’attacher les handlers
  waitForHeader().then(initInteractions).catch(()=>{ /* silencieux */ });

  function waitForHeader(){
    return new Promise((resolve)=>{
      // si déjà présent
      if (document.getElementById('primary-nav')) return resolve();
      // observer le DOM jusqu’à ce que #primary-nav apparaisse
      const mo = new MutationObserver(()=>{
        if (document.getElementById('primary-nav')) {
          mo.disconnect(); resolve();
        }
      });
      mo.observe(document.documentElement, { childList:true, subtree:true });
      // sécurité : fallback après 5s
      setTimeout(()=>{ mo.disconnect(); resolve(); }, 5000);
    });
  }

  function initInteractions(){
    const btnTheme = document.querySelector('[data-theme-toggle]');
    btnTheme && btnTheme.addEventListener('click', () => {
      const next = (root.getAttribute('data-theme') === 'dark') ? 'light' : 'dark';
      setTheme(next, true);
    });

    const btnMenu = document.querySelector('.menu-toggle');
    const nav = document.getElementById('primary-nav');
    if (!(btnMenu && nav)) return;

    // Lier le bouton au menu
    btnMenu.setAttribute('aria-controls', 'primary-nav');
    btnMenu.setAttribute('aria-expanded', 'false');

    let lastFocus = null;

    const focusablesSelector = 'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const getFocusables = ()=> Array.from(nav.querySelectorAll(focusablesSelector)).filter(el => !el.hasAttribute('disabled'));

    function focusFirstLink(){ getFocusables()[0]?.focus(); }

    function openMenu(announceIt = true){
      lastFocus = document.activeElement;
      nav.classList.add('is-open');
      btnMenu.setAttribute('aria-expanded','true');
      document.body.style.overflow = 'hidden';  // lock scroll (optionnel)
      setTimeout(focusFirstLink, 0);
      if (announceIt) announce('Menu ouvert');
    }

    function closeMenu(announceIt = true){
      nav.classList.remove('is-open');
      btnMenu.setAttribute('aria-expanded','false');
      document.body.style.overflow = '';
      (lastFocus || btnMenu).focus();
      lastFocus = null;
      if (announceIt) announce('Menu fermé');
    }

    // Toggle
    btnMenu.addEventListener('click', () => {
      const open = btnMenu.getAttribute('aria-expanded') === 'true';
      open ? closeMenu() : openMenu();
    });

    // ÉCHAP ferme
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) closeMenu();
    });

    // Clic sur un lien => fermer sans annoncer (la navigation prend le relais)
    nav.addEventListener('click', (e) => {
      if (e.target.closest('a')) closeMenu(false);
    });

    // Clic à l’extérieur => fermer
    document.addEventListener('click', (e) => {
      if (!nav.classList.contains('is-open')) return;
      const inside = e.target.closest('#primary-nav, .menu-toggle');
      if (!inside) closeMenu();
    });

    // ---- Focus trap (TAB/SHIFT+TAB restent dans le menu ouvert) ----
    nav.addEventListener('keydown', (e)=>{
      if (!nav.classList.contains('is-open')) return;
      if (e.key !== 'Tab') return;
      const els = getFocusables();
      if (!els.length) return;
      const first = els[0], last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });
  }
})();
