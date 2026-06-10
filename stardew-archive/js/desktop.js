(function () {
  var state = window.PixelDesk;
  var desktop = document.getElementById("desktop");
  var boot = document.getElementById("boot-screen");
  var startButton = document.getElementById("start-button");
  var startMenu = document.getElementById("start-menu");
  var clock = document.getElementById("clock");
  var dateEl = document.getElementById("date");
  var wallpaper = document.getElementById("wallpaper");
  var shutdownOverlay = document.getElementById("shutdown-overlay");
  var bootPhrase = document.getElementById("boot-phrase");
  var bootProgress = document.getElementById("boot-progress");
  var seasonEl = document.getElementById("season-icon");
  var goldEl = document.getElementById("gold-count");
  var energyFill = document.getElementById("energy-fill");
  var snowLayer = document.getElementById("snow-layer");
  var timeProgress = document.getElementById("time-progress-fill");

  var SETTINGS_KEY = "laya-stardew-settings";
  var MYSTERY_KEY = "laya-mystery-seen";

  // ===== Settings =====
  function loadSettings() {
    try {
      var saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
      Object.assign(state.settings, saved);
    } catch (e) {}
  }

  function saveSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
    } catch (e) {}
  }

  // ===== App Opening =====
  function openApp(app) {
    var result = window.Apps.openWindow(app);
    if (!result) return;
    startMenu.classList.add("hidden");

    // Track affinity
    if (result.id) {
      if (window.addAffinity(result.id)) {
        window.showAffinityToast();
        window.Affinity && window.Affinity.checkAllViewed();
      }
    }

    // Update gold
    if (goldEl) goldEl.textContent = String(window.Affinity ? window.Affinity.getGold() : state.affinity * 100 + 500);
  }

  // ===== Pixel Dialog =====
  function showPixelDialog(options) {
    var existing = document.querySelector(".pixel-dialog");
    if (existing) existing.remove();

    var dialog = document.createElement("div");
    dialog.className = "pixel-dialog";
    dialog.innerHTML =
      '<div class="pixel-dialog-panel" role="dialog" aria-modal="true">' +
        '<p class="pixel-dialog-title">' + window.escapeHtml(options.title || "提示") + '</p>' +
        '<p class="pixel-dialog-message">' + window.escapeHtml(options.message || "") + '</p>' +
        '<div class="pixel-dialog-actions">' +
          (options.confirmText ? '<button class="action-btn pixel-dialog-confirm">' + window.escapeHtml(options.confirmText) + '</button>' : '') +
          '<button class="action-btn pixel-dialog-close">' + window.escapeHtml(options.closeText || "知道了") + '</button>' +
        '</div>' +
      '</div>';
    desktop.appendChild(dialog);

    var close = function () { dialog.remove(); };
    dialog.querySelector(".pixel-dialog-close").addEventListener("click", close);
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) close();
    });
    var confirm = dialog.querySelector(".pixel-dialog-confirm");
    if (confirm) {
      confirm.addEventListener("click", function () {
        if (typeof options.onConfirm === "function") options.onConfirm();
        close();
      });
    }
  }

  // ===== Clock =====
  function updateClock() {
    clock.textContent = window.formatTime();
    dateEl.textContent = window.formatDate();
  }

  // ===== Season =====
  function setSeason(s) {
    state.season = s;
    document.documentElement.dataset.season = s;
    if (seasonEl) seasonEl.textContent = window.seasonEmoji(s);
    if (snowLayer) snowLayer.style.display = s === "winter" ? "block" : "none";
  }

  // ===== Wallpaper =====
  function setWallpaper(name) {
    if (name !== "farm") name = "farm";
    state.settings.wallpaper = name;
    var pixEls = wallpaper.querySelectorAll(".pixel-sky,.pixel-hills,.pixel-grass,.pixel-tree,.petal-container,.farm-cloud");

    wallpaper.dataset.wallpaper = "farm";
    wallpaper.style.background = "";
    pixEls.forEach(function (el) { el.style.display = ""; });
    saveSettings();
  }

  function applyTheme(theme) {
    state.settings.theme = theme;
    document.documentElement.dataset.theme = theme;
    saveSettings();
  }

  // ===== Day/Night =====
  function updateDayNight() {
    var hour = new Date().getHours();
    var period;
    if (hour >= 6 && hour < 18) period = "day";
    else if (hour >= 18 && hour < 20) period = "dusk";
    else period = "night";
    document.documentElement.dataset.time = period;

    // Time progress bar (sunrise 6:00 → sunset 18:00)
    if (timeProgress) {
      var now = new Date();
      var mins = (now.getHours() - 6) * 60 + now.getMinutes();
      var pct = Math.max(0, Math.min(100, Math.round(mins / (12 * 60) * 100)));
      timeProgress.style.width = pct + "%";
    }
  }

  // ===== Mysterious Note =====
  function checkMysteryNote() {
    try {
      if (localStorage.getItem(MYSTERY_KEY)) return;
    } catch (e) { return; }

    // Show after 8 seconds
    setTimeout(function () {
      var note = document.getElementById("mystery-note");
      if (!note) return;
      note.classList.remove("hidden");
      note.querySelector(".mystery-note-ok").addEventListener("click", function () {
        note.classList.add("hidden");
        try { localStorage.setItem(MYSTERY_KEY, "1"); } catch (e) {}
      });
    }, 8000);
  }

  // ===== Shutdown Sequence =====
  function shutdownSequence() {
    shutdownOverlay.classList.remove("hidden");
    shutdownOverlay.querySelector(".shutdown-text").textContent = "正在睡觉... 💤";
    shutdownOverlay.querySelector(".shutdown-joke").textContent = "";
    boot.classList.remove("hidden");
    boot.classList.add("active");
    desktop.classList.add("hidden");
    bootPhrase.textContent = "ZZZ...";
    bootProgress.style.width = "100%";

    setTimeout(function () {
      bootPhrase.textContent = "You can't sleep now, there are bugs to fix! 🐛";
      bootProgress.style.width = "0%";
      setTimeout(function () {
        shutdownOverlay.classList.add("hidden");
        boot.classList.add("hidden");
        desktop.classList.remove("hidden");
      }, 2000);
    }, 1200);
  }

  // ===== Boot Animation =====
  var bootPhrases = [
    "Planting seeds...",
    "Loading skills...",
    "Welcome! 🌿"
  ];
  var bootIdx = 0;
  var bootCursorTimer = null;
  var bootDone = false;

  function typeBootPhrase(text, callback) {
    var idx = 0;
    bootPhrase.textContent = "";
    function tick() {
      if (idx < text.length) {
        bootPhrase.textContent = text.slice(0, idx + 1) + "_";
        idx += 1;
        bootCursorTimer = setTimeout(tick, 35);
      } else {
        bootPhrase.textContent = text;
        if (callback) setTimeout(callback, 250);
      }
    }
    tick();
  }

  function clearBootPhrase(callback) {
    bootPhrase.textContent = "";
    if (callback) setTimeout(callback, 80);
  }

  function runBootSequence() {
    function showDesktop() {
      if (bootDone) return;
      bootDone = true;
      if (bootCursorTimer) clearTimeout(bootCursorTimer);
      boot.classList.remove("active");
      boot.classList.add("hidden");
      boot.style.opacity = "1";
      desktop.classList.remove("hidden");
      updateDayNight();
      checkMysteryNote();
    }

    bootPhrase.textContent = "Loading farm desk...";
    bootProgress.style.width = "100%";
    boot.style.transition = "opacity .16s steps(1)";
    setTimeout(function () {
      boot.style.opacity = "0";
      setTimeout(showDesktop, 160);
    }, 420);
  }

  // ===== Energy Tick =====
  function tickEnergy() {
    if (!energyFill) return;
    var now = new Date();
    var pct = 100 - (now.getMinutes() % 60) * 1.2;
    energyFill.style.width = Math.max(10, pct) + "%";
  }

  // ===== Event Bindings =====
  // Desktop icon double-click
  document.querySelectorAll(".desktop-icon").forEach(function (btn) {
    btn.addEventListener("dblclick", function () {
      btn.classList.add("selected");
      setTimeout(function () { btn.classList.remove("selected"); }, 1800);
      openApp(btn.dataset.app);
    });
  });

  // Start menu
  startMenu.querySelectorAll("[data-app]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var app = btn.dataset.app;
      if (app) openApp(app);
    });
  });

  startButton.addEventListener("click", function () {
    startMenu.classList.toggle("hidden");
  });

  document.addEventListener("click", function (event) {
    if (!startMenu.contains(event.target) && event.target !== startButton) {
      startMenu.classList.add("hidden");
    }
  });

  startMenu.addEventListener("click", function (event) {
    var btn = event.target.closest("button");
    if (!btn) return;
    if (btn.id === "shutdown-button") {
      startMenu.classList.add("hidden");
      shutdownSequence();
    }
  });

  // Global: data-url buttons
  document.addEventListener("click", function (event) {
    var demoBtn = event.target.closest("[data-url]");
    if (demoBtn) {
      window.open(demoBtn.dataset.url, "_blank", "noopener,noreferrer");
    }
  });

  // Wallpaper/theme switches
  document.addEventListener("click", function (event) {
    var wpBtn = event.target.closest("[data-wallpaper]");
    if (wpBtn) {
      setWallpaper(wpBtn.dataset.wallpaper);
      wpBtn.parentElement.querySelectorAll("button").forEach(function (btn) {
        btn.classList.toggle("active", btn === wpBtn);
      });
    }
    var themeBtn = event.target.closest("[data-theme]");
    if (themeBtn) {
      applyTheme(themeBtn.dataset.theme);
      themeBtn.parentElement.querySelectorAll("button").forEach(function (btn) {
        btn.classList.toggle("active", btn === themeBtn);
      });
    }
    // Recycle bin empty
    if (event.target.id === "empty-recycle") {
      showPixelDialog({
        title: "Linus wouldn't like this...",
        message: "确认清空后，Linus 的像素头像闪过：I was using that...",
        confirmText: "仍然清空",
        closeText: "先留着",
        onConfirm: function () {
          window.showAffinityToast("垃圾桶拒绝配合。");
        }
      });
    }
  });

  // Energy click easter egg
  document.querySelector(".energy-bar")?.addEventListener("click", function () {
    if (!energyFill) return;
    energyFill.style.width = "100%";
    window.showAffinityToast("⚡ 能量恢复了！(喝了一杯咖啡 ☕)");
    setTimeout(function () { tickEnergy(); }, 3000);
  });

  document.querySelector(".stardew-chicken")?.addEventListener("click", function () {
    window.showAffinityToast("咯咯咯~");
  });
  document.querySelector(".stardew-blue-chicken")?.addEventListener("click", function () {
    window.showAffinityToast("蓝色小鸡正在巡逻。");
  });
  document.querySelector(".stardew-cat")?.addEventListener("click", function () {
    window.showAffinityToast("喵。");
  });

  // ===== Init =====
  loadSettings();
  var currentSeason = window.getSeason();
  setSeason(currentSeason);
  setWallpaper(state.settings.wallpaper || "seasonal");
  applyTheme(state.settings.theme || "farm");
  updateClock();
  tickEnergy();

  setInterval(updateClock, 1000);
  setInterval(updateDayNight, 60000);
  setInterval(tickEnergy, 30000);

  // Start boot
  runBootSequence();

  window.showPixelDialog = showPixelDialog;
})();
