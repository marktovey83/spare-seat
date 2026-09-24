(function () {
  function plusOn() { return typeof isPlus === 'function' && isPlus(); }
  window.showPlusWall = function (why) {
    const main = document.getElementById('main');
    if (!main) return;
    main.innerHTML = '<div class="eyebrow">Plus</div><h2>Locked on Free</h2><p class="body">' + (why || 'This is a Plus seat.') + '</p><div class="card"><h3>$15 / month</h3><p class="body">Friends list and who is online</p><p class="body">Group lounge and team rooms</p><p class="body">Names on the map and pubs past 10 km</p><p class="body">Age and club filters</p><p class="body">Book a Reach pub outside your ring</p><button class="btn" style="margin-top:12px" onclick="buyPlus()">Get Plus — $15 / month</button></div>';
  };
  function markLocks() {
    const nav = document.getElementById('nav-punter');
    if (!nav) return;
    [].forEach.call(nav.querySelectorAll('button'), function (b) {
      if (b.dataset.tab === 'friends') b.textContent = plusOn() ? 'Friends' : 'Friends 🔒';
    });
  }
  const prev = window.showPunter;
  window.showPunter = function (tab) {
    markLocks();
    if (!plusOn() && tab === 'friends') {
      const nav = document.getElementById('nav-punter');
      if (nav) {
        nav.classList.remove('hidden');
        [].forEach.call(nav.querySelectorAll('button'), function (b) { b.classList.toggle('active', b.dataset.tab === 'friends'); });
      }
      showPlusWall('Friends stay with Plus so Free stays a quiet local table.');
      return;
    }
    if (typeof prev === 'function') prev(tab);
    markLocks();
  };
  const prevFriends = window.renderFriends;
  window.renderFriends = function () {
    if (!plusOn()) { showPlusWall('Friends, who is online, and names on the map are Plus.'); return; }
    if (typeof prevFriends === 'function') prevFriends();
  };
  document.addEventListener('DOMContentLoaded', markLocks);
  setTimeout(markLocks, 500);
})();
