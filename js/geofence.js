(function () {
  var MAX_M = 150;
  function metres(a, b) {
    return (typeof km === 'function' ? km(a, b) : 99) * 1000;
  }
  var prev = window.checkIn;
  window.checkIn = function (vid, fid) {
    var v = typeof venue === 'function' ? venue(vid) : null;
    if (!v) { toast('No pub pin'); return; }
    if (!navigator.geolocation) {
      toast('This phone has no location. I am here needs GPS.');
      return;
    }
    toast('Checking you are at ' + v.name + '\u2026');
    navigator.geolocation.getCurrentPosition(function (pos) {
      var here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      var d = metres(here, { lat: v.lat, lng: v.lng });
      var acc = pos.coords.accuracy || 0;
      if (d > MAX_M + Math.min(acc, 80)) {
        toast('Not at the door. You are ' + Math.round(d) + ' m from ' + v.name + '. Walk in, then tap I am here.');
        S.reports = S.reports || [];
        S.reports.push({ at: Date.now(), type: 'geofence', user: (me() || {}).name, venue: v.name, metres: Math.round(d) });
        store.save(S);
        return;
      }
      if (typeof prev === 'function') {
        var old = window.CHECKIN_M;
        if (typeof CHECKIN_M !== 'undefined') window.CHECKIN_M = 999999;
        prev(vid, fid);
      }
    }, function () {
      toast('Turn on location and allow Spare Seat. I am here only works at the pub.');
    }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 20000 });
  };
})();
