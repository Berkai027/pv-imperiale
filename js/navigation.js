/**
 * ═══════════════════════════════════════
 * NAVIGATION — Scroll & Mobile Menu
 * ═══════════════════════════════════════
 */

const Navigation = (() => {
    'use strict';

    const SCROLL_THRESHOLD = 80;

    function initScrollEffect() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;

        let ticking = false;

        window.addEventListener('scroll', () => {
            if (ticking) return;
            ticking = true;

            requestAnimationFrame(() => {
                navbar.classList.toggle('is-scrolled', window.scrollY > SCROLL_THRESHOLD);
                ticking = false;
            });
        }, { passive: true });
    }

    function initMobileMenu() {
        const toggle = document.getElementById('navToggle');
        const links = document.getElementById('navLinks');
        if (!toggle || !links) return;

        function closeMenu() {
            toggle.classList.remove('is-active');
            toggle.setAttribute('aria-expanded', 'false');
            links.classList.remove('is-open');
            document.body.style.overflow = '';
        }

        function openMenu() {
            toggle.classList.add('is-active');
            toggle.setAttribute('aria-expanded', 'true');
            links.classList.add('is-open');
            document.body.style.overflow = 'hidden';
        }

        toggle.addEventListener('click', () => {
            const isOpen = links.classList.contains('is-open');
            isOpen ? closeMenu() : openMenu();
        });

        // Close on link click
        links.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && links.classList.contains('is-open')) {
                closeMenu();
                toggle.focus();
            }
        });
    }

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#') return;

                const target = document.querySelector(href);
                if (!target) return;

                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

    function init() {
        initScrollEffect();
        initMobileMenu();
        initSmoothScroll();
    }

    return { init };
})();
