(function () {
  function ensureVenueTab() {
    const nav = document.getElementById('nav-punter');
    if (!nav || document.getElementById('tab-venues') || nav.querySelector('[data-tab="venues"]')) return;
    const btn = document.createElement('button');
    btn.className = 'btn'; btn.id = 'tab-venues'; btn.dataset.tab = 'venues'; btn.textContent = 'Venues';
    btn.onclick = function () { showPunter('venues'); };
    const chats = nav.querySelector('[data-tab="chats"]');
    if (chats) nav.insertBefore(btn, chats); else nav.appendChild(btn);
  }
  window.renderTonight = function () {
    const main = document.getElementById('main');
    if (!main) return;
    let html = '<div class="eyebrow">Today</div><h2>What\'s on</h2><p class="muted">Games only. Pubs are on the Venues tab.</p>';
    (SEED.fixtures || []).forEach(function (f) {
      html += '<div class="card"><div class="pill">' + f.sport + '</div><h3>' + f.label + '</h3><p class="muted">' + f.start + ' \u00b7 ' + f.venue + '</p></div>';
    });
    main.innerHTML = html;
  };
  window.renderVenuesNear = function () {
    const main = document.getElementById('main');
    if (!main) return;
    const u = typeof me === 'function' ? me() : null;
    const here = (typeof suburb === 'function' && u) ? suburb(u.suburb) : SEED.suburbs[0];
    const plus = typeof isPlus === 'function' && isPlus();
    const cap = typeof FREE_KM === 'number' ? FREE_KM : 10;
    const rows = (SEED.venues || []).map(function (v) {
      const vs = typeof suburb === 'function' ? suburb(v.suburb) : { name: v.suburb, lat: v.lat, lng: v.lng };
      const dist = typeof km === 'function' ? km(here, vs) : 0;
      return { v: v, vs: vs, dist: dist };
    }).sort(function (a, b) { return a.dist - b.dist; });
    const shown = plus ? rows : rows.filter(function (r) { return r.dist <= cap; });
    let html = '<div class="eyebrow">Venues</div><h2>' + (plus ? 'All listed pubs' : 'Within ' + cap + ' km of ' + here.name) + '</h2><div class="list">';
    shown.forEach(function (row) {
      const v = row.v;
      const games = (SEED.fixtures || []).filter(function (f) { return (v.showing || []).indexOf(f.id) >= 0; });
      const fid = (games[0] || SEED.fixtures[0]).id;
      html += '<div class="item"><h3>' + v.name + '</h3><p class="muted">' + row.vs.name + ' \u00b7 ' + row.dist.toFixed(1) + ' km</p><p class="body">' + (v.deal || '') + '</p><div class="row" style="margin-top:8px"><button class="btn ghost" onclick="openVenueCard(\'' + v.id + '\')">What\'s on</button><button class="btn ghost" onclick="headTo(\'' + v.id + '\',\'' + fid + '\')">I\'m heading here</button><button class="btn" onclick="checkIn(\'' + v.id + '\',\'' + fid + '\')">I\'m here</button></div></div>';
    });
    html += '</div>';
    main.innerHTML = html;
  };
  const prev = window.showPunter;
  window.showPunter = function (tab) {
    ensureVenueTab();
    if (tab === 'venues') {
      const nav = document.getElementById('nav-punter');
      if (nav) {
        nav.classList.remove('hidden');
        [].forEach.call(nav.querySelectorAll('button'), function (b) { b.classList.toggle('active', b.dataset.tab === 'venues'); });
      }
      window.renderVenuesNear();
      return;
    }
    if (typeof prev === 'function') prev(tab);
  };
})();
