/* ===========================================
   TILT — 3D card tilt on hover (desktop only)
   =========================================== */
class TiltEffect {
    constructor() {
        if (window.matchMedia('(pointer: coarse)').matches) return;
        this.cards = document.querySelectorAll('.project-card');
        this.init();
    }

    init() {
        this.cards.forEach(card => {
            card.style.transformStyle = 'preserve-3d';
            card.style.perspective = '1000px';

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                card.style.transform = `rotateY(${x * 16}deg) rotateX(${-y * 16}deg)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'rotateY(0) rotateX(0)';
            });
        });
    }
}
