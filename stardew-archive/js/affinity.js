/* ===== Affinity / Friendship System ===== */
window.Affinity = (function () {
  var state = window.PixelDesk;

  function add(reason) {
    if (state.affinityLog.includes(reason)) return false;
    state.affinity += 1;
    state.affinityLog.push(reason);

    // Update gold display
    var goldEl = document.getElementById("gold-count");
    if (goldEl) goldEl.textContent = String(state.affinity * 100 + 500);

    // Show heart popup
    showHeart();
    return true;
  }

  function showHeart() {
    var desktop = document.getElementById("desktop");
    var heart = document.createElement("div");
    heart.className = "heart-pop";
    heart.textContent = "❤️ +1";
    heart.style.right = (20 + Math.random() * 140) + "px";
    heart.style.bottom = (90 + Math.random() * 100) + "px";
    desktop.appendChild(heart);
    setTimeout(function () { heart.remove(); }, 800);
  }

  function checkAllViewed() {
    if (state.affinity >= 3 && !state._finalTriggered) {
      state._finalTriggered = true;
      setTimeout(function () {
        window.showPixelDialog({
          title: "隐藏成就解锁！",
          message: "你是第一个认真看完我所有项目的人！好感度 💖💖💖",
          confirmText: "打开信箱 ✉️",
          closeText: "先不了",
          onConfirm: function () {
            window.Apps.openWindow("contact");
          }
        });
      }, 600);
    }
  }

  function getGold() {
    return state.affinity * 100 + 500;
  }

  function getViewCount() {
    return state.affinityLog.length;
  }

  function getTotalWindows() {
    return 9; // computer, projects, terminal, about, browser, contact, skills, settings, shipping
  }

  return {
    add: add,
    checkAllViewed: checkAllViewed,
    getGold: getGold,
    getViewCount: getViewCount,
    getTotalWindows: getTotalWindows
  };
})();
