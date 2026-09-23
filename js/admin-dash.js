(function () {
  const orig = window.showAdmin;
  function usersIn(subId) {
    return (window.S && S.users ? S.users : []).filter(function (u) { return u.suburb === subId; });
  }
  function demoCard(sub) {
    const people = usersIn(sub.id);
    const plus = people.filter(function (u) { return u.plus || (S.plus && S.plus[u.id]); }).length;
    const ages = {}; const clubs = {};
    people.forEach(function (u) {
      const a = u.ageBand || '—'; ages[a] = (ages[a] || 0) + 1;
      const c = (u.clubs && (u.clubs.AFL || u.clubs.NRL || Object.values(u.clubs)[0])) || '—';
      clubs[c] = (clubs[c] || 0) + 1;
    });
    const pubs = (SEED.venues || []).filter(function (v) { return v.suburb === sub.id; });
    return '<div class="card"><h3>' + sub.name + '</h3><p class="stat">' + people.length + '</p><p class="muted">users \u00b7 ' + plus + ' Plus \u00b7 ' + (people.length - plus) + ' Free</p><p class="body">Age: ' + Object.keys(ages).map(function (k) { return k + ' ' + ages[k]; }).join(' \u00b7 ') + '</p><p class="body">Clubs: ' + Object.keys(clubs).map(function (k) { return k + ' ' + clubs[k]; }).join(' \u00b7 ') + '</p><p class="muted">Pubs: ' + pubs.map(function (v) { return v.name; }).join(' \u00b7 ') + '</p></div>';
  }
  function venueAlgo(v) {
    const games = (SEED.fixtures || []).filter(function (f) { return (v.showing || []).indexOf(f.id) >= 0; });
    const heading = games.reduce(function (n, f) { return n + (typeof countHeading === 'function' ? countHeading(v.id, f.id) : 0); }, 0);
    const here = games.reduce(function (n, f) { return n + (typeof countHere === 'function' ? countHere(v.id, f.id) : 0); }, 0);
    const j = games.reduce(function (n, f) { return n + (typeof jugs === 'function' ? jugs(v.id, f.id) : 0); }, 0);
    const area = typeof suburb === 'function' ? suburb(v.suburb).name : v.suburb;
    return '<div class="card"><h3>' + v.name + (v.target ? ' <span class="pill">target</span>' : '') + '</h3><p class="muted">' + area + ' \u00b7 ' + (v.deal || '') + '</p><p class="body">' + games.map(function (f) { return f.label; }).join(' \u00b7 ') + '</p><p class="muted">' + heading + ' heading \u00b7 ' + here + ' here \u00b7 ' + j + ' jugs</p><p class="body">Jug every 3 check-ins. Check-in at the pub. Free users see this pin inside 10 km.</p></div>';
  }
  window.showAdmin = function (tab) {
    const navP = document.getElementById('nav-punter');
    const navV = document.getElementById('nav-venue');
    const navA = document.getElementById('nav-admin');
    if (navP) navP.classList.add('hidden');
    if (navV) navV.classList.add('hidden');
    if (navA) {
      navA.classList.remove('hidden');
      if (!document.getElementById('tab-rules')) {
        const b = document.createElement('button');
        b.className = 'btn'; b.id = 'tab-rules'; b.dataset.tab = 'rules'; b.textContent = 'Rules';
        b.onclick = function () { showAdmin('rules'); };
        navA.appendChild(b);
      }
      [].forEach.call(navA.querySelectorAll('button'), function (b) { b.classList.toggle('active', b.dataset.tab === tab); });
    }
    const main = document.getElementById('main');
    if (!main) return;
    if (tab === 'areas' && typeof orig === 'function') { orig('areas'); return; }
    if (tab === 'people') {
      main.innerHTML = '<div class="eyebrow">Admin \u00b7 people</div><h2>Who is in each area</h2>' + (SEED.suburbs || []).map(demoCard).join('');
      return;
    }
    if (tab === 'live' || tab === 'venues') {
      main.innerHTML = '<div class="eyebrow">Admin \u00b7 venues</div><h2>Every door</h2>' + (SEED.venues || []).map(venueAlgo).join('');
      return;
    }
    if (tab === 'rules') {
      main.innerHTML = '<div class="eyebrow">Admin \u00b7 rules</div><h2>How the app decides</h2><div class="card"><h3>10 km free ring</h3><p class="body">Free users only see pubs and people inside 10 km of their suburb. Plus drops the ring.</p></div><div class="card"><h3>Lounge window</h3><p class="body">Opens 90 minutes before bounce-down. Free is one-to-one. Plus gets group and team rooms.</p></div><div class="card"><h3>Jug</h3><p class="body">One jug per 3 people checked in at that pub for that game.</p></div><div class="card"><h3>I\'m here</h3><p class="body">Must be at the venue pin. Home check-in is flagged.</p></div><div class="card"><h3>Ratings</h3><p class="body">Showed up and respectful — not money, not the score.</p></div>';
      return;
    }
    if (tab === 'reports' && typeof orig === 'function') orig('reports');
  };
})();
