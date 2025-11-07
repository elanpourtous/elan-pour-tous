(function(){
  const f = document.getElementById('pc-form');
  if(!f) return;

  f.addEventListener('submit', () => {
    const data = new FormData(f);
    const profil = (data.get('profil') || '').toString();
    const note   = (data.get('note')   || '').toString().trim();

    const subject =
      profil === 'entreprise'
        ? 'Entreprise — formations / suivi salariés en situation de handicap'
        : 'Demandeur d’emploi — test de compétences';

    f.querySelector('#pc-subject').value = subject;
    try {
      sessionStorage.setItem('prefill_subject', subject);
      sessionStorage.setItem('prefill_note', note);
    } catch(_) {}
  });
})();
