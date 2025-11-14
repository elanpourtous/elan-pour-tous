(function () {
  const toggleBtn = document.getElementById('chat-toggle');
  const panel = document.getElementById('chat-panel');
  const closeBtn = document.getElementById('chat-close');
  const messagesEl = document.getElementById('chat-messages');
  const form = document.getElementById('chat-form');
  const textarea = document.getElementById('chat-input-text');

  if (!toggleBtn || !panel || !messagesEl || !form || !textarea) return;

  function openChat() {
    panel.hidden = false;
    toggleBtn.setAttribute('aria-expanded', 'true');
    textarea.focus();
  }

  function closeChat() {
    panel.hidden = true;
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.focus();
  }

  function autoResizeTextarea() {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addMessage(text, side) {
    const div = document.createElement('div');
    div.className = 'chat-message ' +
      (side === 'user' ? 'chat-message--user' : 'chat-message--bot');
    div.textContent = text;
    messagesEl.appendChild(div);
    scrollToBottom();
  }

  function showTyping() {
    const wrapper = document.createElement('div');
    wrapper.className = 'chat-message chat-message--bot';

    const typing = document.createElement('div');
    typing.className = 'chat-typing';

    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('span');
      dot.className = 'chat-typing-dot';
      typing.appendChild(dot);
    }

    const label = document.createElement('span');
    label.className = 'chat-typing-label';
    label.textContent = 'Tom écrit…';
    typing.appendChild(label);

    wrapper.appendChild(typing);
    messagesEl.appendChild(wrapper);
    scrollToBottom();

    return wrapper;
  }

  function handleBotReply(userText) {
    const typingBubble = showTyping();

    setTimeout(() => {
      typingBubble.remove();

      const reply =
        "Merci pour ton message : « " +
        userText +
        " ». Je peux t’aider à clarifier ton objectif, organiser tes étapes " +
        "et proposer des outils accessibles (dictée vocale, lecteurs d’écran, etc.).";

      addMessage(reply, 'bot');
    }, 900);
  }

  // ==== Events ====
  toggleBtn.addEventListener('click', () => {
    if (panel.hidden) {
      openChat();
    } else {
      closeChat();
    }
  });

  closeBtn.addEventListener('click', closeChat);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) {
      closeChat();
    }
  });

  textarea.addEventListener('input', autoResizeTextarea);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = textarea.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    textarea.value = '';
    autoResizeTextarea();
    handleBotReply(text);
  });

  // Ouverture clavier : Alt + M
  document.addEventListener('keydown', (e) => {
    if (e.altKey && (e.key === 'm' || e.key === 'M')) {
      e.preventDefault();
      if (panel.hidden) {
        openChat();
      } else {
        closeChat();
      }
    }
  });
})();
