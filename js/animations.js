/**
 * ═══════════════════════════════════════
 * SCROLL REVEAL ANIMATIONS
 * Uses IntersectionObserver for elements
 * with [data-reveal] attribute
 * ═══════════════════════════════════════
 */

const Animations = (() => {
    'use strict';

    function init() {
        const elements = document.querySelectorAll('[data-reveal]');
        if (elements.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (!entry.isIntersecting) return;

                // Stagger siblings for a cascading effect
                const siblings = entry.target.parentElement.querySelectorAll('[data-reveal]');
                const siblingIndex = Array.from(siblings).indexOf(entry.target);
                const delay = siblingIndex * 100;

                setTimeout(() => {
                    entry.target.classList.add('is-visible');
                }, delay);

                observer.unobserve(entry.target);
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -40px 0px',
        });

        elements.forEach(el => observer.observe(el));
    }

    return { init };
})();
