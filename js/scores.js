(function () {
  var ALIASES = {
    Dockers: 'Fremantle', Cats: 'Geelong', Eagles: 'West Coast', Lions: 'Brisbane',
    Crows: 'Adelaide', Swans: 'Sydney', Blues: 'Carlton', Magpies: 'Collingwood',
    Tigers: 'Richmond', Hawks: 'Hawthorn', Demons: 'Melbourne', Saints: 'St Kilda',
    Bombers: 'Essendon', Bulldogs: 'Bulldogs', Power: 'Port Adelaide', Suns: 'Gold Coast',
    Giants: 'Greater Western Sydney', Kangaroos: 'North Melbourne',
    Fremantle: 'Fremantle', Geelong: 'Geelong', 'West Coast': 'West Coast', 'Brisbane': 'Brisbane',
    Panthers: 'Panthers', Roosters: 'Roosters', Storm: 'Storm', Broncos: 'Broncos'
  };
  function sides(f) {
    if (f.label && f.label.indexOf(' vs ') >= 0) return f.label.split(' vs ').map(function (s) { return s.trim(); });
    return [f.home, f.away];
  }
  function hit(team, side) {
    var a = ALIASES[side] || side;
    return team && (team.indexOf(a) >= 0 || team.indexOf(side) >= 0);
  }
  function apply(f, home, away, hs, as_) {
    var pair = sides(f);
    var homeSide = hit(home, pair[0]) ? pair[0] : hit(home, pair[1]) ? pair[1] : '';
    var awaySide = hit(away, pair[0]) ? pair[0] : hit(away, pair[1]) ? pair[1] : '';
    if (!homeSide || !awaySide || homeSide === awaySide) return;
    S.results = S.results || {};
    S.scoreline = S.scoreline || {};
    var hsN = Number(hs), asN = Number(as_);
    if (!isFinite(hsN) || !isFinite(asN)) return;
    if (hsN === asN) {
      S.results[f.id] = 'Draw';
      S.scoreline[f.id] = homeSide + ' ' + hsN + ' drew ' + awaySide + ' ' + asN;
    } else {
      var winner = hsN > asN ? homeSide : awaySide;
      S.results[f.id] = winner;
      S.scoreline[f.id] = (hsN > asN ? homeSide : awaySide) + ' ' + Math.max(hsN, asN) + ' def ' + (hsN > asN ? awaySide : homeSide) + ' ' + Math.min(hsN, asN);
    }
    S.scoreChecked = Date.now();
    if (window.store) store.save(S);
  }
  function matchEvent(f, ev) {
    if (!ev || String(ev.strStatus || '').toUpperCase() !== 'FT') return;
    if (ev.intHomeScore == null || ev.intAwayScore == null) return;
    apply(f, ev.strHomeTeam || '', ev.strAwayTeam || '', ev.intHomeScore, ev.intAwayScore);
  }
  window.refreshScores = function () {
    if (!window.S || !window.SEED) return Promise.resolve();
    var afl = (SEED.fixtures || []).filter(function (f) { return f.sport === 'AFL'; });
    var other = (SEED.fixtures || []).filter(function (f) { return f.sport !== 'AFL'; });
    var jobs = [];
    if (afl.length) {
      jobs.push(fetch('https://www.thesportsdb.com/api/v1/json/3/eventsseason.php?id=4456&s=2026')
        .then(function (r) { return r.json(); })
        .then(function (data) {
          (data.events || []).forEach(function (ev) {
            afl.forEach(function (f) { matchEvent(f, ev); });
          });
        }).catch(function () {}));
    }
    other.forEach(function (f) {
      var q = encodeURIComponent((f.home || '') + ' vs ' + (f.away || ''));
      jobs.push(fetch('https://www.thesportsdb.com/api/v1/json/3/searchevents.php?e=' + q)
        .then(function (r) { return r.json(); })
        .then(function (data) {
          (data.event || data.events || []).forEach(function (ev) { matchEvent(f, ev); });
        }).catch(function () {}));
    });
    return Promise.all(jobs).then(function () {
      if (typeof window.renderMe === 'function' && document.getElementById('main') && /Rate how they took it/.test(document.getElementById('main').innerHTML || '')) {
        window.renderMe();
      }
    });
  };
  setTimeout(function () { if (window.refreshScores) refreshScores(); }, 800);
})();
