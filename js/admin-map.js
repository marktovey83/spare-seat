(function () {
  const orig = window.showAdmin;
  if (!orig) return;
  function hubsFor(p) {
    if (p.extra && p.extra.length) return p.extra;
    return [{ name: p.name, lat: p.lat, lng: p.lng }];
  }
  function drawAdminMap() {
    const el = document.getElementById('admin-map');
    if (!el || typeof L === 'undefined') return;
    if (window._adminMap) { window._adminMap.remove(); window._adminMap = null; }
    const map = L.map(el).setView([-25.2, 134.5], 4);
    window._adminMap = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '&copy; OpenStreetMap' }).addTo(map);
    const bounds = [];
    (SEED.patches || []).forEach(function (p) {
      hubsFor(p).forEach(function (h) {
        L.circle([h.lat, h.lng], { radius: (p.km || 10) * 1000, color: '#ff6a1a', fillColor: '#ff6a1a', fillOpacity: 0.14, weight: 2 }).addTo(map).bindPopup(p.partner + ' \u00b7 ' + h.name + ' \u00b7 10 km');
        bounds.push([h.lat, h.lng]);
      });
    });
    (SEED.venues || []).forEach(function (v) {
      L.circleMarker([v.lat, v.lng], { radius: 8, color: v.target ? '#ffb347' : '#2ee6a6', fillOpacity: 1 }).addTo(map).bindPopup((v.target ? 'Target \u00b7 ' : 'Live \u00b7 ') + v.name);
      bounds.push([v.lat, v.lng]);
    });
    if (bounds.length) map.fitBounds(bounds, { padding: [30, 30], maxZoom: 5 });
    setTimeout(function () { map.invalidateSize(); }, 200);
  }
  window.focusPatch = function (id) {
    const p = (SEED.patches || []).find(function (x) { return x.id === id; });
    if (!p || !window._adminMap) return;
    const h = hubsFor(p)[0];
    window._adminMap.flyTo([h.lat, h.lng], 12, { duration: 0.8 });
  };
  function areasHtml() {
    const cards = (SEED.patches || []).map(function (p) {
      const pubs = (SEED.venues || []).filter(function (v) { return v.patch === p.id; });
      const live = pubs.filter(function (v) { return !v.target; }).length;
      const aim = pubs.filter(function (v) { return v.target; }).length;
      return '<div class="card"><h3>' + p.name + '</h3><p class="muted">' + p.partner + ' \u00b7 10 km</p><p class="body">' + live + ' live \u00b7 ' + aim + ' target</p><p class="muted">' + pubs.map(function (v) { return v.name; }).join(' \u00b7 ') + '</p><button class="btn ghost" style="margin-top:8px" onclick="focusPatch(\'' + p.id + '\')">Zoom 10 km</button></div>';
    }).join('');
    return '<div class="eyebrow">Admin \u00b7 rollout</div><h2>Target patches</h2><p class="body">Perth south-west \u00b7 Sunshine Coast / Brisbane \u00b7 Mackay. Orange = 10 km. Green = live. Gold = target.</p><div id="admin-map" class="admin-map"></div><div class="grid two">' + cards + '</div>';
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
