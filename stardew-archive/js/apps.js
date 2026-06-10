(function () {
  var state = window.PixelDesk;

  // ===== About — NPC Dialog Style =====
  function openAbout() {
    window.NpcDialog.show({
      name: "Laya",
      segments: [
        "你好，我是伍可莹。",
        "说真的，选计算机不是什么深思熟虑的决定。我哥先选了计算机，我填志愿的时候也不了解专业，就按分数从高到低往下填，然后一路滑档，滑到了现在这个专业。",
        "但来了就来了。学着学着发现——还行，甚至有点上头。从写第一行代码到现在，我自己搭过服务器、配过Docker、踩过容器网络里localhost不是localhost的坑，也写过把pymysql伪装成MySQLdb的骚操作。",
        "现在我有两个在跑的项目：一个是工程材料询价系统，实打实部署在企业服务器上天天在用；一个是简历智能推荐，上传简历就能匹配岗位。前端后端部署全自己来。",
        "我不喜欢只写代码。我喜欢想清楚这个东西到底要解决什么问题，然后从零做到它能跑起来。"
      ],
      onDone: function () {
        window.addAffinity("about");
        window.showAffinityToast && window.showAffinityToast();
        window.LevelUp && window.LevelUp.checkProject("intro");
        window.Affinity && window.Affinity.checkAllViewed();
      }
    });
  }

  // ===== Projects — Quest Board Style =====
  function projectsBody() {
    var wrap = document.createElement("div");
    wrap.className = "quest-board";

    var title = document.createElement("div");
    title.className = "quest-board-title";
    title.textContent = "📋 Pierre's Task Board";
    wrap.appendChild(title);

    state.projectsList.forEach(function (proj) {
      var note = document.createElement("article");
      note.className = "quest-note";

      note.innerHTML =
        '<p class="quest-note-kicker">📋 委托</p>' +
        '<h4>' + window.escapeHtml(proj.title) + '</h4>' +
        '<p>' + window.escapeHtml(proj.summary) + '</p>' +
        '<div class="quest-note-meta">' +
          '<span class="quest-tag reward">💰 ' + window.escapeHtml(proj.reward) + '</span>' +
          '<span class="quest-tag status">✅ 已完成</span>' +
        '</div>' +
        '<p class="quest-note-stars">难度：' + "⭐".repeat(proj.difficulty || 3) + '</p>' +
        '<div class="quest-note-actions">' +
          '<button class="action-btn quest-detail-btn" data-project="' + proj.id + '">查看详情</button>' +
          (proj.demo ? '<button class="action-btn" data-url="' + window.escapeHtml(proj.demo) + '">在线Demo</button>' : '') +
        '</div>';

      wrap.appendChild(note);
    });

    // Click handler for detail buttons
    wrap.addEventListener("click", function (event) {
      var detailBtn = event.target.closest(".quest-detail-btn");
      if (!detailBtn) return;
      var projId = detailBtn.dataset.project;
      var proj = state.projectsList.find(function (p) { return p.id === projId; });
      if (!proj) return;

      // Show NPC dialog with project details
      window.NpcDialog.show({
        name: "Pierre",
        segments: proj.detailSegments || [
          "委托详情：「" + proj.title + "」",
          "技术栈：" + proj.stack,
          "我的角色：" + proj.role,
          "亮点：" + proj.highlight,
          "Demo链接：" + (proj.demo || "见下方按钮")
        ],
        reward: "💰 奖励：" + (proj.reward || "全栈实战经验"),
        onDone: function () {
          window.LevelUp && window.LevelUp.checkProject(proj.id);
        }
      });
    });

    return wrap;
  }

  // ===== Computer — File Explorer =====
  function computerBody() {
    var wrap = document.createElement("div");
    wrap.className = "app-section";
    wrap.innerHTML =
      '<div class="app-card">' +
        '<p class="app-heading">📁 文件资源管理器</p>' +
        '<div class="file-tree">C:\\\n' +
        '  📁 Projects\n' +
        '     📁 工程材料询价系统\n' +
        '       📄 overview.txt\n' +
        '       📄 tech-stack.txt\n' +
        '       🎬 demo.exe\n' +
        '     📁 简历智能推荐系统\n' +
        '       📄 overview.txt\n' +
        '       🔗 demo.exe\n' +
        '     📁 ??? 🔒 Coming Soon...\n' +
        '  📁 Skills\n' +
        '     📄 Java ⭐⭐⭐\n' +
        '     📄 Python ⭐⭐⭐\n' +
        '     📄 Vue 3 ⭐⭐⭐\n' +
        '     📄 React ⭐⭐\n' +
        '     📄 TypeScript ⭐⭐\n' +
        '     📄 MySQL ⭐⭐⭐\n' +
        '     📄 Django ⭐⭐\n' +
        '     📄 Docker ⭐⭐\n' +
        '     📄 Git ⭐⭐⭐\n' +
        '  📁 Documents\n' +
        '     📄 Resume.pdf</div>' +
      '</div>';
    return wrap;
  }

  // ===== Browser — TV Channel Style =====
  function browserBody() {
    var wrap = document.createElement("div");
    wrap.className = "app-section";

    var channels = [
      { name: "📺 天气频道", content: '<p class="app-sub">☀️ 今日天气：' + window.seasonLabel(window.getSeason()) + '季，阳光明媚，适合写代码。</p><p class="app-sub">🌡️ CPU温度：正常</p><p class="app-sub">💡 建议：多喝水，少熬夜。</p>' },
      { name: "📺 生活频道", content: '<p class="app-sub">🌐 GitHub 村长发来电报：</p><a class="action-btn mailbox-action" href="' + state.contact.github + '" target="_blank" rel="noreferrer">打开 GitHub 频道</a>' },
      { name: "📺 旅途频道", content: '<p class="app-sub">🔗 技术博客 & 项目演示</p><a class="action-btn mailbox-action" href="https://layayaa.github.io/ai-job-recommender/" target="_blank" rel="noreferrer">AI简历推荐 Demo</a>' }
    ];

    var channelIdx = 0;

    wrap.innerHTML =
      '<div class="app-card">' +
        '<p class="app-heading" id="tv-channel-name">' + channels[0].name + '</p>' +
        '<div style="display:flex;gap:8px;margin-bottom:10px;">' +
          '<button class="action-btn" id="tv-channel-prev">◀ 上一个</button>' +
          '<button class="action-btn" id="tv-channel-next">下一个 ▶</button>' +
        '</div>' +
        '<div class="browser-page" id="tv-channel-content">' + channels[0].content + '</div>' +
      '</div>';

    function updateChannel() {
      wrap.querySelector("#tv-channel-name").textContent = channels[channelIdx].name;
      wrap.querySelector("#tv-channel-content").innerHTML = channels[channelIdx].content;
    }

    wrap.querySelector("#tv-channel-prev").addEventListener("click", function () {
      channelIdx = (channelIdx - 1 + channels.length) % channels.length;
      updateChannel();
    });
    wrap.querySelector("#tv-channel-next").addEventListener("click", function () {
      channelIdx = (channelIdx + 1) % channels.length;
      updateChannel();
    });

    return wrap;
  }

  // ===== Contact — Mailbox Letters =====
  function contactBody() {
    var wrap = document.createElement("div");
    wrap.className = "mailbox-board";
    wrap.innerHTML =
      '<aside class="mailbox-stack" aria-label="村民来信">' +
        '<button class="mailbox-envelope active" data-letter="github">✉ 来自 GitHub 村长</button>' +
        '<button class="mailbox-envelope" data-letter="email">✉ 来自 邮箱驿站</button>' +
        '<button class="mailbox-envelope" data-letter="wechat">✉ 来自 微信旅馆</button>' +
      '</aside>' +
      '<section class="mailbox-reader" aria-live="polite"></section>';
    renderLetter(wrap, "github");
    return wrap;
  }

  function renderLetter(scope, key) {
    var reader = scope.querySelector(".mailbox-reader");
    if (!reader) return;
    var letters = {
      github: {
        from: "GitHub 村长",
        title: "仓库和代码都在这里",
        body: "你好，欢迎来到GitHub村！村长让我告诉你，可莹的仓库全天候开放参观。",
        action: '<a class="action-btn mailbox-action" href="' + state.contact.github + '" target="_blank" rel="noreferrer">打开 GitHub</a>'
      },
      email: {
        from: "邮箱驿站",
        title: "驿站有你的信件",
        body: "如果对可莹感兴趣，随时可以写信到 layaya123456@163.com",
        action: '<a class="action-btn mailbox-action" href="mailto:' + state.contact.email + '">' + state.contact.email + '</a>'
      },
      wechat: {
        from: "微信旅馆",
        title: "旅馆老板让我转告",
        body: "添加微信 __Laya 可以找到她。暗号：星露谷",
        action: '<span class="mailbox-code">' + state.contact.wechat + '</span>'
      }
    };
    var letter = letters[key] || letters.github;
    reader.innerHTML =
      '<article class="mailbox-letter-open">' +
        '<p class="project-kicker">from: ' + window.escapeHtml(letter.from) + '</p>' +
        '<h4>' + window.escapeHtml(letter.title) + '</h4>' +
        '<p>' + window.escapeHtml(letter.body) + '</p>' +
        '<div class="btn-row">' + letter.action + '</div>' +
      '</article>';
  }

  // ===== Skills — Stardew Level Panel =====
  function skillsBody() {
    var wrap = document.createElement("div");
    wrap.className = "skills-panel";
    wrap.innerHTML = '<p class="app-heading">⭐ 技能等级</p>';

    var skillColors = {
      "Java": "#ac3232", "Python": "#4a8cb0", "Vue 3": "#38b764",
      "React": "#5ba4cf", "TypeScript": "#3178c6", "MySQL": "#e08030",
      "Django": "#2d7d4f", "Docker": "#2496ed", "Git": "#f05030"
    };

    state.skills.forEach(function (sk) {
      var name = sk[0], stars = sk[1];
      var level = stars >= 5 ? 5 : stars >= 3 ? 3 : 1;
      var pct = (level / 5) * 100;
      var barColor = skillColors[name] || "#fbf236";
      var row = document.createElement("div");
      row.className = "skill-row";
      row.innerHTML =
        '<span class="skill-icon" style="background:' + barColor + ';"></span>' +
        '<span class="skill-name">' + name + '</span>' +
        '<div class="skill-bar"><span class="skill-bar-fill" style="width:' + pct + '%;background:' + barColor + ';"></span></div>' +
        '<span style="font-size:10px;color:#fbf236;">Lv.' + level + '</span>';
      wrap.appendChild(row);
    });
    return wrap;
  }

  // ===== Settings =====
  function settingsBody() {
    var wrap = document.createElement("div");
    wrap.className = "settings-grid";
    var s = window.getSeason();
    var theme = state.settings.theme || "farm";
    var soundOn = state.settings.sound || false;

    wrap.innerHTML =
      '<div class="settings-option">' +
        '<span>🌄 壁纸</span>' +
        '<div class="settings-choice">' +
          '<button class="active" data-wallpaper="farm">农场桌面</button>' +
        '</div>' +
      '</div>' +
      '<div class="settings-option">' +
        '<span>🎨 主题</span>' +
        '<div class="settings-choice">' +
          '<button class="' + (theme === "farm" ? "active" : "") + '" data-theme="farm">木质</button>' +
          '<button class="' + (theme === "stone" ? "active" : "") + '" data-theme="stone">石质</button>' +
        '</div>' +
      '</div>' +
      '<div class="settings-option">' +
        '<span>🔊 音效</span>' +
        '<div class="settings-choice">' +
          '<button class="' + (soundOn ? "" : "active") + '" data-sound="off">关闭</button>' +
          '<button class="' + (soundOn ? "active" : "") + '" data-sound="on">开启</button>' +
        '</div>' +
      '</div>' +
      '<div class="settings-option">' +
        '<span>📅 当前季节</span>' +
        '<span style="font-size:14px;">' + window.seasonEmoji(s) + ' ' + window.seasonLabel(s) + '季</span>' +
      '</div>';
    return wrap;
  }

  // ===== Recycle Bin =====
  function recycleBody() {
    var wrap = document.createElement("div");
    wrap.className = "recycle-list";
    wrap.innerHTML =
      '<p class="app-heading">🗑️ 垃圾桶</p>' +
      '<div class="recycle-item">📄 bad-code.py<br><small style="color:#888;"># 一段离谱的代码，永远不想再看到</small></div>' +
      '<div class="recycle-item">📄 old-resume-2019.doc<br><small style="color:#888;"># 早期简历——"精通Word"</small></div>' +
      '<div class="recycle-item">📄 bugs.txt<br><small style="color:#888;"># 修复过的bug列表，最后一条："this website"</small></div>' +
      '<button class="action-btn" id="empty-recycle">清空垃圾桶</button>' +
      '<p style="font-size:9px;color:#888;margin-top:4px;">⚠️ Linus 可能会不高兴...</p>';
    return wrap;
  }

  // ===== Shipping Bin =====
  function shippingBody() {
    var wrap = document.createElement("div");
    wrap.className = "app-section";
    wrap.innerHTML =
      '<div class="app-card" style="text-align:center;">' +
        '<p class="app-heading">📦 出货箱</p>' +
        '<p class="app-sub">你想投递什么？</p>' +
        '<div class="btn-row" style="justify-content:center;">' +
          '<button class="action-btn" data-url="' + state.contact.github + '">📄 我的简历 / 作品集</button>' +
          '<a class="action-btn mailbox-action" href="mailto:' + state.contact.email + '">💬 一段留言</a>' +
          '<button class="action-btn" data-url="' + state.contact.github + '">🌟 推荐信 (GitHub)</button>' +
        '</div>' +
        '<p style="font-size:9px;color:#888;margin-top:12px;">关闭窗口 = 出货箱盖子合上 📦</p>' +
      '</div>';

    // Shipping box close animation
    var win = wrap.closest(".window");
    if (win) {
      var closeBtn = win.querySelector(".close");
      if (closeBtn) {
        var origClose = closeBtn.onclick;
        closeBtn.addEventListener("click", function () {
          win.style.transition = "transform .2s steps(1)";
          win.style.transform = "scaleY(.3)";
          setTimeout(function () {
            win.style.transform = "";
          }, 250);
        });
      }
    }

    return wrap;
  }

  // ===== Window Dispatcher =====
  function openWindow(app) {
    // Play sound
    window.SoundManager && window.SoundManager.open();

    switch (app) {
      case "about":
        openAbout();
        return { id: "about", title: "📜 关于我" }; // NPC dialog, not a real window

      case "projects":
        return window.WindowManager.createWindow({ id: "projects", title: "📋 项目委托", icon: "📋", body: projectsBody(), width: 560, height: 500 });

      case "computer":
        return window.WindowManager.createWindow({ id: "computer", title: "💎 我的电脑", icon: "💎", body: computerBody(), width: 580, height: 480 });

      case "terminal":
        return window.WindowManager.createWindow({ id: "terminal", title: "💻 终端", icon: "💻", body: window.createTerminalBody(), width: 700, height: 480 });

      case "browser":
        return window.WindowManager.createWindow({ id: "browser", title: "🎣 电视", icon: "🎣", body: browserBody(), width: 520, height: 400 });

      case "contact":
        return window.WindowManager.createWindow({ id: "contact", title: "📫 信箱", icon: "📫", body: contactBody(), width: 560, height: 440 });

      case "settings":
        return window.WindowManager.createWindow({ id: "settings", title: "⚙️ 设置", icon: "⚙️", body: settingsBody(), width: 560, height: 340 });

      case "skills":
        return window.WindowManager.createWindow({ id: "skills", title: "⭐ 技能树", icon: "⭐", body: skillsBody(), width: 480, height: 420 });

      case "recycle":
        return window.WindowManager.createWindow({ id: "recycle", title: "🗑️ 垃圾桶", icon: "🗑️", body: recycleBody(), width: 480, height: 340 });

      case "shipping":
        return window.WindowManager.createWindow({ id: "shipping", title: "📦 出货箱", icon: "📦", body: shippingBody(), width: 480, height: 280 });

      default:
        return null;
    }
  }

  // ===== Event Delegation =====
  document.addEventListener("click", function (event) {
    var projectFile = event.target.closest("[data-project-file]");
    if (projectFile) {
      var parts = projectFile.dataset.projectFile.split(":");
      var projectBoard = projectFile.closest(".project-board");
      if (!projectBoard) return;
      projectBoard.querySelectorAll(".project-file").forEach(function (btn) {
        btn.classList.toggle("active", btn === projectFile);
      });
      renderProjectDetail(projectBoard, parts[0], parts[1]);
      return;
    }

    var letterButton = event.target.closest("[data-letter]");
    if (!letterButton) return;
    var mailbox = letterButton.closest(".mailbox-board");
    if (!mailbox) return;
    mailbox.querySelectorAll(".mailbox-envelope").forEach(function (btn) {
      btn.classList.toggle("active", btn === letterButton);
    });
    renderLetter(mailbox, letterButton.dataset.letter);
  });

  // Settings: sound toggle
  document.addEventListener("click", function (event) {
    var btn = event.target.closest("[data-sound]");
    if (!btn) return;
    var val = btn.dataset.sound === "on";
    window.SoundManager && window.SoundManager.setEnabled(val);
    btn.parentElement.querySelectorAll("button").forEach(function (b) {
      b.classList.toggle("active", b === btn);
    });
  });

  window.Apps = { openWindow: openWindow };
})();
