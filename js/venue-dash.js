(function () {
  function canBook(v, user) {
    if (!v || !user) return false;
    const here = typeof suburb === 'function' ? suburb(user.suburb) : null;
    if (!here || typeof km !== 'function') return true;
    if (km(here, v) <= 10) return true;
    const plus = typeof isPlus === 'function' && isPlus();
    return !!(v.reach && plus);
  }
  const prevHead = window.headTo;
  const prevIn = window.checkIn;
  window.headTo = function (vid, fid) {
    const v = venue(vid);
    if (!canBook(v, me())) {
      toast(v && v.reach ? 'Plus needed to book this far pub.' : 'This pub is 10 km only. They can turn on Reach.');
      return;
    }
    if (typeof prevHead === 'function') prevHead(vid, fid);
  };
  window.checkIn = function (vid, fid) {
    const v = venue(vid);
    if (!canBook(v, me())) { toast('Too far to check in here.'); return; }
    if (typeof prevIn === 'function') prevIn(vid, fid);
  };
  window.saveVenueOffer = function () {
    const v = venue(me().venueId);
    if (!v) return;
    v.deal = (document.getElementById('v-deal') || {}).value || v.deal;
    v.seats = parseInt((document.getElementById('v-seats') || {}).value, 10) || v.seats;
    v.reach = !!(document.getElementById('v-reach') && document.getElementById('v-reach').checked);
    S.venueAccounts = S.venueAccounts || {};
    S.venueAccounts[v.id] = Object.assign({}, S.venueAccounts[v.id] || {}, { deal: v.deal, seats: v.seats, reach: v.reach });
    store.save(S);
    toast(v.reach ? 'Offer saved. Reach is on.' : 'Offer saved. Bookings stay inside 10 km.');
    showVenue('offer');
  };
  window.showVenue = function (tab) {
    tab = tab || 'tonight';
    const navP = document.getElementById('nav-punter');
    const navA = document.getElementById('nav-admin');
    const navV = document.getElementById('nav-venue');
    if (navP) navP.classList.add('hidden');
    if (navA) navA.classList.add('hidden');
    if (navV) {
      navV.classList.remove('hidden');
      if (!navV.dataset.ready) {
        navV.innerHTML = '<button class="btn" data-tab="tonight" onclick="showVenue(\'tonight\')">Tonight</button><button class="btn" data-tab="offer" onclick="showVenue(\'offer\')">Our offer</button><button class="btn" data-tab="near" onclick="showVenue(\'near\')">Nearby pubs</button>';
        navV.dataset.ready = '1';
      }
      [].forEach.call(navV.querySelectorAll('button'), function (b) { b.classList.toggle('active', b.dataset.tab === tab); });
    }
    const v = venue(me().venueId);
    const main = document.getElementById('main');
    if (!v || !main) return;
    const saved = (S.venueAccounts && S.venueAccounts[v.id]) || {};
    if (saved.deal) v.deal = saved.deal;
    if (saved.seats) v.seats = saved.seats;
    if (typeof saved.reach === 'boolean') v.reach = saved.reach;
    if (tab === 'offer') {
      main.innerHTML = '<div class="eyebrow">Venue \u00b7 offer</div><h2>' + v.name + '</h2><p class="muted">What people see on your pin.</p><div class="card"><label>What\'s on the table</label><input id="v-deal" value="' + String(v.deal || '').replace(/"/g, '&quot;') + '" /><label>Seats held</label><input id="v-seats" type="number" value="' + (v.seats || 8) + '" /><label class="plan plus" style="margin-top:12px"><input type="checkbox" id="v-reach" ' + (v.reach ? 'checked' : '') + ' /> <b>Reach \u00b7 $49 / month</b> \u2014 people outside 10 km can book</label><p class="muted">Off = only users inside 10 km. On = Plus users anywhere can book you.</p><button class="btn" style="margin-top:12px" onclick="saveVenueOffer()">Save offer</button></div>';
      return;
    }
    if (tab === 'near') {
      const others = (SEED.venues || []).filter(function (x) { return x.id !== v.id; }).map(function (x) {
        return { x: x, dist: typeof km === 'function' ? km(v, x) : 0 };
      }).sort(function (a, b) { return a.dist - b.dist; });
      const close = others.filter(function (r) { return r.dist <= 10; });
      const far = others.filter(function (r) { return r.dist > 10; });
      let html = '<div class="eyebrow">Venue \u00b7 nearby</div><h2>Other doors inside 10 km</h2><p class="muted">Their offer. Not their bookings.</p><div class="list">';
      if (!close.length) html += '<p class="muted">No other listed pubs inside 10 km yet.</p>';
      close.forEach(function (row) {
        const x = row.x;
        const games = (SEED.fixtures || []).filter(function (f) { return (x.showing || []).indexOf(f.id) >= 0; });
        html += '<div class="item"><h3>' + x.name + '</h3><p class="muted">' + row.dist.toFixed(1) + ' km \u00b7 ' + (x.reach ? 'Reach on' : 'local only') + '</p><p class="body">' + (x.deal || 'No offer posted') + '</p><p class="muted">' + games.map(function (f) { return f.label; }).join(' \u00b7 ') + '</p></div>';
      });
      html += '</div>';
      if (far.length) {
        html += '<h2>Further out</h2><div class="list">';
        far.forEach(function (row) {
          html += '<div class="item"><h3>' + row.x.name + '</h3><p class="muted">' + row.dist.toFixed(1) + ' km</p><p class="body">' + (row.x.deal || '') + '</p></div>';
        });
        html += '</div>';
      }
      main.innerHTML = html;
      return;
    }
    let html = '<div class="eyebrow">Venue</div><h2>' + v.name + '</h2><p class="body">' + (v.deal || 'Add an offer') + ' \u00b7 ' + (v.seats || 0) + ' seats \u00b7 ' + (v.reach ? 'Reach on' : '10 km bookings only') + '</p>';
    const games = (SEED.fixtures || []).filter(function (f) { return (v.showing || []).indexOf(f.id) >= 0; });
    games.forEach(function (f) {
      const head = Object.values(S.heading || {}).filter(function (h) { return h.venueId === v.id && h.fixtureId === f.id; });
      const here = Object.values(S.here || {}).filter(function (h) { return h.venueId === v.id && h.fixtureId === f.id; });
      html += '<div class="card"><h3>' + f.label + '</h3><div class="row"><div><div class="stat">' + head.length + '</div><div class="muted">heading</div></div><div><div class="stat">' + here.length + '</div><div class="muted">here</div></div></div></div>';
    });
    main.innerHTML = html;
  };
})();
