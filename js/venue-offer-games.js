(function () {
  function acc(id) {
    S.venueAccounts = S.venueAccounts || {};
    S.venueAccounts[id] = S.venueAccounts[id] || {};
    return S.venueAccounts[id];
  }
  function paintOffer() {
    var sess = S.session;
    if (!sess || sess.role !== 'venue') return;
    var v = typeof venue === 'function' ? venue(sess.venueId) : null;
    var main = document.getElementById('main');
    if (!v || !main) return;
    var a = acc(v.id);
    var offers = a.gameOffers || {};
    var html = '<div class="eyebrow">Venue \u00b7 offer</div><h2>' + v.name + '</h2><p class="muted">One offer per game. Tick the screen, write the table deal, mark if it is women only.</p><div class="card"><label class="plan"><input type="checkbox" id="v-pub" ' + (a.published !== false ? 'checked' : '') + ' /> <b>Publish pin</b></label><label class="plan plus"><input type="checkbox" id="v-reach" ' + (a.reach ? 'checked' : '') + ' /> <b>Reach $49/mo</b></label></div>';
    (SEED.fixtures || []).forEach(function (f) {
      var o = offers[f.id] || {};
      var on = o.on || (v.showing || []).indexOf(f.id) >= 0;
      html += '<div class="card"><div class="pill">' + f.sport + '</div><h3>' + f.label + '</h3><p class="muted">' + f.start + (f.lounge ? ' \u00b7 ' + f.lounge : '') + ' \u00b7 ' + (f.venue || '') + '</p><label class="plan"><input class="g-on" data-fid="' + f.id + '" type="checkbox" ' + (on ? 'checked' : '') + ' /> <b>We are showing this</b></label><label>Drink / jug</label><input id="deal-' + f.id + '" value="' + String(o.deal || a.deal || v.deal || '').replace(/"/g, '&quot;') + '" /><label>Food / platter</label><input id="food-' + f.id + '" value="' + String(o.food || a.food || v.food || '').replace(/"/g, '&quot;') + '" /><label>Seats</label><input id="seats-' + f.id + '" type="number" value="' + (o.seats || a.seats || v.seats || 8) + '" /><label class="plan" style="margin-top:10px"><input class="g-women" data-fid="' + f.id + '" type="checkbox" ' + (o.womenOnly ? 'checked' : '') + ' /> <b>Women\'s table only</b> \u2014 men do not book this screen</label></div>';
    });
    html += '<button class="btn" onclick="saveVenueOffer()">Save and stay on Offer</button>';
    main.innerHTML = html;
  }
  var prev = window.showVenue;
  window.showVenue = function (tab) {
    if (tab === 'offer') {
      var navP = document.getElementById('nav-punter');
      var navA = document.getElementById('nav-admin');
      var navV = document.getElementById('nav-venue');
      if (navP) navP.classList.add('hidden');
      if (navA) navA.classList.add('hidden');
      if (navV) {
        navV.classList.remove('hidden');
        [].slice.call(navV.querySelectorAll('button')).forEach(function (b) { b.classList.toggle('active', b.dataset.tab === 'offer'); });
      }
      paintOffer();
      return;
    }
    if (typeof prev === 'function') prev(tab);
  };
  window.saveVenueOffer = function () {
    var sess = S.session;
    if (!sess || sess.role !== 'venue') return;
    var v = venue(sess.venueId);
    var a = acc(v.id);
    a.published = !!(document.getElementById('v-pub') && document.getElementById('v-pub').checked);
    a.reach = !!(document.getElementById('v-reach') && document.getElementById('v-reach').checked);
    a.gameOffers = a.gameOffers || {};
    a.showing = [];
    (SEED.fixtures || []).forEach(function (f) {
      var onEl = document.querySelector('.g-on[data-fid="' + f.id + '"]');
      var wEl = document.querySelector('.g-women[data-fid="' + f.id + '"]');
      var row = {
        on: !!(onEl && onEl.checked),
        deal: (document.getElementById('deal-' + f.id) || {}).value || '',
        food: (document.getElementById('food-' + f.id) || {}).value || '',
        seats: parseInt((document.getElementById('seats-' + f.id) || {}).value, 10) || 8,
        womenOnly: !!(wEl && wEl.checked)
      };
      a.gameOffers[f.id] = row;
      if (row.on) a.showing.push(f.id);
    });
    a.pickedDate = new Date().toDateString();
    v.showing = a.showing;
    v.reach = a.reach;
    v.published = a.published;
    store.save(S);
    toast('Offers saved for ' + a.showing.length + ' games.');
    paintOffer();
  };
  var prevHead = window.headTo;
  window.headTo = function (vid, fid) {
    var a = acc(vid);
    var o = (a.gameOffers || {})[fid] || {};
    var u = typeof me === 'function' ? me() : null;
    if (o.womenOnly && u && String(u.gender || '').toLowerCase() !== 'female') {
      toast('That table is women only.');
      return;
    }
    if (typeof prevHead === 'function') prevHead(vid, fid);
  };
})();
