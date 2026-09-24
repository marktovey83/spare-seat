(function () {
  var PINS = ['\uD83D\uDFE0','\uD83D\uDFE3','\uD83D\uDFE6','\uD83D\uDFE2','\uD83D\uDFE1','\u26AA','\uD83C\uDFC8','\uD83C\uDFC9','\u26BD','\uD83C\uDFCF','\uD83C\uDFC0','\uD83C\uDF7A','\uD83E\uDE91'];
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
  function pinOf(u) { return (u && (u.pin || u.emoji)) || (u && u.gender === 'female' ? '\uD83D\uDFE3' : '\uD83D\uDFE0'); }
  window.renderFriends = function () {
    if (!(typeof isPlus === 'function' && isPlus())) { if (typeof showPlusWall === 'function') showPlusWall('Friends, online, and names on the map are Plus.'); return; }
    var self = typeof me === 'function' ? me() : null;
    var list = (S.users || []).filter(function (u) { return self && u.id !== self.id; });
    var html = '<div class="eyebrow">Plus \u00b7 friends</div><h2>Your crew</h2><p class="muted">Online now and what they are watching today.</p><button class="btn" onclick="showFriendsMap()">Open friends map</button><div class="list" style="margin-top:12px">';
    list.forEach(function (u) {
      var mine = (S.friends[self.id] || []);
      var theirs = (S.friends[u.id] || []);
      var ok = mine.indexOf(u.id) >= 0 && theirs.indexOf(self.id) >= 0;
      html += '<div class="item"><h3>' + pinOf(u) + ' ' + u.name + '</h3><p class="muted">' + (online(u) ? '\u25CF Online' : '\u25CB Offline') + ' \u00b7 ' + suburb(u.suburb).name + '</p><p class="body">' + watching(u) + '</p>' +
        (ok ? '<button class="btn ghost" onclick="showFriendsMap(\'' + u.id + '\')">See on map</button>' : '<button class="btn ghost" onclick="addFriend(\'' + u.id + '\')">Add</button>') + '</div>';
    });
    document.getElementById('main').innerHTML = html + '</div>';
  };
  window.showFriendsMap = function (focusId) {
    var main = document.getElementById('main');
    if (!main) return;
    var nav = document.getElementById('nav-punter');
    if (nav) [].slice.call(nav.querySelectorAll('button')).forEach(function (b) { b.classList.toggle('active', b.dataset.tab === 'friends'); });
    main.innerHTML = '<div class="eyebrow">Friends map</div><h2>Friends and nearby users</h2><p class="muted">Pins use the emoji they picked at register.</p><div id="punter-map" class="chat-map plus" style="height:280px"></div><button class="btn ghost" style="margin-top:10px" onclick="renderFriends()">Back to list</button>';
    drawEmojiMap(document.getElementById('punter-map'), focusId);
  };
  function drawEmojiMap(el, focusId) {
    if (!el || typeof L === 'undefined') return;
    var self = typeof me === 'function' ? me() : null;
    var home = (self && typeof suburb === 'function') ? suburb(self.suburb) : SEED.suburbs[0];
    if (el._leaflet) { try { el._leaflet.remove(); } catch (e) {} el.innerHTML = ''; }
    var map = L.map(el).setView([home.lat, home.lng], 11);
    el._leaflet = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '&copy; OpenStreetMap' }).addTo(map);
    L.circle([home.lat, home.lng], { radius: 10000, color: '#ff6a1a', fillOpacity: 0.08, weight: 2 }).addTo(map);
    function mark(lat, lng, emoji, text) {
      L.marker([lat, lng], { icon: L.divIcon({ className: 'pin-emo', html: '<div style="font-size:22px">' + emoji + '</div>', iconSize: [24, 24] }) }).addTo(map).bindPopup(text);
    }
    mark(home.lat, home.lng, pinOf(self || {}), 'You');
    (S.users || []).forEach(function (u) {
      if (self && u.id === self.id) return;
      if (typeof canSeeUser === 'function' && self && !canSeeUser(self, u)) return;
      var s = suburb(u.suburb); if (!s) return;
      var j = ((u.id.charCodeAt(1) || 3) * 0.0004);
      mark(s.lat + j, s.lng - j, pinOf(u), pinOf(u) + ' ' + u.name + ' \u00b7 ' + (online(u) ? 'online' : 'offline') + '<br>' + watching(u));
    });
    (SEED.venues || []).forEach(function (v) { L.circleMarker([v.lat, v.lng], { radius: 6, color: '#2ee6a6' }).addTo(map).bindPopup(v.name); });
    if (focusId) { var u = (S.users || []).find(function (x) { return x.id === focusId; }); var s = u && suburb(u.suburb); if (s) map.setView([s.lat, s.lng], 13); }
    setTimeout(function () { map.invalidateSize(); }, 250);
  }
  function seedPins() {
    var map = { Dave: '\uD83D\uDFE0', Sarah: '\uD83D\uDFE3', Mick: '\uD83C\uDFC8', Jess: '\uD83D\uDFE2', Tom: '\uD83D\uDFE6' };
    (S.users || []).forEach(function (u) { if (!u.pin) u.pin = map[u.name] || '\uD83D\uDFE0'; });
  }
  function injectPinPicker() {
    if (document.getElementById('p-emoji')) return;
    var pin = document.getElementById('p-pin');
    var host = pin ? pin.parentNode : document.getElementById('auth-user-signup');
    if (!host) return;
    var wrap = document.createElement('div');
    wrap.innerHTML = '<label>Map pin</label><select id="p-emoji">' + PINS.map(function (e) { return '<option value="' + e + '">' + e + '</option>'; }).join('') + '</select><p class="muted">This emoji is your pin on the friends map.</p>';
    if (pin) host.insertBefore(wrap, pin.nextSibling); else host.appendChild(wrap);
  }
  var prevSignup = window.userSignup;
  window.userSignup = function () {
    if (typeof prevSignup === 'function') prevSignup();
    var u = S.users[S.users.length - 1];
    var emo = document.getElementById('p-emoji');
    if (u && emo) { u.pin = emo.value; store.save(S); }
  };
  seedPins();
  document.addEventListener('DOMContentLoaded', injectPinPicker);
  setTimeout(injectPinPicker, 400);
})();
