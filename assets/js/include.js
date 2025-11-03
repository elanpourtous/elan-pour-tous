// assets/js/include.js
function includeInto(id, url) {
  return fetch(url, { cache: "no-store" })
    .then(r => { if (!r.ok) throw new Error(url + " introuvable"); return r.text(); })
    .then(html => { document.getElementById(id).innerHTML = html; });
}

Promise.all([
  includeInto("header-placeholder", "assets/header.html"),
  includeInto("footer-placeholder", "assets/footer.html")
]).then(() => {
  const scripts = [
    "assets/js/main.js",
    "assets/js/accessibilite.js",
    "assets/js/tts.js"
  ];
  for (const src of scripts) {
    const s = document.createElement("script");
    s.src = src; s.defer = true;
    document.body.appendChild(s);
  }
}).catch(err => console.error("Erreur d’inclusion :", err));
