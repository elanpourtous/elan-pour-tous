// tts.js — initialisation simple de la barre TTS globale (si présente dans footer.html)
(function () {
  if (window._ttsInit) return;
  window._ttsInit = true;

  const hasTTS = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  const playBtn = document.getElementById('tts-play');
  const pauseBtn = document.getElementById('tts-pause');
  const resumeBtn = document.getElementById('tts-resume');
  const stopBtn = document.getElementById('tts-stop');
  const rate = document.getElementById('tts-rate');
  const rateVal = document.getElementById('tts-rate-val');
  const voiceSel = document.getElementById('tts-voice');
  const live = document.getElementById('tts-live');
  const bar = document.querySelector('.tts-bar');

  function setState(playing) {
    if (!pauseBtn || !resumeBtn || !stopBtn || !playBtn) return;
    pauseBtn.disabled = !playing;
    resumeBtn.disabled = !playing;
    stopBtn.disabled = !playing;
    playBtn.disabled = playing;
  }
  function getText() {
    const main = document.getElementById('contenu') || document.body;
    const clone = main.cloneNode(true);
    clone.querySelectorAll('.tts-bar, script, style').forEach(n => n.remove());
    return clone.innerText.replace(/\s+/g, ' ').trim();
  }
  function populateVoices() {
    if (!voiceSel) return;
    const voices = speechSynthesis.getVoices();
    voiceSel.innerHTML = '';
    voices
      .filter(v => v.lang.toLowerCase().startsWith('fr'))
      .concat(voices)
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .forEach(v => {
        const opt = document.createElement('option');
        opt.value = v.name;
        opt.textContent = `${v.name} (${v.lang})`;
        voiceSel.appendChild(opt);
      });
  }
  function speak(text) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text || 'Aucun contenu à lire.');
    u.lang = 'fr-FR';
    u.rate = parseFloat(rate?.value || '1');
    const chosen = Array.from(speechSynthesis.getVoices()).find(v => v.name === voiceSel?.value);
    if (chosen) u.voice = chosen;
    u.onend = () => { setState(false); if(live) live.textContent = 'Lecture terminée.'; };
    u.onerror = () => { setState(false); if(live) live.textContent = 'Erreur de lecture.'; };
    window.speechSynthesis.speak(u);
    if(live) live.textContent = 'Lecture en cours…';
    setState(true);
  }

  if (!hasTTS) {
    if (bar) bar.insertAdjacentHTML('beforeend','<span class="hint">La lecture vocale n’est pas disponible sur ce navigateur.</span>');
    [playBtn, pauseBtn, resumeBtn, stopBtn, rate, voiceSel].forEach(el => el && (el.disabled = true));
    return;
  }

  populateVoices();
  if (speechSynthesis.onvoiceschanged !== undefined) { speechSynthesis.onvoiceschanged = populateVoices; }

  playBtn?.addEventListener('click', () => speak(getText()));
  pauseBtn?.addEventListener('click', () => { speechSynthesis.pause(); if(live) live.textContent = 'Pause.'; });
  resumeBtn?.addEventListener('click', () => { speechSynthesis.resume(); if(live) live.textContent = 'Reprise.'; });
  stopBtn?.addEventListener('click', () => { speechSynthesis.cancel(); setState(false); if(live) live.textContent = 'Lecture stoppée.'; });

  rate?.addEventListener('input', () => { if (rateVal) rateVal.textContent = `${parseFloat(rate.value).toFixed(1)}×`; });

  document.addEventListener('keydown', (e) => {
    if (!e.altKey) return;
    const k = e.key.toLowerCase();
    if (k === 'l') { e.preventDefault(); speak(getText()); }
    if (k === 'p') { e.preventDefault(); speechSynthesis.pause(); }
    if (k === 'r') { e.preventDefault(); speechSynthesis.resume(); }
    if (k === 's') { e.preventDefault(); speechSynthesis.cancel(); setState(false); }
  });
})();
