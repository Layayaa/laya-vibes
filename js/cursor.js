/* ===========================================
   CURSOR — Custom cursor with dot + ring
   =========================================== */
class CustomCursor {
    constructor() {
        if (window.matchMedia('(pointer: coarse)').matches) return;

        this.dot = document.createElement('div');
        this.dot.className = 'cursor-dot';
        this.ring = document.createElement('div');
        this.ring.className = 'cursor-ring';
        document.body.appendChild(this.dot);
        document.body.appendChild(this.ring);

        this.mouse = { x: -100, y: -100 };
        this.dotPos = { x: -100, y: -100 };
        this.ringPos = { x: -100, y: -100 };

        this.init();
    }

    init() {
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        const hoverTargets = 'a, button, .project-card, .contact-method, .skill-tag, .nav-dot, .nav-theme-toggle, [data-cursor]';

        document.querySelectorAll(hoverTargets).forEach(el => {
            el.addEventListener('mouseenter', () => {
                this.dot.classList.add('hidden');
                this.ring.classList.add('active');
            });
            el.addEventListener('mouseleave', () => {
                this.dot.classList.remove('hidden');
                this.ring.classList.remove('active');
            });
        });

        // Observe dynamically added elements
        const observer = new MutationObserver(() => {
            document.querySelectorAll(hoverTargets).forEach(el => {
                if (!el._cursorBound) {
                    el._cursorBound = true;
                    el.addEventListener('mouseenter', () => {
                        this.dot.classList.add('hidden');
                        this.ring.classList.add('active');
                    });
                    el.addEventListener('mouseleave', () => {
                        this.dot.classList.remove('hidden');
                        this.ring.classList.remove('active');
                    });
                }
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });

        this.animate();
    }

    animate() {
        const lerp = 0.15;
        this.dotPos.x += (this.mouse.x - this.dotPos.x) * lerp;
        this.dotPos.y += (this.mouse.y - this.dotPos.y) * lerp;
        this.ringPos.x += (this.mouse.x - this.ringPos.x) * lerp * 0.7;
        this.ringPos.y += (this.mouse.y - this.ringPos.y) * lerp * 0.7;

        this.dot.style.left = this.dotPos.x + 'px';
        this.dot.style.top = this.dotPos.y + 'px';
        this.ring.style.left = this.ringPos.x + 'px';
        this.ring.style.top = this.ringPos.y + 'px';

        requestAnimationFrame(() => this.animate());
    }
}
