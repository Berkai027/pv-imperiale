/* ═══════════════════════════════════════
   i18n — Lightweight translation engine
   ═══════════════════════════════════════ */

const I18n = (() => {
    const SUPPORTED = ['en', 'it', 'pt', 'es'];
    const DEFAULT = 'en';
    let translations = {};
    let currentLocale = DEFAULT;

    function getLocale() {
        const saved = localStorage.getItem('pv-lang');
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
            localStorage.setItem('pv-lang', locale);
        } catch (e) {
            console.warn(`[i18n] Failed to load ${locale}, falling back to ${DEFAULT}`);
            if (locale !== DEFAULT) {
                return loadTranslations(DEFAULT);
            }
        }
    }

    function apply() {
        // Text content
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[key] != null) {
                el.innerHTML = translations[key];
            }
        });

        // Placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (translations[key] != null) {
                el.placeholder = translations[key];
            }
        });

        // Aria labels
        document.querySelectorAll('[data-i18n-aria]').forEach(el => {
            const key = el.getAttribute('data-i18n-aria');
            if (translations[key] != null) {
                el.setAttribute('aria-label', translations[key]);
            }
        });

        // Alt texts
        document.querySelectorAll('[data-i18n-alt]').forEach(el => {
            const key = el.getAttribute('data-i18n-alt');
            if (translations[key] != null) {
                el.setAttribute('alt', translations[key]);
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

        // Update active state on language selector
        document.querySelectorAll('.lang-selector__btn').forEach(btn => {
            btn.classList.toggle('is-active', btn.dataset.lang === currentLocale);
        });
    }

    async function switchLanguage(locale) {
        if (!SUPPORTED.includes(locale)) return;
        if (locale === currentLocale && Object.keys(translations).length > 0) return;
        await loadTranslations(locale);
        apply();
    }

    function t(key) {
        return translations[key] || key;
    }

    function getLocaleCode() {
        return currentLocale;
    }

    async function init() {
        const locale = getLocale();
        await loadTranslations(locale);
        apply();

        // Bind language selector buttons
        document.querySelectorAll('.lang-selector__btn').forEach(btn => {
            btn.addEventListener('click', () => {
                switchLanguage(btn.dataset.lang);
            });
        });
    }

    return { init, switchLanguage, t, getLocaleCode };
})();

// Export for use in other modules
window.I18n = I18n;
