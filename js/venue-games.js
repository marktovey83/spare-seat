(function () {
  const prev = window.showVenue;
  window.saveVenueGames = function () {
    const v = venue(me().venueId);
    if (!v) return;
    const picks = [].map.call(document.querySelectorAll('.v-game:checked'), function (el) { return el.value; });
    v.showing = picks;
    S.venueAccounts = S.venueAccounts || {};
    S.venueAccounts[v.id] = Object.assign({}, S.venueAccounts[v.id] || {}, { showing: picks, pickedDate: new Date().toDateString() });
    store.save(S);
    toast(picks.length ? 'Screens set. Floor updated.' : 'No games selected.');
    if (typeof prev === 'function') prev('tonight');
  };
  window.showVenue = function (tab) {
    tab = tab || 'tonight';
    const v = venue(me().venueId);
    const acc = (S.venueAccounts && v && S.venueAccounts[v.id]) || {};
    if (acc.showing) v.showing = acc.showing;
    const today = new Date().toDateString();
    const needPick = acc.pickedDate !== today;
    const navV = document.getElementById('nav-venue');
    if (navV && !document.getElementById('tab-games')) {
      const b = document.createElement('button');
      b.className = 'btn'; b.id = 'tab-games'; b.dataset.tab = 'games'; b.textContent = "Today's games";
      b.onclick = function () { showVenue('games'); };
      navV.insertBefore(b, navV.firstChild);
    }
    if ((tab === 'tonight' || !tab) && needPick) tab = 'games';
    if (tab === 'games') {
      const navP = document.getElementById('nav-punter');
      const navA = document.getElementById('nav-admin');
      if (navP) navP.classList.add('hidden');
      if (navA) navA.classList.add('hidden');
      if (navV) {
        navV.classList.remove('hidden');
        [].forEach.call(navV.querySelectorAll('button'), function (btn) {
          btn.classList.toggle('active', btn.dataset.tab === 'games');
        });
      }
      const on = (v && v.showing) || [];
      document.getElementById('main').innerHTML = '<div class="eyebrow">Morning board</div><h2>What\'s on today</h2><p class="muted">Tick what this pub will show. Floor and the user pin follow this list.</p><div class="card">' + (SEED.fixtures || []).map(function (f) {
        return '<label class="plan" style="display:block;margin:8px 0"><input class="v-game" type="checkbox" value="' + f.id + '" ' + (on.indexOf(f.id) >= 0 ? 'checked' : '') + ' /> <b>' + f.sport + '</b> \u00b7 ' + f.label + '<br /><span class="muted">' + f.start + ' \u00b7 ' + f.venue + '</span></label>';
      }).join('') + '<button class="btn" style="margin-top:12px" onclick="saveVenueGames()">Set today\'s screens</button></div>';
      return;
    }
    if (typeof prev === 'function') prev(tab);
  };
})();
