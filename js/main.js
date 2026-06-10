/* ===========================================
   MAIN — Entry point, loading sequence
   =========================================== */
document.addEventListener('DOMContentLoaded', () => {
    /* Loading bar */
    const loadingBar = document.querySelector('.loading-bar');
    const heroName = document.querySelector('.hero-name');

    /* Phase 1: Loading bar */
    gsap.to(loadingBar, {
        width: '100%',
        duration: 0.8,
        ease: 'power2.inOut',
        onComplete: () => {
            /* Phase 2: Name letter-by-letter entrance */
            gsap.fromTo('.hero-letter',
                { y: 24, opacity: 0 },
                {
                    y: 0, opacity: 1,
                    duration: 0.38,
                    stagger: 0.04,
                    ease: 'back.out(1.7)',
                }
            );

            /* Phase 3: Subtitle + location + scroll fade in */
            gsap.fromTo('.hero-subtitle, .hero-location, .hero-scroll',
                { opacity: 0, y: 10 },
                {
                    opacity: 1, y: 0,
                    duration: 0.4,
                    stagger: 0.1,
                    delay: 0.35,
                    ease: 'power2.out',
                }
            );

            /* Phase 4: Loading bar fade out */
            gsap.to(loadingBar, {
                opacity: 0,
                duration: 0.3,
                delay: 0.55,
                onComplete: () => loadingBar.remove(),
            });
        },
    });

    /* Init modules */
    new HeroCanvas();
    new CustomCursor();
    new Nav();
    initScrollAnimations();
    new TiltEffect();
    new ClipboardCopy();
    new MagneticButton();
    new ProjectModal();
    new ScreenshotLightbox();
    const siteInteractions = new SiteInteractions();

    /* Glitch effect — random interval 12-20s */
    function triggerGlitch() {
        siteInteractions.triggerGlitch();
        setTimeout(triggerGlitch, 12000 + Math.random() * 8000);
    }
    setTimeout(triggerGlitch, 15000);
});
