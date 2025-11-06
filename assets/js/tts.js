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
// assets/js/tts.js — Lecture vocale + “karaoké” (surlignage paragraphe courant)
(function () {
  if (window._ttsInit) return;
  window._ttsInit = true;

  const LS_TTS = 'ttsPrefs';
  const hasTTS = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

  // UI
  const playBtn   = document.getElementById('tts-play');
  const pauseBtn  = document.getElementById('tts-pause');
  const resumeBtn = document.getElementById('tts-resume');
  const stopBtn   = document.getElementById('tts-stop');
  const rate      = document.getElementById('tts-rate');
  const rateVal   = document.getElementById('tts-rate-val');
  const voiceSel  = document.getElementById('tts-voice');
  const live      = document.getElementById('tts-live');
  const bar       = document.querySelector('.tts-bar');

  // État TTS
  let queue = [];           // [{el: HTMLElement, text: string}]
  let index = 0;            // index courant dans la queue
  let mode  = 'auto';       // 'auto' (page) | 'selection' (un seul bloc/texte)
  let locking = false;      // évite double déclenchements
  let currentUtterance = null;

  function setState(playing) {
    [pauseBtn, resumeBtn, stopBtn].forEach(b => b && (b.disabled = !playing));
    if (playBtn) playBtn.disabled = playing;
  }
  function say(msg){ if (live) live.textContent = msg; }

  // -------- Préférences voix / vitesse
  function restorePrefs() {
    try {
      const p = JSON.parse(localStorage.getItem(LS_TTS) || '{}');
      if (p.rate && rate) {
        rate.value = String(p.rate);
        if (rateVal) rateVal.textContent = `${parseFloat(p.rate).toFixed(1)}×`;
      }
      if (p.voice && voiceSel) voiceSel.value = p.voice;
    } catch {}
  }
  function savePrefs() {
    try {
      const p = { rate: rate ? parseFloat(rate.value || '1') : 1, voice: voiceSel ? voiceSel.value : '' };
      localStorage.setItem(LS_TTS, JSON.stringify(p));
    } catch {}
  }

  // -------- Collecte des blocs lisibles (page)
  function getMainRoot() {
    return document.getElementById('contenu') || document.body;
  }
  function blocksFromMain() {
    const main = getMainRoot();
    // Sélection de blocs “lisibles” : titres, paragraphes, listes, citations, légendes
    const sel = 'h1,h2,h3,h4,h5,h6,p,li,blockquote,figcaption';
    const nodes = Array.from(main.querySelectorAll(sel))
      .filter(n => (n.innerText || '').trim().length > 0 && !n.closest('.tts-bar'));
    return nodes.map(el => ({ el, text: el.innerText.replace(/\s+/g, ' ').trim() }));
  }

  // -------- Gestion de la sélection
  function getSelectionText() {
    if (!window.getSelection) return '';
    const s = window.getSelection().toString().trim();
    return s || '';
  }
  function getSelectionBlock() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    let node = sel.getRangeAt(0).commonAncestorContainer;
    if (node.nodeType !== 1) node = node.parentNode;
    // Remonte au bloc lisible le plus proche
    while (node && node !== document && !/^(P|LI|BLOCKQUOTE|FIGCAPTION|H1|H2|H3|H4|H5|H6)$/.test(node.tagName)) {
      node = node.parentNode;
    }
    return node && node.tagName ? node : getMainRoot();
  }

  // -------- Mise en surbrillance
  function highlight(el) {
    clearHighlight();
    if (el && el.classList) {
      el.classList.add('tts-current');
      // Scroll doux vers le bloc courant
      try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch {}
    }
  }
  function clearHighlight() {
    document.querySelectorAll('.tts-current').forEach(n => n.classList.remove('tts-current'));
  }

  // -------- Synthèse
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
    restorePrefs();
  }

  function speakText(text, elForHighlight) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text || 'Aucun contenu à lire.');
    u.lang = 'fr-FR';
    u.rate = parseFloat(rate?.value || '1');
    const chosen = Array.from(speechSynthesis.getVoices()).find(v => v.name === voiceSel?.value);
    if (chosen) u.voice = chosen;

    u.onstart = () => { highlight(elForHighlight); say('Lecture en cours…'); setState(true); savePrefs(); };
    u.onend   = () => { setState(false); say('Lecture terminée.'); clearHighlight(); };
    u.onerror = () => { setState(false); say('Erreur de lecture.'); clearHighlight(); };

    currentUtterance = u;
    window.speechSynthesis.speak(u);
  }

  function speakQueue(startAt = 0) {
    if (locking) return;
    locking = true;
    index = startAt;

    function next() {
      if (index >= queue.length) { setState(false); say('Lecture terminée.'); clearHighlight(); locking = false; return; }
      const item = queue[index++];
      const u = new SpeechSynthesisUtterance(item.text || '');
      u.lang = 'fr-FR';
      u.rate = parseFloat(rate?.value || '1');
      const chosen = Array.from(speechSynthesis.getVoices()).find(v => v.name === voiceSel?.value);
      if (chosen) u.voice = chosen;

      u.onstart = () => { highlight(item.el); say('Lecture en cours…'); setState(true); savePrefs(); };
      u.onend   = () => { clearHighlight(); setTimeout(next, 0); };
      u.onerror = () => { clearHighlight(); setTimeout(next, 0); };

      currentUtterance = u;
      window.speechSynthesis.speak(u);
    }
    next();
  }

  // -------- Contrôles
  function onPlay() {
    const sel = getSelectionText();
    if (sel) {
      mode = 'selection';
      const el = getSelectionBlock();
      queue = [{ el, text: sel }];
      speakQueue(0);
      return;
    }
    mode = 'auto';
    queue = blocksFromMain();
    if (queue.length === 0) { speakText(getMainRoot().innerText.trim(), getMainRoot()); return; }
    speakQueue(0);
  }

  function onPause()  { speechSynthesis.pause();  say('Pause.'); }
  function onResume() { speechSynthesis.resume(); say('Reprise.'); }
  function onStop()   { speechSynthesis.cancel(); setState(false); say('Lecture stoppée.'); clearHighlight(); locking = false; }

  // -------- Init / Fallback
  if (!hasTTS) {
    if (bar) bar.insertAdjacentHTML('beforeend','<span class="hint">🔇 La lecture vocale n’est pas disponible sur ce navigateur.</span>');
    [playBtn, pauseBtn, resumeBtn, stopBtn, rate, voiceSel].forEach(el => el && (el.disabled = true));
    return;
  }
  populateVoices();
  if (speechSynthesis.onvoiceschanged !== undefined) speechSynthesis.onvoiceschanged = populateVoices;

  // Boutons
  playBtn?.addEventListener('click', onPlay);
  pauseBtn?.addEventListener('click', onPause);
  resumeBtn?.addEventListener('click', onResume);
  stopBtn?.addEventListener('click', onStop);

  // Réglages
  rate?.addEventListener('input', () => { if (rateVal) rateVal.textContent = `${parseFloat(rate.value).toFixed(1)}×`; savePrefs(); });
  voiceSel?.addEventListener('change', savePrefs);

  // Raccourcis (Alt + L/P/R/S)
  document.addEventListener('keydown', (e) => {
    if (!e.altKey) return;
    const k = e.key.toLowerCase();
    if (k === 'l') { e.preventDefault(); onPlay(); }
    if (k === 'p') { e.preventDefault(); onPause(); }
    if (k === 'r') { e.preventDefault(); onResume(); }
    if (k === 's') { e.preventDefault(); onStop(); }
  });

  // Accessibilité de la barre
  if (bar) { bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'Lecture à voix haute'); }
})();
