/*
  Élan pour tous — Lecture vocale (TTS)
  Compatible RGAA 4.1 / WCAG 2.2 AA
  Utilise l’API SpeechSynthesis du navigateur
*/

(function () {
  if (!("speechSynthesis" in window)) {
    console.warn("Synthèse vocale non supportée sur ce navigateur.");
    return;
  }

  const synth = window.speechSynthesis;
  const ttsBar = document.querySelector(".tts-bar");
  const toggleBtn = document.getElementById("tts-toggle");
  const playBtn = document.getElementById("tts-play");
  const pauseBtn = document.getElementById("tts-pause");
  const resumeBtn = document.getElementById("tts-resume");
  const stopBtn = document.getElementById("tts-stop");
  const rateInput = document.getElementById("tts-rate");
  const rateVal = document.getElementById("tts-rate-val");
  const voiceSelect = document.getElementById("tts-voice");
  const live = document.getElementById("tts-live");

  let currentUtterance = null;
  let voices = [];

  function loadVoices() {
    voices = synth.getVoices();
    if (!voiceSelect) return;
    voiceSelect.innerHTML = "";

    voices.forEach((v, i) => {
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = `${v.name} (${v.lang})`;
      if (v.lang.startsWith("fr")) opt.selected = true;
      voiceSelect.appendChild(opt);
    });
  }

  synth.onvoiceschanged = loadVoices;
  loadVoices();

  if (toggleBtn && ttsBar) {
    toggleBtn.addEventListener("click", () => {
      const isVisible = !ttsBar.hasAttribute("hidden");
      if (isVisible) {
        ttsBar.setAttribute("hidden", "");
        toggleBtn.setAttribute("aria-pressed", "false");
        speakAnnounce("Lecture vocale fermée.");
      } else {
        ttsBar.removeAttribute("hidden");
        toggleBtn.setAttribute("aria-pressed", "true");
        speakAnnounce("Lecture vocale activée.");
      }
    });
  }

  function playText() {
    if (synth.speaking) synth.cancel();

    const main = document.querySelector("main");
    if (!main) return alert("Aucun contenu principal trouvé à lire.");

    const text = main.innerText.trim();
    if (!text) return alert("Le contenu est vide.");

    currentUtterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = voices[voiceSelect.value] || voices.find(v => v.lang.startsWith("fr"));
    if (selectedVoice) currentUtterance.voice = selectedVoice;

    currentUtterance.rate = parseFloat(rateInput.value);
    currentUtterance.pitch = 1;
    currentUtterance.lang = currentUtterance.voice?.lang || "fr-FR";

    currentUtterance.onstart = () => updateStatus("Lecture en cours…");
    currentUtterance.onend = () => {
      updateStatus("Lecture terminée.");
      disableButtons(true, false, true, true);
    };

    synth.speak(currentUtterance);
    disableButtons(false, false, false, false);
  }

  function pauseText() {
    if (synth.speaking && !synth.paused) {
      synth.pause();
      updateStatus("Lecture mise en pause.");
      disableButtons(true, true, false, false);
    }
  }

  function resumeText() {
    if (synth.paused) {
      synth.resume();
      updateStatus("Lecture reprise.");
      disableButtons(false, false, false, false);
    }
  }

  function stopText() {
    synth.cancel();
    updateStatus("Lecture arrêtée.");
    disableButtons(true, false, true, true);
  }

  function updateStatus(msg) {
    if (live) live.textContent = msg;
    else console.log("TTS:", msg);
  }

  function speakAnnounce(msg) {
    const u = new SpeechSynthesisUtterance(msg);
    u.lang = "fr-FR";
    u.rate = 1.1;
    u.volume = 0.8;
    synth.speak(u);
  }

  if (rateInput) {
    rateInput.addEventListener("input", e => {
      rateVal.textContent = e.target.value + "×";
    });
  }

  function disableButtons(play, pause, resume, stop) {
    if (playBtn) playBtn.disabled = play;
    if (pauseBtn) pauseBtn.disabled = pause;
    if (resumeBtn) resumeBtn.disabled = resume;
    if (stopBtn) stopBtn.disabled = stop;
  }

  if (playBtn) playBtn.addEventListener("click", playText);
  if (pauseBtn) pauseBtn.addEventListener("click", pauseText);
  if (resumeBtn) resumeBtn.addEventListener("click", resumeText);
  if (stopBtn) stopBtn.addEventListener("click", stopText);

  document.addEventListener("keydown", e => {
    if (!ttsBar || ttsBar.hasAttribute("hidden")) return;
    if (e.altKey && e.code === "KeyL") playText();
    if (e.altKey && e.code === "KeyP") pauseText();
    if (e.altKey && e.code === "KeyR") resumeText();
    if (e.altKey && e.code === "KeyS") stopText();
  });
})();
