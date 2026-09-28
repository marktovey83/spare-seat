(function () {
  function avg(id) {
    var rows = (S.ratings && S.ratings.people && S.ratings.people[id]) || [];
    if (!rows.length) return null;
    var n = rows.reduce(function (a, r) { return a + Number(r.score || 0); }, 0) / rows.length;
    return { n: rows.length, score: Math.round(n * 10) / 10 };
  }
  function stars(n) {
    var s = Math.round(n || 0), out = '', i;
    for (i = 1; i <= 5; i++) out += i <= s ? '\u2605' : '\u2606';
    return out;
  }
  window.personRating = avg;
  window.personStars = function (id) {
    var a = avg(id);
    return a ? stars(a.score) + ' ' + a.score + ' (' + a.n + ')' : 'No ratings yet';
  };
  function fixtureIdFor(u) {
    if (!u) return 'f1';
    if (window.S && S.watching && S.watching[u.id]) return S.watching[u.id];
    if (u.watching) return u.watching;
    var h = Object.values(S.heading || {}).find(function (x) { return x.userId === u.id; });
    if (h) return h.fixtureId;
    return 'f1';
  }
  function fixtureBy(id) {
    return (SEED.fixtures || []).find(function (f) { return f.id === id; }) || (SEED.fixtures || [])[0] || { id: 'f1', sport: 'AFL', label: 'Dockers vs Cats' };
  }
  function sideOf(u, fid) {
    if (!u) return '';
    if (S.sidePin && S.sidePin[u.id]) return S.sidePin[u.id];
    var f = fixtureBy(fid);
    var sport = f.sport || 'AFL';
    if (u.clubs && u.clubs[sport]) return u.clubs[sport];
    return '';
  }
  function teamsOf(fid) {
    var f = fixtureBy(fid);
    if (f.label && f.label.indexOf(' vs ') >= 0) return f.label.split(' vs ').map(function (s) { return s.trim(); });
    return [f.home || 'Home', f.away || 'Away'];
  }
  function canRate(rater, target, fid) {
    var winner = S.results && S.results[fid];
    if (!winner) return { ok: false, why: 'Result is not in yet.' };
    var mine = sideOf(rater, fid);
    var theirs = sideOf(target, fid);
    if (!mine) return { ok: false, why: 'Pick your side in the lounge first.' };
    if (mine !== winner) return { ok: false, why: 'Your side lost, so you do not rate.' };
    if (!theirs) return { ok: false, why: 'They have not picked a side.' };
    if (theirs === winner) return { ok: true, why: 'Same winning side.' };
    return { ok: true, why: 'They lost. Rate how they took it.' };
  }
  function met() {
    var u = me();
    if (!u) return [];
    var ids = {};
    function pair(bucket) {
      Object.values(bucket || {}).forEach(function (h) {
        if (h.userId !== u.id) return;
        Object.values(bucket || {}).forEach(function (o) {
          if (o.userId !== u.id && o.venueId === h.venueId && o.fixtureId === h.fixtureId) ids[o.userId] = true;
        });
      });
    }
    pair(S.here); pair(S.heading);
    var list = Object.keys(ids).map(function (id) { return S.users.find(function (x) { return x.id === id; }); }).filter(Boolean);
    if (!list.length) list = (S.users || []).filter(function (x) { return x.id !== u.id; }).slice(0, 4);
    return list;
  }
  var prevMe = window.renderMe;
  window.renderMe = function () {
    if (typeof prevMe === 'function') prevMe();
    var main = document.getElementById('main');
    if (!main) return;
    var box = document.createElement('div');
    box.className = 'card';
    var u = me();
    var fid = fixtureIdFor(u);
    var f = fixtureBy(fid);
    var winner = S.results && S.results[fid];
    var teams = teamsOf(fid);
    var mine = sideOf(u, fid);
    var intro = '<h3>Rate how they took it</h3><p class="muted">Only the winning side rates. If your team lost, no rating from you. Stars are about how someone behaved in the loss.</p>' +
      '<p class="body">' + f.label + (mine ? ' · you went for ' + mine : ' · pick a side in the lounge') + (winner ? ' · ' + winner + ' won' : ' · no result yet') + '</p>' +
      '<div class="row" style="flex-wrap:wrap;gap:8px;margin-bottom:10px">' + teams.map(function (tm) {
        return '<button class="btn ghost" onclick="setGameWinner(\'' + fid + '\',\'' + tm.replace(/'/g, '') + '\')">' + tm + ' won</button>';
      }).join('') + '</div>';
    var rows = met().map(function (p) {
      var a = avg(p.id);
      var gate = canRate(u, p, fid);
      var theirSide = sideOf(p, fid);
      var buttons = gate.ok
        ? '<div class="row">' + [1,2,3,4,5].map(function (n) { return '<button class="btn ghost" onclick="rateStars(\'' + p.id + '\',' + n + ')">' + n + '\u2605</button>'; }).join('') + '</div>'
        : '<p class="muted">' + gate.why + '</p>';
      return '<div class="item"><h3>' + p.name + '</h3><p class="muted">' + (theirSide || 'No side yet') + ' · ' + (a ? stars(a.score) + ' ' + a.score : 'No rating yet') + '</p>' + buttons +
        '<button class="btn ghost" style="margin-top:8px" onclick="reportUser(\'' + p.id + '\')">Report</button></div>';
    }).join('');
    if (mine && winner && mine !== winner) {
      rows = '<p class="body">Your side lost. You do not rate tonight. Winning fans can rate how you took it.</p>';
    }
    box.innerHTML = intro + rows;
    main.appendChild(box);
  };
  window.setGameWinner = function (fid, team) {
    S.results = S.results || {};
    S.results[fid] = team;
    store.save(S);
    toast(team + ' won');
    renderMe();
  };
  window.rateStars = function (id, score) {
    var u = me();
    var target = (S.users || []).find(function (x) { return x.id === id; });
    var fid = fixtureIdFor(u);
    var gate = canRate(u, target || {}, fid);
    if (!gate.ok) { toast(gate.why); return; }
    S.ratings = S.ratings || { venues: {}, people: {} };
    S.ratings.people[id] = (S.ratings.people[id] || []).filter(function (r) { return r.user !== (u || {}).name; });
    S.ratings.people[id].push({ user: (u || {}).name, score: score, at: Date.now(), side: sideOf(target, fid), bySide: sideOf(u, fid) });
    store.save(S);
    toast('Rated ' + score + ' stars');
    renderMe();
  };
  window.reportUser = function (id) {
    var why = prompt('What happened? Short note. Admin sees this.') || '';
    if (!why.trim()) return;
    var p = S.users.find(function (x) { return x.id === id; });
    S.reports = S.reports || [];
    S.reports.push({ at: Date.now(), type: 'user', by: (me() || {}).name, about: p ? p.name : id, note: why.trim() });
    store.save(S);
    toast('Report sent to admin');
  };
  var prevF = window.renderFriends;
  window.renderFriends = function () {
    if (typeof prevF === 'function') prevF();
    var main = document.getElementById('main');
    if (!main) return;
    (S.users || []).forEach(function (u) {
      if (!main.innerHTML || main.innerHTML.indexOf(u.name) < 0) return;
      main.innerHTML = main.innerHTML.replace(u.name + '</h3>', u.name + '</h3><p class="muted">' + personStars(u.id) + '</p>');
    });
  };
})();
