(function () {
  function esc(s) {
    return String(s || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  }
  function fixtureFor(key) {
    var list = (window.SEED && SEED.fixtures) || [];
    var id = '';
    var m = String(key).match(/^match:(.+)$/);
    if (m) id = m[1];
    var found = list.filter(function (f) { return f.id === id; })[0];
    return found || list[0] || null;
  }
  function teamsFor(key) {
    var f = fixtureFor(key);
    if (!f) return ['Home', 'Away'];
    if (f.label && f.label.indexOf(' vs ') >= 0) return f.label.split(' vs ').map(function (s) { return s.trim(); });
    return [f.home || 'Home', f.away || 'Away'];
  }
  function remember(key, team) {
    window._side = window._side || {};
    window._side[key] = team;
    if (!window.S) return;
    S.loungeSide = S.loungeSide || {};
    S.loungeSide[key] = team;
    S.sidePin = S.sidePin || {};
    S.watching = S.watching || {};
    var u = typeof me === 'function' ? me() : null;
    var f = fixtureFor(key);
    if (u) {
      S.sidePin[u.id] = team;
      if (f) {
        S.watching[u.id] = f.id;
        u.watching = f.id;
        u.clubs = u.clubs || {};
        u.clubs[f.sport || 'AFL'] = team;
      }
      var row = (S.users || []).find(function (x) { return x.id === u.id; });
      if (row && f) {
        row.watching = f.id;
        row.clubs = row.clubs || {};
        row.clubs[f.sport || 'AFL'] = team;
      }
    }
    if (window.store) store.save(S);
  }
  function known(key) {
    if (window._side && window._side[key]) return window._side[key];
    if (window.S && S.loungeSide && S.loungeSide[key]) {
      window._side = window._side || {};
      window._side[key] = S.loungeSide[key];
      return window._side[key];
    }
    return '';
  }
  function stamp(team) {
    var main = document.getElementById('main');
    if (!main || main.querySelector('.going-for')) return;
    var h = main.querySelector('h2');
    if (!h) return;
    var p = document.createElement('p');
    p.className = 'muted going-for';
    p.textContent = "You're going for " + team;
    h.insertAdjacentElement('afterend', p);
  }
  var orig = window.enterLounge;
  window.enterLounge = function (key, title) {
    if (typeof orig !== 'function') return;
    if (String(key).indexOf('dm:') === 0) return orig(key, title);
    var team = known(key);
    if (team) {
      orig(key, title);
      stamp(team);
      return;
    }
    var teams = teamsFor(key);
    var main = document.getElementById('main');
    if (!main) return orig(key, title);
    main.innerHTML = '<button class="back-link" onclick="showPunter(\'chats\')">\u2190 Back</button>'
      + '<div class="eyebrow">Before you go in</div><h2>Who are you going for?</h2>'
      + '<p class="body">' + (title || 'This lounge') + '</p><div class="row" style="flex-wrap:wrap;gap:10px">'
      + teams.map(function (t) {
          return '<button class="btn" onclick="pickLoungeSide(\'' + esc(key) + '\',\'' + esc(title) + '\',\'' + esc(t) + '\')">' + t + '</button>';
        }).join('')
      + '</div>';
  };
  window.pickLoungeSide = function (key, title, team) {
    remember(key, team);
    if (typeof toast === 'function') toast('Going for ' + team);
    if (typeof orig === 'function') orig(key, title);
    stamp(team);
  };
})();
