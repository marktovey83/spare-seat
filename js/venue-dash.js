(function () {
  function acc(id) { S.venueAccounts = S.venueAccounts || {}; S.venueAccounts[id] = S.venueAccounts[id] || {}; return S.venueAccounts[id]; }
  function mergeVenue(v) {
    if (!v) return v;
    const a = acc(v.id);
    ['deal','food','seats','reach','published','photos'].forEach(function (k) { if (a[k] !== undefined) v[k] = a[k]; });
    return v;
  }
  function persist(v) {
    const a = acc(v.id);
    a.deal = v.deal; a.food = v.food; a.seats = v.seats; a.reach = v.reach; a.published = v.published; a.photos = v.photos || [];
    store.save(S);
  }
  function photosHtml(v) {
    return (v.photos || []).map(function (src) {
      return '<img src="' + src + '" alt="" style="width:96px;height:68px;object-fit:cover;border-radius:10px;margin:4px 6px 8px 0;border:1px solid rgba(255,106,26,.4)" />';
    }).join('');
  }
  function canBook(v, user) {
    if (!v || !user) return false;
    const here = typeof suburb === 'function' ? suburb(user.suburb) : null;
    if (!here || typeof km !== 'function') return true;
    if (km(here, v) <= 10) return true;
    return !!(v.reach && typeof isPlus === 'function' && isPlus());
  }
  const prevHead = window.headTo, prevIn = window.checkIn;
  window.headTo = function (vid, fid) {
    const v = mergeVenue(venue(vid));
    if (!canBook(v, me())) { toast(v && v.reach ? 'Plus needed to book this far pub.' : 'This pub is 10 km only.'); return; }
    if (prevHead) prevHead(vid, fid);
  };
  window.checkIn = function (vid, fid) {
    const v = mergeVenue(venue(vid));
    if (!canBook(v, me())) { toast('Too far to check in here.'); return; }
    if (prevIn) prevIn(vid, fid);
  };
  window.addVenuePhoto = function (input) {
    const v = mergeVenue(venue(me().venueId));
    const file = input.files && input.files[0];
    if (!file) return;
    if (file.size > 900000) { toast('Keep photos under 1 MB for the demo.'); return; }
    const reader = new FileReader();
    reader.onload = function () { v.photos = (v.photos || []).slice(0, 2); v.photos.push(reader.result); persist(v); showVenue('offer'); };
    reader.readAsDataURL(file);
  };
  window.clearVenuePhotos = function () { const v = mergeVenue(venue(me().venueId)); v.photos = []; persist(v); showVenue('offer'); };
  window.saveVenueOffer = function () {
    const v = mergeVenue(venue(me().venueId));
    v.deal = document.getElementById('v-deal').value.trim();
    v.food = document.getElementById('v-food').value.trim();
    v.seats = parseInt(document.getElementById('v-seats').value, 10) || 8;
    v.reach = document.getElementById('v-reach').checked;
    v.published = document.getElementById('v-pub').checked;
    persist(v);
    toast(v.published ? 'Published — users see this offer.' : 'Saved as draft.');
    showVenue('offer');
  };
  window.staffTick = function (uid, vid, fid) {
    S.here = S.here || {};
    const row = Object.values(S.heading || {}).find(function (h) { return h.userId === uid && h.venueId === vid && h.fixtureId === fid; });
    S.here[uid + fid] = { userId: uid, name: row ? row.name : uid, venueId: vid, fixtureId: fid, at: Date.now() };
    store.save(S);
    const n = typeof countHere === 'function' ? countHere(vid, fid) : 0;
    toast(n && n % 3 === 0 ? 'Ticked. SEND the jug / platter now.' : 'Ticked as here.');
    showVenue('tonight');
  };
  window.openVenueCard = function (vid) {
    const v = mergeVenue(venue(vid));
    const main = document.getElementById('main');
    const games = (SEED.fixtures || []).filter(function (f) { return (v.showing || []).indexOf(f.id) >= 0; });
    const fid = (games[0] || SEED.fixtures[0] || {}).id;
    main.innerHTML = '<button class="ss-back" onclick="showPunter(\'venues\')">\u2190 Venues</button><div class="eyebrow">' + (v.published === false ? 'Draft' : 'Published offer') + '</div><h2>' + v.name + '</h2>' + photosHtml(v) + '<div class="card"><h3>On the table</h3><p class="body">' + (v.deal || 'No drink offer yet') + '</p><p class="body">' + (v.food || 'No food offer yet') + '</p><p class="muted">' + (v.seats || 0) + ' seats</p></div><div class="row" style="margin-top:12px"><button class="btn ghost" onclick="headTo(\'' + v.id + '\',\'' + fid + '\')">I\'m heading here</button><button class="btn" onclick="checkIn(\'' + v.id + '\',\'' + fid + '\')">I\'m here</button></div>';
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
        navV.innerHTML = '<button class="btn" data-tab="tonight" onclick="showVenue(\'tonight\')">Floor</button><button class="btn" data-tab="offer" onclick="showVenue(\'offer\')">Offer</button><button class="btn" data-tab="near" onclick="showVenue(\'near\')">Nearby</button>';
        navV.dataset.ready = '1';
      }
      [].forEach.call(navV.querySelectorAll('button'), function (b) { b.classList.toggle('active', b.dataset.tab === tab); });
    }
    const v = mergeVenue(venue(me().venueId));
    const main = document.getElementById('main');
    if (!v || !main) return;
    if (tab === 'offer') {
      main.innerHTML = '<div class="eyebrow">Offer</div><h2>' + v.name + '</h2>' + photosHtml(v) + '<div class="card"><label>Drink / jug</label><input id="v-deal" value="' + String(v.deal || '').replace(/"/g,'&quot;') + '" /><label>Food / platter</label><input id="v-food" value="' + String(v.food || '').replace(/"/g,'&quot;') + '" /><label>Seats</label><input id="v-seats" type="number" value="' + (v.seats || 8) + '" /><label>Photos</label><input type="file" accept="image/*" onchange="addVenuePhoto(this)" /><label class="plan" style="margin-top:12px"><input type="checkbox" id="v-pub" ' + (v.published !== false ? 'checked' : '') + ' /> <b>Publish</b></label><label class="plan plus"><input type="checkbox" id="v-reach" ' + (v.reach ? 'checked' : '') + ' /> <b>Reach $49/mo</b></label><button class="btn" style="margin-top:12px" onclick="saveVenueOffer()">Save and publish</button></div>';
      return;
    }
    if (tab === 'near') {
      const close = (SEED.venues || []).filter(function (x) { return x.id !== v.id && typeof km === 'function' && km(v, x) <= 10; });
      let html = '<div class="eyebrow">Nearby</div><h2>Other doors inside 10 km</h2><div class="list">';
      close.forEach(function (x) { mergeVenue(x); html += '<div class="item"><h3>' + x.name + '</h3>' + photosHtml(x) + '<p class="body">' + (x.deal || '') + '</p><p class="body">' + (x.food || '') + '</p></div>'; });
      main.innerHTML = html + '</div>';
      return;
    }
    const games = (SEED.fixtures || []).filter(function (f) { return (v.showing || []).indexOf(f.id) >= 0; });
    let html = '<div class="eyebrow">Floor</div><h2>' + v.name + '</h2><p class="body">' + (v.deal || '') + ' \u00b7 ' + (v.food || '') + '</p><p class="muted">Tick them when they walk in. Every 3 here = send the next jug / platter.</p>';
    games.forEach(function (f) {
      const head = Object.values(S.heading || {}).filter(function (h) { return h.venueId === v.id && h.fixtureId === f.id; });
      const hereMap = {};
      Object.values(S.here || {}).forEach(function (h) { if (h.venueId === v.id && h.fixtureId === f.id) hereMap[h.userId] = true; });
      const hereN = Object.keys(hereMap).length;
      const due = hereN > 0 && hereN % 3 === 0;
      html += '<div class="card"><h3>' + f.label + '</h3><div class="row"><div><div class="stat">' + head.length + '</div><div class="muted">booked</div></div><div><div class="stat">' + hereN + '</div><div class="muted">here</div></div><div><div class="stat">' + Math.floor(hereN / 3) + '</div><div class="muted">sent</div></div></div>' + (due ? '<p class="pill">SEND NOW</p>' : '<p class="muted">' + (3 - (hereN % 3)) + ' more until next send</p>') + '<table><thead><tr><th>Patron</th><th>Status</th><th></th></tr></thead><tbody>';
      head.forEach(function (h) {
        const inDoor = !!hereMap[h.userId];
        html += '<tr><td>' + h.name + '</td><td>' + (inDoor ? '\u2713 Here' : 'Heading') + '</td><td>' + (inDoor ? '' : '<button class="btn ghost" onclick="staffTick(\'' + h.userId + '\',\'' + v.id + '\',\'' + f.id + '\')">Tick here</button>') + '</td></tr>';
      });
      if (!head.length) html += '<tr><td colspan="3">No one booked yet</td></tr>';
      html += '</tbody></table></div>';
    });
    main.innerHTML = html;
  };
})();
