// assets/js/tts.js — Lecture vocale + sélection + “karaoké” + prefs (voix/vitesse)
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
  let queue = [];      // [{el: HTMLElement, text: string}]
  let index = 0;       // index dans la queue
  let locking = false; // anti double lancement

  function setState(playing) { [pauseBtn, resumeBtn, stopBtn].forEach(b => b && (b.disabled = !playing)); if (playBtn) playBtn.disabled = playing; }
  function say(msg){ if (live) live.textContent = msg; }

  // ------- Préférences
  function restorePrefs() {
    try {
      const p = JSON.parse(localStorage.getItem(LS_TTS) || '{}');
      if (p.rate && rate) { rate.value = String(p.rate); rateVal && (rateVal.textContent = `${parseFloat(p.rate).toFixed(1)}×`); }
      if (p.voice && voiceSel) voiceSel.value = p.voice;
    } catch {}
  }
  function savePrefs() {
    try {
      const p = { rate: rate ? parseFloat(rate.value || '1') : 1, voice: voiceSel ? voiceSel.value : '' };
      localStorage.setItem(LS_TTS, JSON.stringify(p));
    } catch {}
  }

  // ------- Racine & blocs lisibles
  function getMainRoot(){ return document.getElementById('contenu') || document.body; }
  function blocksFromMain() {
    const main = getMainRoot();
    const sel = 'h1,h2,h3,h4,h5,h6,p,li,blockquote,figcaption';
    const nodes = Array.from(main.querySelectorAll(sel))
      .filter(n => (n.innerText || '').trim().length > 0 && !n.closest('.tts-bar'));
    return nodes.map(el => ({ el, text: el.innerText.replace(/\s+/g, ' ').trim() }));
  }

  // ------- Sélection
  function getSelectionText(){ return (window.getSelection && window.getSelection().toString().trim()) || ''; }
  function getSelectionBlock() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    let node = sel.getRangeAt(0).commonAncestorContainer;
    if (node.nodeType !== 1) node = node.parentNode;
    while (node && node !== document && !/^(P|LI|BLOCKQUOTE|FIGCAPTION|H1|H2|H3|H4|H5|H6)$/.test(node.tagName)) node = node.parentNode;
    return node && node.tagName ? node : getMainRoot();
  }

  // ------- Karaoké (surlignage bloc courant)
  function highlight(el){ clearHighlight(); if (el?.classList){ el.classList.add('tts-current'); try{ el.scrollIntoView({behavior:'smooth', block:'center'});}catch{}} }
  function clearHighlight(){ document.querySelectorAll('.tts-current').forEach(n => n.classList.remove('tts-current')); }

  // ------- Voix
  function populateVoices() {
    if (!voiceSel) return;
    const voices = speechSynthesis.getVoices();
    voiceSel.innerHTML = '';
    voices
      .filter(v => v.lang.toLowerCase().startsWith('fr'))
      .concat(voices)
      .filter((v,i,a)=>a.indexOf(v)===i)
      .forEach(v => {
        const opt = document.createElement('option');
        opt.value = v.name; opt.textContent = `${v.name} (${v.lang})`;
        voiceSel.appendChild(opt);
      });
    restorePrefs();
  }

  // ------- Lecture bloc par bloc (queue)
  function speakQueue(startAt = 0) {
    if (locking) return;
    locking = true; index = startAt;

    const next = () => {
      if (index >= queue.length){ setState(false); say('Lecture terminée.'); clearHighlight(); locking = false; return; }
      const item = queue[index++];
      const u = new SpeechSynthesisUtterance(item.text || '');
      u.lang = 'fr-FR'; u.rate = parseFloat(rate?.value || '1');
      const chosen = Array.from(speechSynthesis.getVoices()).find(v => v.name === voiceSel?.value); if (chosen) u.voice = chosen;
      u.onstart = ()=>{ highlight(item.el); say('Lecture en cours…'); setState(true); savePrefs(); };
      u.onend   = ()=>{ clearHighlight(); setTimeout(next, 0); };
      u.onerror = ()=>{ clearHighlight(); setTimeout(next, 0); };
      speechSynthesis.speak(u);
    };
    next();
  }

  // ------- Contrôles globaux
  function onPlay() {
    const selText = getSelectionText();
    if (selText) {
      const el = getSelectionBlock();
      queue = [{ el, text: selText }];
      speakQueue(0);
      return;
    }
    queue = blocksFromMain();
    if (queue.length === 0) {
      const text = getMainRoot().innerText.replace(/\s+/g,' ').trim();
      queue = [{ el: getMainRoot(), text }];
    }
    speakQueue(0);
  }
  function onPause(){ speechSynthesis.pause(); say('Pause.'); }
  function onResume(){ speechSynthesis.resume(); say('Reprise.'); }
  function onStop(){ speechSynthesis.cancel(); setState(false); say('Lecture stoppée.'); clearHighlight(); locking=false; }

  // ------- Init / Fallback
  if (!hasTTS) {
    bar?.insertAdjacentHTML('beforeend','<span class="hint">🔇 La lecture vocale n’est pas disponible sur ce navigateur.</span>');
    [playBtn, pauseBtn, resumeBtn, stopBtn, rate, voiceSel].forEach(el => el && (el.disabled = true));
    return;
  }
  populateVoices();
  if (speechSynthesis.onvoiceschanged !== undefined) speechSynthesis.onvoiceschanged = populateVoices;

  // Événements
  playBtn?.addEventListener('click', onPlay);
  pauseBtn?.addEventListener('click', onPause);
  resumeBtn?.addEventListener('click', onResume);
  stopBtn?.addEventListener('click', onStop);

  rate?.addEventListener('input', ()=>{ rateVal && (rateVal.textContent = `${parseFloat(rate.value).toFixed(1)}×`); savePrefs(); });
  voiceSel?.addEventListener('change', savePrefs);

  // Raccourcis (Alt + L/P/R/S)
  document.addEventListener('keydown', (e)=>{
    if (!e.altKey) return;
    const k = e.key.toLowerCase();
    if (k==='l'){ e.preventDefault(); onPlay(); }
    if (k==='p'){ e.preventDefault(); onPause(); }
    if (k==='r'){ e.preventDefault(); onResume(); }
    if (k==='s'){ e.preventDefault(); onStop(); }
  });

  // Accessibilité de la barre
  if (bar) { bar.setAttribute('role','region'); bar.setAttribute('aria-label','Lecture à voix haute'); }
})();
