/* ===========================================
   INTERACTIONS — Ripples, keyboard eggs, terminal
   =========================================== */
class SiteInteractions {
    constructor() {
        this.heroName = document.querySelector('.hero-name');
        this.terminal = document.getElementById('terminalPanel');
        this.terminalBody = document.getElementById('terminalBody');
        this.terminalForm = document.getElementById('terminalForm');
        this.terminalInput = document.getElementById('terminalInput');
        this.konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
        this.konamiIndex = 0;
        this.lastParticleAt = 0;
        this.init();
    }

    init() {
        this.initProgress();
        this.initRipple();
        this.initParticles();
        this.initKeyboard();
        this.initTerminal();
        this.initAboutNotes();
        this.initSkillFilters();
        this.initHeroParallax();
    }

    initProgress() {
        const progress = document.querySelector('.scroll-progress');
        if (!progress) return;

        const update = () => {
            const scrollable = document.documentElement.scrollHeight - window.innerHeight;
            const ratio = scrollable <= 0 ? 0 : window.scrollY / scrollable;
            progress.style.width = `${Math.min(1, Math.max(0, ratio)) * 100}%`;
        };

        update();
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
    }

    initRipple() {
        document.addEventListener('click', (event) => {
            const blocked = event.target.closest('input, textarea, select, button, a, .terminal-panel');
            if (blocked) return;

            const ripple = document.createElement('span');
            ripple.className = 'click-ripple';
            ripple.style.left = `${event.clientX}px`;
            ripple.style.top = `${event.clientY}px`;
            ripple.style.borderColor = Math.random() > 0.5 ? 'var(--pink)' : 'var(--cyan)';
            document.body.appendChild(ripple);
            ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
        });
    }

    initParticles() {
        if (!window.matchMedia('(pointer: fine)').matches) return;

        document.addEventListener('pointermove', (event) => {
            const now = performance.now();
            if (now - this.lastParticleAt < 55) return;
            this.lastParticleAt = now;

            const particleCount = 1 + Math.floor(Math.random() * 2);
            for (let i = 0; i < particleCount; i += 1) {
                const particle = document.createElement('span');
                particle.className = 'cursor-particle';
                particle.style.left = `${event.clientX}px`;
                particle.style.top = `${event.clientY}px`;
                particle.style.background = Math.random() > 0.5 ? 'var(--pink)' : 'var(--cyan)';
                particle.style.setProperty('--dx', `${(Math.random() - 0.5) * 26}px`);
                particle.style.setProperty('--dy', `${(Math.random() - 0.5) * 26}px`);
                document.body.appendChild(particle);
                particle.addEventListener('animationend', () => particle.remove(), { once: true });
            }
        }, { passive: true });
    }

    initKeyboard() {
        document.addEventListener('keydown', (event) => {
            if (this.isTypingTarget(event.target)) return;

            this.handleKonami(event);

            const key = event.key.toLowerCase();
            if (key === 'l') {
                this.triggerGlitch();
            } else if (key === 'h') {
                this.scrollToHero();
            } else if (key === 'c') {
                this.toggleTheme();
            }
        });
    }

    handleKonami(event) {
        const expected = this.konami[this.konamiIndex];
        const pressed = event.key.length === 1 ? event.key.toLowerCase() : event.key;

        if (pressed === expected) {
            this.konamiIndex += 1;
            if (this.konamiIndex === this.konami.length) {
                this.konamiIndex = 0;
                this.triggerEasterEgg();
            }
            return;
        }

        this.konamiIndex = pressed === this.konami[0] ? 1 : 0;
    }

    triggerGlitch() {
        if (!this.heroName) return;
        this.heroName.classList.add('glitch');
        window.setTimeout(() => this.heroName.classList.remove('glitch'), 260);
    }

    scrollToHero() {
        const hero = document.getElementById('hero');
        if (!hero) return;
        if (window.__lenis) {
            window.__lenis.scrollTo(hero, { offset: 0 });
        } else {
            hero.scrollIntoView({ behavior: 'smooth' });
        }
    }

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);

        const button = document.querySelector('.nav-theme-toggle');
        if (button) button.textContent = next === 'dark' ? '☀' : '☾';
    }

    triggerEasterEgg() {
        document.body.classList.add('easter-flash');
        window.setTimeout(() => document.body.classList.remove('easter-flash'), 650);

        const toast = document.createElement('div');
        toast.className = 'easter-toast';
        toast.textContent = '你发现了彩蛋 🎮';
        document.body.appendChild(toast);
        toast.addEventListener('animationend', () => toast.remove(), { once: true });
    }

    initTerminal() {
        if (!this.terminal || !this.terminalForm || !this.terminalInput) return;

        this.heroName?.addEventListener('dblclick', () => this.openTerminal());
        this.terminal.querySelector('.terminal-close')?.addEventListener('click', () => this.closeTerminal());

        this.terminalForm.addEventListener('submit', (event) => {
            event.preventDefault();
            this.submitTerminalCommand();
        });

        this.terminalInput.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter') return;
            event.preventDefault();
            this.submitTerminalCommand();
        });
    }

    openTerminal() {
        this.terminal.classList.add('open');
        this.terminal.setAttribute('aria-hidden', 'false');
        this.terminalInput.focus();
    }

    closeTerminal() {
        this.terminal.classList.remove('open');
        this.terminal.setAttribute('aria-hidden', 'true');
    }

    submitTerminalCommand() {
        const command = this.terminalInput.value.trim();
        if (!command) return;
        this.terminalInput.value = '';
        this.runCommand(command);
    }

    runCommand(command) {
        this.appendLine(`> ${command}`, 'terminal-command');

        const normalized = command.toLowerCase();
        if (normalized === 'clear') {
            this.terminalBody.innerHTML = '';
            return;
        }

        const responses = {
            help: 'commands: help / whoami / projects / hire-me / clear',
            whoami: 'Laya: product-minded full-stack developer, AI tool explorer, requirement-document enthusiast.',
            projects: 'case 01: 工程材料询价系统 · case 02: AI 实习推荐系统',
            'hire-me': '方向：AI 开发 / 全栈工程师 / 产品相关。Email: layaya123456@163.com · WeChat: __Laya',
        };

        this.typeLine(responses[normalized] || `command not found: ${command}`, responses[normalized] ? '' : 'terminal-error');
    }

    initAboutNotes() {
        const words = document.querySelectorAll('.interactive-word[data-note]');
        if (!words.length) return;

        let activeNote = null;

        const closeNote = () => {
            if (!activeNote) return;
            activeNote.remove();
            activeNote = null;
            words.forEach((word) => word.classList.remove('active'));
        };

        words.forEach((word) => {
            word.setAttribute('tabindex', '0');
            word.setAttribute('role', 'button');
            word.setAttribute('aria-label', `${word.textContent}：点击查看说明`);

            const openNote = () => {
                const wasActive = word.classList.contains('active');
                closeNote();
                if (wasActive) return;

                word.classList.add('active');
                activeNote = document.createElement('span');
                activeNote.className = 'about-word-note';
                activeNote.textContent = word.dataset.note;
                word.appendChild(activeNote);
            };

            word.addEventListener('click', (event) => {
                event.stopPropagation();
                openNote();
            });

            word.addEventListener('keydown', (event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                openNote();
            });
        });

        document.addEventListener('click', closeNote);
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') closeNote();
        });
    }

    initSkillFilters() {
        const buttons = document.querySelectorAll('.skills-filter-btn');
        const tags = document.querySelectorAll('.skill-tag[data-skill-category]');
        const note = document.getElementById('skillsFilterNote');
        if (!buttons.length || !tags.length) return;

        const notes = {
            all: '一组能把需求、实现和表达串起来的工具。',
            tech: '技术能力负责把想法稳定地写成页面、接口、数据和部署。',
            product: '产品能力负责把模糊目标拆成流程、边界和可执行方案。',
            ai: 'AI 能力负责把工具、工作流和业务场景连起来。',
            expression: '表达能力负责把复杂事情讲清楚，让协作更顺。'
        };

        const applyFilter = (filter) => {
            buttons.forEach((button) => {
                const isActive = button.dataset.skillFilter === filter;
                button.classList.toggle('active', isActive);
                button.setAttribute('aria-pressed', String(isActive));
            });

            tags.forEach((tag) => {
                const categories = tag.dataset.skillCategory.split(' ');
                const matches = filter === 'all' || categories.includes(filter);
                tag.classList.toggle('dimmed', !matches);
                tag.classList.toggle('highlighted', matches && filter !== 'all');
            });

            if (note) note.textContent = notes[filter] || notes.all;
        };

        buttons.forEach((button) => {
            button.setAttribute('aria-pressed', String(button.classList.contains('active')));
            button.addEventListener('click', () => applyFilter(button.dataset.skillFilter));
        });
    }

    initHeroParallax() {
        const hero = document.querySelector('.hero');
        const nameplate = document.querySelector('.hero-nameplate');
        const stickers = document.querySelectorAll('.hero-sticker');
        if (!hero || !nameplate || !window.matchMedia('(pointer: fine)').matches) return;

        hero.addEventListener('pointermove', (event) => {
            const rect = hero.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;

            nameplate.style.setProperty('--hero-x', `${x * 14}px`);
            nameplate.style.setProperty('--hero-y', `${y * 12}px`);
            nameplate.style.setProperty('--hero-rotate', `${-0.6 + x * 1.4}deg`);

            stickers.forEach((sticker, index) => {
                const depth = index + 1;
                sticker.style.setProperty('--sticker-x', `${x * depth * 10}px`);
                sticker.style.setProperty('--sticker-y', `${y * depth * 8}px`);
            });
        }, { passive: true });

        hero.addEventListener('pointerleave', () => {
            nameplate.style.removeProperty('--hero-x');
            nameplate.style.removeProperty('--hero-y');
            nameplate.style.removeProperty('--hero-rotate');
            stickers.forEach((sticker) => {
                sticker.style.removeProperty('--sticker-x');
                sticker.style.removeProperty('--sticker-y');
            });
        });
    }

    appendLine(text, className = '') {
        const line = document.createElement('p');
        if (className) line.className = className;
        line.textContent = text;
        this.terminalBody.appendChild(line);
        this.terminalBody.scrollTop = this.terminalBody.scrollHeight;
        return line;
    }

    typeLine(text, className = '') {
        const line = this.appendLine('', className);
        let index = 0;
        const tick = () => {
            line.textContent = text.slice(0, index);
            index += 1;
            this.terminalBody.scrollTop = this.terminalBody.scrollHeight;
            if (index <= text.length) window.setTimeout(tick, 12);
        };
        tick();
    }

    isTypingTarget(target) {
        return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
    }
}
