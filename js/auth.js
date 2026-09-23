window.AUTH = window.AUTH || { role: null, mode: 'login' };
function setAuthRole(role) { AUTH.role = role; AUTH.mode = 'login'; paintAuth(); }
function resetAuth() { AUTH.role = null; AUTH.mode = 'login'; paintAuth(); }
function setAuthMode(mode) {
  AUTH.mode = mode;
  const a = document.getElementById('sw-login');
  const b = document.getElementById('sw-signup');
  if (a) { a.classList.toggle('active', mode === 'login'); a.classList.toggle('on', mode === 'login'); }
  if (b) { b.classList.toggle('active', mode === 'signup'); b.classList.toggle('on', mode === 'signup'); }
  paintAuth();
}
function paintAuth() {
  const picked = !!AUTH.role;
  const show = function (id, on) { const el = document.getElementById(id); if (el) el.classList.toggle('hidden', !on); };
  show('two-doors', !picked);
  show('pick-hint', !picked);
  show('auth-steps', picked);
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
function toggleAdmin() {}
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
  const clubs = {}; clubs[sport] = document.getElementById('p-club').value;
  const planEl = document.querySelector('input[name="u-plan"]:checked');
  const user = {
    id: 'u' + Date.now(), name: name, email: email, pass: pass,
    suburb: document.getElementById('p-sub').value, sports: [sport], clubs: clubs,
    plus: !!(planEl && planEl.value === 'plus'),
    ageBand: document.getElementById('p-age').value, showUp: [0, 0], role: 'user'
  };
  S.users.push(user);
  if (user.plus) S.plus[user.id] = true;
  store.save(S);
  setSession(user);
}
function venueLogin() {
  const id = document.getElementById('v-pick').value;
  const secret = document.getElementById('v-pin').value.trim();
  const v = venue(id);
  if (!v) { toast('Pick a venue'); return; }
  const extra = (S.venueAccounts || {})[v.id];
  const ok = secret === v.pin || secret === 'seat' || (extra && extra.pass === secret);
  if (!ok) { toast('Wrong password or PIN'); return; }
  setSession({ role: 'venue', venueId: v.id, venueName: v.name });
}
function venueSignup() {
  const name = document.getElementById('vs-name').value.trim();
  const pass = document.getElementById('vs-pass').value;
  const pin = (document.getElementById('vs-pin').value.trim() || '4821');
  const sub = document.getElementById('vs-sub').value;
  if (!name || !pass) { toast('Venue name and password needed'); return; }
  const here = suburb(sub);
  const v = { id: 'v' + Date.now(), name: name, suburb: sub, lat: here.lat + 0.002, lng: here.lng + 0.002, showing: SEED.fixtures.map(function (f) { return f.id; }).slice(0, 2), deal: 'Spare Seat table', seats: 8, pin: pin };
  SEED.venues.push(v);
  S.venueAccounts = S.venueAccounts || {};
  S.venueAccounts[v.id] = { pass: pass, pin: pin, name: name };
  store.save(S); fillSelects();
  setSession({ role: 'venue', venueId: v.id, venueName: v.name });
}
