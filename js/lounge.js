(function () {
  const SEED_MSGS = [
    { name: "Dave", text: "Heading to Freo Hotel. Who's got a spare seat?" },
    { name: "Sarah", text: "I'm Cats \u2014 already at Local if anyone's south." },
    { name: "Mick", text: "Pub table near the screen. Be there 5." }
  ];
  function openFixture() {
    return (window.SEED && SEED.fixtures[0]) || { id: "f1", label: "Dockers vs Cats", venue: "Optus Stadium", start: "Tonight 6:10pm AWST", sport: "AFL" };
  }
  function loungeHtml() {
    const plus = typeof isPlus === "function" && isPlus();
    const f = openFixture();
    const pubs = (SEED.venues || []).filter((v) => (v.showing || []).includes(f.id));
    const people = (SEED.people || []).slice(0, 4);
    const msgs = SEED_MSGS.map((m) => "<div class=\"msg\"><b>" + m.name + "</b> " + m.text + "</div>").join("");
    return '<div class="eyebrow">Lounge \u00b7 open</div><h2>' + f.label + '</h2>' +
      '<p class="body">' + f.sport + ' \u00b7 ' + f.start + ' \u00b7 showing at nearby pubs</p>' +
      '<p class="muted">Opened 90 minutes before bounce-down. ' + (plus ? 'Plus: stay in after the siren and open other rooms anytime.' : 'This 10 km map is the only map on Free. Plus unlocks Friends map and anytime chat.') + '</p>' +
      '<div id="punter-map" class="chat-map ' + (plus ? 'plus' : 'free') + '"></div>' +
      '<div class="card"><div class="pill">OPEN NOW</div><h3>Match lounge</h3>' +
      '<p class="muted">' + people.map((p) => p.name).join(' \u00b7 ') + ' in the room</p>' +
      '<div class="chat" id="chatbox">' + msgs + '</div>' +
      '<div class="row"><input id="chat-in" placeholder="Talk the game \u2014 no stakes" />' +
      '<button class="btn" onclick="sendMsg(\'match:' + f.id + '\')">Send</button></div></div>' +
      '<h2>Pubs showing it</h2><div class="list">' +
      pubs.map((v) => '<div class="item"><h3>' + v.name + '</h3><p class="muted">' + v.deal + '</p><button class="btn ghost" onclick="openRoom(\'pub:' + v.id + '\',\'' + v.name + ' table\')">Open table</button></div>').join('') +
      '</div><h2>Later games</h2><div class="list">' +
      (SEED.fixtures || []).slice(1).map((g) => '<div class="item"><h3>' + g.label + '</h3><p class="muted">' + (plus ? 'Plus \u2014 open anytime' : 'Opens 90 minutes before ' + g.start) + '</p>' + (plus ? '<button class="btn ghost" onclick="openRoom(\'match:' + g.id + '\',\'' + g.label.replace(/'/g, '') + '\')">Open</button>' : '') + '</div>').join('') +
      '</div><div id="room"></div>';
  }
  window.renderChats = function () {
    const main = document.getElementById("main");
    if (!main) return;
    main.innerHTML = loungeHtml();
    if (typeof drawPunterMap === "function") drawPunterMap();
  };
})();
