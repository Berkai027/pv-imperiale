/**
 * ═══════════════════════════════════════
 * MAIN — App Initialization
 * ═══════════════════════════════════════
 */

document.addEventListener('DOMContentLoaded', async () => {
    await I18n.init();
    Ticker.init();
    Navigation.init();
    Animations.init();
    ContactForm.init();

    // Hero image slow-zoom trigger
    const hero = document.getElementById('hero');
    if (hero) {
        requestAnimationFrame(() => hero.classList.add('is-loaded'));
    }
});
