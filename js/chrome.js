(function () {
  function addNavLogout(nav) {
    if (!nav) return;
    var b = document.getElementById('nav-logout');
    if (!b) {
      b = document.createElement('button');
      b.id = 'nav-logout';
      b.className = 'btn';
      b.textContent = 'Log out';
      b.onclick = function () { if (typeof logout === 'function') logout(); };
    }
    nav.appendChild(b);
    b.style.display = 'inline-flex';
  }
  function paintChrome() {
    var sess = window.S && S.session;
    var app = document.getElementById('view-app');
    var inApp = app && !app.classList.contains('hidden');
    if (sess || inApp) {
      document.body.classList.add('ss-in');
      document.body.classList.remove('gate-on');
    }
    addNavLogout(document.getElementById('nav-punter'));
    addNavLogout(document.getElementById('nav-venue'));
    addNavLogout(document.getElementById('nav-admin'));
    var bar = document.getElementById('topbar');
    var out = document.getElementById('btn-out');
    if (bar && (sess || inApp)) bar.style.display = 'flex';
    if (out) {
      out.textContent = 'Log out';
      out.onclick = function () { if (typeof logout === 'function') logout(); };
      out.style.display = 'inline-flex';
    }
  }
  window.openAccount = function () {
    var sess = S.session;
    if (!sess) return;
    if (sess.role === 'venue' && typeof showVenueAccount === 'function') return showVenueAccount();
    if (sess.role === 'venue' && typeof showVenue === 'function') return showVenue('offer');
    if (typeof showPunter === 'function') showPunter('me');
  };
  var prevRoute = window.route;
  window.route = function () { if (typeof prevRoute === 'function') prevRoute(); paintChrome(); };
  var prevP = window.showPunter;
  window.showPunter = function (tab) {
    if (typeof prevP === 'function') prevP(tab);
    paintChrome();
  };
  document.addEventListener('DOMContentLoaded', paintChrome);
  setTimeout(paintChrome, 200);
  setTimeout(paintChrome, 1000);
})();
