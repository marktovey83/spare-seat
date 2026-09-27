(function () {
  function acc(id) {
    S.venueAccounts = S.venueAccounts || {};
    S.venueAccounts[id] = S.venueAccounts[id] || {};
    return S.venueAccounts[id];
  }
  function kickoff(f) {
    if (!f || !f.start) return null;
    var m = String(f.start).match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
    if (!m) return null;
    var h = parseInt(m[1], 10) % 12;
    if (/pm/i.test(m[3])) h += 12;
    var min = parseInt(m[2], 10);
    var d = new Date();
    var label = String(f.start).toLowerCase();
    var names = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    var idx = -1;
    names.forEach(function (n, i) { if (label.indexOf(n) >= 0) idx = i; });
    if (idx >= 0) {
      var add = (idx - d.getDay() + 7) % 7;
      d.setDate(d.getDate() + add);
    }
    d.setHours(h, min, 0, 0);
    if (d.getTime() < Date.now() - 3 * 3600000 && idx < 0) d.setDate(d.getDate() + 1);
    return d;
  }
  function minsUntil(f) {
    var k = kickoff(f);
    if (!k) return 99999;
    return (k.getTime() - Date.now()) / 60000;
  }
  function memberOn() {
    var el = document.getElementById('v-member');
    if (el) return !!el.checked;
    var sess = S.session;
    if (!sess || !sess.venueId) return false;
    return !!acc(sess.venueId).member;
  }
  function lockMins() { return memberOn() ? 60 : 90; }
  function offerText(o) {
    if (!o) return '';
    return [o.deal || '', o.food || '', String(o.seats || ''), o.womenOnly ? 'w' : ''].join('|');
  }
  var prevSave = window.saveVenueOffer;
  window.saveVenueOffer = function () {
    var sess = S.session;
    if (!sess || sess.role !== 'venue') { if (prevSave) prevSave(); return; }
    var v = typeof venue === 'function' ? venue(sess.venueId) : null;
    if (!v) return;
    var a = acc(v.id);
    a.member = memberOn();
    var blocked = [];
    var needsMember = false;
    (SEED.fixtures || []).forEach(function (f) {
      var prev = (a.gameOffers || {})[f.id] || {};
      var onEl = document.querySelector('.g-on[data-fid="' + f.id + '"]');
      var wEl = document.querySelector('.g-women[data-fid="' + f.id + '"]');
      var next = {
        on: !!(onEl && onEl.checked),
        deal: (document.getElementById('deal-' + f.id) || {}).value || '',
        food: (document.getElementById('food-' + f.id) || {}).value || '',
        seats: parseInt((document.getElementById('seats-' + f.id) || {}).value, 10) || 8,
        womenOnly: !!(wEl && wEl.checked)
      };
      var had = offerText(prev);
      var now = offerText(next);
      var changed = had && had !== now;
      if (!changed) return;
      if (!a.member) needsMember = true;
      if (minsUntil(f) < (a.member ? 60 : 90)) blocked.push(f.label);
    });
    if (needsMember) {
      toast('Free to list. Membership is needed to change an offer so it matches or beats another pub.');
      return;
    }
    if (blocked.length) {
      toast('Locked. Free venues lock 90 min out. Members lock 60 min out. ' + blocked[0]);
      return;
    }
    if (typeof prevSave === 'function') prevSave();
  };
  function rivals(vid, fid) {
    return (SEED.venues || []).filter(function (v) { return v.id !== vid && (v.showing || []).indexOf(fid) >= 0; }).map(function (v) {
      var a = (S.venueAccounts && S.venueAccounts[v.id]) || {};
      var o = (a.gameOffers || {})[fid] || {};
      return v.name + ': ' + (o.deal || v.deal || 'no drink offer') + (o.food || v.food ? ' · ' + (o.food || v.food) : '');
    });
  }
  function decorateOffer() {
    var main = document.getElementById('main');
    var sess = S.session;
    if (!main || !sess || sess.role !== 'venue' || document.getElementById('v-member')) return;
    var v = typeof venue === 'function' ? venue(sess.venueId) : null;
    if (!v) return;
    var a = acc(v.id);
    var box = document.createElement('div');
    box.className = 'card';
    var lines = (SEED.fixtures || []).map(function (f) {
      var mins = Math.round(minsUntil(f));
      var lock = mins < lockMins();
      var others = rivals(v.id, f.id);
      ['deal-', 'food-', 'seats-'].forEach(function (p) {
        var el = document.getElementById(p + f.id);
        if (el && lock) el.disabled = true;
      });
      return '<p class="body"><b>' + f.label + '</b> · ' + (lock ? 'changes locked' : (mins > 24 * 60 ? 'open' : mins + ' min to lock')) + ' · free locks at 90, member at 60</p>' +
        (others.length ? '<p class="muted">Competition: ' + others.join(' | ') + '</p>' : '');
    }).join('');
    box.innerHTML = '<label class="plan plus"><input type="checkbox" id="v-member" ' + (a.member ? 'checked' : '') + ' onchange="decorateVenueOffer()" /> <b>Venue member</b> — change your offer to match or better the competition. Locks 60 minutes before the game. Free locks at 90.</label>' + lines;
    var btn = main.querySelector('button.btn');
    if (btn) main.insertBefore(box, btn); else main.appendChild(box);
  }
  window.decorateVenueOffer = decorateOffer;
  var prevShow = window.showVenue;
  window.showVenue = function (tab) {
    if (typeof prevShow === 'function') prevShow(tab);
    if (tab === 'offer') decorateOffer();
  };
  var prevHead = window.headTo;
  function paintChoice(p) {
    window._choice = p;
    var main = document.getElementById('main');
    if (!main) return;
    var old = document.getElementById('choice-card');
    if (old) old.remove();
    var from = p.from ? (typeof venue === 'function' ? venue(p.from) : null) : null;
    var to = p.vid ? (typeof venue === 'function' ? venue(p.vid) : null) : null;
    var card = document.createElement('div');
    card.id = 'choice-card';
    card.className = 'card';
    card.innerHTML = '<h3>' + (p.mode === 'drop' ? 'Not going?' : 'Change where you are going?') + '</h3><p class="body">' +
      (p.mode === 'drop' ? 'You will come off the list.' : ('From ' + ((from && from.name) || 'the other pub') + ' to ' + ((to && to.name) || 'this pub') + '.')) +
      '</p><label class="plan"><input type="checkbox" id="better-yes" /> <b>Yes</b> — I am changing for a better offer</label><div class="row" style="margin-top:10px"><button class="btn" onclick="confirmSeatChange()">Confirm</button><button class="btn ghost" onclick="document.getElementById(\'choice-card\').remove()">Cancel</button></div>';
    main.insertBefore(card, main.firstChild);
  }
  window.headTo = function (vid, fid) {
    var u = typeof me === 'function' ? me() : null;
    if (!u) return;
    var cur = (S.heading || {})[u.id + fid];
    if (cur && cur.venueId === vid) {
      toast('You are already on this list. Use Not going if you have changed your mind.');
      return;
    }
    if (cur && cur.venueId !== vid) {
      paintChoice({ mode: 'change', vid: vid, fid: fid, from: cur.venueId });
      return;
    }
    if (typeof prevHead === 'function') prevHead(vid, fid);
  };
  window.notGoing = function (fid) {
    var u = me();
    if (!S.heading || !S.heading[u.id + fid]) { toast('You are not on a list for that game.'); return; }
    paintChoice({ mode: 'drop', fid: fid, from: S.heading[u.id + fid].venueId });
  };
  window.confirmSeatChange = function () {
    var box = document.getElementById('better-yes');
    if (!box || !box.checked) { toast('Tick yes if you are changing for a better offer.'); return; }
    var p = window._choice || {};
    var u = me();
    S.seatChanges = S.seatChanges || [];
    S.seatChanges.push({ at: Date.now(), userId: u.id, fid: p.fid, from: p.from || '', to: p.vid || '', betterOffer: true, mode: p.mode });
    if (p.mode === 'drop') {
      delete S.heading[u.id + p.fid];
      if (S.here) delete S.here[u.id + p.fid];
      store.save(S);
      toast('You are not going.');
    } else if (typeof prevHead === 'function') {
      prevHead(p.vid, p.fid);
    }
    var card = document.getElementById('choice-card');
    if (card) card.remove();
    if (typeof renderVenuesNear === 'function') renderVenuesNear();
  };
  var prevVenues = window.renderVenuesNear;
  window.renderVenuesNear = function () {
    if (typeof prevVenues === 'function') prevVenues();
    var u = typeof me === 'function' ? me() : null;
    var main = document.getElementById('main');
    if (!u || !main) return;
    (SEED.fixtures || []).forEach(function (f) {
      var row = (S.heading || {})[u.id + f.id];
      if (!row) return;
      var v = typeof venue === 'function' ? venue(row.venueId) : null;
      var note = document.createElement('div');
      note.className = 'card';
      note.innerHTML = '<p class="body">You are going to <b>' + ((v && v.name) || 'a pub') + '</b> for ' + f.label + '.</p><button class="btn ghost" onclick="notGoing(\'' + f.id + '\')">Not going</button>';
      main.appendChild(note);
    });
  };
})();
