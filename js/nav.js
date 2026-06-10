/* ===========================================
   NAV — Dot navigation + theme toggle
   =========================================== */
class Nav {
    constructor() {
        this.dots = document.querySelectorAll('.nav-dot');
        this.sections = document.querySelectorAll('.section[id]');
        this.themeToggle = document.querySelector('.nav-theme-toggle');
        this.initTheme();
        this.initScrollSpy();
        this.initClicks();
    }

    initTheme() {
        const saved = localStorage.getItem('theme');
        if (saved) {
            document.documentElement.setAttribute('data-theme', saved);
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        }
        this.updateThemeIcon();
    }

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        this.updateThemeIcon();
    }

    updateThemeIcon() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        this.themeToggle.textContent = isDark ? '☀' : '☾';
    }

    initScrollSpy() {
        window.addEventListener('scroll', () => {
            let current = '';
            this.sections.forEach(section => {
                const top = section.getBoundingClientRect().top;
                if (top < window.innerHeight * 0.4) {
                    current = section.id;
                }
            });
            this.dots.forEach(dot => {
                dot.classList.toggle('active', dot.dataset.section === current);
            });
        }, { passive: true });
    }

    initClicks() {
        this.dots.forEach(dot => {
            dot.addEventListener('click', () => {
                const target = document.getElementById(dot.dataset.section);
                if (target && window.__lenis) {
                    window.__lenis.scrollTo(target, { offset: 0 });
                }
            });
        });

        this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }
}
