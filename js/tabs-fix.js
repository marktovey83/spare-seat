(function () {
  function dedupe() {
    const nav = document.getElementById('nav-punter');
    if (!nav) return;
    const seen = {};
    [].forEach.call(nav.querySelectorAll('button'), function (b) {
      const k = b.dataset.tab || (b.textContent || '').trim().toLowerCase();
      if (seen[k]) b.remove();
      else seen[k] = true;
    });
  }
  const orig = window.showPunter;
  if (!orig) return;
  window.showPunter = function (tab) {
    dedupe();
    orig(tab);
    if (tab === 'tonight' || tab === 'today' || tab === 'me') {
      const m = document.getElementById('punter-map');
      if (m) m.remove();
      return;
    }
    if (tab === 'chats' && typeof window.renderChats === 'function') {
      window.renderChats();
      const m = document.getElementById('punter-map');
      if (m) m.classList.add('chat-map');
      return;
    }
    if (tab === 'friends') {
      const plus = ((document.getElementById('who') || {}).textContent || '').indexOf('Plus') >= 0;
      const m = document.getElementById('punter-map');
      if (!plus && m) m.remove();
      if (plus && m) m.classList.add('chat-map');
    }
  };
  document.addEventListener('DOMContentLoaded', dedupe);
  setTimeout(dedupe, 400);
})();
