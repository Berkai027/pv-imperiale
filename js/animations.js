/**
 * ═══════════════════════════════════════
 * SCROLL REVEAL + PARALLAX ANIMATIONS
 * ═══════════════════════════════════════
 */

const Animations = (() => {
    'use strict';

    // Feature detection
    const hasIO = 'IntersectionObserver' in window;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function initReveal() {
        const elements = document.querySelectorAll('[data-reveal]');
        if (elements.length === 0) return;

        // If no IO support or reduced motion, show everything immediately
        if (!hasIO || prefersReducedMotion) {
            elements.forEach(el => el.classList.add('is-visible'));
            return;
        }

        // Pre-cache sibling indices for performance
        const indexCache = new Map();
        elements.forEach(el => {
            const siblings = el.parentElement.querySelectorAll('[data-reveal]');
            indexCache.set(el, Array.from(siblings).indexOf(el));
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                const siblingIndex = indexCache.get(entry.target) || 0;
                const delay = siblingIndex * 100;

                setTimeout(() => {
                    entry.target.classList.add('is-visible');
                }, delay);

                observer.unobserve(entry.target);
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px',
        });

        elements.forEach(el => observer.observe(el));
    }

    function initSectionReveal() {
        const sections = document.querySelectorAll('[data-reveal-section]');
        if (sections.length === 0) return;

        if (!hasIO || prefersReducedMotion) {
            sections.forEach(el => el.classList.add('is-visible'));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.05 });

        sections.forEach(el => observer.observe(el));
    }

    function initParallax() {
        const heroImage = document.querySelector('.hero-image');
        if (!heroImage) return;

        // Disable for reduced motion or mobile
        if (prefersReducedMotion) return;
        const mq = window.matchMedia('(min-width: 768px)');
        if (!mq.matches) return;

        let ticking = false;

        function onScroll() {
            if (ticking) return;
            ticking = true;

            requestAnimationFrame(() => {
                const scrolled = window.scrollY;
                if (scrolled < window.innerHeight * 1.5) {
                    heroImage.style.transform = `translateY(${scrolled * 0.3}px)`;
                }
                ticking = false;
            });
        }

        window.addEventListener('scroll', onScroll, { passive: true });

        // Stop parallax if viewport resizes to mobile
        mq.addEventListener('change', (e) => {
            if (!e.matches) {
                window.removeEventListener('scroll', onScroll);
                heroImage.style.transform = '';
            } else {
                window.addEventListener('scroll', onScroll, { passive: true });
            }
        });
    }

    function init() {
        initReveal();
        initSectionReveal();
        initParallax();
    }

    return { init };
})();
