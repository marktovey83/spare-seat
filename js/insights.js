(function () {
  function genderOf(u) {
    if (u.gender) return u.gender;
    return (u.name === 'Sarah' || u.name === 'Jess') ? 'female' : 'male';
  }
  function areaUsers(subId) {
    const fromUsers = (S.users || []).filter(function (u) { return !subId || u.suburb === subId; });
    const fromSeed = (SEED.people || []).filter(function (p) { return !subId || p.suburb === subId; });
    const map = {};
    fromSeed.concat(fromUsers).forEach(function (u) { map[u.id || u.name] = u; });
    return Object.values(map);
  }
  function seedN(subId, key) {
    var n = 17, s = String(subId || 'all') + key;
    for (var i = 0; i < s.length; i++) n = (n * 31 + s.charCodeAt(i)) % 997;
    return n;
  }
  function statsFor(subId) {
    const list = areaUsers(subId);
    var men = list.filter(function (u) { return genderOf(u) === 'male'; }).length;
    var women = list.filter(function (u) { return genderOf(u) === 'female'; }).length;
    men = men * 42 + 180 + seedN(subId, 'm') % 80;
    women = women * 28 + 70 + seedN(subId, 'w') % 50;
    const sports = {}, clubs = {};
    list.forEach(function (u) {
      (u.sports || []).forEach(function (s) { sports[s] = (sports[s] || 0) + 1; });
      Object.keys(u.clubs || {}).forEach(function (k) {
        var c = u.clubs[k]; if (c) clubs[c] = (clubs[c] || 0) + 1;
      });
    });
    const sportRank = Object.keys(sports).sort(function (a, b) { return sports[b] - sports[a]; });
    const clubRank = Object.keys(clubs).sort(function (a, b) { return clubs[b] - clubs[a]; });
    const rates = Object.values((S.ratings && S.ratings.venues) || {}).flat();
    const avg = rates.length ? (rates.reduce(function (s, r) { return s + Number(r.score || 0); }, 0) / rates.length) : 4.2;
    const fixtures = SEED.fixtures || [];
    const pick = fixtures.filter(function (f) { return sportRank[0] && f.sport === sportRank[0]; });
    const algo = pick.length ? ('Put ' + pick[0].label + ' on the main screen. ' + sportRank[0] + ' is the local lead.') : 'Hold a mixed screen tonight.';
    const need = women > men * 0.35 ? 'Keep a women-welcome table near the screen.' : 'Most of the ring is men watching with mates.';
    return { men: men, women: women, sports: sports, clubs: clubs, sportRank: sportRank, clubRank: clubRank, avg: avg.toFixed(1), algo: algo, need: need, n: men + women };
  }
  function paidVenue(v) {
    if (!v) return false;
    const a = (S.venueAccounts && S.venueAccounts[v.id]) || {};
    return !!(v.insights || a.insights || v.reach || a.reach);
  }
  window.buyVenueInsights = function () {
    const v = venue(me().venueId);
    if (!v) return;
    S.venueAccounts = S.venueAccounts || {};
    S.venueAccounts[v.id] = Object.assign({}, S.venueAccounts[v.id] || {}, { insights: true });
    v.insights = true;
    store.save(S);
    toast('Insights $29/mo on (demo, no card).');
    showVenue('insights');
  };
  function cardHtml(title, st) {
    const sportBits = (st.sportRank || []).map(function (s) { return s + ' ' + st.sports[s]; }).join(' \u00b7 ') || 'AFL lead';
    const clubBits = (st.clubRank || []).slice(0, 5).map(function (c) { return c + ' ' + st.clubs[c]; }).join(' \u00b7 ') || 'Dockers';
    return '<div class="card"><h3>' + title + '</h3><div class="row"><div><div class="stat">' + st.men + '</div><div class="muted">men</div></div><div><div class="stat">' + st.women + '</div><div class="muted">women</div></div><div><div class="stat">' + st.n + '</div><div class="muted">in ring</div></div></div><p class="body">Sports: ' + sportBits + '</p><p class="body">Clubs: ' + clubBits + '</p><p class="muted">Pub rating ' + st.avg + '/5</p><p class="pill" style="margin-top:8px">' + st.algo + '</p><p class="body">' + st.need + '</p></div>';
  }
  window.showVenue = (function (prev) {
    return function (tab) {
      const nav = document.getElementById('nav-venue');
      if (nav && !document.getElementById('tab-insights')) {
        const b = document.createElement('button');
        b.className = 'btn'; b.id = 'tab-insights'; b.dataset.tab = 'insights'; b.textContent = 'Insights';
        b.onclick = function () { showVenue('insights'); };
        nav.appendChild(b);
      }
      if (tab === 'insights') {
        const navP = document.getElementById('nav-punter');
        const navA = document.getElementById('nav-admin');
        if (navP) navP.classList.add('hidden');
        if (navA) navA.classList.add('hidden');
        if (nav) {
          nav.classList.remove('hidden');
          [].forEach.call(nav.querySelectorAll('button'), function (btn) { btn.classList.toggle('active', btn.dataset.tab === 'insights'); });
        }
        const v = venue(me().venueId);
        const main = document.getElementById('main');
        if (!v || !main) return;
        if (!paidVenue(v)) {
          main.innerHTML = '<div class="eyebrow">Locked</div><h2>Local insights</h2><p class="body">Who is in your 10 km ring, what they follow, and what to put on the screen.</p><div class="card"><h3>Insights \u00b7 $29 / month</h3><p class="body">Men / women in the area</p><p class="body">Preferred sports and clubs</p><p class="body">Show-up and pub rating</p><p class="body">A nightly screen suggestion</p><button class="btn" style="margin-top:12px" onclick="buyVenueInsights()">Unlock Insights</button></div>';
          return;
        }
        main.innerHTML = '<div class="eyebrow">Insights</div><h2>' + v.name + ' ring</h2>' + cardHtml((typeof suburb === 'function' ? suburb(v.suburb).name : v.suburb), statsFor(v.suburb));
        return;
      }
      if (typeof prev === 'function') prev(tab);
    };
  })(window.showVenue);
  window.showAdmin = (function (prev) {
    return function (tab) {
      const nav = document.getElementById('nav-admin');
      if (nav && !document.getElementById('tab-insights-admin')) {
        const b = document.createElement('button');
        b.className = 'btn'; b.id = 'tab-insights-admin'; b.dataset.tab = 'insights'; b.textContent = 'Insights';
        b.onclick = function () { showAdmin('insights'); };
        nav.appendChild(b);
      }
      if (tab === 'insights') {
        if (nav) {
          nav.classList.remove('hidden');
          [].forEach.call(nav.querySelectorAll('button'), function (btn) { btn.classList.toggle('active', btn.dataset.tab === 'insights'); });
        }
        const navP = document.getElementById('nav-punter');
        const navV = document.getElementById('nav-venue');
        if (navP) navP.classList.add('hidden');
        if (navV) navV.classList.add('hidden');
        var html = '<div class="eyebrow">Admin</div><h2>Demographics</h2><p class="muted">Same board venues pay $29/mo to see.</p>' + cardHtml('All listed areas', statsFor(null));
        (SEED.suburbs || []).forEach(function (s) { html += cardHtml(s.name, statsFor(s.id)); });
        document.getElementById('main').innerHTML = html;
        return;
      }
      if (typeof prev === 'function') prev(tab);
    };
  })(window.showAdmin);
})();
