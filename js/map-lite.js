(function () {
  var LIGHT = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
  function plusOn() { return typeof isPlus === 'function' && isPlus(); }
  function fidNow() {
    var k = window._lounge && window._lounge.key;
    var m = k && String(k).match(/match:([^:]+)/);
    if (m) return m[1];
    return ((SEED.fixtures || [])[0] || {}).id;
  }
  function watchingId(u) {
    if (!u) return null;
    if (u.watching) return u.watching;
    if (S.watching && S.watching[u.id]) return S.watching[u.id];
    var here = Object.values(S.here || {}).find(function (h) { return h.userId === u.id; });
    if (here) return here.fixtureId;
    var head = Object.values(S.heading || {}).find(function (h) { return h.userId === u.id; });
    if (head) return head.fixtureId;
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
  function popHtml(u) {
    var rate = typeof personStars === 'function' ? personStars(u.id) : '';
    var sub = typeof suburb === 'function' ? suburb(u.suburb) : null;
    return '<div class="pin-pop"><b>' + u.name + '</b><br>' + (sub ? sub.name : '') +
      (rate ? '<br>' + rate : '') +
      '<br><button class="btn" style="margin-top:8px" onclick="openDm(\'' + u.id + '\',\'' + String(u.name).replace(/'/g, '') + '\')">Chat</button></div>';
  }
  function listHtml(people) {
    if (!people.length) return '<div class="watch-list"><p class="muted">No one else on this game yet.</p></div>';
    return '<div class="watch-list">' + people.map(function (u) {
      var rate = typeof personStars === 'function' ? personStars(u.id) : '';
      var sub = suburb(u.suburb);
      return '<div class="item"><h3>' + u.name + '</h3><p class="muted">' + (sub ? sub.name : '') + (rate ? ' \u00b7 ' + rate : '') +
        '</p><button class="btn ghost" onclick="openDm(\'' + u.id + '\',\'' + String(u.name).replace(/'/g, '') + '\')">Chat</button></div>';
    }).join('') + '</div>';
  }
  window.drawGameWatchMap = function (el, fid) {
    if (!el || typeof L === 'undefined') return;
    fid = fid || fidNow();
    var self = typeof me === 'function' ? me() : null;
    var plus = plusOn();
    var home = (self && typeof suburb === 'function') ? suburb(self.suburb) : SEED.suburbs[0];
    var list = watchers(fid).filter(function (u) { return plus || within10(u, self); });
    el.style.height = '176px';
    if (el._leaflet) { try { el._leaflet.remove(); } catch (e) {} el.innerHTML = ''; }
    var map = plus ? L.map(el, { zoomControl: false }).setView([-25.2, 133.8], 4) : L.map(el, { zoomControl: false }).setView([home.lat, home.lng], 12);
    el._leaflet = map;
    L.tileLayer(LIGHT, { maxZoom: 18, attribution: '&copy; OSM \u00b7 Carto' }).addTo(map);
    if (!plus) L.circle([home.lat, home.lng], { radius: 10000, color: '#ff6a1a', fillColor: '#ff6a1a', fillOpacity: 0.12, weight: 2 }).addTo(map);
    L.circleMarker([home.lat, home.lng], { radius: 10, color: '#fff', fillColor: '#ff6a1a', fillOpacity: 1, weight: 2 }).addTo(map).bindPopup('You');
    (SEED.venues || []).forEach(function (v) {
      if (!plus) {
        if (typeof km === 'function' && km(home, v) > 10) return;
      }
      L.circleMarker([v.lat, v.lng], { radius: 7, color: '#fff', fillColor: '#1a7f4b', fillOpacity: 1, weight: 2 }).addTo(map).bindPopup(v.name);
    });
    list.forEach(function (u) {
      var s = suburb(u.suburb); if (!s) return;
      L.circleMarker([s.lat, s.lng], { radius: 8, color: '#fff', fillColor: '#2b0a5c', fillOpacity: 1, weight: 2 })
        .addTo(map).bindPopup(popHtml(u));
    });
    var wrap = el.parentNode;
    var old = document.getElementById('watch-list');
    if (old) old.remove();
    if (plus) {
      var box = document.createElement('div');
      box.id = 'watch-list';
      box.innerHTML = listHtml(list);
      if (wrap) el.insertAdjacentElement('afterend', box);
    }
    setTimeout(function () { map.invalidateSize(); }, 250);
  };
  var prevEnter = window.enterLounge;
  window.enterLounge = function (key, title) {
    if (typeof prevEnter === 'function') prevEnter(key, title);
    var el = document.getElementById('punter-map');
    var fid = fidNow();
    if (el) drawGameWatchMap(el, fid);
  };
  var prevFriendsMap = window.showFriendsMap;
  window.showFriendsMap = function (focusId) {
    if (typeof prevFriendsMap === 'function') prevFriendsMap(focusId);
    var el = document.getElementById('punter-map');
    if (el) {
      el.style.height = '176px';
      drawGameWatchMap(el, fidNow());
    }
  };
})();
