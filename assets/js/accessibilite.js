/*
  Élan pour tous — Accessibilité visuelle
  RGAA 4.1 : tailles, contrastes, espacement, persistance
*/

(function(){
  const root = document.documentElement;
  const STORAGE_KEY = "accessibilitySettings";
  const buttons = document.querySelectorAll(".access-btn");

  const settings = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
    fontSize: 100,
    contrast: false,
    spacing: false
  };

  applySettings();

  function applySettings(){
    root.style.fontSize = settings.fontSize + "%";
    root.classList.toggle("high-contrast", settings.contrast);
    root.classList.toggle("large-spacing", settings.spacing);
  }

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.action;
      if(action === "font+") settings.fontSize = Math.min(settings.fontSize + 10, 180);
      if(action === "font-") settings.fontSize = Math.max(settings.fontSize - 10, 80);
      if(action === "contrast") settings.contrast = !settings.contrast;
      if(action === "spacing") settings.spacing = !settings.spacing;
      if(action === "reset") {
        settings.fontSize = 100;
        settings.contrast = false;
        settings.spacing = false;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      applySettings();
    });
  });
})();
