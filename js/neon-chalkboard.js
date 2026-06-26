(() => {
    const ready = (fn) => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn, { once: true });
        } else {
            fn();
        }
    };

    ready(() => {
        const cursor = document.querySelector('.neon-cursor');
        const cursorDot = document.querySelector('.neon-cursor-dot');
        const cursorRing = document.querySelector('.neon-cursor-ring');

        if (cursor && cursorDot && cursorRing && window.matchMedia('(pointer: fine)').matches) {
            let mouseX = window.innerWidth / 2;
            let mouseY = window.innerHeight / 2;
            let ringX = mouseX;
            let ringY = mouseY;

            window.addEventListener('pointermove', (event) => {
                mouseX = event.clientX;
                mouseY = event.clientY;
                cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
            }, { passive: true });

            const tickCursor = () => {
                ringX += (mouseX - ringX) * 0.22;
                ringY += (mouseY - ringY) * 0.22;
                cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
                requestAnimationFrame(tickCursor);
            };
            tickCursor();

            document.querySelectorAll('a, button, .case-board, .repo-card, .skill-stickers span, .contact-card').forEach((target) => {
                target.addEventListener('pointerenter', () => cursor.classList.add('is-hovering'));
                target.addEventListener('pointerleave', () => cursor.classList.remove('is-hovering'));
            });
        }

        const skillTags = document.querySelectorAll('.skill-stickers span');
        skillTags.forEach((tag, index) => {
            const rotate = [-3, -1, 2, 1, -2, 3][index % 6];
            tag.style.setProperty('--r', `${rotate}deg`);
        });

        document.querySelectorAll('[data-evidence-slider]').forEach((slider) => {
            const track = slider.querySelector('.evidence-track');
            const previousButton = slider.querySelector('.evidence-prev');
            const nextButton = slider.querySelector('.evidence-next');
            if (!track || !previousButton || !nextButton) return;

            const updateButtons = () => {
                const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth - 2);
                previousButton.disabled = track.scrollLeft <= 2;
                nextButton.disabled = track.scrollLeft >= maxScroll;
            };

            const moveSlide = (direction) => {
                track.scrollBy({
                    left: direction * track.clientWidth,
                    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
                });
            };

            previousButton.addEventListener('click', () => moveSlide(-1));
            nextButton.addEventListener('click', () => moveSlide(1));
            track.addEventListener('scroll', updateButtons, { passive: true });
            window.addEventListener('resize', updateButtons);
            updateButtons();
        });

        const cardDesk = document.querySelector('.draw-grid');
        const drawCards = Array.from(document.querySelectorAll('.draw-card'));
        const shuffleStarsButton = document.querySelector('[data-shuffle-stars]');
        const drawAllButton = document.querySelector('[data-draw-all]');
        const resetStarsButton = document.querySelector('[data-reset-stars]');
        const starCount = document.querySelector('[data-star-count]');
        let maxCardZ = 100;
        let maxPinnedZ = 600;

        const updateStarCount = () => {
            if (!starCount) return;
            const revealed = drawCards.filter((card) => card.classList.contains('is-revealed')).length;
            starCount.textContent = `已翻开 ${revealed} / ${drawCards.length}`;
        };

        const setCardRevealed = (card, revealed) => {
            card.classList.toggle('is-revealed', revealed);
            card.querySelector('.repo-card-inner')?.setAttribute('aria-pressed', String(revealed));
            if (revealed && !card.classList.contains('is-pinned')) {
                maxCardZ += 1;
                card.style.zIndex = String(maxCardZ);
            }
            updateStarCount();
        };

        const setCardPinned = (card, pinned) => {
            card.classList.toggle('is-pinned', pinned);
            card.querySelector('.pin-card')?.setAttribute('aria-pressed', String(pinned));
            if (pinned) {
                setCardRevealed(card, true);
                maxPinnedZ += 1;
                card.style.zIndex = String(maxPinnedZ);
            } else {
                maxCardZ += 1;
                card.style.zIndex = String(maxCardZ);
            }
        };

        const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

        const applyCardTransform = (card) => {
            const x = Number(card.dataset.x || 0);
            const y = Number(card.dataset.y || 0);
            const rotation = Number(card.dataset.rotation || 0);
            card.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
        };

        const placeCards = (animate = false) => {
            if (!cardDesk || !drawCards.length) return;
            const deskRect = cardDesk.getBoundingClientRect();
            const cardWidth = drawCards[0].offsetWidth || 180;
            const cardHeight = drawCards[0].offsetHeight || 258;
            const maxX = Math.max(0, deskRect.width - cardWidth - 18);
            const maxY = Math.max(0, deskRect.height - cardHeight - 18);

            drawCards.forEach((card, index) => {
                if (animate && card.classList.contains('is-pinned')) return;
                const seedX = (index * 83) % Math.max(1, maxX);
                const row = Math.floor(index / 5);
                const jitterX = ((index * 37) % 76) - 38;
                const jitterY = ((index * 29) % 52) - 26;
                const x = clamp(18 + seedX + jitterX, 10, maxX);
                const y = clamp(18 + row * 92 + jitterY, 10, maxY);
                const rotation = ((index * 17) % 24) - 12;
                card.dataset.x = String(x);
                card.dataset.y = String(y);
                card.dataset.rotation = String(rotation);
                if (!card.classList.contains('is-pinned')) {
                    card.style.zIndex = String(10 + index);
                }
                card.style.setProperty('--spread-rotate', `${rotation}deg`);

                if (animate && window.gsap) {
                    gsap.to(card, {
                        duration: 0.45,
                        ease: 'power3.out',
                        x,
                        y,
                        rotation
                    });
                } else {
                    applyCardTransform(card);
                }
            });
        };

        drawCards.forEach((card, index) => {
            card.style.setProperty('--deal-index', String(index));
            const button = card.querySelector('.repo-card-inner');
            const pin = card.querySelector('.pin-card');
            if (!button) return;
            button.setAttribute('aria-pressed', 'false');
            button.setAttribute('aria-label', `翻开第 ${index + 1} 张星标仓库卡片`);
            pin?.setAttribute('aria-pressed', 'false');
            pin?.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                setCardPinned(card, !card.classList.contains('is-pinned'));
            });

            let pointerId = null;
            let startX = 0;
            let startY = 0;
            let originX = 0;
            let originY = 0;
            let didDrag = false;

            button.addEventListener('pointerdown', (event) => {
                if (event.target.closest('a')) return;
                pointerId = event.pointerId;
                startX = event.clientX;
                startY = event.clientY;
                originX = Number(card.dataset.x || 0);
                originY = Number(card.dataset.y || 0);
                didDrag = false;
                if (card.classList.contains('is-pinned')) {
                    maxPinnedZ += 1;
                    card.style.zIndex = String(maxPinnedZ);
                } else {
                    maxCardZ += 1;
                    card.style.zIndex = String(maxCardZ);
                }
                card.classList.add('is-dragging');
                button.setPointerCapture?.(pointerId);
            });

            button.addEventListener('pointermove', (event) => {
                if (pointerId !== event.pointerId) return;
                const dx = event.clientX - startX;
                const dy = event.clientY - startY;
                if (Math.abs(dx) > 5 || Math.abs(dy) > 5) didDrag = true;
                if (!didDrag || !cardDesk) return;
                const deskRect = cardDesk.getBoundingClientRect();
                const maxX = Math.max(0, deskRect.width - card.offsetWidth - 10);
                const maxY = Math.max(0, deskRect.height - card.offsetHeight - 10);
                const x = clamp(originX + dx, 4, maxX);
                const y = clamp(originY + dy, 4, maxY);
                card.dataset.x = String(x);
                card.dataset.y = String(y);
                applyCardTransform(card);
            });

            const finishPointer = (event) => {
                if (pointerId !== event.pointerId) return;
                card.classList.remove('is-dragging');
                button.releasePointerCapture?.(pointerId);
                pointerId = null;
                if (!didDrag && !card.classList.contains('is-revealed')) {
                    setCardRevealed(card, true);
                }
            };

            button.addEventListener('pointerup', finishPointer);
            button.addEventListener('pointercancel', finishPointer);

            button.addEventListener('click', (event) => {
                if (event.target.closest('a')) return;
                if (didDrag) event.preventDefault();
            });

            button.addEventListener('keydown', (event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                if (event.target.closest('a, .pin-card')) return;
                event.preventDefault();
                if (!card.classList.contains('is-revealed')) {
                    setCardRevealed(card, true);
                }
            });
        });

        shuffleStarsButton?.addEventListener('click', () => {
            placeCards(true);
        });

        drawAllButton?.addEventListener('click', () => {
            drawCards.forEach((card, index) => {
                window.setTimeout(() => setCardRevealed(card, true), index * 90);
            });
        });

        resetStarsButton?.addEventListener('click', () => {
            drawCards.forEach((card, index) => {
                if (card.classList.contains('is-pinned')) return;
                window.setTimeout(() => setCardRevealed(card, false), index * 24);
            });
            window.setTimeout(() => placeCards(true), 220);
        });

        window.addEventListener('resize', () => placeCards(false));
        placeCards(false);
        updateStarCount();

        const pixelCompanion = document.querySelector('[data-pixel-companion]');
        const pixelStage = pixelCompanion?.querySelector('.pixel-stage');
        let pixelMoodTimer = null;

        const setPixelMood = (mood, duration = 900) => {
            if (!pixelCompanion) return;
            window.clearTimeout(pixelMoodTimer);
            pixelCompanion.classList.remove('is-looking', 'is-coding', 'is-waving');
            if (mood) pixelCompanion.classList.add(mood);
            pixelMoodTimer = window.setTimeout(() => {
                pixelCompanion.classList.remove('is-looking', 'is-coding', 'is-waving');
            }, duration);
        };

        pixelStage?.addEventListener('pointermove', (event) => {
            if (!window.matchMedia('(pointer: fine)').matches) return;
            const rect = pixelStage.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;
            pixelStage.classList.add('is-tracking');
            pixelStage.style.setProperty('--look-x', `${Math.round(x * 10)}px`);
            pixelStage.style.setProperty('--look-y', `${Math.round(y * 8)}px`);
            pixelStage.style.setProperty('--eye-x', `${Math.round(x * 3)}px`);
            pixelStage.style.setProperty('--eye-y', `${Math.round(y * 2)}px`);
        }, { passive: true });

        pixelStage?.addEventListener('pointerleave', () => {
            pixelStage.classList.remove('is-tracking');
            pixelStage.style.removeProperty('--look-x');
            pixelStage.style.removeProperty('--look-y');
            pixelStage.style.removeProperty('--eye-x');
            pixelStage.style.removeProperty('--eye-y');
        });

        pixelCompanion?.addEventListener('pointerenter', () => setPixelMood('is-waving', 1300));
        pixelCompanion?.addEventListener('click', () => setPixelMood('is-waving', 1300));

        document.querySelectorAll('[data-case]').forEach((caseCard) => {
            caseCard.addEventListener('pointerenter', () => setPixelMood('is-looking', 1600));
        });

        document.querySelectorAll('.skill-stickers span, .repo-card').forEach((workItem) => {
            workItem.addEventListener('pointerenter', () => setPixelMood('is-coding', 1300));
        });

        const cards = document.querySelectorAll('.case-board, .paper-card, .portrait-card, .pixel-companion-card, .chalk-card, .contact-card');
        cards.forEach((card) => {
            card.addEventListener('pointermove', (event) => {
                if (!window.matchMedia('(pointer: fine)').matches) return;
                const rect = card.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width - 0.5;
                const y = (event.clientY - rect.top) / rect.height - 0.5;
                card.style.transform = `translate(${x * 4}px, ${y * 4}px) rotate(${x * 1.2}deg)`;
            });

            card.addEventListener('pointerleave', () => {
                card.style.transform = '';
            });
        });

        if (!window.gsap) return;

        gsap.registerPlugin(window.ScrollTrigger);

        gsap.from('.hero-title span, .hero-title small', {
            y: 80,
            rotate: 8,
            opacity: 0,
            duration: 0.9,
            ease: 'back.out(1.7)',
            stagger: 0.08
        });

        gsap.from('.eyebrow, .hero-card, .hero-meta span', {
            y: 24,
            opacity: 0,
            duration: 0.65,
            ease: 'power3.out',
            stagger: 0.08,
            delay: 0.35
        });

        gsap.utils.toArray('.panel').forEach((panel) => {
            const elements = panel.querySelectorAll('.section-heading, .paper-card, .portrait-card, .pixel-companion-card, .mini-index, .case-board, .skill-stickers span, .contact-card');
            if (!elements.length) return;

            gsap.from(elements, {
                scrollTrigger: {
                    trigger: panel,
                    start: 'top 72%',
                    once: true
                },
                y: 42,
                opacity: 0,
                duration: 0.72,
                ease: 'power3.out',
                stagger: 0.06
            });
        });

        gsap.utils.toArray('.evidence-track img').forEach((image, index) => {
            gsap.from(image, {
                scrollTrigger: {
                    trigger: image,
                    start: 'top 82%',
                    once: true
                },
                scale: 0.92,
                opacity: 0,
                duration: 0.75,
                ease: 'power3.out',
                delay: index * 0.04
            });
        });
    });
})();
