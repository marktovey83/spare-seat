(function () {
  const orig = window.showPunter;
  if (!orig) return;
  window.showPunter = function (tab) {
    orig(tab);
    if (tab === "tonight" || tab === "today" || tab === "me") {
      const m = document.getElementById("punter-map");
      if (m) m.remove();
      return;
    }
    if (tab === "chats" && typeof window.renderChats === "function") {
      window.renderChats();
      const m = document.getElementById("punter-map");
      if (m) m.classList.add("chat-map");
      return;
    }
    if (tab === "friends") {
      const plus = ((document.getElementById("who") || {}).textContent || "").indexOf("Plus") >= 0;
      const m = document.getElementById("punter-map");
      if (!plus && m) m.remove();
      if (plus && m) m.classList.add("chat-map");
    }
  };
})();
