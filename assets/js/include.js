<script>
(function () {
  // --- Menu mobile ---
  const menuBtn = document.getElementById('menu-toggle');
  const nav = document.getElementById('primary-nav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', String(!expanded));
      menuBtn.setAttribute('aria-label', expanded ? 'Ouvrir le menu' : 'Fermer le menu');
      nav.toggleAttribute('hidden'); // évite display:none sur <ul> pour l’accessibilité
    });
  }

  // --- Mettre aria-current="page" automatiquement ---
  try {
    const path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('#primary-nav a').forEach(a => {
      const href = a.getAttribute('href');
      if (href && href.endsWith(path)) {
        a.setAttribute('aria-current', 'page');
      } else {
        a.removeAttribute('aria-current');
      }
    });
  } catch {}

  // --- Thème clair/sombre ---
  const themeBtn = document.getElementById('theme-toggle');
  const root = document.documentElement;
  function setTheme(mode) {
    root.setAttribute('data-theme', mode);
    localStorage.setItem('theme', mode);
    const dark = mode === 'dark';
    themeBtn?.setAttribute('aria-pressed', String(dark));
    themeBtn?.setAttribute('aria-label', dark ? 'Désactiver le mode sombre' : 'Activer le mode sombre');
    themeBtn?.setAttribute('title', dark ? 'Désactiver le mode sombre' : 'Activer le mode sombre');
  }
  const saved = localStorage.getItem('theme');
  if (saved) setTheme(saved);
  themeBtn?.addEventListener('click', () => {
    const mode = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(mode);
  });

  // --- Accessibilité visuelle (taille, contraste, espacement, reset) ---
  const actionMap = {
    'font+': () => { const cur = parseFloat(getComputedStyle(root).getPropertyValue('--base-font') || '1'); root.style.setProperty('--base-font', (cur+0.05).toFixed(2)); },
    'font-': () => { const cur = parseFloat(getComputedStyle(root).getPropertyValue('--base-font') || '1'); root.style.setProperty('--base-font', Math.max(0.8, cur-0.05).toFixed(2)); },
    'contrast': () => document.body.classList.toggle('high-contrast'),
    'spacing':  () => document.body.classList.toggle('wide-spacing'),
    'reset':    () => {
      root.style.removeProperty('--base-font');
      document.body.classList.remove('high-contrast','wide-spacing');
    }
  };
  document.querySelectorAll('.access-btn[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');
      actionMap[action]?.();
    });
  });

  // Raccourcis clavier (Alt + -, Alt + =, Alt + C, Alt + S, Alt + 0)
  document.addEventListener('keydown', (e) => {
    if (!e.altKey) return;
    const k = e.key.toLowerCase();
    if (k === '-' ) { e.preventDefault(); actionMap['font-'](); }
    if (k === '=' ) { e.preventDefault(); actionMap['font+'](); }
    if (k === 'c' ) { e.preventDefault(); actionMap['contrast'](); }
    if (k === 's' ) { e.preventDefault(); actionMap['spacing'](); }
    if (k === '0' ) { e.preventDefault(); actionMap['reset'](); }
  });

  // --- Toggle de la barre TTS globale (footer) ---
  const ttsToggle = document.getElementById('tts-toggle');
  const ttsBar = document.querySelector('.tts-bar');
  if (ttsToggle && ttsBar) {
    ttsToggle.addEventListener('click', () => {
      const hidden = ttsBar.hasAttribute('hidden');
      ttsBar.toggleAttribute('hidden');
      ttsToggle.setAttribute('aria-pressed', String(hidden));
    });
  }
})();
</script>
