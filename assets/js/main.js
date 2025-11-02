/*
  Élan pour tous — Accessibilité : menu mobile + thème clair/sombre + annonces vocales
  RGAA 4.1 / WCAG 2.2 AA
*/
(function () {
  const THEME_KEY = 'pref-theme';
  const root     = document.documentElement;
  const btnTheme = document.querySelector('[data-theme-toggle]');
  const btnMenu  = document.querySelector('.menu-toggle');
  const nav      = document.getElementById('primary-nav');

  // ---------- Live region (lecteurs d’écran) ----------
  const live = document.createElement('div');
  live.setAttribute('role','status');
  live.setAttribute('aria-live','polite');
  live.className = 'visually-hidden';
  document.body.appendChild(live);

  // Petit anti-spam pour aria-live
  let liveT;
  function announce(msg){
    clearTimeout(liveT);
    liveT = setTimeout(()=> { live.textContent = msg; }, 50);
  }

  // ---------- Thème clair / sombre ----------
  const mqDark = window.matchMedia('(prefers-color-scheme: dark)');

  // Charge préférence stockée ou défaut système
  const saved = localStorage.getItem(THEME_KEY);
  setTheme(saved || (mqDark.matches ? 'dark' : 'light'), false);

  // Si l’utilisateur n’a PAS choisi, on suit le système en live
  function onSystemThemeChange(e){
    const userSet = localStorage.getItem(THEME_KEY);
    if (!userSet) setTheme(e.matches ? 'dark' : 'light', false);
  }
  mqDark.addEventListener?.('change', onSystemThemeChange);

  function setTheme(mode, say = true){
    const m = (mode === 'dark') ? 'dark' : 'light';
    root.setAttribute('data-theme', m);
    // si c’est un choix utilisateur, on enregistre
    if (say) localStorage.setItem(THEME_KEY, m);
    if (btnTheme){
      btnTheme.setAttribute('aria-pressed', String(m === 'dark'));
      btnTheme.setAttribute('title', m === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre');
      btnTheme.setAttribute('aria-label', m === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre');
    }
    if (say) announce(m === 'dark' ? 'Mode sombre activé' : 'Mode clair activé');
  }

  btnTheme && btnTheme.addEventListener('click', () => {
    const next = (root.getAttribute('data-theme') === 'dark') ? 'light' : 'dark';
    setTheme(next, true);
  });

  // ---------- Menu mobile accessible ----------
  if (btnMenu && nav){
    // Lier le bouton au menu
    btnMenu.setAttribute('aria-controls', 'primary-nav');
    btnMenu.setAttribute('aria-expanded', 'false');

    let lastFocus = null;

    function focusFirstLink(){
      const first = nav.querySelector('a, button, [tabindex]:not([tabindex="-1"])');
      first && first.focus();
    }

    function openMenu(announceIt = true){
      lastFocus = document.activeElement;
      nav.classList.add('is-open');
      btnMenu.setAttribute('aria-expanded','true');
      // focus dans le menu
      setTimeout(focusFirstLink, 0);
      if (announceIt) announce('Menu ouvert');
      // page derrière non interactive (optionnel si besoin) :
      // document.body.style.overflow = 'hidden';
    }

    function closeMenu(announceIt = true){
      nav.classList.remove('is-open');
      btnMenu.setAttribute('aria-expanded','false');
      // document.body.style.overflow = '';
      // retour du focus sur le bouton
      (lastFocus || btnMenu).focus();
      lastFocus = null;
      if (announceIt) announce('Menu fermé');
    }

    btnMenu.addEventListener('click', () => {
      const open = btnMenu.getAttribute('aria-expanded') === 'true';
      open ? closeMenu() : openMenu();
    });

    // ÉCHAP ferme
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) closeMenu();
    });

    // Clic sur un lien du menu => fermer sans annoncer (le changement de page suffit)
    nav.addEventListener('click', (e) => {
      if (e.target.closest('a')) closeMenu(false);
    });

    // Clic à l’extérieur => fermer
    document.addEventListener('click', (e) => {
      if (!nav.classList.contains('is-open')) return;
      const inside = e.target.closest('#primary-nav, .menu-toggle');
      if (!inside) closeMenu();
    });
  }
})();
