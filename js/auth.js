window.AUTH = window.AUTH || { role: 'user', mode: 'login' };
function setAuthRole(role) {
  AUTH.role = role || 'user';
  AUTH.mode = 'login';
  paintAuth();
}
function resetAuth() {
  AUTH.role = 'user';
  AUTH.mode = 'login';
  paintAuth();
}
function setAuthMode(mode) {
  AUTH.mode = mode;
  const a = document.getElementById('sw-login');
  const b = document.getElementById('sw-signup');
  if (a) { a.classList.toggle('active', mode === 'login'); a.classList.toggle('on', mode === 'login'); }
  if (b) { b.classList.toggle('active', mode === 'signup'); b.classList.toggle('on', mode === 'signup'); }
  paintAuth();
}
function paintAuth() {
  if (!AUTH.role) AUTH.role = 'user';
  const show = function (id, on) { const el = document.getElementById(id); if (el) el.classList.toggle('hidden', !on); };
  show('two-doors', true);
  show('pick-hint', true);
  show('auth-steps', true);
  const back = document.querySelector('.ss-back');
  if (back) back.classList.add('hidden');
  document.querySelectorAll('#two-doors .door').forEach(function (d) {
    const t = (d.textContent || '').trim().toLowerCase();
    d.classList.toggle('on', t === AUTH.role);
  });
  const a = document.getElementById('sw-login');
  const b = document.getElementById('sw-signup');
  if (a) { a.classList.toggle('active', AUTH.mode === 'login'); a.classList.toggle('on', AUTH.mode === 'login'); }
  if (b) { b.classList.toggle('active', AUTH.mode === 'signup'); b.classList.toggle('on', AUTH.mode === 'signup'); }
  show('auth-user-login', AUTH.role === 'user' && AUTH.mode === 'login');
  show('auth-user-signup', AUTH.role === 'user' && AUTH.mode === 'signup');
  show('auth-venue-login', AUTH.role === 'venue' && AUTH.mode === 'login');
  show('auth-venue-signup', AUTH.role === 'venue' && AUTH.mode === 'signup');
  show('auth-admin-login', AUTH.role === 'admin');
  const sw = document.querySelector('.ss-switch');
  if (sw) sw.classList.toggle('hidden', AUTH.role === 'admin');
}
function findUser(id) {
  const q = (id || '').trim().toLowerCase();
  return S.users.find(function (u) {
    return (u.name && u.name.toLowerCase() === q) || (u.email && u.email.toLowerCase() === q);
  });
}
function userLogin() {
  const id = document.getElementById('u-login-id').value.trim();
  const pass = document.getElementById('u-login-pass').value;
  const user = findUser(id);
  if (!user) { toast('No user with that name or email'); return; }
  if ((user.pass || 'seat') !== pass) { toast('Wrong password'); return; }
  user.role = 'user';
  setSession(user);
}
function userSignup() {
  const name = document.getElementById('u-name').value.trim();
  const email = document.getElementById('u-email').value.trim();
  const pass = document.getElementById('u-pass').value;
  if (!name || !pass) { toast('Name and password needed'); return; }
  if (findUser(name) || (email && findUser(email))) { toast('That account already exists — log in'); return; }
  const sport = document.getElementById('p-sport').value;
  const user = {
    id: 'u' + Date.now(), name: name, email: email, pass: pass,
    suburb: document.getElementById('p-sub').value,
    sports: [sport], clubs: {}, plus: !!(document.querySelector('input[name="u-plan"]:checked') && document.querySelector('input[name="u-plan"]:checked').value === 'plus'),
    ageBand: document.getElementById('p-age').value, showUp: [0, 0], role: 'user'
  };
  user.clubs[sport] = document.getElementById('p-club').value;
  S.users.push(user);
  if (user.plus) S.plus[user.id] = true;
  store.save(S);
  setSession(user);
}
function venueLogin() {
  const id = document.getElementById('v-pick').value;
  const pin = document.getElementById('v-pin').value;
  const v = venue(id);
  if (!v) { toast('Pick a pub'); return; }
  if (pin !== (v.pin || '4821') && pin !== '4821') { toast('Wrong PIN'); return; }
  setSession({ role: 'venue', venueId: v.id, venueName: v.name });
}
function venueSignup() {
  const name = document.getElementById('vs-name').value.trim();
  if (!name) { toast('Venue name needed'); return; }
  const v = { id: 'v' + Date.now(), name: name, suburb: document.getElementById('vs-sub').value, showing: [], deal: '', seats: 8, pin: document.getElementById('vs-pin').value || '4821' };
  SEED.venues.push(v);
  setSession({ role: 'venue', venueId: v.id, venueName: v.name });
}
window.setAuthRole = setAuthRole;
window.resetAuth = resetAuth;
window.setAuthMode = setAuthMode;
window.userLogin = userLogin;
window.userSignup = userSignup;
window.venueLogin = venueLogin;
window.venueSignup = venueSignup;
document.addEventListener('DOMContentLoaded', function () {
  if (location.search.indexOf('gate') >= 0) { S.session = null; store.save(S); }
  if (!S.session) document.body.classList.add('gate-on');
  else document.body.classList.remove('gate-on');
  paintAuth();
  S.users.forEach(function (u) { if (!u.pass) u.pass = 'seat'; });
  const vs = document.getElementById('vs-sub');
  if (vs && !vs.options.length) vs.innerHTML = SEED.suburbs.map(function (s) { return '<option value="' + s.id + '">' + s.name + '</option>'; }).join('');
  const vp = document.getElementById('v-pick');
  if (vp && !vp.options.length) vp.innerHTML = SEED.venues.map(function (v) { return '<option value="' + v.id + '">' + v.name + '</option>'; }).join('');
  const ps = document.getElementById('p-sub');
  if (ps && !ps.options.length) ps.innerHTML = SEED.suburbs.map(function (s) { return '<option value="' + s.id + '">' + s.name + '</option>'; }).join('');
});
