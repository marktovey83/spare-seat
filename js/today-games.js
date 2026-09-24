(function () {
  const SHOT = {
    AFL: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c8?auto=format&fit=crop&w=1200&q=70',
    NRL: 'https://images.unsplash.com/photo-1461896836934-ffe607ba6851?auto=format&fit=crop&w=1200&q=70',
    Cricket: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=70',
    NFL: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=70',
    NBA: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=70',
    'A-League': 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=70'
  };
  function mineSports() {
    const u = typeof me === 'function' ? me() : null;
    return (u && u.sports && u.sports.length) ? u.sports.slice() : [];
  }
  function orderSports() {
    const pref = mineSports();
    const rest = (SEED.sports || []).filter(function (s) { return pref.indexOf(s) < 0; });
    return pref.concat(rest);
  }
  function card(f, mine) {
    const img = f.img || SHOT[f.sport] || SHOT.AFL;
    const lounge = f.lounge || 'Lounge 90 min before kick-off';
    return '<article class="game-card' + (mine ? ' mine' : '') + '"><div class="game-shot" style="background-image:url(\'' + img + '\')"><span class="pill">' + f.sport + '</span>' + (mine ? '<span class="pill mine-pill">Your sport</span>' : '') + '</div><div class="game-copy"><h3>' + f.label + '</h3><p class="body">' + (f.home || '') + ' vs ' + (f.away || '') + '</p><p class="muted">' + f.start + '</p><p class="muted">' + (f.venue || '') + '</p><p class="lounge-line">' + lounge + '</p><button class="btn ghost" onclick="showPunter(\'chats\')">Open lounge</button></div></article>';
  }
  window.renderTonight = function () {
    const main = document.getElementById('main');
    if (!main) return;
    const pref = mineSports();
    const games = SEED.fixtures || [];
    const by = {};
    games.forEach(function (f) { by[f.sport] = by[f.sport] || []; by[f.sport].push(f); });
    var html = '<div class="eyebrow">Today</div><h2>What\'s on</h2><p class="muted">' + (pref.length ? ('Your sports first \u2014 ' + pref.join(' \u00b7 ') + '.') : 'Pick sports on Me to pin your codes to the top.') + ' Lounge opens 90 minutes before bounce-down.</p>';
    orderSports().forEach(function (sport) {
      const list = by[sport];
      if (!list || !list.length) return;
      const mine = pref.indexOf(sport) >= 0;
      html += '<section class="sport-block' + (mine ? ' sport-mine' : '') + '"><div class="sport-head"><h3>' + sport + '</h3>' + (mine ? '<span class="pill">Pinned for you</span>' : '') + '</div><div class="game-grid">' + list.map(function (f) { return card(f, mine); }).join('') + '</div></section>';
    });
    main.innerHTML = html;
  };
})();
