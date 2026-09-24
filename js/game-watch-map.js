(function () {
  function fidFromLounge() {
    var k = window._lounge && window._lounge.key;
    if (!k) return ((SEED.fixtures || [])[0] || {}).id;
    var m = String(k).match(/match:([^:]+)/);
    if (m) return m[1];
    return ((SEED.fixtures || [])[0] || {}).id;
  }
  function watchingId(u) {
    if (!u) return null;
    if (u.watching) return u.watching;
    var here = Object.values(S.here || {}).find(function (h) { return h.userId === u.id; });
    if (here) return here.fixtureId;
    var head = Object.values(S.heading || {}).find(function (h) { return h.userId === u.id; });
    if (head) return head.fixtureId;
    if (S.watching && S.watching[u.id]) return S.watching[u.id];
    var sport = (u.sports && u.sports[0]) || 'AFL';
    var fx = (SEED.fixtures || []).find(function (x) { return x.sport === sport; });
    return fx ? fx.id : null;
  }
  function watchers(fid) {
    var self = typeof me === 'function' ? me() : null;
    return (S.users || []).filter(function (u) {
      if (self && u.id === self.id) return false;
      if (watchingId(u) !== fid) return false;
      if (typeof canSeeUser === 'function' && self && !canSeeUser(self, u)) return false;
      return true;
    });
  }
  function within10(u, self) {
    if (!self || typeof suburb !== 'function' || typeof km !== 'function') return true;
    var a = suburb(self.suburb), b = suburb(u.suburb);
    if (!a || !b) return false;
    return km(a, b) <= 10;
  }
  window.drawGameWatchMap = function (el, fid) {
    if (!el || typeof L === 'undefined') return;
    var self = typeof me === 'function' ? me() : null;
    var plus = typeof isPlus === 'function' && isPlus();
    var home = (self && typeof suburb === 'function') ? suburb(self.suburb) : SEED.suburbs[0];
    var list = watchers(fid).filter(function (u) { return plus || within10(u, self); });
    if (el._leaflet) { try { el._leaflet.remove(); } catch (e) {} el.innerHTML = ''; }
    var map = plus ? L.map(el).setView([-25.2, 133.8], 4) : L.map(el).setView([home.lat, home.lng], 12);
    el._leaflet = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '&copy; OpenStreetMap' }).addTo(map);
    if (!plus) L.circle([home.lat, home.lng], { radius: 10000, color: '#ff6a1a', fillOpacity: 0.1, weight: 2 }).addTo(map);
    L.circleMarker([home.lat, home.lng], { radius: 8, color: '#ff6a1a', fillOpacity: 1 }).addTo(map).bindPopup('You');
    list.forEach(function (u) {
      var s = suburb(u.suburb); if (!s) return;
      var j = ((u.id.charCodeAt(1) || 3) * 0.15);
      var lat = plus ? s.lat : s.lat + j * 0.002;
      var lng = plus ? s.lng : s.lng - j * 0.002;
      var rate = typeof personStars === 'function' ? personStars(u.id) : '';
      L.circleMarker([lat, lng], { radius: 8, color: '#fff8f0', fillColor: '#ff6a1a', fillOpacity: 1, weight: 2 })
        .addTo(map).bindPopup(u.name + '<br>Watching this game<br>' + s.name + (rate ? '<br>' + rate : ''));
    });
    setTimeout(function () { map.invalidateSize(); }, 250);
  };
  var prevEnter = window.enterLounge;
  window.enterLounge = function (key, title) {
    var u = typeof me === 'function' ? me() : null;
    var fid = null;
    var m = String(key || '').match(/match:([^:]+)/);
    if (m) fid = m[1];
    if (!fid) fid = fidFromLounge();
    if (u && window.S) {
      S.watching = S.watching || {};
      S.watching[u.id] = fid;
      if (u.id) {
        var row = S.users.find(function (x) { return x.id === u.id; });
        if (row) row.watching = fid;
      }
      store.save(S);
    }
    if (typeof prevEnter === 'function') prevEnter(key, title);
    var el = document.getElementById('punter-map');
    if (el) drawGameWatchMap(el, fid);
  };
  (S.users || []).forEach(function (u) {
    if (!u.watching) {
      var sport = (u.sports && u.sports[0]) || 'AFL';
      var fx = (SEED.fixtures || []).find(function (x) { return x.sport === sport; });
      if (fx) u.watching = fx.id;
    }
  });
})();
