/* ===========================================
   HERO CANVAS — Y2K floating geometric shapes
   =========================================== */
class HeroCanvas {
    constructor() {
        this.canvas = document.getElementById('heroCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.shapes = [];
        this.mouse = { x: -999, y: -999 };
        this.isVisible = true;
        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        document.addEventListener('visibilitychange', () => {
            this.isVisible = !document.hidden;
            if (this.isVisible) this.animate();
        });

        this.createShapes();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createShapes() {
        const colors = [
            'rgba(255,45,111,0.15)',
            'rgba(0,212,255,0.12)',
            'rgba(205,255,0,0.1)',
            'rgba(255,45,111,0.18)',
            'rgba(0,212,255,0.15)',
        ];

        this.shapes = [];
        for (let i = 0; i < 10; i++) {
            const type = ['circle', 'triangle', 'rect'][Math.floor(Math.random() * 3)];
            this.shapes.push({
                type,
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                ox: 0, oy: 0, // origin for return
                size: 20 + Math.random() * 60,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.003,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                color: colors[Math.floor(Math.random() * colors.length)],
                opacity: 0.08 + Math.random() * 0.12,
            });
        }
    }

    animate() {
        if (!this.isVisible) return;
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.clearRect(0, 0, w, h);

        // Draw connecting lines between nearby shapes
        for (let i = 0; i < this.shapes.length; i++) {
            for (let j = i + 1; j < this.shapes.length; j++) {
                const a = this.shapes[i];
                const b = this.shapes[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 300) {
                    const alpha = (1 - dist / 300) * 0.06;
                    ctx.strokeStyle = `rgba(0,212,255,${alpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }
        }

        // Draw & update shapes
        this.shapes.forEach(s => {
            // Mouse repulsion
            const mx = s.x - this.mouse.x;
            const my = s.y - this.mouse.y;
            const md = Math.sqrt(mx * mx + my * my);
            if (md < 120 && md > 0) {
                const force = (120 - md) / 120 * 3;
                s.x += (mx / md) * force;
                s.y += (my / md) * force;
            } else {
                // lerp back to drift path
                s.x += s.vx;
                s.y += s.vy;
            }

            // Wrap around
            if (s.x < -80) s.x = w + 80;
            if (s.x > w + 80) s.x = -80;
            if (s.y < -80) s.y = h + 80;
            if (s.y > h + 80) s.y = -80;

            s.rotation += s.rotSpeed;

            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(s.rotation);
            ctx.globalAlpha = s.opacity;

            if (s.type === 'circle') {
                ctx.strokeStyle = s.color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, s.size / 2, 0, Math.PI * 2);
                ctx.stroke();
            } else if (s.type === 'triangle') {
                const sz = s.size / 2;
                ctx.strokeStyle = s.color;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(0, -sz);
                ctx.lineTo(sz * 0.87, sz * 0.5);
                ctx.lineTo(-sz * 0.87, sz * 0.5);
                ctx.closePath();
                ctx.stroke();
            } else if (s.type === 'rect') {
                ctx.strokeStyle = s.color;
                ctx.lineWidth = 1.5;
                ctx.strokeRect(-s.size / 2, -s.size / 2, s.size, s.size);
            }

            ctx.restore();
        });

        requestAnimationFrame(() => this.animate());
    }
}
