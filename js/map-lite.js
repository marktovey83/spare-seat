(function () {
  var LIGHT = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
  function plusOn() { return typeof isPlus === 'function' && isPlus(); }
  function fidNow() {
    var k = window._lounge && window._lounge.key;
    var m = k && String(k).match(/match:([^:]+)/);
    if (m) return m[1];
    return ((SEED.fixtures || [])[0] || {}).id;
  }
  var PIN = {
    Dockers: { e: '\u2693', bg: '#2b0a5c', fg: '#fff200' },
    Cats: { e: '\uD83D\uDC31', bg: '#001f3f', fg: '#ffffff' },
    Eagles: { e: '\uD83E\uDD85', bg: '#003087', fg: '#f2a900' },
    Lions: { e: '\uD83E\uDD81', bg: '#a30046', fg: '#fdb813' },
    Crows: { e: '\uD83D\uDC26', bg: '#002b5c', fg: '#e21937' },
    Panthers: { e: '\uD83D\uDC06', bg: '#111', fg: '#c4a747' },
    Roosters: { e: '\uD83D\uDC13', bg: '#e10600', fg: '#fff' },
    Storm: { e: '\u26A1', bg: '#6b2d8b', fg: '#fdb813' },
    Broncos: { e: '\uD83E\uDD81', bg: '#7b003c', fg: '#fdb813' },
    Scorchers: { e: '\uD83D\uDD25', bg: '#ff6a1a', fg: '#071018' },
    Sixers: { e: '\uD83C\uDFC6', bg: '#eb1c2d', fg: '#fff' },
    Heat: { e: '\uD83D\uDD25', bg: '#7a0019', fg: '#fdb813' },
    '49ers': { e: '\uD83C\uDFC8', bg: '#aa0000', fg: '#b3995d' },
    Rams: { e: '\uD83D\uDC0F', bg: '#003594', fg: '#ffd100' },
    Lakers: { e: '\uD83C\uDFC0', bg: '#552583', fg: '#fdb927' },
    Celtics: { e: '\uD83C\uDFC0', bg: '#007a33', fg: '#ba9653' },
    Glory: { e: '\u2B50', bg: '#6b2d8b', fg: '#fff' },
    Victory: { e: '\u26BD', bg: '#1a1a1a', fg: '#b11a21' },
    Australia: { e: '\uD83C\uDFCF', bg: '#00843d', fg: '#ffcd00' },
    'South Africa': { e: '\uD83C\uDFCF', bg: '#007a4d', fg: '#ffb81c' },
    Fremantle: { e: '\u2693', bg: '#2b0a5c', fg: '#fff200' },
    Geelong: { e: '\uD83D\uDC31', bg: '#001f3f', fg: '#ffffff' }
  };
  function sideOf(u, fid) {
    if (!u) return '';
    if (window.S && S.sidePin && S.sidePin[u.id]) return S.sidePin[u.id];
    var f = (SEED.fixtures || []).find(function (x) { return x.id === fid; });
    var sport = (f && f.sport) || 'AFL';
    if (u.clubs && u.clubs[sport]) return u.clubs[sport];
    return '';
  }
  function pinFor(name) { return PIN[name] || { e: '\uD83D\uDC64', bg: '#ff6a1a', fg: '#071018' }; }
  function clubIcon(name) {
    var p = pinFor(name);
    return L.divIcon({
      className: 'club-pin',
      html: '<div style="width:30px;height:30px;border-radius:50%;background:' + p.bg + ';color:' + p.fg + ';border:2px solid ' + p.fg + ';display:flex;align-items:center;justify-content:center;font-size:16px;line-height:1">' + p.e + '</div>',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  }
  function watchingId(u) {
    if (!u) return null;
    if (window.S && S.watching && S.watching[u.id]) return S.watching[u.id];
    if (u.watching) return u.watching;
    var here = Object.values((S && S.here) || {}).find(function (h) { return h.userId === u.id; });
    if (here) return here.fixtureId;
    var head = Object.values((S && S.heading) || {}).find(function (h) { return h.userId === u.id; });
    if (head) return head.fixtureId;
    return null;
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
    var youSide = self ? sideOf(self, fid) : '';
    L.marker([home.lat, home.lng], { icon: clubIcon(youSide) }).addTo(map).bindPopup('You' + (youSide ? '<br>' + youSide : ''));
    (SEED.venues || []).forEach(function (v) {
      if (!plus) {
        if (typeof km === 'function' && km(home, v) > 10) return;
      }
      L.circleMarker([v.lat, v.lng], { radius: 7, color: '#fff', fillColor: '#1a7f4b', fillOpacity: 1, weight: 2 }).addTo(map).bindPopup(v.name);
    });
    list.forEach(function (u) {
      var s = suburb(u.suburb); if (!s) return;
      var side = sideOf(u, fid);
      L.marker([s.lat, s.lng], { icon: clubIcon(side) }).addTo(map).bindPopup((side ? side + '<br>' : '') + popHtml(u));
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

(function seedWatch() {
  (SEED.people || []).forEach(function (p) {
    if (!p.watching) return;
    var row = (S.users || []).find(function (u) { return u.id === p.id; });
    if (row && !row.watching && !(S.watching && S.watching[row.id])) row.watching = p.watching;
  });
})();
