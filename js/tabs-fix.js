(function () {
  const orig = window.showPunter;
  if (!orig) return;
  window.showPunter = function (tab) {
    orig(tab);
    if (tab === "tonight" || tab === "today" || tab === "friends" || tab === "me") {
      const m = document.getElementById("punter-map");
      if (m) m.remove();
    }
  };
})();
