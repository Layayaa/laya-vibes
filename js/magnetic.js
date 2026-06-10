/* ===========================================
   MAGNETIC — Magnetic hover for contact button
   =========================================== */
class MagneticButton {
    constructor() {
        this.btn = document.querySelector('.contact-btn');
        if (!this.btn || window.matchMedia('(pointer: coarse)').matches) return;
        this.init();
    }

    init() {
        this.btn.addEventListener('mousemove', (e) => {
            const rect = this.btn.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = e.clientX - cx;
            const dy = e.clientY - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 80) {
                const force = (80 - dist) / 80 * 8;
                this.btn.style.transform = `translate(${(dx / dist) * force}px, ${(dy / dist) * force}px)`;
            }
        });

        this.btn.addEventListener('mouseleave', () => {
            this.btn.style.transform = 'translate(0, 0)';
        });
    }
}
