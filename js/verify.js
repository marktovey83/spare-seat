(function () {
  function codeFor(email) {
    var s = String(email || 'demo').toLowerCase(), n = 4821, i;
    for (i = 0; i < s.length; i++) n = (n * 13 + s.charCodeAt(i)) % 9000;
    return String(1000 + n);
  }
  function ensurePanels() {
    var pass = document.getElementById('u-pass');
    if (pass) {
      pass.classList.add('hidden');
      if (pass.previousElementSibling && pass.previousElementSibling.tagName === 'LABEL') pass.previousElementSibling.classList.add('hidden');
    }
    if (document.getElementById('auth-user-mail')) return;
    var card = document.querySelector('.auth-card');
    if (!card) return;
    var mail = document.createElement('div'); mail.id = 'auth-user-mail'; mail.className = 'hidden';
    mail.innerHTML = '<h2>Check your email</h2><p class="body">We sent a link to <b id="mail-to"></b>.</p><p class="muted">That link sets your password and confirms you are 18 or over. Live product uses a real mailer.</p><button class="btn" onclick="openSetPass()">Open the email link</button>';
    var setp = document.createElement('div'); setp.id = 'auth-user-setpass'; setp.className = 'hidden';
    setp.innerHTML = '<h2>Set password \u00b7 18+</h2><p class="muted">This is the age check. Tick it or the account stays locked.</p><label>New password</label><input id="set-pass" type="password" /><label>Again</label><input id="set-pass2" type="password" /><label class="plan" style="margin-top:12px"><input type="checkbox" id="set-age" /> <b>I am 18 or over</b></label><button class="btn" style="margin-top:12px" onclick="finishSetPass()">Save and verify</button>';
    var two = document.createElement('div'); two.id = 'auth-user-2fa'; two.className = 'hidden';
    two.innerHTML = '<h2>Two-step code</h2><p class="body">Sent to <b id="two-to"></b></p><p class="muted">Demo code: <b id="two-hint"></b>. Also accepts 4821.</p><label>Code</label><input id="two-code" inputmode="numeric" /><button class="btn" style="margin-top:12px" onclick="finishTwo()">Confirm login</button>';
    card.appendChild(mail); card.appendChild(setp); card.appendChild(two);
  }
  var prevPaint = window.paintAuth;
  window.paintAuth = function () {
    ensurePanels();
    if (typeof prevPaint === 'function') prevPaint();
    var extra = AUTH.step;
    ['auth-user-mail','auth-user-setpass','auth-user-2fa'].forEach(function (id) {
      var el = document.getElementById(id); if (el) el.classList.toggle('hidden', extra !== id);
    });
    if (extra) {
      ['auth-user-login','auth-user-signup'].forEach(function (id) {
        var el = document.getElementById(id); if (el) el.classList.add('hidden');
      });
    }
  };
  window.userSignup = function () {
    ensurePanels();
    var name = (document.getElementById('u-name') || {}).value.trim();
    var email = (document.getElementById('u-email') || {}).value.trim();
    if (!name || !email || email.indexOf('@') < 0) { toast('Name and a real email needed'); return; }
    if (findUser(name) || findUser(email)) { toast('That account already exists \u2014 log in'); return; }
    var sport = (document.getElementById('p-sport') || {}).value;
    var user = { id: 'u' + Date.now(), name: name, email: email, pass: null, suburb: (document.getElementById('p-sub') || {}).value, sports: [sport], clubs: {}, plus: !!(document.querySelector('input[name="u-plan"]:checked') && document.querySelector('input[name="u-plan"]:checked').value === 'plus'), ageBand: (document.getElementById('p-age') || {}).value, showUp: [0, 0], role: 'user', verified: false, ageOk: false };
    if (sport) user.clubs[sport] = (document.getElementById('p-club') || {}).value;
    S.users.push(user);
    if (user.plus) S.plus[user.id] = true;
    S.pendingUser = user.id;
    store.save(S);
    AUTH.step = 'auth-user-mail';
    var to = document.getElementById('mail-to'); if (to) to.textContent = email;
    toast('Verification email queued');
    paintAuth();
  };
  window.openSetPass = function () { AUTH.step = 'auth-user-setpass'; paintAuth(); };
  window.finishSetPass = function () {
    var a = document.getElementById('set-pass').value, b = document.getElementById('set-pass2').value;
    if (!a || a.length < 4) { toast('Password needs 4 or more characters'); return; }
    if (a !== b) { toast('Passwords do not match'); return; }
    if (!document.getElementById('set-age').checked) { toast('Confirm you are 18 or over'); return; }
    var u = S.users.find(function (x) { return x.id === S.pendingUser; }) || S.users[S.users.length - 1];
    if (!u) return;
    u.pass = a; u.verified = true; u.ageOk = true; store.save(S);
    AUTH.step = null; AUTH.mode = 'login';
    toast('Age verified. Log in \u2014 you will get a two-step code.');
    paintAuth();
  };
  window.userLogin = function () {
    ensurePanels();
    var id = document.getElementById('u-login-id').value.trim();
    var pass = document.getElementById('u-login-pass').value;
    var user = findUser(id);
    if (!user) { toast('No user with that name or email'); return; }
    if ((user.pass || 'seat') !== pass) { toast('Wrong password'); return; }
    S.pendingUser = user.id;
    S.pendingCode = codeFor(user.email || user.name);
    AUTH.step = 'auth-user-2fa';
    var t = document.getElementById('two-to'); var h = document.getElementById('two-hint');
    if (t) t.textContent = user.email || (user.name + '@spareseat.demo');
    if (h) h.textContent = S.pendingCode;
    toast('Two-step code sent');
    paintAuth();
  };
  window.finishTwo = function () {
    var typed = (document.getElementById('two-code') || {}).value.trim();
    if (typed !== String(S.pendingCode) && typed !== '4821') { toast('Wrong code. Demo also accepts 4821.'); return; }
    var user = S.users.find(function (x) { return x.id === S.pendingUser; });
    if (!user) { toast('Session lost'); return; }
    user.role = 'user'; user.verified = true; AUTH.step = null; store.save(S); setSession(user);
  };
  (S.users || []).forEach(function (u) { if (u.pass === 'seat') { u.verified = true; u.ageOk = true; } });
  document.addEventListener('DOMContentLoaded', ensurePanels);
  setTimeout(ensurePanels, 400);
})();
