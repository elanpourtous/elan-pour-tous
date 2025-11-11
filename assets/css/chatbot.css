/* ---------- Container & bouton flottant ---------- */
.ept-chat {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 1200;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
}

.ept-chat__fab{
  background:#0b8457;
  color:#fff;
  border:none;
  border-radius:50%;
  width:3rem;height:3rem;
  font-size:1.5rem;
  cursor:pointer;
  box-shadow:0 6px 16px rgba(0,0,0,.2);
}
.ept-chat__fab:focus-visible{
  outline:3px solid var(--focus,#94c5ff);
  outline-offset:2px;
}

/* ---------- Boîte de dialogue ---------- */
.ept-chat__dialog{
  position:fixed;
  bottom:5rem; right:1rem;
  width:320px; max-height:520px;
  background:#fff; color:#111;
  border:1px solid #d6d6d6;
  border-radius:.75rem;
  box-shadow:0 10px 24px rgba(0,0,0,.2);
  display:flex; flex-direction:column;
}
[data-theme="dark"] .ept-chat__dialog{ background:#1b1b1b; color:#eee; border-color:#333; }

.ept-chat__header{
  background:#0b8457; color:#fff;
  padding:.5rem .75rem;
  display:flex; align-items:center; justify-content:space-between;
  border-radius:.75rem .75rem 0 0;
}
.ept-chat__close{
  background:transparent; color:#fff; border:none; font-size:1.1rem; cursor:pointer;
}
.ept-chat__close:focus-visible{
  outline:3px solid var(--focus,#94c5ff); outline-offset:2px;
}

/* ---------- Log ---------- */
.ept-chat__log{
  padding:.75rem;
  overflow:auto;
  gap:.5rem;
  display:flex; flex-direction:column;
}

/* Bulles */
.msg{ max-width:85%; padding:.5rem .65rem; border-radius:.6rem; line-height:1.35; }
.msg--user{ align-self:flex-end; background:#e7fff3; border:1px solid #bfead3; }
.msg--bot { align-self:flex-start; background:#f6f6f6; border:1px solid #e2e2e2; }
[data-theme="dark"] .msg--user{ background:#0f3; color:#053; }
[data-theme="dark"] .msg--bot { background:#2a2a2a; border-color:#3a3a3a; }

/* Tapotement / typing */
.msg--typing{ display:inline-flex; gap:.25rem; }
.typing-dot{
  width:.4rem; height:.4rem; border-radius:999px; background:#888; opacity:.4;
  animation:blink 1s infinite;
}
.typing-dot:nth-child(2){ animation-delay:.2s }
.typing-dot:nth-child(3){ animation-delay:.4s }
@keyframes blink{ 0%,100%{opacity:.2} 50%{opacity:1} }

/* ---------- Formulaire ---------- */
.ept-chat__form{ display:flex; border-top:1px solid #ddd; }
.ept-chat__form input{
  flex:1; border:none; padding:.6rem .7rem;
  background:transparent; color:inherit;
}
.ept-chat__form button{
  background:#0b8457; color:#fff; border:none;
  padding:.55rem .9rem; cursor:pointer;
}
.ept-chat__form button:disabled{ opacity:.6; cursor:not-allowed; }

/* Astuce */
.ept-chat__hint{
  margin:0; padding:.5rem .75rem; font-size:.8rem; color:#555;
  border-top:1px solid #eee;
}
[data-theme="dark"] .ept-chat__hint{ color:#bbb; border-top-color:#333; }

/* Accessibilité util. lecteurs d’écran */
.sr-only{
  position:absolute!important; width:1px;height:1px; padding:0;margin:-1px; overflow:hidden;
  clip:rect(0,0,0,0); white-space:nowrap;border:0;
}