/**
 * ═══════════════════════════════════════
 * SCROLL REVEAL + PARALLAX ANIMATIONS
 * ═══════════════════════════════════════
 */

const Animations = (() => {
    'use strict';

    // ── Scroll reveal for [data-reveal] elements ──
    function initReveal() {
        const elements = document.querySelectorAll('[data-reveal]');
        if (elements.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                const siblings = entry.target.parentElement.querySelectorAll('[data-reveal]');
                const siblingIndex = Array.from(siblings).indexOf(entry.target);
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

    // ── Section-level fade for [data-reveal-section] ──
    function initSectionReveal() {
        const sections = document.querySelectorAll('[data-reveal-section]');
        if (sections.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.05,
        });

        sections.forEach(el => observer.observe(el));
    }

    // ── Hero parallax — image moves at 0.3x scroll speed ──
    function initParallax() {
        const heroImage = document.querySelector('.hero-image');
        if (!heroImage) return;

        // Disable on mobile for performance
        if (window.innerWidth < 768) return;

        let ticking = false;

        window.addEventListener('scroll', () => {
            if (ticking) return;
            ticking = true;

            requestAnimationFrame(() => {
                const scrolled = window.scrollY;
                if (scrolled < window.innerHeight * 1.5) {
                    heroImage.style.transform = `translateY(${scrolled * 0.3}px)`;
                }
                ticking = false;
            });
        }, { passive: true });
    }

    function init() {
        initReveal();
        initSectionReveal();
        initParallax();
    }

    return { init };
})();
