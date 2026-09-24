(function () {
  function esc(s) { return String(s || '').replace(/"/g, '&quot;'); }
  function suburbs() {
    return (SEED.suburbs || []).map(function (s) {
      return '<option value="' + s.id + '">' + s.name + '</option>';
    }).join('');
  }
  var prevMe = window.renderMe;
  window.renderMe = function () {
    var u = typeof me === 'function' ? me() : null;
    var main = document.getElementById('main');
    if (!u || !main) { if (typeof prevMe === 'function') prevMe(); return; }
    var full = (S.users || []).find(function (x) { return x.id === u.id; }) || u;
    var rate = typeof personStars === 'function' ? personStars(full.id) : '';
    main.innerHTML = '<div class="eyebrow">Me</div><h2>' + (full.name || 'You') + '</h2><p class="muted">' + (typeof isPlus === 'function' && isPlus() ? 'Plus' : 'Free \u00b7 10 km') + (rate ? ' \u00b7 ' + rate : '') + '</p><div class="card"><h3>Account</h3><p class="muted">This used to sit on the top bar.</p><label>Name</label><input id="me-name" value="' + esc(full.name) + '" /><label>Email</label><input id="me-email" value="' + esc(full.email) + '" /><label>Mobile</label><input id="me-mobile" value="' + esc(full.mobile) + '" placeholder="04xx xxx xxx" /><label>Suburb</label><select id="me-sub">' + suburbs() + '</select><label>New password</label><input id="me-pass" type="password" placeholder="Leave blank to keep" /><label class="plan" style="margin-top:10px"><input type="checkbox" id="me-plus" ' + (full.plus || (S.plus && S.plus[full.id]) ? 'checked' : '') + ' /> <b>Plus $15/mo</b></label><button class="btn" style="margin-top:12px" onclick="saveMeAccount()">Save account</button></div>';
    var sel = document.getElementById('me-sub');
    if (sel && full.suburb) sel.value = full.suburb;
    if (typeof prevMe === 'function') {
      var holder = document.createElement('div');
      var keep = main.innerHTML;
      prevMe();
      var extra = main.innerHTML;
      main.innerHTML = keep + '<div class="card" style="margin-top:12px">' + extra + '</div>';
    }
  };
  window.saveMeAccount = function () {
    var u = me();
    if (!u) return;
    var row = (S.users || []).find(function (x) { return x.id === u.id; }) || u;
    row.name = (document.getElementById('me-name') || {}).value || row.name;
    row.email = (document.getElementById('me-email') || {}).value || row.email;
    row.mobile = (document.getElementById('me-mobile') || {}).value || row.mobile;
    row.suburb = (document.getElementById('me-sub') || {}).value || row.suburb;
    var pass = (document.getElementById('me-pass') || {}).value;
    if (pass) row.pass = pass;
    var plus = !!(document.getElementById('me-plus') && document.getElementById('me-plus').checked);
    row.plus = plus;
    S.plus = S.plus || {};
    if (plus) S.plus[row.id] = true; else delete S.plus[row.id];
    u.name = row.name; u.email = row.email; u.mobile = row.mobile; u.suburb = row.suburb; u.plus = plus;
    store.save(S);
    toast('Account saved on Me');
    renderMe();
  };
})();
