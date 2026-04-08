/* ═══════════════════════════════════════
   i18n — Lightweight translation engine
   ═══════════════════════════════════════ */

const I18n = (() => {
    const SUPPORTED = ['en', 'it', 'pt', 'es'];
    const DEFAULT = 'en';
    // Keys that legitimately contain HTML (<br>, <em>)
    const HTML_KEYS = new Set([
        'hero.title', 'about.title', 'services.title', 'cta.title',
        'contact.title', 'footer.tagline',
    ]);
    let translations = {};
    let currentLocale = DEFAULT;

    function safeGetStorage(key) {
        try { return localStorage.getItem(key); }
        catch { return null; }
    }

    function safeSetStorage(key, value) {
        try { localStorage.setItem(key, value); }
        catch { /* Private browsing or storage disabled */ }
    }

    function getLocale() {
        const saved = safeGetStorage('pv-lang');
        if (saved && SUPPORTED.includes(saved)) return saved;

        const browser = (navigator.language || '').slice(0, 2).toLowerCase();
        if (SUPPORTED.includes(browser)) return browser;

        return DEFAULT;
    }

    async function loadTranslations(locale) {
        try {
            const res = await fetch(`locales/${locale}.json`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            translations = await res.json();
            currentLocale = locale;
            safeSetStorage('pv-lang', locale);
        } catch {
            if (locale !== DEFAULT) {
                return loadTranslations(DEFAULT);
            }
        }
    }

    function apply() {
        // Combined single-pass query for all i18n elements
        const elements = document.querySelectorAll('[data-i18n], [data-i18n-placeholder], [data-i18n-aria], [data-i18n-alt]');

        elements.forEach(el => {
            const textKey = el.getAttribute('data-i18n');
            if (textKey && translations[textKey] != null) {
                if (HTML_KEYS.has(textKey)) {
                    el.innerHTML = translations[textKey];
                } else {
                    el.textContent = translations[textKey];
                }
            }

            const placeholderKey = el.getAttribute('data-i18n-placeholder');
            if (placeholderKey && translations[placeholderKey] != null) {
                el.placeholder = translations[placeholderKey];
            }

            const ariaKey = el.getAttribute('data-i18n-aria');
            if (ariaKey && translations[ariaKey] != null) {
                el.setAttribute('aria-label', translations[ariaKey]);
            }

            const altKey = el.getAttribute('data-i18n-alt');
            if (altKey && translations[altKey] != null) {
                el.setAttribute('alt', translations[altKey]);
            }
        });

        // HTML lang
        const langMap = { en: 'en', it: 'it', pt: 'pt-BR', es: 'es' };
        document.documentElement.lang = langMap[currentLocale] || currentLocale;

        // Meta tags
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && translations['meta.description']) {
            metaDesc.setAttribute('content', translations['meta.description']);
        }
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle && translations['meta.og.title']) {
            ogTitle.setAttribute('content', translations['meta.og.title']);
        }
        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc && translations['meta.og.description']) {
            ogDesc.setAttribute('content', translations['meta.og.description']);
        }
        const ogLocale = document.querySelector('meta[property="og:locale"]');
        if (ogLocale) {
            const localeMap = { en: 'en_US', it: 'it_IT', pt: 'pt_BR', es: 'es_ES' };
            ogLocale.setAttribute('content', localeMap[currentLocale] || 'en_US');
        }

        // Title
        if (translations['meta.title']) {
            document.title = translations['meta.title'];
        }

        // Update active state on language selector (cached after first call)
        const langBtns = document.querySelectorAll('.lang-selector__btn');
        langBtns.forEach(btn => {
            const isActive = btn.dataset.lang === currentLocale;
            btn.classList.toggle('is-active', isActive);
            btn.setAttribute('aria-pressed', String(isActive));
        });
    }

    async function switchLanguage(locale) {
        if (!SUPPORTED.includes(locale)) return;
        if (locale === currentLocale && Object.keys(translations).length > 0) return;
        await loadTranslations(locale);
        apply();
    }

    async function init() {
        const locale = getLocale();
        await loadTranslations(locale);
        apply();

        document.querySelectorAll('.lang-selector__btn').forEach(btn => {
            btn.addEventListener('click', () => {
                switchLanguage(btn.dataset.lang);
            });
        });
    }

    return { init, switchLanguage };
})();

window.I18n = I18n;
