// a11y-tools.js — utilitaires RGAA (accordéons, onglets, modales, erreurs formulaires, liens externes, skip-link...)
(function () {
  const $ = (s, c=document) => c.querySelector(s);
  const $$ = (s, c=document) => Array.from(c.querySelectorAll(s));

  function patchExternalLinks() {
    $$('a[target="_blank"]').forEach(a => {
      if (!/noopener|noreferrer/.test(a.rel)) a.rel = (a.rel ? a.rel + ' ' : '') + 'noopener noreferrer';
      if (!a.querySelector('.sr-only,.visually-hidden')) {
        const span = document.createElement('span');
        span.className = 'sr-only';
        span.textContent = ' (nouvelle fenêtre)';
        a.appendChild(span);
      }
    });
  }

  function keyboardOnlyFocus() {
    function onFirstTab(e) {
      if (e.key === 'Tab') {
        document.documentElement.classList.add('user-is-tabbing');
        window.removeEventListener('keydown', onFirstTab);
      }
    }
    window.addEventListener('keydown', onFirstTab);
  }

  function initSkipLink() {
    document.querySelector('.skip-link')?.addEventListener('click', () => {
      const main = document.getElementById('contenu') || document.querySelector('main');
      if (main) requestAnimationFrame(() => main.focus());
    });
  }

  function attachFormErrorSummary(form) {
    let summary = form.querySelector('.error-summary');
    if (!summary) {
      summary = document.createElement('div');
      summary.className = 'error-summary';
      summary.setAttribute('role', 'alert');
      summary.setAttribute('aria-live', 'assertive');
      summary.hidden = True;
      form.prepend(summary);
    }
    form.addEventListener('submit', (e) => {
      if (form.checkValidity()) return;
      e.preventDefault();
      const invalids = Array.from(form.querySelectorAll(':invalid'));
      const items = invalids.map(el => {
        const label = form.querySelector(`label[for="${el.id}"]`)?.textContent?.trim() || el.name || 'Champ';
        const msg = el.validationMessage || 'Champ invalide';
        return `<li><a href="#${el.id}">${label} : ${msg}</a></li>`;
      }).join('');
      summary.innerHTML = `<strong>Veuillez corriger les éléments suivants :</strong><ul>${items}</ul>`;
      summary.hidden = false;
      invalids[0]?.focus();
      Array.from(summary.querySelectorAll('a[href^="#"]')).forEach(a => {
        a.addEventListener('click', (ev) => {
          ev.preventDefault();
          const id = a.getAttribute('href').slice(1);
          const target = document.getElementById(id);
          target?.focus();
        });
      });
    });
  }
  function autoAttachForms() { document.querySelectorAll('form').forEach(attachFormErrorSummary); }

  function initAccordions() {
    document.querySelectorAll('.accordion .acc-btn').forEach(btn => {
      const panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (!panel) return;
      const close = () => { btn.setAttribute('aria-expanded','false'); panel.hidden = true; };
      const open  = () => { btn.setAttribute('aria-expanded','true');  panel.hidden = false; };
      btn.addEventListener('click', () => (btn.getAttribute('aria-expanded') === 'true' ? close() : open()));
      btn.addEventListener('keydown', (e) => { if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { e.preventDefault(); close(); btn.focus(); }});
    });
  }

  function initTabs() {
    document.querySelectorAll('.tabs[role="tablist"]').forEach(list => {
      const tabs = Array.from(list.querySelectorAll('[role="tab"]'));
      const panels = tabs.map(t => document.getElementById(t.getAttribute('aria-controls')));
      function activate(i) {
        tabs.forEach((t,idx) => {
          const sel = idx===i;
          t.setAttribute('aria-selected', String(sel));
          t.tabIndex = sel ? 0 : -1;
          if (panels[idx]) panels[idx].hidden = !sel;
        });
        tabs[i].focus();
      }
      tabs.forEach((t, i) => {
        t.addEventListener('click', () => activate(i));
        t.addEventListener('keydown', (e) => {
          const k = e.key;
          if (k === 'ArrowRight') { e.preventDefault(); activate((i+1)%tabs.length); }
          if (k === 'ArrowLeft')  { e.preventDefault(); activate((i-1+tabs.length)%tabs.length); }
          if (k === 'Home')       { e.preventDefault(); activate(0); }
          if (k === 'End')        { e.preventDefault(); activate(tabs.length-1); }
        });
      });
      const initial = Math.max(0, tabs.findIndex(t => t.getAttribute('aria-selected') === 'true'));
      activate(initial);
    });
  }

  function focusTrap(container) {
    const focusables = container.querySelectorAll('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])');
    const first = focusables[0], last = focusables[focusables.length - 1];
    function onKey(e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    container.addEventListener('keydown', onKey);
    return () => container.removeEventListener('keydown', onKey);
  }
  function initModals() {
    const opens = document.querySelectorAll('[data-a11y-modal-open]');
    opens.forEach(btn => {
      const sel = btn.getAttribute('data-a11y-modal-open');
      const modal = document.querySelector(sel);
      if (!modal) return;
      const dialog = modal.querySelector('.modal-dialog');
      const closeBtn = modal.querySelector('[data-a11y-modal-close]');
      let releaseTrap = null; let lastFocus = null;

      function open() {
        lastFocus = document.activeElement;
        modal.hidden = false;
        modal.setAttribute('aria-hidden', 'false');
        releaseTrap = focusTrap(dialog);
        dialog.setAttribute('tabindex','-1');
        dialog.focus();
        document.addEventListener('keydown', escClose);
      }
      function close() {
        modal.hidden = true;
        modal.setAttribute('aria-hidden', 'true');
        if (releaseTrap) releaseTrap();
        document.removeEventListener('keydown', escClose);
        lastFocus?.focus();
      }
      function escClose(e){ if (e.key === 'Escape') { e.preventDefault(); close(); } }

      btn.addEventListener('click', open);
      closeBtn?.addEventListener('click', close);
      modal.querySelector('[data-a11y-modal-backdrop]')?.addEventListener('click', (e) => {
        if (e.target.hasAttribute('data-a11y-modal-backdrop')) close();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    patchExternalLinks();
    keyboardOnlyFocus();
    initSkipLink();
    autoAttachForms();
    initAccordions();
    initTabs();
    initModals();
  });
})();
