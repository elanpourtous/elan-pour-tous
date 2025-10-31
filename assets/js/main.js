/*
  Élan pour tous — Accessibilité : menu mobile + thème clair/sombre + annonces vocales
  RGAA 4.1 / WCAG 2.2 AA compliant
*/

(function(){
  const STORAGE_KEY = "theme";
  const root = document.documentElement;
  const btnTheme = document.querySelector("[data-theme-toggle]");
  const btnMenu = document.querySelector(".menu-toggle");
  const nav = document.getElementById("primary-nav");

  // Zone d’annonce (lecteurs d’écran)
  const liveRegion = document.createElement("div");
  liveRegion.setAttribute("aria-live", "polite");
  liveRegion.setAttribute("role", "status");
  liveRegion.className = "visually-hidden";
  document.body.appendChild(liveRegion);

  // Thème clair/sombre
  const saved = localStorage.getItem(STORAGE_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const startTheme = saved || (prefersDark ? "dark" : "light");
  setTheme(startTheme, false);

  function setTheme(mode, announce = true){
    root.setAttribute("data-theme", mode);
    localStorage.setItem(STORAGE_KEY, mode);
    if(btnTheme){
      btnTheme.setAttribute("aria-pressed", mode === "dark");
      btnTheme.title = mode === "dark" ? "Passer en mode clair" : "Passer en mode sombre";
    }
    if(announce){
      liveRegion.textContent = mode === "dark" ? "Mode sombre activé" : "Mode clair activé";
    }
  }

  btnTheme && btnTheme.addEventListener("click", () => {
    const mode = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    setTheme(mode);
  });

  // Menu mobile
  function closeMenu(announce = true){
    nav.classList.remove("is-open");
    btnMenu.setAttribute("aria-expanded","false");
    if(announce) liveRegion.textContent = "Menu fermé";
  }
  function openMenu(announce = true){
    nav.classList.add("is-open");
    btnMenu.setAttribute("aria-expanded","true");
    if(announce) liveRegion.textContent = "Menu ouvert";
  }

  btnMenu && btnMenu.addEventListener("click", () => {
    const expanded = btnMenu.getAttribute("aria-expanded") === "true";
    expanded ? closeMenu() : openMenu();
  });

  document.addEventListener("keydown", e => {
    if(e.key === "Escape" && nav.classList.contains("is-open")) closeMenu();
  });

  nav && nav.addEventListener("click", e => {
    if(e.target.closest("a")) closeMenu(false);
  });
})();
