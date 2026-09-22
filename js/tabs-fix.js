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
    if (tab === "chats" || tab === "friends") {
      const m = document.getElementById("punter-map");
      if (m) m.classList.add("chat-map");
      if (tab === "chats" && !document.getElementById("lounge-note")) {
        const note = document.createElement("div");
        note.id = "lounge-note";
        note.className = "card";
        note.style.marginBottom = "14px";
        const plus = ((document.getElementById("who") || {}).textContent || "").indexOf("Plus") >= 0;
        note.innerHTML = "<h3>Game lounges</h3>" +
          "<p class=\"body\">Each match lounge opens <b>90 minutes before bounce-down</b>. Chat the table, find a seat, then watch together.</p>" +
          (plus
            ? "<p class=\"muted\">Plus: lounges stay open anytime \u2014 before, during, after. Friends list and standing crews are unlocked.</p>"
            : "<p class=\"muted\">Free: lounge opens 90 minutes before the game. Plus ($15/mo) can chat anytime, open friends, and join standing crews.</p>");
        const rooms = [...document.querySelectorAll("#main h2")].find((h) => /rooms/i.test(h.textContent));
        const main = document.getElementById("main");
        if (rooms) main.insertBefore(note, rooms);
        else if (m && m.nextSibling) main.insertBefore(note, m.nextSibling);
        else main.appendChild(note);
      }
    }
  };
})();
