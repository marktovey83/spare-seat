(function () {
  const SEED_MSGS = [
    { name: "Dave", text: "Heading to Freo Hotel. Who's got a spare seat?" },
    { name: "Sarah", text: "I'm Cats — already at Local if anyone's south." },
    { name: "Mick", text: "Pub table near the screen. Be there 5." }
  ];
  function openFixture() {
    return (window.SEED && SEED.fixtures[0]) || { id: "f1", label: "Dockers vs Cats", start: "Tonight 6:10pm AWST", sport: "AFL" };
  }
  window.openDm = function (id, name) {
    const self = (typeof me === "function" && me()) || {};
    const key = "dm:" + [self.id || "me", id].sort().join("-");
    if (typeof openRoom === "function") openRoom(key, "Chat with " + name);
    const room = document.getElementById("room");
    if (room) room.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  function peopleNear() {
    const self = typeof me === "function" ? me() : null;
    return (SEED.people || []).filter((p) => !self || p.id !== self.id);
  }
  function loungeHtml() {
    const plus = typeof isPlus === "function" && isPlus();
    const f = openFixture();
    const pubs = (SEED.venues || []).filter((v) => (v.showing || []).includes(f.id));
    const people = peopleNear();
    const msgs = SEED_MSGS.map((m) => "<div class=\"msg\"><b>" + m.name + "</b> " + m.text + "</div>").join("");
    const dms = people.map((p) => "<div class=\"item\"><h3>" + p.name + "</h3><p class=\"muted\">" + ((p.clubs && p.clubs.AFL) || "") + "</p><button class=\"btn ghost\" onclick=\"openDm('" + p.id + "','" + p.name + "')\">Message</button></div>").join("");
    if (!plus) {
      return '<div class="eyebrow">Chat \u00b7 Free</div><h2>' + f.label + '</h2>' +
        '<p class="body">Lounge window is open (90 min before bounce-down). Free is one-to-one only.</p>' +
        '<p class="muted">This 10 km map is the only map on Free. Group lounges and team rooms are Plus.</p>' +
        '<div id="punter-map" class="chat-map free"></div>' +
        '<h2>Message one person</h2><div class="list">' + dms + '</div>' +
        '<div class="card"><div class="pill">Plus</div><h3>Match lounge + team chats</h3>' +
        '<p class="body">Plus opens the group room, Dockers chat, Cats chat, and pub tables.</p>' +
        '<button class="btn" onclick="buyPlus()">Get Plus \u2014 $15 / month</button></div><div id="room"></div>';
    }
    return '<div class="eyebrow">Lounge \u00b7 Plus</div><h2>' + f.label + '</h2>' +
      '<p class="body">' + f.sport + ' \u00b7 ' + f.start + ' \u00b7 group lounge + team rooms</p>' +
      '<p class="muted">Opened 90 minutes before bounce-down. Plus stays open after the siren.</p>' +
      '<div id="punter-map" class="chat-map plus"></div>' +
      '<div class="card"><div class="pill">OPEN NOW</div><h3>Match lounge</h3>' +
      '<p class="muted">' + people.map((p) => p.name).join(' \u00b7 ') + ' in the room</p>' +
      '<div class="chat" id="chatbox">' + msgs + '</div>' +
      '<div class="row"><input id="chat-in" placeholder="Talk the game — no stakes" />' +
      '<button class="btn" onclick="sendMsg(\'match:' + f.id + '\')">Send</button></div></div>' +
      '<h2>Team chats</h2><div class="list">' +
      '<div class="item"><h3>Dockers room</h3><p class="muted">Same-club chat</p><button class="btn ghost" onclick="openRoom(\'team:dockers\',\'Dockers room\')">Open</button></div>' +
      '<div class="item"><h3>Cats room</h3><p class="muted">Same-club chat</p><button class="btn ghost" onclick="openRoom(\'team:cats\',\'Cats room\')">Open</button></div></div>' +
      '<h2>One-to-one</h2><div class="list">' + dms + '</div>' +
      '<h2>Pub tables</h2><div class="list">' +
      pubs.map((v) => '<div class="item"><h3>' + v.name + '</h3><p class="muted">' + v.deal + '</p><button class="btn ghost" onclick="openRoom(\'pub:' + v.id + '\',\'' + v.name + ' table\')">Open table</button></div>').join('') +
      '</div><div id="room"></div>';
  }
  window.renderChats = function () {
    const main = document.getElementById("main");
    if (!main) return;
    main.innerHTML = loungeHtml();
    if (typeof drawPunterMap === "function") drawPunterMap();
  };
})();
