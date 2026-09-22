const ADMIN = { user: "admin", pass: "spareseat" };
const FREE_KM = 10;
const CHECKIN_M = 150;

const $ = (id) => document.getElementById(id);
const store = {
  load() {
    const raw = localStorage.getItem("spareseat");
    if (raw) return JSON.parse(raw);
    const state = {
      session: null,
      plus: {},
      heading: {},
      here: {},
      chats: {},
      friends: {},
      ratings: { venues: {}, people: {} },
      reports: [],
      users: SEED.people.map((p) => ({ ...p })),
    };
    localStorage.setItem("spareseat", JSON.stringify(state));
    return state;
  },
  save(s) { localStorage.setItem("spareseat", JSON.stringify(s)); }
};

let S = store.load();

function km(a, b) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
function suburb(id) { return SEED.suburbs.find((s) => s.id === id); }
function venue(id) { return SEED.venues.find((v) => v.id === id); }
function fixture(id) { return SEED.fixtures.find((f) => f.id === id); }
function me() { return S.session; }
function isPlus() { return !!(me() && (me().plus || S.plus[me().id])); }
function countHeading(vid, fid) {
  return Object.values(S.heading).filter((h) => h.venueId === vid && h.fixtureId === fid).length;
}
function countHere(vid, fid) {
  return Object.values(S.here).filter((h) => h.venueId === vid && h.fixtureId === fid).length;
}
function jugs(vid, fid) { return Math.floor(countHere(vid, fid) / 3); }

function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  setTimeout(() => t.classList.add("hidden"), 2400);
}

function setSession(sess) {
  S.session = sess;
  store.save(S);
  route();
}

function logout() {
  S.session = null;
  store.save(S);
  route();
}

function route() {
  const sess = S.session;
  $("view-gate").classList.toggle("hidden", !!sess);
  $("view-app").classList.toggle("hidden", !sess);
  if (!sess) return;
  $("who").textContent = sess.role === "admin" ? "Admin" : sess.role === "venue" ? sess.venueName : sess.name + (isPlus() ? " · Plus" : "");
  if (sess.role === "admin") showAdmin("areas");
  else if (sess.role === "venue") showVenue();
  else showPunter("tonight");
}

function startPunter() {
  const name = $("p-name").value.trim() || "Guest";
  const sub = $("p-sub").value;
  const sport = $("p-sport").value;
  const club = $("p-club").value;
  const existing = S.users.find((u) => u.name.toLowerCase() === name.toLowerCase());
  const user = existing || {
    id: "u" + Date.now(),
    name, suburb: sub, sports: [sport], clubs: { [sport]: club },
    plus: false, ageBand: $("p-age").value, showUp: [0, 0]
  };
  if (!existing) S.users.push(user);
  user.role = "punter";
  setSession(user);
}

function startVenue() {
  const id = $("v-pick").value;
  const pin = $("v-pin").value.trim();
  const v = venue(id);
  if (!v || pin !== v.pin) { toast("Wrong venue PIN"); return; }
  setSession({ role: "venue", venueId: v.id, venueName: v.name });
}

function startAdmin() {
  if ($("a-user").value.trim() !== ADMIN.user || $("a-pass").value !== ADMIN.pass) {
    toast("Admin login failed");
    return;
  }
  setSession({ role: "admin", name: "Admin" });
}

function fillSelects() {
  $("p-sub").innerHTML = SEED.suburbs.map((s) => `<option value="${s.id}">${s.name}</option>`).join("");
  $("p-sport").innerHTML = SEED.sports.map((s) => `<option>${s}</option>`).join("");
  $("v-pick").innerHTML = SEED.venues.map((v) => `<option value="${v.id}">${v.name}</option>`).join("");
  refreshClubs();
}
function refreshClubs() {
  const sport = $("p-sport").value;
  $("p-club").innerHTML = (SEED.clubs[sport] || ["Neutral"]).map((c) => `<option>${c}</option>`).join("");
}

function showPunter(tab) {
  $("nav-punter").classList.remove("hidden");
  $("nav-venue").classList.add("hidden");
  $("nav-admin").classList.add("hidden");
  [...$("nav-punter").querySelectorAll("button")].forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
  if (tab === "tonight") renderTonight();
  if (tab === "chats") renderChats();
  if (tab === "friends") renderFriends();
  if (tab === "me") renderMe();
}

function renderTonight() {
  const u = me();
  const here = suburb(u.suburb);
  const sports = u.sports || ["AFL"];
  const games = SEED.fixtures.filter((f) => sports.includes(f.sport) || isPlus());
  let html = `<div class="eyebrow">Tonight</div><h2>Don't watch it alone</h2>
    <p class="body">${isPlus() ? "Plus · any distance, full table list, filters." : "Free · people and pubs within " + FREE_KM + " km of " + here.name + "."}</p>`;
  games.forEach((f) => {
    const pubs = SEED.venues.filter((v) => v.showing.includes(f.id));
    html += `<div class="card"><div class="pill">${f.sport}</div>
      <h3>${f.label}</h3>
      <p class="muted">${f.start} · ${f.venue}</p>
      <div class="list" style="margin-top:10px">`;
    pubs.forEach((v) => {
      const vs = suburb(v.suburb);
      const dist = km(here, vs);
      const far = dist > FREE_KM && !isPlus();
      const heading = countHeading(v.id, f.id);
      const hereN = countHere(v.id, f.id);
      const people = listGoing(v.id, f.id, far);
      html += `<div class="item">
        <h3>${v.name} <span class="muted">${vs.name} · ${dist.toFixed(1)} km</span></h3>
        <p class="body">${v.deal}</p>
        <p class="muted">${heading} heading · ${hereN} here · ${jugs(v.id, f.id)} jugs poured · ${v.seats} seats held</p>
        ${people}
        <div class="row" style="margin-top:8px">
          <button class="btn ghost" onclick="headTo('${v.id}','${f.id}')">I'm heading here</button>
          <button class="btn" onclick="checkIn('${v.id}','${f.id}')">I'm here</button>
        </div>
      </div>`;
    });
    html += `</div></div>`;
  });
  $("main").innerHTML = html;
}

function listGoing(vid, fid, gated) {
  const rows = Object.values(S.heading).filter((h) => h.venueId === vid && h.fixtureId === fid);
  if (!rows.length) return `<p class="muted">Nobody on the table list yet.</p>`;
  if (gated) return `<p class="muted">${rows.length} going · faces are Plus</p>`;
  if (!isPlus()) {
    return `<p class="muted">${rows.length} going · ${rows.slice(0, 3).map((r) => r.name[0]).join(" ")} · Plus to see who</p>`;
  }
  return `<p class="body">Going: ${rows.map((r) => r.name).join(", ")}</p>`;
}

function headTo(vid, fid) {
  const u = me();
  S.heading[u.id + fid] = { userId: u.id, name: u.name, venueId: vid, fixtureId: fid, at: Date.now() };
  store.save(S);
  toast("Seat noted at " + venue(vid).name);
  renderTonight();
}

function checkIn(vid, fid) {
  const u = me();
  const v = venue(vid);
  const here = suburb(u.suburb);
  const metres = km(here, { lat: v.lat, lng: v.lng }) * 1000;
  if (metres > CHECKIN_M + 2000) {
    toast("Too far for I'm here. Demo uses your suburb pin — pick a closer suburb or head to this pub.");
    S.reports.push({ at: Date.now(), type: "failed-checkin", user: u.name, venue: v.name, metres: Math.round(metres) });
    store.save(S);
    return;
  }
  S.heading[u.id + fid] = { userId: u.id, name: u.name, venueId: vid, fixtureId: fid, at: Date.now() };
  S.here[u.id + fid] = { userId: u.id, name: u.name, venueId: vid, fixtureId: fid, at: Date.now() };
  const n = countHere(vid, fid);
  store.save(S);
  if (n % 3 === 0) toast("Jug's on the Spare Seat table (" + n + " checked in)");
  else toast("You're here. " + (3 - (n % 3)) + " more for the next jug");
  renderTonight();
}

function chatKey(kind, id) { return kind + ":" + id; }

function renderChats() {
  const rooms = SEED.fixtures.map((f) => ({ key: chatKey("match", f.id), title: f.label + " match room", plus: false }));
  SEED.venues.forEach((v) => rooms.push({ key: chatKey("pub", v.id), title: v.name + " table", plus: false }));
  rooms.push({ key: chatKey("crew", "sunday-nfl"), title: "Sunday NFL crew", plus: true });
  let html = `<div class="eyebrow">Chat</div><h2>Rooms</h2><div class="list">`;
  rooms.forEach((r) => {
    const locked = r.plus && !isPlus();
    html += `<div class="item"><h3>${r.title} ${r.plus ? '<span class="pill">Plus</span>' : ""}</h3>
      ${locked ? `<p class="muted">Plus to open standing crews.</p>` : `<button class="btn ghost" onclick="openRoom('${r.key}','${r.title.replace(/'/g, "")}')">Open</button>`}
    </div>`;
  });
  html += `</div><div id="room"></div>`;
  $("main").innerHTML = html;
}

function openRoom(key, title) {
  if (!S.chats[key]) S.chats[key] = [];
  const box = S.chats[key].map((m) => `<div class="msg"><b>${m.name}</b> ${m.text}</div>`).join("") || `<div class="msg muted">No messages yet. Talk about the game.</div>`;
  $("room").innerHTML = `<div class="card"><h3>${title}</h3>
    <div class="chat" id="chatbox">${box}</div>
    <div class="row"><input id="chat-in" placeholder="Message (no stakes, no numbers first)" />
    <button class="btn" onclick="sendMsg('${key}')">Send</button></div></div>`;
}

function sendMsg(key) {
  const text = $("chat-in").value.trim();
  if (!text) return;
  const banned = /(payid|\$\d+|weed|cocaine|come to (my|mine))/i;
  if (banned.test(text)) {
    S.reports.push({ at: Date.now(), type: "chat-flag", user: me().name, text });
    store.save(S);
    toast("Message blocked. Keep it about the game.");
    return;
  }
  S.chats[key] = S.chats[key] || [];
  S.chats[key].push({ name: me().name, text, at: Date.now() });
  store.save(S);
  openRoom(key, key);
}

function renderFriends() {
  if (!isPlus()) {
    $("main").innerHTML = `<div class="card"><h2>Friends are Plus</h2><p class="body">Free gets tonight and the pub table. Plus keeps your crew.</p>
      <button class="btn" onclick="buyPlus()">Get Plus — $10 / month demo</button></div>`;
    return;
  }
  const list = S.users.filter((u) => u.id !== me().id);
  let html = `<div class="eyebrow">Plus</div><h2>Friends</h2><div class="list">`;
  list.forEach((u) => {
    const mine = (S.friends[me().id] || []);
    const theirs = (S.friends[u.id] || []);
    const ok = mine.includes(u.id) && theirs.includes(me().id);
    const sent = mine.includes(u.id);
    html += `<div class="item"><h3>${u.name} · ${u.clubs.AFL || ""} · ${suburb(u.suburb).name}</h3>
      <p class="muted">${ok ? "Friends · can see if they're on tonight" : sent ? "Request sent" : "Not friends yet"}</p>
      ${ok ? "" : `<button class="btn ghost" onclick="addFriend('${u.id}')">Add</button>`}
    </div>`;
  });
  html += `</div>`;
  $("main").innerHTML = html;
}

function addFriend(id) {
  S.friends[me().id] = S.friends[me().id] || [];
  if (!S.friends[me().id].includes(id)) S.friends[me().id].push(id);
  S.friends[id] = S.friends[id] || [];
  if (!S.friends[id].includes(me().id)) S.friends[id].push(me().id);
  store.save(S);
  toast("Friend added (demo auto-accept)");
  renderFriends();
}

function renderMe() {
  const u = me();
  const su = u.showUp || [0, 0];
  $("main").innerHTML = `<div class="card">
    <div class="eyebrow">Profile</div>
    <h2>${u.name}</h2>
    <p class="body">${suburb(u.suburb).name} · ${u.ageBand} · ${(u.sports || []).join(", ")}</p>
    <p class="muted">Show-up ${su[0]}/${su[1] || 0} · ${isPlus() ? "Plus" : "Free 10 km"}</p>
    ${isPlus() ? "" : `<button class="btn" onclick="buyPlus()">Upgrade to Plus</button>`}
    <hr style="border:0;border-top:1px solid var(--line);margin:16px 0" />
    <h3>Rate last table</h3>
    <p class="muted">Only after a shared check-in. Stars for manners, not the punt.</p>
    <label>Venue</label>
    <select id="rate-v">${SEED.venues.map((v) => `<option value="${v.id}">${v.name}</option>`).join("")}</select>
    <label>Score 1–5</label>
    <select id="rate-s"><option>5</option><option>4</option><option>3</option><option>2</option><option>1</option></select>
    <button class="btn ghost" style="margin-top:10px" onclick="rateVenue()">Rate pub</button>
  </div>`;
}

function buyPlus() {
  S.plus[me().id] = true;
  me().plus = true;
  const u = S.users.find((x) => x.id === me().id);
  if (u) u.plus = true;
  store.save(S);
  toast("Plus on (demo, no charge)");
  showPunter("tonight");
}

function rateVenue() {
  const id = $("rate-v").value;
  const score = Number($("rate-s").value);
  S.ratings.venues[id] = S.ratings.venues[id] || [];
  S.ratings.venues[id].push({ user: me().name, score });
  store.save(S);
  toast("Thanks. Only check-ins should rate in production.");
}

function showVenue() {
  $("nav-punter").classList.add("hidden");
  $("nav-venue").classList.remove("hidden");
  $("nav-admin").classList.add("hidden");
  const v = venue(me().venueId);
  let html = `<div class="eyebrow">Venue</div><h2>${v.name}</h2>
    <p class="body">${v.deal} · ${v.seats} seats held near the screen</p>`;
  SEED.fixtures.filter((f) => v.showing.includes(f.id)).forEach((f) => {
    const head = Object.values(S.heading).filter((h) => h.venueId === v.id && h.fixtureId === f.id);
    const here = Object.values(S.here).filter((h) => h.venueId === v.id && h.fixtureId === f.id);
    html += `<div class="card"><h3>${f.label}</h3>
      <div class="row">
        <div><div class="stat">${head.length}</div><div class="muted">heading</div></div>
        <div><div class="stat">${here.length}</div><div class="muted">here</div></div>
        <div><div class="stat">${jugs(v.id, f.id)}</div><div class="muted">jugs to pour</div></div>
      </div>
      <table><thead><tr><th>Name</th><th>Status</th></tr></thead><tbody>
      ${head.map((h) => `<tr><td>${h.name}</td><td>${here.find((x) => x.userId === h.userId) ? "Here" : "Heading"}</td></tr>`).join("") || `<tr><td colspan="2">No bookings yet</td></tr>`}
      </tbody></table></div>`;
  });
  const scores = S.ratings.venues[v.id] || [];
  const avg = scores.length ? (scores.reduce((a, b) => a + b.score, 0) / scores.length).toFixed(1) : "—";
  html += `<p class="muted">Venue rating ${avg} from ${scores.length} check-in reviews</p>`;
  $("main").innerHTML = html;
}

function showAdmin(tab) {
  $("nav-punter").classList.add("hidden");
  $("nav-venue").classList.add("hidden");
  $("nav-admin").classList.remove("hidden");
  [...$("nav-admin").querySelectorAll("button")].forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
  if (tab === "areas") {
    let html = `<div class="eyebrow">Admin</div><h2>What's on in each area</h2><div class="grid two">`;
    SEED.suburbs.forEach((sub) => {
      const users = S.users.filter((u) => u.suburb === sub.id);
      const venues = SEED.venues.filter((v) => v.suburb === sub.id);
      const hereN = Object.values(S.here).filter((h) => venue(h.venueId).suburb === sub.id).length;
      html += `<div class="card"><h3>${sub.name}</h3>
        <p class="stat">${users.length}</p><p class="muted">punters</p>
        <p class="body">${venues.map((v) => v.name).join(", ") || "No pin yet"}</p>
        <p class="muted">${hereN} checked in tonight</p></div>`;
    });
    html += `</div>`;
    $("main").innerHTML = html;
  }
  if (tab === "people") {
    $("main").innerHTML = `<div class="eyebrow">Admin</div><h2>Punters</h2>
      <table><thead><tr><th>Name</th><th>Area</th><th>Club</th><th>Plan</th></tr></thead><tbody>
      ${S.users.map((u) => `<tr><td>${u.name}</td><td>${suburb(u.suburb).name}</td><td>${u.clubs.AFL || "—"}</td><td>${u.plus || S.plus[u.id] ? "Plus" : "Free"}</td></tr>`).join("")}
      </tbody></table>`;
  }
  if (tab === "live") {
    let html = `<div class="eyebrow">Admin</div><h2>Live tables</h2>`;
    SEED.venues.forEach((v) => {
      html += `<div class="card"><h3>${v.name}</h3>`;
      SEED.fixtures.filter((f) => v.showing.includes(f.id)).forEach((f) => {
        html += `<p class="body">${f.label}: ${countHeading(v.id, f.id)} heading · ${countHere(v.id, f.id)} here · ${jugs(v.id, f.id)} jugs</p>`;
      });
      html += `</div>`;
    });
    $("main").innerHTML = html;
  }
  if (tab === "reports") {
    const rows = S.reports.slice().reverse();
    $("main").innerHTML = `<div class="eyebrow">Admin</div><h2>Flags</h2>
      ${rows.length ? rows.map((r) => `<div class="item"><b>${r.type}</b> · ${r.user || ""} · ${r.venue || ""}<div class="muted">${r.text || r.metres || ""}</div></div>`).join("") : `<p class="muted">No reports yet.</p>`}
      <button class="btn ghost" onclick="resetDemo()">Reset demo data</button>`;
  }
}

function resetDemo() {
  localStorage.removeItem("spareseat");
  S = store.load();
  toast("Demo reset");
  showAdmin("areas");
}

window.headTo = headTo;
window.checkIn = checkIn;
window.openRoom = openRoom;
window.sendMsg = sendMsg;
window.addFriend = addFriend;
window.buyPlus = buyPlus;
window.rateVenue = rateVenue;
window.resetDemo = resetDemo;
window.showPunter = showPunter;
window.showAdmin = showAdmin;
window.startPunter = startPunter;
window.startVenue = startVenue;
window.startAdmin = startAdmin;
window.logout = logout;
window.refreshClubs = refreshClubs;

document.addEventListener("DOMContentLoaded", () => {
  fillSelects();
  $("p-sport").addEventListener("change", refreshClubs);
  route();
});
