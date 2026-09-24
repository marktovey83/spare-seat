(function () {
  var COLOURS = {
    Dockers: { hex: '#2b0a5c', hex2: '#fff200', label: 'Dockers purple / gold' },
    Eagles: { hex: '#003087', hex2: '#f2a900', label: 'Eagles blue / gold' },
    Cats: { hex: '#001F3F', hex2: '#ffffff', label: 'Cats navy / white' },
    Lions: { hex: '#A30046', hex2: '#fdb813', label: 'Lions maroon / gold' },
    Crows: { hex: '#002B5C', hex2: '#E21937', label: 'Crows navy / red' },
    Storm: { hex: '#6B2D8B', hex2: '#fdb813', label: 'Storm purple / gold' },
    Panthers: { hex: '#000000', hex2: '#c4a747', label: 'Panthers black / gold' },
    Broncos: { hex: '#7B003C', hex2: '#fdb813', label: 'Broncos maroon / gold' },
    Scorchers: { hex: '#ff6a1a', hex2: '#071018', label: 'Scorchers orange' },
    Sixers: { hex: '#eb1c2d', hex2: '#7a0010', label: 'Sixers magenta' },
    Heat: { hex: '#7A0019', hex2: '#fdb813', label: 'Heat maroon' },
    '49ers': { hex: '#AA0000', hex2: '#B3995D', label: '49ers red / gold' },
    Chiefs: { hex: '#E31837', hex2: '#FFB81C', label: 'Chiefs red / gold' },
    Lakers: { hex: '#552583', hex2: '#FDB927', label: 'Lakers purple / gold' },
    Celtics: { hex: '#007A33', hex2: '#BA9653', label: 'Celtics green' },
    Glory: { hex: '#6B2D8B', hex2: '#ffffff', label: 'Glory purple' },
    Victory: { hex: '#1a1a1a', hex2: '#b11a21', label: 'Victory navy / red' },
    Neutral: { hex: '#ff6a1a', hex2: '#071018', label: 'Spare Seat orange' }
  };
  function clubOf(u) {
    if (!u) return 'Neutral';
    if (u.clubs) {
      var k = Object.keys(u.clubs)[0];
      if (k && u.clubs[k]) return u.clubs[k];
    }
    return u.club || 'Neutral';
  }
  function col(u) { return COLOURS[clubOf(u)] || COLOURS.Neutral; }
  function watching(u) {
    var head = Object.values(S.heading || {}).find(function (h) { return h.userId === u.id; });
    if (head) { var f = (SEED.fixtures || []).find(function (x) { return x.id === head.fixtureId; }); if (f) return f.label + ' \u00b7 heading'; }
    var here = Object.values(S.here || {}).find(function (h) { return h.userId === u.id; });
    if (here) { var g = (SEED.fixtures || []).find(function (x) { return x.id === here.fixtureId; }); if (g) return g.label + ' \u00b7 at the pub'; }
    var sport = (u.sports && u.sports[0]) || 'AFL';
    var fx = (SEED.fixtures || []).find(function (x) { return x.sport === sport; });
    return fx ? fx.label : 'No game pinned';
  }
  function online(u) { if (u.online === true) return true; if (u.online === false) return false; return ['Mick','Tom','Sarah'].indexOf(u.name) >= 0; }
  window.renderFriends = function () {
    if (!(typeof isPlus === 'function' && isPlus())) { if (typeof showPlusWall === 'function') showPlusWall('Friends, online, and names on the map are Plus.'); return; }
    var self = typeof me === 'function' ? me() : null;
    var list = (S.users || []).filter(function (u) { return self && u.id !== self.id; });
    var html = '<div class="eyebrow">Plus \u00b7 friends</div><h2>Your crew</h2><p class="muted">Online now, what they are watching, pin in their club colours.</p><button class="btn" onclick="showFriendsMap()">Open friends map</button><div class="list" style="margin-top:12px">';
    list.forEach(function (u) {
      var c = col(u);
      var mine = (S.friends[self.id] || []);
      var theirs = (S.friends[u.id] || []);
      var ok = mine.indexOf(u.id) >= 0 && theirs.indexOf(self.id) >= 0;
      html += '<div class="item"><h3><span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:' + c.hex + ';box-shadow:0 0 0 2px ' + c.hex2 + ';margin-right:6px"></span>' + u.name + '</h3><p class="muted">' + (online(u) ? '\u25CF Online' : '\u25CB Offline') + ' \u00b7 ' + clubOf(u) + ' \u00b7 ' + suburb(u.suburb).name + '</p><p class="body">' + watching(u) + '</p>' +
        (ok ? '<button class="btn ghost" onclick="showFriendsMap(\'' + u.id + '\')">See on map</button>' : '<button class="btn ghost" onclick="addFriend(\'' + u.id + '\')">Add</button>') + '</div>';
    });
    document.getElementById('main').innerHTML = html + '</div>';
  };
  window.showFriendsMap = function (focusId) {
    var main = document.getElementById('main');
    if (!main) return;
    main.innerHTML = '<div class="eyebrow">Friends map</div><h2>Club-colour pins</h2><p class="muted">Each pin is the team they follow.</p><div id="punter-map" class="chat-map plus" style="height:280px"></div><button class="btn ghost" style="margin-top:10px" onclick="renderFriends()">Back to list</button>';
    drawColourMap(document.getElementById('punter-map'), focusId);
  };
  function drawColourMap(el, focusId) {
    if (!el || typeof L === 'undefined') return;
    var self = typeof me === 'function' ? me() : null;
    var home = (self && typeof suburb === 'function') ? suburb(self.suburb) : SEED.suburbs[0];
    if (el._leaflet) { try { el._leaflet.remove(); } catch (e) {} el.innerHTML = ''; }
    var map = L.map(el).setView([home.lat, home.lng], 11);
    el._leaflet = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '&copy; OpenStreetMap' }).addTo(map);
    L.circle([home.lat, home.lng], { radius: 10000, color: '#ff6a1a', fillOpacity: 0.08, weight: 2 }).addTo(map);
    function mark(lat, lng, u, text) {
      var c = col(u);
      L.circleMarker([lat, lng], { radius: 9, color: c.hex2, fillColor: c.hex, fillOpacity: 1, weight: 2 }).addTo(map).bindPopup(text);
    }
    mark(home.lat, home.lng, self || { clubs: { AFL: 'Neutral' } }, 'You \u00b7 ' + clubOf(self));
    (S.users || []).forEach(function (u) {
      if (self && u.id === self.id) return;
      if (typeof canSeeUser === 'function' && self && !canSeeUser(self, u)) return;
      var s = suburb(u.suburb); if (!s) return;
      var j = ((u.id.charCodeAt(1) || 3) * 0.0004);
      mark(s.lat + j, s.lng - j, u, u.name + ' \u00b7 ' + clubOf(u) + '<br>' + (online(u) ? 'Online' : 'Offline') + ' \u00b7 ' + watching(u));
    });
    (SEED.venues || []).forEach(function (v) { L.circleMarker([v.lat, v.lng], { radius: 6, color: '#2ee6a6' }).addTo(map).bindPopup(v.name); });
    if (focusId) { var u = (S.users || []).find(function (x) { return x.id === focusId; }); var s = u && suburb(u.suburb); if (s) map.setView([s.lat, s.lng], 13); }
    setTimeout(function () { map.invalidateSize(); }, 250);
  }
  function fillClubPins() {
    var clubSel = document.getElementById('p-club');
    var host = document.getElementById('p-pin') ? document.getElementById('p-pin').parentNode : document.getElementById('auth-user-signup');
    if (!host) return;
    var box = document.getElementById('pin-colour-box');
    if (!box) {
      box = document.createElement('div');
      box.id = 'pin-colour-box';
      host.appendChild(box);
    }
    var club = clubSel ? clubSel.value : 'Neutral';
    var c = COLOURS[club] || COLOURS.Neutral;
    box.innerHTML = '<label>Map pin colour</label><p class="body"><span style="display:inline-block;width:18px;height:18px;border-radius:50%;background:' + c.hex + ';box-shadow:0 0 0 3px ' + c.hex2 + ';vertical-align:middle;margin-right:8px"></span>' + c.label + '</p><p class="muted">Taken from the club you follow. Change club to change the pin.</p>';
  }
  var prevSignup = window.userSignup;
  window.userSignup = function () {
    if (typeof prevSignup === 'function') prevSignup();
    var u = S.users[S.users.length - 1];
    var clubSel = document.getElementById('p-club');
    if (u && clubSel) {
      var sport = (document.getElementById('p-sport') || {}).value || 'AFL';
      u.clubs = u.clubs || {};
      u.clubs[sport] = clubSel.value;
      u.pinColour = (COLOURS[clubSel.value] || COLOURS.Neutral).hex;
      store.save(S);
    }
  };
  document.addEventListener('change', function (e) {
    if (e.target && (e.target.id === 'p-club' || e.target.id === 'p-sport')) fillClubPins();
  });
  document.addEventListener('DOMContentLoaded', fillClubPins);
  setTimeout(fillClubPins, 400);
})();
