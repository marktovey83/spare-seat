(function () {
  const SEED_MSGS = {
    "match:f1": [
      { name: "Dave", text: "Heading to Freo Hotel. Who's got a spare seat?" },
      { name: "Sarah", text: "I'm Cats — already at Local if anyone's south." },
      { name: "Mick", text: "Pub table near the screen. Be there 5." }
    ],
    "team:dockers": [
      { name: "Dave", text: "Purple army. Who's at Freo Hotel?" },
      { name: "Mick", text: "I'll grab the corner near the screen." }
    ],
    "team:cats": [{ name: "Sarah", text: "Cats in the house. Local has a spare seat." }]
  };
  function f0() {
    return (window.SEED && SEED.fixtures[0]) || { id: "f1", label: "Dockers vs Cats", start: "Tonight 6:10pm AWST", sport: "AFL" };
  }
  function plusOn() { return typeof isPlus === "function" && isPlus(); }
  function peopleNear() {
    const self = typeof me === "function" ? me() : null;
    return (SEED.people || []).filter((p) => !self || p.id !== self.id);
  }
  function msgsFor(key) {
    const live = (window.S && S.chats && S.chats[key]) || [];
    const seed = SEED_MSGS[key] || [];
    const all = seed.concat(live);
    if (!all.length) return '<div class="msg muted">No messages yet. Talk about the game.</div>';
    return all.map((m) => '<div class="msg"><b>' + m.name + '</b> ' + m.text + '</div>').join('');
  }
  function directory() {
    const plus = plusOn();
    const f = f0();
    const people = peopleNear();
    const pubs = (SEED.venues || []).filter((v) => (v.showing || []).includes(f.id));
    const dms = people.map((p) => '<div class="item"><h3>' + p.name + '</h3><p class="muted">' + ((p.clubs && p.clubs.AFL) || '') + '</p><button class="btn ghost" onclick="enterLounge(\'dm:' + p.id + '\',\'' + p.name + '\')">Message</button></div>').join('');
    if (!plus) {
      return '<div class="eyebrow">Chat \u00b7 Free</div><h2>' + f.label + '</h2><p class="body">Lounge is open — 90 minutes before bounce-down. Free chats one person at a time.</p><p class="muted">Map and thread open after you tap Message. Group lounge is Plus.</p><h2>Message one person</h2><div class="list">' + dms + '</div><div class="card"><div class="pill">Plus</div><h3>Group lounge + team chats</h3><p class="body">Plus walks into the match lounge, Dockers room, Cats room, and pub tables.</p><button class="btn" onclick="buyPlus()">Get Plus — $15 / month</button></div>';
    }
    return '<div class="eyebrow">Chat \u00b7 Plus</div><h2>' + f.label + '</h2><p class="body">Pick a room. Chat only after you walk in.</p><div class="list"><div class="item"><h3>Match lounge</h3><p class="muted">Everyone watching ' + f.label + '</p><button class="btn" onclick="enterLounge(\'match:' + f.id + '\',\'' + f.label + '\')">Enter lounge</button></div><div class="item"><h3>Dockers room</h3><p class="muted">Team chat</p><button class="btn ghost" onclick="enterLounge(\'team:dockers\',\'Dockers room\')">Enter</button></div><div class="item"><h3>Cats room</h3><p class="muted">Team chat</p><button class="btn ghost" onclick="enterLounge(\'team:cats\',\'Cats room\')">Enter</button></div></div><h2>One-to-one</h2><div class="list">' + dms + '</div><h2>Pub tables</h2><div class="list">' + pubs.map((v) => '<div class="item"><h3>' + v.name + '</h3><p class="muted">' + v.deal + '</p><button class="btn ghost" onclick="enterLounge(\'pub:' + v.id + '\',\'' + v.name + ' table\')">Enter table</button></div>').join('') + '</div>';
  }
  function loungeScreen(key, title) {
    const plus = plusOn();
    const group = key.indexOf('dm:') !== 0;
    if (group && !plus) {
      return '<button class="back-link" onclick="showPunter(\'chats\')">\u2190 Back to chats</button><div class="card"><h2>Plus lounge</h2><p class="body">Group and team rooms are Plus. Free stays one-to-one.</p><button class="btn" onclick="buyPlus()">Get Plus — $15 / month</button></div>';
    }
    const who = peopleNear().map((p) => p.name).join(' \u00b7 ');
    if (!plus) {
      return '<button class="back-link" onclick="showPunter(\'chats\')">\u2190 Back to chats</button><div class="eyebrow">Free \u00b7 1:1</div><h2>' + title + '</h2><p class="muted">Just you and them. Map is 10 km — the only map on Free.</p><div id="punter-map" class="chat-map free"></div><div class="card"><div class="chat" id="chatbox">' + msgsFor(key) + '</div><div class="row"><input id="chat-in" placeholder="Message ' + title + '" /><button class="btn" onclick="sendMsg(\'' + key + '\')">Send</button></div></div>';
    }
    return '<button class="back-link" onclick="showPunter(\'chats\')">\u2190 Back to chats</button><div class="eyebrow">Plus \u00b7 ' + (group ? 'lounge' : '1:1') + '</div><h2>' + title + '</h2><p class="body">' + (group ? 'Group room \u00b7 ' + who : 'Private chat') + '</p><p class="muted">Opened 90 minutes before bounce-down. Plus can stay after the siren.</p><div id="punter-map" class="chat-map plus"></div><div class="card"><div class="pill">' + (group ? 'LOUNGE' : 'DIRECT') + '</div><div class="chat" id="chatbox">' + msgsFor(key) + '</div><div class="row"><input id="chat-in" placeholder="Talk the game — no stakes" /><button class="btn" onclick="sendMsg(\'' + key + '\')">Send</button></div></div>';
  }
  window.renderChats = function () {
    const main = document.getElementById('main');
    if (!main) return;
    main.innerHTML = directory();
  };
  window.enterLounge = function (key, title) {
    window._lounge = { key: key, title: title };
    const main = document.getElementById('main');
    if (!main) return;
    if (window.S) { S.chats = S.chats || {}; S.chats[key] = S.chats[key] || []; }
    main.innerHTML = loungeScreen(key, title);
    if (typeof drawPunterMap === 'function') drawPunterMap();
  };
  window.openRoom = function (key, title) { window.enterLounge(key, title); };
  window.openDm = function (id, name) { window.enterLounge('dm:' + id, name); };
  window.sendMsg = function (key) {
    const input = document.getElementById('chat-in');
    const text = input && input.value.trim();
    if (!text) return;
    if (/(payid|\$\d+|weed|cocaine|come to (my|mine))/i.test(text)) {
      if (typeof toast === 'function') toast('Message blocked. Keep it about the game.');
      return;
    }
    if (window.S) {
      S.chats = S.chats || {}; S.chats[key] = S.chats[key] || [];
      const n = (typeof me === 'function' && me() && me().name) || 'You';
      S.chats[key].push({ name: n, text: text, at: Date.now() });
      if (window.store) store.save(S);
    }
    window.enterLounge(key, (window._lounge && window._lounge.title) || key);
  };
})();
