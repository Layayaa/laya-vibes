/* ===========================================
   SCROLL ANIMATIONS — GSAP ScrollTrigger
   =========================================== */
function initScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    /* About section — text paragraphs fade in */
    document.querySelectorAll('.about-text p').forEach((p, i) => {
        gsap.fromTo(p,
            { opacity: 0, y: 24 },
            {
                opacity: 1, y: 0,
                duration: 0.6,
                delay: i * 0.15,
                ease: 'power2.out',
                scrollTrigger: { trigger: '.about-grid', start: 'top 70%', toggleActions: 'play none none none' },
            }
        );
    });

    /* About avatar — assemble animation */
    gsap.fromTo('.about-avatar',
        { opacity: 0, scale: 0.8 },
        {
            opacity: 1, scale: 1,
            duration: 0.8,
            ease: 'back.out(1.4)',
            scrollTrigger: { trigger: '.about-grid', start: 'top 70%', toggleActions: 'play none none none' },
        }
    );

    /* Project cards — staggered slide-up */
    gsap.fromTo('.project-card',
        { opacity: 0, y: 30 },
        {
            opacity: 1, y: 0,
            duration: 0.6,
            stagger: 0.15,
            ease: 'power2.out',
            scrollTrigger: { trigger: '.projects-grid', start: 'top 75%', toggleActions: 'play none none none' },
        }
    );

    /* Skills — tag explosion */
    gsap.fromTo('.skill-tag',
        { opacity: 0, scale: 0, x: 0, y: 0 },
        {
            opacity: 1, scale: 1,
            duration: 0.5,
            stagger: 0.03,
            ease: 'back.out(2)',
            scrollTrigger: { trigger: '.skills-groups', start: 'top 75%', toggleActions: 'play none none none' },
        }
    );

    /* Contact — title bounce + methods fade */
    gsap.fromTo('.contact-title',
        { opacity: 0, y: 40, scale: 0.9 },
        {
            opacity: 1, y: 0, scale: 1,
            duration: 0.7,
            ease: 'back.out(1.7)',
            scrollTrigger: { trigger: '.contact', start: 'top 70%', toggleActions: 'play none none none' },
        }
    );

    gsap.fromTo('.contact-method',
        { opacity: 0, y: 20 },
        {
            opacity: 1, y: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: { trigger: '.contact-methods', start: 'top 80%', toggleActions: 'play none none none' },
        }
    );
}
