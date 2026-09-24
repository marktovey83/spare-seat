(function () {
  function gamesBox(v) {
    var on = v.showing || [];
    return '<div class="card" id="offer-games"><h3>Games today</h3><p class="muted">Tick each game this pub will show. Save keeps you on Offer.</p>' +
      (SEED.fixtures || []).map(function (f) {
        return '<label class="plan" style="display:block;margin:8px 0"><input class="v-game" type="checkbox" value="' + f.id + '" ' +
          (on.indexOf(f.id) >= 0 ? 'checked' : '') + ' /> <b>' + f.sport + '</b> \u00b7 ' + f.label +
          '<br /><span class="muted">' + f.start + (f.lounge ? ' \u00b7 ' + f.lounge : '') + ' \u00b7 ' + (f.venue || '') + '</span></label>';
      }).join('') +
      '<button class="btn" style="margin-top:12px" onclick="saveVenueOffer()">Save and stay on Offer</button></div>';
  }
  var prev = window.showVenue;
  window.showVenue = function (tab) {
    if (typeof prev === 'function') prev(tab);
    if (tab !== 'offer') return;
    var main = document.getElementById('main');
    if (!main || document.getElementById('offer-games')) return;
    var v = (typeof venue === 'function' && typeof me === 'function') ? venue(me().venueId) : null;
    if (!v) return;
    main.insertAdjacentHTML('beforeend', gamesBox(v));
  };
  var prevSave = window.saveVenueOffer;
  window.saveVenueOffer = function () {
    if (typeof prevSave === 'function') prevSave();
    var v = (typeof venue === 'function' && typeof me === 'function') ? venue(me().venueId) : null;
    if (!v || !window.S) return;
    S.venueAccounts = S.venueAccounts || {};
    var a = S.venueAccounts[v.id] || {};
    a.showing = [].slice.call(document.querySelectorAll('.v-game:checked')).map(function (el) { return el.value; });
    a.pickedDate = new Date().toDateString();
    v.showing = a.showing;
    v.pickedDate = a.pickedDate;
    S.venueAccounts[v.id] = a;
    store.save(S);
    if (typeof prev === 'function') prev('offer');
    var main = document.getElementById('main');
    if (main && !document.getElementById('offer-games')) main.insertAdjacentHTML('beforeend', gamesBox(v));
  };
  var prevGames = window.saveVenueGames;
  window.saveVenueGames = function () {
    if (typeof prevGames === 'function') prevGames();
    if (typeof window.showVenue === 'function') window.showVenue('offer');
  };
})();
