(function () {
  const API_URL = "https://elan-bot.onrender.com/chat"; // ⬅️ remplace par ton URL Render

  const $ = (s, c = document) => c.querySelector(s);
  const chat = $("#ept-chat");
  if (!chat) return;

  const fab   = $("#ept-chat-toggle");
  const panel = $("#ept-chat-dialog");
  const close = $("#ept-chat-close");
  const log   = $("#ept-chat-log");
  const form  = $("#ept-chat-form");
  const input = $("#ept-chat-input");

  // Accessibilité: ouvrir/fermer
  function open() {
    panel.hidden = false;
    fab.setAttribute("aria-expanded", "true");
    setTimeout(() => input?.focus(), 0);
  }
  function closePanel() {
    panel.hidden = true;
    fab.setAttribute("aria-expanded", "false");
    fab.focus();
  }

  fab?.addEventListener("click", () => panel.hidden ? open() : closePanel());
  close?.addEventListener("click", closePanel);

  // Raccourci Alt+M
  document.addEventListener("keydown", (e) => {
    if (e.altKey && (e.key.toLowerCase() === "m")) {
      e.preventDefault();
      panel.hidden ? open() : closePanel();
    }
    if (e.key === "Escape" && !panel.hidden) {
      e.preventDefault(); closePanel();
    }
  });

  // Utilitaires
  function addMsg(text, who = "bot") {
    const div = document.createElement("div");
    div.className = "ept-chat__msg " + (who === "user" ? "ept-chat__msg--user" : "ept-chat__msg--bot");
    div.textContent = text;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }

  // Soumission
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = (input.value || "").trim();
    if (!msg) return;
    addMsg(msg, "user");
    input.value = "";
    input.disabled = true;

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ message: msg })
      });
      if (!res.ok) throw new Error("Réponse serveur invalide");
      const data = await res.json();
      addMsg(data.reply || "Je n’ai pas bien compris, peux-tu reformuler ?");
    } catch (err) {
      addMsg("⚠️ Impossible de joindre l’assistant. Réessaie plus tard.");
      console.error(err);
    } finally {
      input.disabled = false;
      input.focus();
    }
  });

  // Message d’accueil
  addMsg("Bonjour 👋 Je suis l’assistant Élan pour tous. Je peux vous orienter : formations, tests de compétences, accessibilité en entreprise… Posez-moi votre question !");
})();
