(function () {
  function hideRibbonAccount() {
    var acct = document.getElementById('btn-account');
    if (acct) {
      acct.remove();
    }
  }
  function paintChrome() {
    hideRibbonAccount();
    var sess = window.S && S.session;
    var app = document.getElementById('view-app');
    var inApp = app && !app.classList.contains('hidden');
    if (sess || inApp) {
      document.body.classList.add('ss-in');
      document.body.classList.remove('gate-on');
    }
    var bar = document.getElementById('topbar');
    var out = document.getElementById('btn-out');
    if (bar && (sess || inApp)) bar.style.display = 'flex';
    if (out) {
      out.textContent = 'Log out';
      out.onclick = function () { if (typeof logout === 'function') logout(); };
      out.style.display = 'inline-flex';
    }
    var who = document.getElementById('who');
    if (who && sess) {
      who.textContent = sess.role === 'admin' ? 'Admin' : sess.role === 'venue' ? (sess.venueName || 'Venue') : ((sess.name || 'User') + (typeof isPlus === 'function' && isPlus() ? ' \u00b7 Plus' : ''));
    }
    ensureVenueMe();
  }
  function ensureVenueMe() {
    var nav = document.getElementById('nav-venue');
    if (!nav || nav.classList.contains('hidden')) return;
    if (document.getElementById('venue-me-btn')) return;
    var b = document.createElement('button');
    b.id = 'venue-me-btn';
    b.className = 'btn';
    b.dataset.tab = 'me';
    b.textContent = 'Me';
    b.onclick = function () { if (typeof showVenueAccount === 'function') showVenueAccount(); };
    nav.appendChild(b);
  }
  window.openAccount = function () {
    var sess = S.session;
    if (!sess) return;
    if (sess.role === 'venue' && typeof showVenueAccount === 'function') return showVenueAccount();
    if (typeof showPunter === 'function') showPunter('me');
  };
  window.showVenueAccount = window.showVenueAccount || function () {
    var sess = S.session;
    var v = typeof venue === 'function' ? venue(sess.venueId) : null;
    var extra = (S.venueAccounts && S.venueAccounts[sess.venueId]) || {};
    var main = document.getElementById('main');
    if (!main) return;
    var navV = document.getElementById('nav-venue');
    if (navV) [].slice.call(navV.querySelectorAll('button')).forEach(function (b) { b.classList.toggle('active', b.dataset.tab === 'me'); });
    main.innerHTML = '<div class="eyebrow">Venue \u00b7 Me</div><h2>' + ((v && v.name) || sess.venueName || 'Venue') + '</h2><div class="card"><p class="muted">Pub login details live here, not on the top bar.</p><label>Venue name</label><input id="va-name" value="' + (((v && v.name) || '').replace(/"/g, '&quot;')) + '" /><label>Email</label><input id="va-email" value="' + ((extra.email || sess.email || '').replace(/"/g, '&quot;')) + '" /><label>Suburb</label><input id="va-sub" value="' + ((v && v.suburb) || '') + '" /><label>Staff PIN</label><input id="va-pin" value="' + ((v && v.pin) || extra.pin || '4821') + '" /><label>New password</label><input id="va-pass" type="password" placeholder="Leave blank to keep" /><p class="body" style="margin-top:12px">Reach ' + (extra.reach || (v && v.reach) ? 'on \u00b7 $49/mo' : 'off') + ' \u00b7 Insights ' + (extra.insights || (v && v.insights) ? 'on \u00b7 $29/mo' : 'off') + '</p><div class="row" style="margin-top:12px"><button class="btn" onclick="saveVenueAccount()">Save</button><button class="btn ghost" onclick="logout()">Log out</button></div></div>';
  };
  window.saveVenueAccount = window.saveVenueAccount || function () {
    var sess = S.session;
    if (!sess || sess.role !== 'venue') return;
    S.venueAccounts = S.venueAccounts || {};
    var row = S.venueAccounts[sess.venueId] || {};
    row.email = (document.getElementById('va-email') || {}).value;
    row.pin = (document.getElementById('va-pin') || {}).value;
    var pass = (document.getElementById('va-pass') || {}).value;
    if (pass) row.pass = pass;
    S.venueAccounts[sess.venueId] = row;
    var v = typeof venue === 'function' ? venue(sess.venueId) : null;
    if (v) {
      v.name = (document.getElementById('va-name') || {}).value || v.name;
      v.suburb = (document.getElementById('va-sub') || {}).value || v.suburb;
      v.pin = row.pin;
      sess.venueName = v.name;
    }
    store.save(S);
    toast('Saved on Me');
    showVenueAccount();
  };
  var prevRoute = window.route;
  window.route = function () { if (typeof prevRoute === 'function') prevRoute(); paintChrome(); };
  var prevP = window.showPunter;
  window.showPunter = function (tab) { if (typeof prevP === 'function') prevP(tab); paintChrome(); };
  var prevV = window.showVenue;
  window.showVenue = function (tab) { if (typeof prevV === 'function') prevV(tab); paintChrome(); };
  document.addEventListener('DOMContentLoaded', paintChrome);
  setTimeout(paintChrome, 200);
})();
