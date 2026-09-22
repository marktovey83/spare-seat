(function () {
  const orig = window.showAdmin;
  if (!orig) return;
  function drawAdminMap() {
    const el = document.getElementById('admin-map');
    if (!el || typeof L === 'undefined' || el._leaflet_id) return;
    const map = L.map(el).setView([-25.2, 134.5], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '&copy; OpenStreetMap' }).addTo(map);
    const bounds = [];
    (SEED.patches || []).forEach(function (p) {
      const hubs = (p.extra || []).concat([{ name: p.name, lat: p.lat, lng: p.lng }]);
      hubs.forEach(function (h) {
        if (!h.lat) return;
        L.circle([h.lat, h.lng], { radius: (p.km || 10) * 1000, color: '#ff6a1a', fillColor: '#ff6a1a', fillOpacity: 0.12, weight: 2 }).addTo(map).bindPopup(p.partner + ' \u00b7 ' + h.name + ' \u00b7 ' + (p.km || 10) + ' km');
        bounds.push([h.lat, h.lng]);
      });
    });
    (SEED.venues || []).forEach(function (v) {
      L.circleMarker([v.lat, v.lng], { radius: 7, color: v.target ? '#ffb347' : '#2ee6a6', fillOpacity: 1 }).addTo(map).bindPopup((v.target ? 'Target \u00b7 ' : 'Live \u00b7 ') + v.name);
      bounds.push([v.lat, v.lng]);
    });
    if (bounds.length) map.fitBounds(bounds, { padding: [28, 28], maxZoom: 6 });
    setTimeout(function () { map.invalidateSize(); }, 250);
  }
  function areasHtml() {
    const cards = (SEED.patches || []).map(function (p) {
      const pubs = (SEED.venues || []).filter(function (v) { return v.patch === p.id; });
      const live = pubs.filter(function (v) { return !v.target; }).length;
      const aim = pubs.filter(function (v) { return v.target; }).length;
      return '<div class="card"><h3>' + p.name + '</h3><p class="muted">' + p.partner + ' \u00b7 ' + (p.km || 10) + ' km rings</p><p class="body">' + live + ' live pin \u00b7 ' + aim + ' target pub</p><p class="muted">' + pubs.map(function (v) { return v.name; }).join(' \u00b7 ') + '</p></div>';
    }).join('');
    return '<div class="eyebrow">Admin \u00b7 rollout</div><h2>Target patches</h2><p class="body">Three partner areas. Orange ring is 10 km. Green pin is live. Gold pin is a target pub showing a game.</p><div id="admin-map" class="admin-map"></div><div class="grid two">' + cards + '</div>';
  }
  window.showAdmin = function (tab) {
    orig(tab);
    if (tab !== 'areas') return;
    const main = document.getElementById('main');
    if (!main) return;
    main.innerHTML = areasHtml();
    drawAdminMap();
  };
})();
