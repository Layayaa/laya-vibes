/* ===========================================
   MODAL — Project detail modal
   =========================================== */
const projectData = [
    {
        index: "case 01",
        title: "工程材料询价系统",
        summary: "企业内部历史询价复用系统，帮助工程师更快检索历史报价、复用上传资料，并给管理侧提供统计视角。",
        tags: ["React", "TypeScript", "Django", "MySQL", "Docker"],
        link: "http://8.219.223.217/",
        background: "这个项目面向企业内部工程材料询价场景。核心问题是历史报价散落、检索成本高、重复询价多，所以重点放在历史数据复用和查询效率上。",
        role: ["梳理询价、检索、上传、统计和用户管理流程", "实现前端主要页面与交互状态", "配合后端数据结构完成查询和筛选逻辑"],
        features: ["智能查询与条件筛选", "历史文件上传和复用", "统计分析与用户管理", "Docker 部署"],
        highlight: "我在这个项目里更多承担了“把业务讲清楚再做出来”的角色：先拆流程和边界，再把它变成可操作页面。",
        images: [
            "项目截图/微信图片_20260604105241_752_152.png",
            "项目截图/微信图片_20260604105241_753_152.png",
            "项目截图/微信图片_20260604105241_754_152.png"
        ],
        imageAlts: ["询价系统智能查询界面", "询价系统条件筛选界面", "询价系统统计分析界面"]
    },
    {
        index: "case 02",
        title: "AI 实习推荐系统",
        summary: "围绕简历分析和岗位推荐做的 AI 应用，把上传、解析、技能标签和推荐结果串成一条完整流程。",
        tags: ["Python", "Dify", "Weaviate", "Docker"],
        link: "https://layayaa.github.io/ai-job-recommender/",
        background: "这个项目关注求职者从简历到岗位匹配的过程，重点不是单次问答，而是让 AI 分析结果能转化成可查看、可比较的推荐结果。",
        role: ["设计简历上传、技能提取和岗位推荐流程", "搭建 Dify 工作流和向量检索相关逻辑", "整理推荐结果展示方式，让输出更可解释"],
        features: ["简历上传与分析", "技能标签生成", "岗位检索和推荐", "推荐结果展示"],
        highlight: "这个项目展示的是我把 AI 工具接进业务流程的能力：让 AI 成为流程里的一个环节，而不是独立的演示窗口。",
        images: [
            "项目截图/微信图片_20260604110348_755_152.png",
            "项目截图/微信图片_20260604110348_756_152.png",
            "项目截图/微信图片_20260604110348_757_152.png"
        ],
        imageAlts: ["AI 实习推荐系统简历分析界面", "AI 实习推荐系统岗位推荐界面", "AI 实习推荐系统搜索结果界面"]
    },
    {
        index: "case 03",
        title: "旌灵云仓小助手",
        summary: "面向德阳 OPC 社区的微信小程序，提供会议空间预约辅助、活动信息浏览、通知提醒与反馈提交等服务，帮助用户更高效地管理预约安排、获取社区动态，并便捷提交项目交流材料。",
        tags: ["微信小程序", "JavaScript", "云开发", "CloudBase", "云函数", "云数据库", "预约管理", "活动管理", "通知公告", "用户反馈"],
        link: "assets/jingling-cloud-qr.jpg",
        linkLabel: "查看二维码",
        background: "这个小程序服务于德阳 OPC 社区，围绕会议空间预约、活动信息传达和用户反馈收集等日常协作场景，把分散的信息入口整合到微信小程序里。",
        role: ["梳理预约辅助、活动查看、通知提醒和反馈提交流程", "搭建小程序页面结构与核心交互", "使用云开发能力组织云函数、云数据库和业务数据流转"],
        features: ["会议空间预约辅助", "活动信息浏览", "通知公告与提醒", "个人反馈提交", "项目交流材料邮箱提交"],
        highlight: "这个项目更偏向真实社区服务场景，我重点关注的是让用户能快速找到入口、完成预约相关操作，并把反馈和交流材料顺畅提交出去。",
        images: [
            "assets/jingling-home.jpg",
            "assets/jingling-booking.jpg",
            "assets/jingling-profile.jpg",
            "assets/jingling-activities.jpg"
        ],
        imageAlts: ["旌灵云仓小助手首页工作台", "旌灵云仓小助手预约办理界面", "旌灵云仓小助手我的预约界面", "旌灵云仓小助手活动列表界面"]
    }
];

class ProjectModal {
    constructor() {
        this.overlay = document.getElementById('modalOverlay');
        if (!this.overlay) return;
        this.activeProject = null;
        this.activeImageIndex = 0;
        this.init();
    }

    init() {
        /* Card clicks */
        document.querySelectorAll('.project-card').forEach((card, i) => {
            card.addEventListener('click', (event) => {
                if (event.target.closest('.project-card-visual')) return;
                this.open(i);
            });
        });

        /* Close button */
        this.overlay.querySelector('.modal-close').addEventListener('click', () => this.close());

        /* Click outside content to close */
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });

        /* ESC key */
        document.addEventListener('keydown', (e) => {
            if (!this.overlay.classList.contains('open')) return;
            if (e.key === 'Escape') this.close();
            if (e.key === 'ArrowLeft') this.shiftImage(-1);
            if (e.key === 'ArrowRight') this.shiftImage(1);
        });
    }

    open(index) {
        const project = projectData[index];
        if (!project) return;
        this.activeProject = project;
        this.activeImageIndex = 0;

        this.overlay.querySelector('.modal-index').textContent = project.index;
        this.overlay.querySelector('.modal-title').textContent = project.title;
        this.overlay.querySelector('.modal-summary').textContent = project.summary;
        this.overlay.querySelector('.modal-background').textContent = project.background;
        this.overlay.querySelector('.modal-highlight').textContent = project.highlight;

        this.renderList('.modal-role', project.role);
        this.renderList('.modal-features', project.features);

        const visuals = this.overlay.querySelector('.modal-visuals');
        visuals.innerHTML = `
            <button class="modal-carousel-btn modal-carousel-prev" type="button" aria-label="上一张截图">&lsaquo;</button>
            <div class="modal-carousel-frame">
                <img class="modal-carousel-image" src="" alt="">
            </div>
            <button class="modal-carousel-btn modal-carousel-next" type="button" aria-label="下一张截图">&rsaquo;</button>
            <p class="modal-carousel-count" aria-live="polite"></p>
        `;
        visuals.querySelector('.modal-carousel-prev').addEventListener('click', () => this.shiftImage(-1));
        visuals.querySelector('.modal-carousel-next').addEventListener('click', () => this.shiftImage(1));
        this.renderCarouselImage();

        const tagsContainer = this.overlay.querySelector('.modal-tags');
        tagsContainer.innerHTML = project.tags.map(t =>
            `<span class="project-card-tag">${t}</span>`
        ).join('');

        const link = this.overlay.querySelector('.modal-link');
        link.href = project.link;
        link.textContent = project.linkLabel || 'Open Project \u2192';
        link.target = '_blank';
        link.rel = 'noopener';

        this.overlay.classList.add('open');
        this.overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.overlay.classList.remove('open');
        this.overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        this.activeProject = null;
    }

    shiftImage(direction) {
        const project = this.activeProject;
        if (!project || project.images.length < 2) return;
        this.activeImageIndex = (this.activeImageIndex + direction + project.images.length) % project.images.length;
        this.renderCarouselImage();
    }

    renderCarouselImage() {
        const project = this.activeProject;
        if (!project) return;

        const image = this.overlay.querySelector('.modal-carousel-image');
        const count = this.overlay.querySelector('.modal-carousel-count');
        const previous = this.overlay.querySelector('.modal-carousel-prev');
        const next = this.overlay.querySelector('.modal-carousel-next');
        const total = project.images.length;
        const current = this.activeImageIndex;

        image.src = project.images[current];
        image.alt = project.imageAlts[current] || project.title;
        count.textContent = `${current + 1} / ${total}`;
        previous.disabled = total < 2;
        next.disabled = total < 2;
    }

    renderList(selector, items) {
        const list = this.overlay.querySelector(selector);
        list.innerHTML = items.map((item) => `<li>${item}</li>`).join('');
    }
}

class ScreenshotLightbox {
    constructor() {
        this.lightbox = document.getElementById('screenshotLightbox');
        if (!this.lightbox) return;
        this.image = this.lightbox.querySelector('.screenshot-lightbox-img');
        this.closeButton = this.lightbox.querySelector('.screenshot-lightbox-close');
        this.init();
    }

    init() {
        document.querySelectorAll('.project-card-visual img').forEach((image) => {
            image.setAttribute('tabindex', '0');
            image.setAttribute('role', 'button');
            image.setAttribute('aria-label', `查看截图：${image.alt}`);

            image.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    event.stopPropagation();
                    this.open(image);
                }
            });
        });

        document.addEventListener('click', (event) => {
            const image = event.target.closest('.project-card-visual img');
            if (!image) return;
            event.preventDefault();
            event.stopPropagation();
            this.open(image);
        }, true);

        this.closeButton.addEventListener('click', () => this.close());

        this.lightbox.addEventListener('click', (event) => {
            if (event.target === this.lightbox) this.close();
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.lightbox.classList.contains('open')) this.close();
        });
    }

    open(sourceImage) {
        this.image.src = sourceImage.currentSrc || sourceImage.src;
        this.image.alt = sourceImage.alt;
        this.lightbox.classList.add('open');
        this.lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.lightbox.classList.remove('open');
        this.lightbox.setAttribute('aria-hidden', 'true');
        this.image.src = '';
        document.body.style.overflow = '';
    }
}
