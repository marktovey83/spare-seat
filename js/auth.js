window.AUTH = window.AUTH || { role: "user", mode: "login" };

function setAuthRole(role) {
  AUTH.role = role;
  const u = document.getElementById("sw-user");
  const v = document.getElementById("sw-venue");
  if (u) u.classList.toggle("active", role === "user");
  if (v) v.classList.toggle("active", role === "venue");
  paintAuth();
}
function setAuthMode(mode) {
  AUTH.mode = mode;
  const a = document.getElementById("sw-login");
  const b = document.getElementById("sw-signup");
  if (a) a.classList.toggle("active", mode === "login");
  if (b) b.classList.toggle("active", mode === "signup");
  paintAuth();
}
function paintAuth() {
  const show = (id, on) => { const el = document.getElementById(id); if (el) el.classList.toggle("hidden", !on); };
  show("auth-user-login", AUTH.role === "user" && AUTH.mode === "login");
  show("auth-user-signup", AUTH.role === "user" && AUTH.mode === "signup");
  show("auth-venue-login", AUTH.role === "venue" && AUTH.mode === "login");
  show("auth-venue-signup", AUTH.role === "venue" && AUTH.mode === "signup");
}
function toggleAdmin() {
  const el = document.getElementById("admin-box");
  if (el) el.classList.toggle("hidden");
}
function findUser(id) {
  const q = (id || "").trim().toLowerCase();
  return S.users.find((u) =>
    (u.name && u.name.toLowerCase() === q) ||
    (u.email && u.email.toLowerCase() === q)
  );
}
function userLogin() {
  const id = document.getElementById("u-login-id").value.trim();
  const pass = document.getElementById("u-login-pass").value;
  const user = findUser(id);
  if (!user) { toast("No user with that name or email"); return; }
  if ((user.pass || "seat") !== pass) { toast("Wrong password"); return; }
  user.role = "user";
  setSession(user);
}
function userSignup() {
  const name = document.getElementById("u-name").value.trim();
  const email = document.getElementById("u-email").value.trim();
  const pass = document.getElementById("u-pass").value;
  if (!name || !pass) { toast("Name and password needed"); return; }
  if (findUser(name) || (email && findUser(email))) { toast("That account already exists \u2014 log in"); return; }
  const sport = document.getElementById("p-sport").value;
  const user = {
    id: "u" + Date.now(), name, email, pass,
    suburb: document.getElementById("p-sub").value,
    sports: [sport], clubs: { [sport]: document.getElementById("p-club").value },
    plus: false, ageBand: document.getElementById("p-age").value, showUp: [0, 0], role: "user"
  };
  S.users.push(user);
  store.save(S);
  toast("Account created");
  setSession(user);
}
function venueLogin() {
  const id = document.getElementById("v-pick").value;
  const secret = document.getElementById("v-pin").value.trim();
  const v = venue(id);
  if (!v) { toast("Pick a venue"); return; }
  const extra = (S.venueAccounts || {})[id];
  const ok = secret === v.pin || secret === "seat" || (extra && extra.pass === secret);
  if (!ok) { toast("Wrong password or PIN"); return; }
  setSession({ role: "venue", venueId: v.id, venueName: v.name });
}
function venueSignup() {
  const name = document.getElementById("vs-name").value.trim();
  const email = document.getElementById("vs-email").value.trim();
  const pass = document.getElementById("vs-pass").value;
  const pin = (document.getElementById("vs-pin").value.trim() || "4821");
  const sub = document.getElementById("vs-sub").value;
  if (!name || !pass) { toast("Venue name and password needed"); return; }
  const here = suburb(sub);
  const v = {
    id: "v" + Date.now(), name, suburb: sub,
    lat: here.lat + 0.002, lng: here.lng + 0.002,
    showing: SEED.fixtures.map((f) => f.id).slice(0, 2),
    deal: "Spare Seat table \u00b7 jug every 3 check-ins", seats: 8, pin
  };
  SEED.venues.push(v);
  S.venueAccounts = S.venueAccounts || {};
  S.venueAccounts[v.id] = { email, pass, pin, name };
  store.save(S);
  if (typeof fillSelects === "function") fillSelects();
  toast("Venue listed");
  setSession({ role: "venue", venueId: v.id, venueName: v.name });
}

window.setAuthRole = setAuthRole;
window.setAuthMode = setAuthMode;
window.toggleAdmin = toggleAdmin;
window.userLogin = userLogin;
window.userSignup = userSignup;
window.venueLogin = venueLogin;
window.venueSignup = venueSignup;

document.addEventListener("DOMContentLoaded", () => {
  S.users.forEach((u) => { if (!u.pass) u.pass = "seat"; });
  const vs = document.getElementById("vs-sub");
  if (vs && !vs.options.length) {
    vs.innerHTML = SEED.suburbs.map((s) => '<option value="' + s.id + '">' + s.name + "</option>").join("");
  }
});
