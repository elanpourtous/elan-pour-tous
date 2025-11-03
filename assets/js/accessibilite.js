/*
  Élan pour tous — Accessibilité visuelle
  RGAA 4.1 : tailles, contrastes, espacement, persistance + annonces + raccourcis
*/

(function () {
  const root = document.documentElement;
  const STORAGE_KEY = "accessibilitySettings";
  const buttons = document.querySelectorAll(".access-btn");

  // Région live (lecteurs d’écran)
  const live = document.getElementById("a11y-live") || (() => {
    const d = document.createElement("div");
    d.id = "a11y-live";
    d.className = "visually-hidden";
    d.setAttribute("role", "status");
    d.setAttribute("aria-live", "polite");
    document.body.appendChild(d);
    return d;
  })();

  // État initial (avec bornes de sécurité)
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const defaults = { fontSize: 100, contrast: false, spacing: false };
  const state = Object.assign(
    {},
    defaults,
    (() => {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
      catch { return {}; }
    })()
  );
  state.fontSize = clamp(Number(state.fontSize) || 100, 80, 200);

  applyState(false); // application silencieuse

  // ————— Fonctions —————
  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    // Événement custom pour interop
    document.dispatchEvent(new CustomEvent("a11y:changed", { detail: { ...state } }));
  }

  let liveT;
  function announce(msg) {
    clearTimeout(liveT);
    liveT = setTimeout(() => (live.textContent = msg), 40);
  }

  function reflectButtons() {
    buttons.forEach((btn) => {
      const act = btn.dataset.action;
      if (act === "contrast") btn.setAttribute("aria-pressed", String(!!state.contrast));
      if (act === "spacing") btn.setAttribute("aria-pressed", String(!!state.spacing));
      if (act === "font+")  btn.setAttribute("aria-pressed", "false");
      if (act === "font-")  btn.setAttribute("aria-pressed", "false");
      if (act === "reset")  btn.setAttribute("aria-pressed", "false");
      btn.setAttribute("type", btn.getAttribute("type") || "button");
    });
  }

  function applyState(announceIt = true) {
    root.style.fontSize = state.fontSize + "%";
    root.classList.toggle("high-contrast", !!state.contrast);
    root.classList.toggle("large-spacing", !!state.spacing);
    reflectButtons();
    if (announceIt) {
      const bits = [
        `Taille ${state.fontSize}%`,
        state.contrast ? "contraste élevé activé" : "contraste normal",
        state.spacing ? "espacement augmenté" : "espacement normal",
      ];
      announce(bits.join(", "));
    }
    saveState();
  }

  function handleAction(action) {
    switch (action) {
      case "font+":
        state.fontSize = clamp(state.fontSize + 10, 80, 200);
        break;
      case "font-":
        state.fontSize = clamp(state.fontSize - 10, 80, 200);
        break;
      case "contrast":
        state.contrast = !state.contrast;
        break;
      case "spacing":
        state.spacing = !state.spacing;
        break;
      case "reset":
        Object.assign(state, defaults);
        break;
      default:
        return;
    }
    applyState(true);
  }

  // ————— Clics sur les boutons —————
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => handleAction(btn.dataset.action));
    // Indices d’accessibilité
    if (!btn.hasAttribute("aria-label") && btn.dataset.label) {
      btn.setAttribute("aria-label", btn.dataset.label);
    }
  });

  // ————— Raccourcis clavier —————
  // Alt+=  : taille +10%
  // Alt+-  : taille -10%
  // Alt+C  : contraste
  // Alt+S  : espacement
  // Alt+0  : réinitialiser
  document.addEventListener("keydown", (e) => {
    if (!e.altKey) return;
    const k = e.key.toLowerCase();
    if (k === "=" || k === "+") { e.preventDefault(); handleAction("font+"); return; }
    if (k === "-")              { e.preventDefault(); handleAction("font-"); return; }
    if (k === "c")              { e.preventDefault(); handleAction("contrast"); return; }
    if (k === "s")              { e.preventDefault(); handleAction("spacing"); return; }
    if (k === "0")              { e.preventDefault(); handleAction("reset"); return; }
  });

  // Expose une API minimale si besoin
  window.A11yUI = {
    getState: () => ({ ...state }),
    setState: (next) => { Object.assign(state, next); applyState(true); },
    reset: () => { Object.assign(state, defaults); applyState(true); },
  };
})();
