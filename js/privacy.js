(function () {
  function genderOf(u) { return (u && (u.gender || u.sex) || '').toLowerCase(); }
  function canSee(viewer, other) {
    if (!viewer || !other || viewer.id === other.id) return false;
    const vg = genderOf(viewer);
    const og = genderOf(other);
    if (og === 'female' && (other.see || 'everyone') === 'women' && vg !== 'female') return false;
    return true;
  }
  window.canSeeUser = canSee;
  (SEED.people || []).forEach(function (p) {
    if (!p.gender) p.gender = (p.name === 'Sarah' || p.name === 'Jess') ? 'female' : 'male';
    if (p.gender === 'female' && !p.see) p.see = p.name === 'Sarah' ? 'women' : 'everyone';
    if (!p.pinMode) p.pinMode = 'suburb';
  });
  if (window.S && S.users) {
    S.users.forEach(function (u) {
      if (!u.gender) u.gender = (u.name === 'Sarah' || u.name === 'Jess') ? 'female' : 'male';
      if (u.gender === 'female' && !u.see) u.see = u.name === 'Sarah' ? 'women' : 'everyone';
      if (!u.pinMode) u.pinMode = 'suburb';
    });
  }
  function injectSignup() {
    if (document.getElementById('p-gender')) return;
    const age = document.getElementById('p-age');
    if (!age) return;
    const box = document.createElement('div');
    box.innerHTML = '<label>Male or female</label><select id="p-gender" onchange="toggleSeeBox()"><option value="male">Male</option><option value="female">Female</option></select><div id="see-box" class="hidden"><label>Who can see you</label><select id="p-see"><option value="women">Women only</option><option value="everyone">Everyone</option></select></div><label>Location on the map</label><select id="p-pin"><option value="suburb">Suburb centre only</option><option value="precise">Share a closer pin</option></select><p class="muted">10 km is from the centre of your suburb unless you share a closer pin.</p>';
    age.parentNode.insertBefore(box, age.nextSibling);
  }
  window.toggleSeeBox = function () {
    const g = document.getElementById('p-gender');
    const box = document.getElementById('see-box');
    if (box) box.classList.toggle('hidden', !(g && g.value === 'female'));
  };
  const prevSignup = window.userSignup;
  window.userSignup = function () {
    if (typeof prevSignup === 'function') prevSignup();
    const u = S.users[S.users.length - 1];
    if (!u) return;
    const g = document.getElementById('p-gender');
    const see = document.getElementById('p-see');
    const pin = document.getElementById('p-pin');
    u.gender = g ? g.value : 'male';
    u.see = u.gender === 'female' ? (see ? see.value : 'women') : 'everyone';
    u.pinMode = pin ? pin.value : 'suburb';
    if (S.session && S.session.id === u.id) Object.assign(S.session, { gender: u.gender, see: u.see, pinMode: u.pinMode });
    store.save(S);
  };
  window.savePrivacy = function () {
    const u = S.users.find(function (x) { return x.id === me().id; }) || me();
    const g = document.getElementById('me-gender').value;
    u.gender = g;
    u.see = g === 'female' ? document.getElementById('me-see').value : 'everyone';
    u.pinMode = document.getElementById('me-pin').value;
    Object.assign(me(), { gender: u.gender, see: u.see, pinMode: u.pinMode });
    store.save(S);
    toast('Profile saved');
    renderMe();
  };
  const prevMe = window.renderMe;
  window.renderMe = function () {
    if (typeof prevMe === 'function') prevMe();
    const main = document.getElementById('main');
    if (!main) return;
    const u = me();
    const g = genderOf(u) || 'male';
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = '<h3>Who sees you</h3><label>Male or female</label><select id="me-gender" onchange="document.getElementById(\'me-see-wrap\').classList.toggle(\'hidden\', this.value!==\'female\')"><option value="male"' + (g === 'male' ? ' selected' : '') + '>Male</option><option value="female"' + (g === 'female' ? ' selected' : '') + '>Female</option></select><div id="me-see-wrap" class="' + (g === 'female' ? '' : 'hidden') + '"><label>Who can see you</label><select id="me-see"><option value="women">Women only</option><option value="everyone">Everyone</option></select><p class="muted">Women only means men never see your name or pin.</p></div><label>Location</label><select id="me-pin"><option value="suburb"' + ((u.pinMode || 'suburb') === 'suburb' ? ' selected' : '') + '>Suburb centre only</option><option value="precise"' + (u.pinMode === 'precise' ? ' selected' : '') + '>Share a closer pin</option></select><p class="muted">The 10 km ring uses the centre of your suburb if you keep suburb only.</p><button class="btn" style="margin-top:12px" onclick="savePrivacy()">Save profile</button>';
    main.insertBefore(card, main.firstChild);
  };
  document.addEventListener('DOMContentLoaded', injectSignup);
  setTimeout(injectSignup, 400);
})();
