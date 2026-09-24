(function () {
  function codeFor(key) {
    var s = String(key || 'demo').toLowerCase(), n = 4821, i;
    for (i = 0; i < s.length; i++) n = (n * 13 + s.charCodeAt(i)) % 9000;
    return String(1000 + n);
  }
  function maskPhone(p) {
    var d = String(p || '').replace(/\D/g, '');
    if (d.length < 4) return p || 'your phone';
    return '****' + d.slice(-4);
  }
  function ensurePanels() {
    var signup = document.getElementById('auth-user-signup');
    if (signup && !document.getElementById('u-mobile')) {
      var email = document.getElementById('u-email');
      if (email && email.parentNode) {
        var lab = document.createElement('label');
        lab.textContent = 'Mobile';
        var inp = document.createElement('input');
        inp.id = 'u-mobile';
        inp.placeholder = '04xx xxx xxx';
        inp.inputMode = 'tel';
        email.parentNode.insertBefore(lab, email.nextSibling);
        email.parentNode.insertBefore(inp, lab.nextSibling);
      }
    }
    if (document.getElementById('auth-user-2fa')) {
      var two = document.getElementById('auth-user-2fa');
      if (two && !document.getElementById('btn-bio')) {
        var extra = document.createElement('div');
        extra.innerHTML = '<p class="muted" style="margin-top:12px">Or use this phone.</p><button type="button" class="btn ghost" id="btn-bio" onclick="useBiometric()">Thumb / Face ID</button>';
        two.appendChild(extra);
      }
      return;
    }
    var card = document.querySelector('.auth-card');
    if (!card) return;
    var mail = document.createElement('div'); mail.id = 'auth-user-mail'; mail.className = 'hidden';
    mail.innerHTML = '<h2>Check email and phone</h2><p class="body">Link to <b id="mail-to"></b>. Code also goes to your mobile when we hook SMS.</p><button class="btn" onclick="openSetPass()">Open the email link</button>';
    var setp = document.createElement('div'); setp.id = 'auth-user-setpass'; setp.className = 'hidden';
    setp.innerHTML = '<h2>Set password \u00b7 18+</h2><label>New password</label><input id="set-pass" type="password" /><label>Again</label><input id="set-pass2" type="password" /><label class="plan" style="margin-top:12px"><input type="checkbox" id="set-age" /> <b>I am 18 or over</b></label><button class="btn" style="margin-top:12px" onclick="finishSetPass()">Save and verify</button>';
    var two = document.createElement('div'); two.id = 'auth-user-2fa'; two.className = 'hidden';
    two.innerHTML = '<h2>Phone check</h2><p class="body">Code sent to <b id="two-to"></b></p><p class="muted">Demo code <b id="two-hint"></b> or 4821. Live app uses SMS.</p><label>Code</label><input id="two-code" inputmode="numeric" /><button class="btn" style="margin-top:12px" onclick="finishTwo()">Confirm login</button><p class="muted" style="margin-top:12px">Or unlock this phone.</p><button type="button" class="btn ghost" id="btn-bio" onclick="useBiometric()">Thumb / Face ID</button>';
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
  var prevSignup = window.userSignup;
  window.userSignup = function () {
    if (typeof prevSignup === 'function') prevSignup();
    var mob = (document.getElementById('u-mobile') || {}).value;
    var u = S.users[S.users.length - 1];
    if (u && mob) { u.mobile = mob.replace(/\s/g, ''); store.save(S); }
  };
  var prevLogin = window.userLogin;
  window.userLogin = function () {
    if (typeof prevLogin === 'function') prevLogin();
    var user = S.users.find(function (x) { return x.id === S.pendingUser; });
    var t = document.getElementById('two-to');
    if (t && user) t.textContent = user.mobile ? maskPhone(user.mobile) : (user.email || 'your phone');
    var h2 = document.querySelector('#auth-user-2fa h2');
    if (h2) h2.textContent = user && user.mobile ? 'Phone check' : 'Two-step code';
  };
  window.useBiometric = function () {
    if (!window.PublicKeyCredential) {
      toast('This browser has no fingerprint / Face ID. Use the SMS code.');
      return;
    }
    var user = S.users.find(function (x) { return x.id === S.pendingUser; });
    if (!user) { toast('Log in first'); return; }
    PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().then(function (ok) {
      if (!ok) { toast('No thumb print on this device. Use the code.'); return; }
      var chal = new Uint8Array(32);
      if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(chal);
      return navigator.credentials.create({
        publicKey: {
          challenge: chal,
          rp: { name: 'Spare Seat', id: location.hostname },
          user: { id: new TextEncoder().encode(user.id), name: user.email || user.name, displayName: user.name },
          pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
          authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
          timeout: 60000
        }
      });
    }).then(function (cred) {
      if (!cred) return;
      user.bioOk = true;
      store.save(S);
      AUTH.step = null;
      toast('Phone unlocked');
      setSession(user);
    }).catch(function () {
      toast('Fingerprint cancelled. Enter the phone code.');
    });
  };
  document.addEventListener('DOMContentLoaded', ensurePanels);
  setTimeout(ensurePanels, 400);
})();
