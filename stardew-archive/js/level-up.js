/* ===== Level-Up Popup System ===== */
window.LevelUp = (function () {
  function show(options) {
    // options: { skill, fromLevel, toLevel, unlock }
    var existing = document.querySelector(".level-up-popup");
    if (existing) existing.remove();

    var popup = document.createElement("div");
    popup.className = "level-up-popup";
    popup.innerHTML =
      '<div class="level-up-panel">' +
        '<div class="level-up-stars">✨</div>' +
        '<p class="level-up-title">技能升级！</p>' +
        '<p class="level-up-skill">' + window.escapeHtml(options.skill || "全栈开发") + '</p>' +
        '<p class="level-up-levels">Lv.' + (options.fromLevel || 5) + ' → Lv.' + (options.toLevel || 6) + '</p>' +
        '<div class="level-up-bar"><span class="level-up-fill"></span></div>' +
        (options.unlock ? '<p class="level-up-unlock">🔓 解锁：' + window.escapeHtml(options.unlock) + '</p>' : '') +
        '<button class="level-up-ok">确定</button>' +
      '</div>';

    var desktop = document.getElementById("desktop");
    desktop.appendChild(popup);

    popup.querySelector(".level-up-ok").addEventListener("click", function () {
      popup.remove();
    });
    popup.addEventListener("click", function (event) {
      if (event.target === popup) popup.remove();
    });

    // Auto-dismiss after 5s
    setTimeout(function () {
      if (popup.parentNode) popup.remove();
    }, 5000);

    return popup;
  }

  // Track which projects have triggered level-ups
  var triggered = {};

  function checkProject(projectId) {
    if (triggered[projectId]) return;
    triggered[projectId] = true;

    if (projectId === "material") {
      show({
        skill: "全栈开发",
        fromLevel: 5,
        toLevel: 6,
        unlock: "企业级项目部署能力"
      });
    } else if (projectId === "resume") {
      show({
        skill: "AI应用开发",
        fromLevel: 3,
        toLevel: 4,
        unlock: "Dify平台+向量数据库实战"
      });
    }
  }

  return { show: show, checkProject: checkProject };
})();
