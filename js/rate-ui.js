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
  function met() {
    var u = me();
    if (!u) return [];
    var ids = {};
    Object.values(S.here || {}).forEach(function (h) {
      if (h.userId === u.id) {
        Object.values(S.here || {}).forEach(function (o) {
          if (o.userId !== u.id && o.venueId === h.venueId && o.fixtureId === h.fixtureId) ids[o.userId] = o;
        });
      }
    });
    Object.values(S.heading || {}).forEach(function (h) {
      if (h.userId === u.id) {
        Object.values(S.heading || {}).forEach(function (o) {
          if (o.userId !== u.id && o.venueId === h.venueId && o.fixtureId === h.fixtureId) ids[o.userId] = ids[o.userId] || o;
        });
      }
    });
    var list = Object.keys(ids).map(function (id) { return S.users.find(function (x) { return x.id === id; }); }).filter(Boolean);
    if (!list.length) list = (S.users || []).filter(function (x) { return x.id !== u.id; }).slice(0, 4);
    return list;
  }
  var prevMe = window.renderMe;
  window.renderMe = function () {
    if (typeof prevMe === 'function') prevMe();
    var main = document.getElementById('main');
    if (!main) return;
    var people = met();
    var box = document.createElement('div');
    box.className = 'card';
    box.innerHTML = '<h3>Rate the table</h3><p class="muted">After the siren. Stars are for showed up and respectful \u2014 same idea as Uber. Not for who won.</p>' +
      people.map(function (p) {
        var a = avg(p.id);
        return '<div class="item"><h3>' + p.name + '</h3><p class="muted">' + (a ? stars(a.score) + ' ' + a.score : 'No rating yet') + '</p><div class="row">' +
          [1,2,3,4,5].map(function (n) { return '<button class="btn ghost" onclick="rateStars(\'' + p.id + '\',' + n + ')">' + n + '\u2605</button>'; }).join('') +
          '</div><button class="btn ghost" style="margin-top:8px" onclick="reportUser(\'' + p.id + '\')">Report</button></div>';
      }).join('');
    main.appendChild(box);
  };
  window.rateStars = function (id, score) {
    S.ratings = S.ratings || { venues: {}, people: {} };
    S.ratings.people[id] = S.ratings.people[id] || [];
    S.ratings.people[id] = S.ratings.people[id].filter(function (r) { return r.user !== (me() || {}).name; });
    S.ratings.people[id].push({ user: (me() || {}).name, score: score, at: Date.now() });
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
  var prevMap = window.showFriendsMap;
  window.showFriendsMap = function (focusId) {
    if (typeof prevMap === 'function') prevMap(focusId);
    setTimeout(function () {
      document.querySelectorAll('.leaflet-popup-content').forEach(function () {});
    }, 400);
  };
})();
