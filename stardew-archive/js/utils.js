window.PixelDesk = {
  zIndex: 20,
  windows: new Map(),
  activeId: null,
  affinity: 0,
  affinityLog: [],
  season: "spring",
  settings: {
    wallpaper: "seasonal",
    theme: "farm",
    sound: false,
  },
  projectsList: [
    {
      id: "material",
      title: "工程材料询价系统",
      summary: "集成数据导入、数据清洗、询价查询、供应商管理、价格分析等模块，以及AI增强功能（材料智能匹配、供应商智能推荐、价格趋势预测）的全栈系统。",
      stack: "React + TypeScript + Next.js / Django + MySQL + Redis / Pandas + Scikit-learn / Docker",
      role: "全栈独立开发，从需求分析、数据库设计、前后端实现到部署上线都自己完成。",
      highlight: "真实部署在企业服务器上，覆盖数据导入、清洗、询价、供应商管理、价格分析和 AI 增强能力。",
      reward: "全栈实战 + 企业级部署经验",
      difficulty: 3,
      demo: "http://8.219.223.217/",
      detailSegments: [
        "委托详情：「工程材料询价系统」",
        "技术栈：React + TypeScript + Next.js / Django + MySQL + Redis / Pandas + Scikit-learn / Docker + GitHub Actions",
        "我的角色：全栈独立开发，从需求分析、数据库设计、前后端实现到部署上线都自己完成。",
        "亮点：真实部署在企业服务器上，覆盖数据导入、清洗、询价、供应商管理、价格分析和 AI 增强能力。",
        "Demo链接：http://8.219.223.217/ （网站内可查看操作录屏，或申请实机体验）"
      ]
    },
    {
      id: "resume",
      title: "简历智能推荐系统",
      summary: "上传简历，AI智能分析并推荐匹配岗位。12个Docker容器编排运行，完整可演示的AI应用。",
      stack: "Python 3.12 + Dify 1.9.1 / MySQL + PostgreSQL + Redis + Weaviate / Docker + Nginx",
      role: "独立开发，从Dify工作流编排到Docker容器部署全流程独立完成。",
      highlight: "把简历解析、岗位匹配和语义检索串成一个完整可演示的 AI 应用。",
      reward: "AI应用开发 + 容器编排实战",
      difficulty: 3,
      demo: "https://layayaa.github.io/ai-job-recommender/",
      detailSegments: [
        "委托详情：「简历智能推荐系统」",
        "技术栈：Python 3.12 + Dify 1.9.1 / MySQL 8.0 + PostgreSQL 15 + Redis 6 + Weaviate 1.19 / Docker + Nginx（12个容器编排运行）",
        "我的角色：独立开发，从Dify工作流编排到Docker容器部署全流程独立完成。",
        "亮点：把简历解析、岗位匹配和语义检索串成一个完整可演示的 AI 应用。",
        "Demo链接：https://layayaa.github.io/ai-job-recommender/ （公开可访问，适合面试官快速体验）"
      ]
    }
  ],
  skills: [
    ["Java", 5], ["Python", 5], ["Vue 3", 5],
    ["React", 3], ["TypeScript", 3], ["MySQL", 5],
    ["Django", 3], ["Docker", 3], ["Git", 5]
  ],
  contact: {
    email: "layaya123456@163.com",
    wechat: "__Laya",
    github: "https://github.com/Layayaa",
  }
};

window.formatDate = function (d) {
  d = d || new Date();
  return d.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "-");
};

window.formatTime = function (d) {
  d = d || new Date();
  return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false });
};

window.escapeHtml = function (v) {
  return String(v).replace(/[&<>"']/g, function (ch) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
  });
};

window.getSeason = function (month) {
  var m = month == null ? new Date().getMonth() + 1 : month;
  if (m >= 3 && m <= 5) return "spring";
  if (m >= 6 && m <= 8) return "summer";
  if (m >= 9 && m <= 11) return "autumn";
  return "winter";
};

window.seasonLabel = function (s) {
  return { spring: "春", summer: "夏", autumn: "秋", winter: "冬" }[s] || "";
};

window.seasonEmoji = function (s) {
  return { spring: "🌸", summer: "☀️", autumn: "🍂", winter: "❄️" }[s] || "";
};

window.addAffinity = function (reason) {
  var state = window.PixelDesk;
  if (state.affinityLog.includes(reason)) return false;
  state.affinity += 1;
  state.affinityLog.push(reason);
  return true;
};

window.showAffinityToast = function (msg) {
  var desktop = document.getElementById("desktop");
  var existing = document.querySelector(".affinity-toast");
  if (existing) existing.remove();
  var toast = document.createElement("div");
  toast.className = "affinity-toast";
  toast.textContent = msg || ("❤️ +1  好感度 " + window.PixelDesk.affinity);
  desktop.appendChild(toast);
  setTimeout(function () { toast.remove(); }, 2800);
};
