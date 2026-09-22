(function () {
  function home() {
    const sel = document.getElementById("p-sub");
    const id = sel && sel.value ? sel.value : "freo";
    return (window.SEED && SEED.suburbs.find((s) => s.id === id)) || { lat: -32.0569, lng: 115.7439, name: "Fremantle" };
  }
  function draw(el, plus) {
    const h = home();
    if (typeof L === "undefined" || el._leaflet_id) return;
    const map = L.map(el).setView([h.lat, h.lng], plus ? 10 : 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "&copy; OpenStreetMap" }).addTo(map);
    L.circle([h.lat, h.lng], { radius: plus ? 45000 : 10000, color: "#ff6a1a", fillColor: "#ff6a1a", fillOpacity: 0.12, weight: 2 }).addTo(map);
    L.circleMarker([h.lat, h.lng], { radius: 8, color: "#ffb347", fillOpacity: 1 }).addTo(map).bindPopup("You \u00b7 " + h.name);
    if (window.SEED) {
      SEED.venues.forEach((v) => L.circleMarker([v.lat, v.lng], { radius: 7, color: "#2ee6a6", fillOpacity: 1 }).addTo(map).bindPopup(v.name));
      SEED.people.forEach((p) => {
        const s = SEED.suburbs.find((x) => x.id === p.suburb);
        if (!s) return;
        L.circleMarker([s.lat + 0.004, s.lng + 0.003], { radius: 6, color: "#fff8f0", fillOpacity: 0.9 }).addTo(map).bindPopup(plus ? p.name + " \u00b7 " + s.name : s.name + " \u00b7 nearby");
      });
    }
    setTimeout(function () { map.invalidateSize(); }, 250);
  }
  function inject() {
    const app = document.getElementById("view-app");
    const main = document.getElementById("main");
    if (!app || !main || app.classList.contains("hidden")) return;
    const who = (document.getElementById("who") || {}).textContent || "";
    if (!who || who === "Admin") return;
    if (who.indexOf("Hotel") >= 0 || who === "Local" || who === "Club" || who.indexOf("Arms") >= 0) return;
    const plusUser = who.indexOf("Plus") >= 0;
    const tabOn = [...document.querySelectorAll("#nav-punter button")].some(function (b) {
      if (!b.classList.contains("active")) return false;
      if (b.dataset.tab === "chats") return true;
      if (b.dataset.tab === "friends" && plusUser) return true;
      return false;
    });
    if (!tabOn) return;
    var el = document.getElementById("punter-map");
    if (!el) {
      el = document.createElement("div");
      el.id = "punter-map";
      el.className = "chat-map " + (plusUser ? "plus" : "free");
      main.insertBefore(el, main.firstChild);
      draw(el, plusUser);
    }
  }
  setInterval(inject, 600);
})();
