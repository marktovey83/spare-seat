(function () {
  function paintChrome() {
    var bar = document.getElementById('topbar');
    if (!bar) return;
    var sess = window.S && S.session;
    if (!sess) { bar.style.display = ''; return; }
    document.body.classList.remove('gate-on');
    bar.style.display = 'flex';
    var who = document.getElementById('who');
    if (who) who.textContent = sess.role === 'admin' ? 'Admin' : sess.role === 'venue' ? (sess.venueName || 'Venue') : ((sess.name || 'User') + (typeof isPlus === 'function' && isPlus() ? ' \u00b7 Plus' : ''));
    var acct = document.getElementById('btn-account');
    if (!acct) {
      acct = document.createElement('button');
      acct.id = 'btn-account';
      acct.className = 'btn ghost';
      acct.textContent = 'Account';
      bar.appendChild(acct);
    }
    acct.onclick = openAccount;
    acct.style.display = sess.role === 'admin' ? 'none' : 'inline-flex';
    var out = document.getElementById('btn-out');
    if (!out) {
      out = document.createElement('button');
      out.id = 'btn-out';
      out.className = 'btn';
      bar.appendChild(out);
    }
    out.textContent = 'Log out';
    out.className = 'btn';
    out.style.display = 'inline-flex';
    out.onclick = function () { if (typeof logout === 'function') logout(); };
  }
  window.openAccount = function () {
    var sess = S.session;
    if (!sess) return;
    if (sess.role === 'venue') return showVenueAccount();
    if (typeof showPunter === 'function') showPunter('me');
  };
  window.showVenueAccount = window.showVenueAccount || function () {
    if (typeof showVenue === 'function') showVenue('offer');
  };
  var prevRoute = window.route;
  window.route = function () { if (typeof prevRoute === 'function') prevRoute(); paintChrome(); };
  document.addEventListener('DOMContentLoaded', paintChrome);
  setTimeout(paintChrome, 200);
  setTimeout(paintChrome, 800);
})();
