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
