(function () {
  var state = window.PixelDesk;

  var intro = [
    "输入 help 查看命令。",
    "欢迎来到 Laya 的终端。",
  ];

  function renderHelp() {
    return [
      "help          - 显示命令",
      "whoami        - 自我介绍",
      "ls            - 查看项目",
      "cat <name>    - 查看项目详情",
      "skills        - 查看技能等级",
      "contact       - 联系方式",
      "weather       - 查看天气",
      "neofetch      - 系统信息",
      "sudo hire-me  - 彩蛋",
      "clear         - 清屏",
      "exit          - 关闭终端",
    ].join("\n");
  }

  function renderSkills() {
    return state.skills.map(function (sk) {
      var level = sk[1] >= 5 ? 5 : sk[1] >= 3 ? 3 : 1;
      return sk[0].padEnd(12) + " Lv." + level + " " + "█".repeat(level) + "░".repeat(5 - level);
    }).join("\n");
  }

  function renderProjects() {
    return state.projectsList.map(function (p) {
      return "📄 " + p.title;
    }).join("\n");
  }

  function renderWhoami() {
    return [
      "Laya / 伍可莹",
      "一名懂产品的全栈工程师。",
      "从滑档到上头，从第一行代码到全栈部署。",
    ].join("\n");
  }

  function renderNeofetch() {
    return [
      "      .-^^^^^-.      ",
      "     /  O   O  \\     ",
      "    |    ◡    |    ",
      "     \\  `---'  /     ",
      "      `-------'      ",
      "  ─────────────────",
      "  用户: Laya",
      "  系统: Stardew Desk OS v1.0",
      "  主机: 鹈鹕镇电脑",
      "  季节: " + window.seasonLabel(window.getSeason()) + "季 " + window.seasonEmoji(window.getSeason()),
      "  好感度: " + "❤️".repeat(Math.min(state.affinity, 5)) + " (" + state.affinity + "/5)",
      "  金币: " + (state.affinity * 100 + 500) + "g",
      "  运行时间: 从滑档到现在，一直在跑。",
    ].join("\n");
  }

  function renderWeather() {
    var s = window.getSeason();
    var map = {
      spring: "🌸 Spring · Sunny · Perfect day for coding!",
      summer: "☀️ Summer · Bright · Great day for optimizing!",
      autumn: "🍂 Autumn · Crisp · Ideal for code review!",
      winter: "❄️ Winter · Snowy · Perfect for learning new skills!",
    };
    return map[s] || "天气未知。";
  }

  function commandOutput(input) {
    var value = input.trim();
    var parts = value.split(/\s+/);
    var cmd = parts[0];
    var arg = parts.slice(1).join(" ");
    switch (cmd.toLowerCase()) {
      case "help": return renderHelp();
      case "whoami": return renderWhoami();
      case "ls": return renderProjects();
      case "skills": return renderSkills();
      case "contact":
        return "GitHub: " + state.contact.github + "\n邮箱: " + state.contact.email + "\n微信: " + state.contact.wechat;
      case "neofetch": return renderNeofetch();
      case "weather": return renderWeather();
      case "cat":
        var proj = state.projectsList.find(function (p) {
          return p.id === arg || p.title.includes(arg);
        });
        if (proj) {
          return proj.title + "\n\n" + proj.summary + "\n\n技术栈: " + proj.stack + "\n\nDemo: " + (proj.demo || "暂无");
        }
        return "未知项目。试试: cat material 或 cat resume";
      case "sudo":
        if (/hire-me/i.test(arg)) {
          return [
            "[sudo] ACCESS GRANTED ✦",
            "",
            "你输入了 sudo hire-me，说明两件事：",
            "一，你懂终端。二，你对我有点兴趣。",
            "",
            "那我也直说——",
            "我选专业是滑档滑进来的，但我留下是自己选的。",
            "我踩过的bug能写一份报告，但我每个都解了。",
            "我的项目不是demo，是真的有人在用的。",
            "",
            "所以如果你要找的人是：",
            "→ 不只会写代码，还会想问题的人",
            "→ 不只会搭项目，还能把项目跑起来的人",
            "→ 不只会用框架，还能把pymysql假装成MySQLdb的人（别问为什么）",
            "",
            "那就是我。",
            "",
            "信箱就在桌面上，双击一下，我们聊聊？📫",
          ].join("\n");
        }
        return "权限不足。市长还没有批准。";
      case "clear":
        return "__CLEAR__";
      case "exit":
        return "__EXIT__";
      default:
        return value ? "未知命令: " + value + "  — 输入 help 查看可用命令" : "";
    }
  }

  function createTerminalBody() {
    var wrap = document.createElement("div");
    wrap.className = "terminal";

    var output = document.createElement("div");
    output.className = "terminal-output";
    wrap.appendChild(output);

    var history = document.createElement("div");
    history.className = "terminal-block";
    output.appendChild(history);

    intro.forEach(function (line) {
      var div = document.createElement("div");
      div.textContent = line;
      history.appendChild(div);
    });

    var inputRow = document.createElement("div");
    inputRow.className = "terminal-line";
    inputRow.innerHTML = '<span class="terminal-prompt">C:\\&gt;</span>';
    var input = document.createElement("input");
    input.className = "terminal-input";
    input.autocomplete = "off";
    input.spellcheck = false;
    inputRow.appendChild(input);
    output.appendChild(inputRow);
    var cursor = document.createElement("span");
    cursor.className = "terminal-cursor";
    inputRow.appendChild(cursor);

    function appendLine(text) {
      var div = document.createElement("div");
      div.textContent = text;
      output.insertBefore(div, inputRow);
    }

    input.addEventListener("keydown", function (event) {
      if (event.key !== "Enter") return;
      var value = input.value;
      appendLine("C:\\> " + value);
      var result = commandOutput(value);
      if (result === "__CLEAR__") {
        output.innerHTML = "";
        output.appendChild(inputRow);
      } else if (result === "__EXIT__") {
        window.WindowManager.closeWindow("terminal");
      } else if (result) {
        result.split("\n").forEach(function (line) { appendLine(line); });
      }
      input.value = "";
      output.scrollTop = output.scrollHeight;
    });

    setTimeout(function () { input.focus(); }, 0);
    return wrap;
  }

  window.createTerminalBody = createTerminalBody;
})();
