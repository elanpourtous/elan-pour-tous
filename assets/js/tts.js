/* Élan pour tous – TTS (Lecture à voix haute) */
(function(){
  const synth = window.speechSynthesis;
  if (!synth) return;

  const els = {
    play:   document.getElementById('tts-play'),
    pause:  document.getElementById('tts-pause'),
    resume: document.getElementById('tts-resume'),
    stop:   document.getElementById('tts-stop'),
    rate:   document.getElementById('tts-rate'),
    rateVal:document.getElementById('tts-rate-val'),
    voice:  document.getElementById('tts-voice'),
    live:   document.getElementById('tts-live'),
    main:   document.querySelector('main')
  };

  let utter = null;
  let voices = [];

  function say(msg){
    if (els.live){ els.live.textContent = ''; setTimeout(()=> els.live.textContent = msg, 30); }
  }

  function getTextToRead(){
    const sel = window.getSelection && window.getSelection().toString().trim();
    if (sel) return sel;
    return (els.main ? els.main.innerText : document.body.innerText || '').trim();
  }

  function loadVoices(){
    voices = synth.getVoices().sort((a,b) => a.name.localeCompare(b.name));
    els.voice.innerHTML = '';
    const pref = ['fr-FR','fr-CA','fr-BE','fr-CH'];
    voices.forEach((v,i) => {
      const opt = document.createElement('option');
      opt.value = String(i);
      opt.textContent = `${v.name} — ${v.lang}`;
      if (pref.some(p => v.lang.startsWith(p))) opt.selected = true;
      els.voice.appendChild(opt);
    });
  }
  loadVoices();
  if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined){
    speechSynthesis.onvoiceschanged = loadVoices;
  }

  function setButtons(state){
    // state: idle | speaking | paused
    if (state === 'speaking'){
      els.play.disabled = true;
      els.pause.disabled = false;
      els.resume.disabled = true;
      els.stop.disabled = false;
    } else if (state === 'paused'){
      els.play.disabled = true;
      els.pause.disabled = true;
      els.resume.disabled = false;
      els.stop.disabled = false;
    } else {
      els.play.disabled = false;
      els.pause.disabled = true;
      els.resume.disabled = true;
      els.stop.disabled = true;
    }
  }
  setButtons('idle');

  function play(){
    const text = getTextToRead();
    if (!text) return;
    if (synth.speaking) synth.cancel();

    utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'fr-FR';
    const rate = parseFloat(els.rate.value || '1');
    utter.rate = rate;

    const v = voices[parseInt(els.voice.value,10)];
    if (v) utter.voice = v;

    utter.onstart  = () => { setButtons('speaking'); say('Lecture démarrée'); };
    utter.onpause  = () => { setButtons('paused');   say('Lecture en pause'); };
    utter.onresume = () => { setButtons('speaking'); say('Reprise de la lecture'); };
    utter.onend    = () => { setButtons('idle');     say('Lecture terminée'); };
    utter.onerror  = () => { setButtons('idle');     say('Erreur de lecture'); };

    synth.speak(utter);
  }
  function pause(){ if (synth.speaking && !synth.paused){ synth.pause(); } }
  function resume(){ if (synth.paused){ synth.resume(); } }
  function stop(){ synth.cancel(); setButtons('idle'); say('Lecture arrêtée'); }

  // Événements UI
  els.play.addEventListener('click', play);
  els.pause.addEventListener('click', pause);
  els.resume.addEventListener('click', resume);
  els.stop.addEventListener('click', stop);

  els.rate.addEventListener('input', e => {
    const v = parseFloat(e.target.value||'1').toFixed(1);
    els.rateVal.textContent = `${v}×`;
    if (utter && synth.speaking && !synth.paused){
      // on coupe et relance à la nouvelle vitesse
      const wasSel = window.getSelection && window.getSelection().toString();
      stop(); setTimeout(play, 30);
    }
  });

  // Raccourcis : Alt+L / Alt+P / Alt+R / Alt+S
  document.addEventListener('keydown', e => {
    if (!e.altKey) return;
    const k = e.key.toLowerCase();
    if (k === 'l'){ e.preventDefault(); play(); }
    if (k === 'p'){ e.preventDefault(); pause(); }
    if (k === 'r'){ e.preventDefault(); resume(); }
    if (k === 's'){ e.preventDefault(); stop(); }
  });

  window.addEventListener('beforeunload', stop);
})();
