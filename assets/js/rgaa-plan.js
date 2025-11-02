/* RGAA Plan d’action – checklist interactive
   - Sauvegarde auto (localStorage)
   - Progression %
   - Filtre (all / todo / done)
   - Export JSON / Reset
*/
(function () {
  const $list = document.getElementById('rgaa-checklist');
  if (!$list) return;

  const STORAGE_KEY = $list.dataset.key || 'rgaa-plan';
  const $items = Array.from($list.querySelectorAll('.rgaa-item'));
  const $checks = Array.from($list.querySelectorAll('.rgaa-check'));
  const $notes = Array.from($list.querySelectorAll('.rgaa-note'));
  const $progress = document.getElementById('rgaa-progress');
  const $progressLabel = document.getElementById('rgaa-progress-label');
  const $filter = document.getElementById('rgaa-filter');
  const $export = document.getElementById('rgaa-export');
  const $reset = document.getElementById('rgaa-reset');

  // --------- State helpers
  const load = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch { return {}; }
  };
  const save = (state) => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

  // --------- Init from storage
  const state = load();

  $items.forEach(li => {
    const id = li.dataset.id;
    const s = state[id] || {};
    const check = li.querySelector('.rgaa-check');
    const note = li.querySelector('.rgaa-note');
    if (typeof s.done === 'boolean') check.checked = s.done;
    if (typeof s.note === 'string') note.value = s.note;
    applyBadge(li, check.checked);
  });

  updateProgress();

  // --------- Events
  $checks.forEach(chk => {
    chk.addEventListener('change', () => {
      const li = chk.closest('.rgaa-item');
      const id = li.dataset.id;
      state[id] = state[id] || {};
      state[id].done = chk.checked;
      applyBadge(li, chk.checked);
      save(state);
      updateProgress();
      applyFilter();
    });
  });

  // debounce pour notes
  let t;
  $notes.forEach(area => {
    area.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const li = area.closest('.rgaa-item');
        const id = li.dataset.id;
        state[id] = state[id] || {};
        state[id].note = area.value;
        save(state);
      }, 250);
    });
  });

  if ($filter) {
    $filter.addEventListener('change', applyFilter);
  }

  if ($export) {
    $export.addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'rgaa-plan.json';
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
    });
  }

  if ($reset) {
    $reset.addEventListener('click', () => {
      if (!confirm('Réinitialiser tous les critères ?')) return;
      localStorage.removeItem(STORAGE_KEY);
      $checks.forEach(c => (c.checked = false));
      $notes.forEach(n => (n.value = ''));
      $items.forEach(li => applyBadge(li, false));
      updateProgress();
      applyFilter();
    });
  }

  // --------- UI helpers
  function applyBadge(li, done) {
    const badge = li.querySelector('.rgaa-badge');
    if (!badge) return;
    badge.textContent = done ? 'OK' : 'À corriger';
    badge.classList.toggle('is-done', !!done);
  }

  function updateProgress() {
    const total = $checks.length;
    const done = $checks.filter(c => c.checked).length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    if ($progress) $progress.value = pct;
    if ($progressLabel) $progressLabel.textContent = `${pct}% complété`;
  }

  function applyFilter() {
    if (!$filter) return;
    const mode = $filter.value;
    $items.forEach(li => {
      const checked = li.querySelector('.rgaa-check').checked;
      const show = (mode === 'all') || (mode === 'done' && checked) || (mode === 'todo' && !checked);
      li.style.display = show ? '' : 'none';
    });
  }
})();

<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Élan pour tous – Accessibilité RGAA</title>
  <meta name="description" content="Engagement d’Élan pour tous en matière d’accessibilité numérique (RGAA) : moyens, ressources, plan d’action et contacts.">
  <meta name="theme-color" content="#0b8457">
  <link rel="icon" href="assets/ima/baa.png" type="image/png">
  <link rel="stylesheet" href="assets/css/style.css">
  <link rel="stylesheet" href="assets/css/rgaa-accessible.css">
</head>

<body>
  <!-- Lien d’évitement -->
  <a href="#contenu" class="skip-link">Aller au contenu</a>

  <!-- HEADER dynamique -->
  <div id="header-placeholder" role="banner"></div>

  <main id="contenu" class="container hero" role="main">
    <h1>Accessibilité RGAA</h1>

    <!-- Bannière / badge -->
    <div class="rgaa-banner" role="complementary" aria-label="Engagement accessibilité du site">
      <img src="assets/ima/accessibility.svg" alt="" class="rgaa-icon" width="24" height="24" aria-hidden="true">
      <p>
        <strong>Accessibilité RGAA démontrée ✅</strong> — site conçu pour être inclusif et utilisable par tous.
        <a href="declaration-accessibilite.html">Lire la déclaration</a>
      </p>
    </div>

    <!-- Sommaire -->
    <nav aria-label="Sommaire accessibilité" class="toc">
      <ul>
        <li><a href="#engagement">Notre engagement</a></li>
        <li><a href="#moyens">Moyens mis en œuvre</a></li>
        <li><a href="#ressources">Ressources utiles</a></li>
        <li><a href="#plan">Plan d’action / Checklist</a></li>
        <li><a href="#contact-acces">Contact accessibilité</a></li>
      </ul>
    </nav>

    <section id="engagement" aria-labelledby="h-eng">
      <h2 id="h-eng">Notre engagement</h2>
      <p>
        Élan pour tous applique les recommandations du <strong>RGAA 4.1</strong> et des <strong>WCAG</strong>.
        Les évolutions du site incluent des vérifications systématiques (clavier, lecteurs d’écran, contrastes, multimédia).
      </p>
    </section>

    <section id="moyens" aria-labelledby="h-moyens">
      <h2 id="h-moyens">Moyens mis en œuvre</h2>
      <ul>
        <li>Structure sémantique (titres hiérarchisés, listes, régions ARIA).</li>
        <li>Navigation clavier complète, <em>skip-link</em> et focus visible renforcé.</li>
        <li>Contrastes conformes (AA), thèmes clair/sombre et respect de <em>prefers-reduced-motion</em>.</li>
        <li>Alternatives textuelles pour les images ; médias sous-titrés quand nécessaire.</li>
        <li>Formulaires : labels, indications, erreurs annoncées, <em>honeypot</em> anti-spam.</li>
      </ul>
    </section>

    <section id="ressources" aria-labelledby="h-ress">
      <h2 id="h-ress">Ressources utiles</h2>
      <ul>
        <li><a href="https://accessibilite.numerique.gouv.fr/" target="_blank" rel="noopener">Site officiel RGAA</a></li>
        <li><a href="https://www.w3.org/WAI/standards-guidelines/wcag/" target="_blank" rel="noopener">WCAG (W3C)</a></li>
        <li><a href="declaration-accessibilite.html">Déclaration d’accessibilité</a></li>
        <li><a href="rgaa-checklist.html">Checklist d’auto-évaluation (statique)</a></li>
      </ul>
    </section>

    <section id="plan" aria-labelledby="h-plan">
      <h2 id="h-plan">Plan d’action / Checklist</h2>
      <p>
        Utilisez notre plan d’action pour suivre vos corrections RGAA. Version interactive disponible
        (sauvegarde locale, filtres, export JSON).
      </p>

      <!-- ✅ Version statique minimale (toujours visible) -->
      <ul>
        <li><strong>1.1</strong> — Images porteuses d’info : alternatives textuelles pertinentes.</li>
        <li><strong>3.2</strong> — Contrastes conformes (AA) pour textes/éléments interactifs.</li>
        <li><strong>4.1</strong> — Navigation clavier + ordre logique + focus visible.</li>
        <li><strong>8.x</strong> — Formulaires : labels, indications, messages d’erreur.</li>
      </ul>

      <!-- 🔧 Option : intégrer la checklist interactive (si tu as créé assets/js/rgaa-plan.js) -->
      <!--
      <div id="rgaa-plan-mount">
        <section id="rgaa-plan" aria-labelledby="plan-rgaa">
          <h3 id="plan-rgaa">Checklist interactive</h3>
          <div class="rgaa-controls" role="group" aria-label="Contrôles du plan d’action">
            <label>Filtrer :
              <select id="rgaa-filter">
                <option value="all">Tout</option>
                <option value="todo">À corriger</option>
                <option value="done">OK</option>
              </select>
            </label>
            <button type="button" id="rgaa-export" class="btn">Exporter JSON</button>
            <button type="button" id="rgaa-reset" class="btn">Réinitialiser</button>
          </div>
          <div class="rgaa-progresswrap" aria-live="polite">
            <progress id="rgaa-progress" value="0" max="100"></progress>
            <span id="rgaa-progress-label">0% complété</span>
          </div>
          <ul id="rgaa-checklist" class="rgaa-list" data-key="rgaa-plan-v1">
            <li class="rgaa-item" data-id="1.1">
              <div class="rgaa-head">
                <label><input type="checkbox" class="rgaa-check"><strong>1.1</strong> — Images porteuses d’info : alternatives textuelles</label>
                <span class="rgaa-badge" aria-hidden="true">À corriger</span>
              </div>
              <details><summary>Détails / Notes</summary>
                <p class="hint">Alt descriptif, images décoratives ignorées (alt="" / role="presentation").</p>
                <textarea class="rgaa-note" rows="3" placeholder="Notes / actions…"></textarea>
              </details>
            </li>
            <li class="rgaa-item" data-id="3.2">
              <div class="rgaa-head">
                <label><input type="checkbox" class="rgaa-check"><strong>3.2</strong> — Contrastes (AA)</label>
                <span class="rgaa-badge" aria-hidden="true">À corriger</span>
              </div>
              <details><summary>Détails / Notes</summary>
                <p class="hint">États hover/focus, placeholders, boutons désactivés.</p>
                <textarea class="rgaa-note" rows="3" placeholder="Notes / actions…"></textarea>
              </details>
            </li>
            <li class="rgaa-item" data-id="4.1">
              <div class="rgaa-head">
                <label><input type="checkbox" class="rgaa-check"><strong>4.1</strong> — Clavier + focus</label>
                <span class="rgaa-badge" aria-hidden="true">À corriger</span>
              </div>
              <details><summary>Détails / Notes</summary>
                <p class="hint">Ordre logique, skip-link, pas de piège clavier.</p>
                <textarea class="rgaa-note" rows="3" placeholder="Notes / actions…"></textarea>
              </details>
            </li>
          </ul>
        </section>
      </div>
      -->
    </section>

    <section id="contact-acces" aria-labelledby="h-contact">
      <h2 id="h-contact">Contact accessibilité</h2>
      <p>Vous avez identifié un problème d’accessibilité ou besoin d’une alternative ?</p>
      <ul>
        <li>📧 <a href="mailto:elanpourtous49@gmail.com">elanpourtous49@gmail.com</a></li>
        <li>📞 <a href="tel:+33783336757">07 83 33 67 57</a></li>
      </ul>
      <p>Nous vous répondons et mettons en place une solution adaptée.</p>
    </section>
  </main>

  <!-- FOOTER dynamique -->
  <div id="footer-placeholder" role="contentinfo"></div>

  <!-- Inclusion des fragments + scripts après injection -->
  <script>
    function includeInto(id, url) {
      return fetch(url, { cache: "no-store" })
        .then(r => { if (!r.ok) throw new Error(url + " introuvable"); return r.text(); })
        .then(html => { document.getElementById(id).innerHTML = html; });
    }

    Promise.all([
      includeInto("header-placeholder", "assets/header.html"),
      includeInto("footer-placeholder", "assets/footer.html")
    ])
    .then(() => {
      // Surligner l’onglet courant automatiquement
      (function () {
        const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
        document.querySelectorAll('.nav-links a').forEach(a => {
          if ((a.getAttribute('href')||'').toLowerCase() === current) {
            a.setAttribute('aria-current', 'page'); a.classList.add('active');
          }
        });
      })();

      const s1 = document.createElement('script'); s1.src = 'assets/js/main.js'; s1.defer = true; document.body.appendChild(s1);
      const s2 = document.createElement('script'); s2.src = 'assets/js/accessibilite.js'; s2.defer = true; document.body.appendChild(s2);

      // ⬇️ Dé-commente si tu as créé assets/js/rgaa-plan.js (version interactive)
      // const s3 = document.createElement('script'); s3.src = 'assets/js/rgaa-plan.js'; s3.defer = true; document.body.appendChild(s3);
    })
    .catch(err => console.error('Erreur d’inclusion :', err));
  </script>

  <style>
    /* Petit style local pour le sommaire */
    .toc { margin: 1rem 0 2rem; }
    .toc ul { display:flex; flex-wrap:wrap; gap:.75rem 1rem; padding:0; list-style:none; }
    .toc a { display:inline-block; padding:.4rem .7rem; border:1px solid var(--border); border-radius:.5rem; text-decoration:none; color:var(--fg); background:var(--card); }
    .toc a:hover { filter: brightness(1.05); }
  </style>
</body>
</html>
