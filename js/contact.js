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
        if (!submitBtn) return;

        const textEl = submitBtn.querySelector('.contact-form__submit-text');

        // Create aria-live region for screen reader announcements
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('role', 'status');
        liveRegion.className = 'sr-only';
        form.appendChild(liveRegion);

        function announce(msg) {
            liveRegion.textContent = msg;
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nameField = form.querySelector('#name');
            const emailField = form.querySelector('#email');
            const messageField = form.querySelector('#message');

            if (!nameField || !emailField || !messageField) return;

            const name = nameField.value.trim();
            const email = emailField.value.trim();
            const message = messageField.value.trim();

            if (!name || !email || !message) {
                announce('Please fill in all required fields.');
                if (!name) { nameField.focus(); return; }
                if (!email) { emailField.focus(); return; }
                messageField.focus();
                return;
            }

            if (!validateEmail(email)) {
                announce('Please enter a valid email address.');
                emailField.focus();
                return;
            }

            try {
                submitBtn.classList.add('is-loading');
                submitBtn.setAttribute('aria-disabled', 'true');

                // Simulate sending (replace with actual API endpoint)
                await new Promise(resolve => setTimeout(resolve, 1500));

                submitBtn.classList.remove('is-loading');
                submitBtn.removeAttribute('aria-disabled');
                submitBtn.style.background = 'var(--c-green)';
                submitBtn.style.color = '#fff';
                submitBtn.style.borderColor = 'var(--c-green)';

                if (textEl) textEl.textContent = 'Message sent!';
                announce('Your message has been sent successfully.');

                setTimeout(() => {
                    if (textEl) textEl.textContent = 'Send message';
                    submitBtn.style.background = '';
                    submitBtn.style.color = '';
                    submitBtn.style.borderColor = '';
                    form.reset();
                }, 3000);
            } catch {
                submitBtn.classList.remove('is-loading');
                submitBtn.removeAttribute('aria-disabled');
                announce('An error occurred. Please try again.');
            }
        });
    }

    return { init };
})();
