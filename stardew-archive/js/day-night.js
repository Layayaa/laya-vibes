/* ===== Day/Night Cycle ===== */
window.DayNight = (function () {
  var currentPeriod = "day";
  var progressFill = null;

  function getPeriod(hour) {
    if (hour >= 6 && hour < 18) return "day";
    if (hour >= 18 && hour < 20) return "dusk";
    return "night";
  }

  function getProgress(hour, minute) {
    // Sunrise ~6:00 to sunset ~18:00 as progress (0-100%)
    if (hour < 6) return 0;
    if (hour >= 18) return 100;
    return Math.round(((hour - 6) * 60 + minute) / (12 * 60) * 100);
  }

  function update() {
    var now = new Date();
    var hour = now.getHours();
    var minute = now.getMinutes();
    var period = getPeriod(hour);
    var progress = getProgress(hour, minute);

    if (period !== currentPeriod) {
      document.documentElement.dataset.time = period;
      currentPeriod = period;
    }

    if (progressFill) {
      progressFill.style.width = progress + "%";
    }
  }

  function init() {
    update();

    // Create time progress bar element if needed
    var tray = document.querySelector(".tray");
    if (tray) {
      var bar = document.createElement("span");
      bar.className = "tray-stat";
      bar.innerHTML = '<span style="font-size:8px;">☀️</span><span class="time-progress"><span class="time-progress-fill"></span></span><span style="font-size:8px;">🌙</span>';
      tray.insertBefore(bar, tray.querySelector("#clock"));
      progressFill = bar.querySelector(".time-progress-fill");
    }

    setInterval(update, 60000);
    update();
  }

  return { init: init, getPeriod: getPeriod };
})();
