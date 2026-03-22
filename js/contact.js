/**
 * ═══════════════════════════════════════
 * CONTACT FORM — Validation & Submit
 * ═══════════════════════════════════════
 */

const ContactForm = (() => {
    'use strict';

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function init() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        const submitBtn = form.querySelector('.contact-form__submit');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = form.querySelector('#name').value.trim();
            const email = form.querySelector('#email').value.trim();
            const message = form.querySelector('#message').value.trim();

            // Basic validation
            if (!name || !email || !message) return;
            if (!validateEmail(email)) {
                form.querySelector('#email').focus();
                return;
            }

            // Show loading state
            submitBtn.classList.add('is-loading');

            // Simulate sending (replace with actual API endpoint)
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Success feedback
            submitBtn.classList.remove('is-loading');
            submitBtn.style.background = 'var(--c-gold)';
            submitBtn.style.color = 'var(--c-bg)';
            submitBtn.style.borderColor = 'var(--c-gold)';

            const textEl = submitBtn.querySelector('.contact-form__submit-text');
            textEl.textContent = 'Mensagem enviada!';

            // Reset after 3 seconds
            setTimeout(() => {
                textEl.textContent = 'Enviar mensagem';
                submitBtn.style.background = '';
                submitBtn.style.color = '';
                submitBtn.style.borderColor = '';
                form.reset();
            }, 3000);
        });
    }

    return { init };
})();
