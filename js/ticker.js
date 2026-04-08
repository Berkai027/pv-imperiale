/**
 * ═══════════════════════════════════════
 * TICKER TAPE — Market Data
 * Fetches real-time quotes from Brapi API (free tier)
 * Falls back to static data if API is unavailable
 * ═══════════════════════════════════════
 */

const Ticker = (() => {
    'use strict';

    const BRAPI_BASE = 'https://brapi.dev/api';
    const FETCH_TIMEOUT = 5000;
    let refreshInterval = null;

    const BR_TICKERS = ['PETR4', 'VALE3', 'ITUB4', 'BBDC4', 'WEGE3', 'ABEV3'];
    const INTL_TICKERS = ['^BVSP', '^GSPC', '^IXIC', '^DJI', '^FTSE', '^N225'];
    const CURRENCY_TICKERS = ['USDBRL', 'EURBRL', 'GBPBRL'];
    const CRYPTO_TICKERS = ['BTC', 'ETH'];

    const DISPLAY_NAMES = {
        '^BVSP': 'IBOV', '^GSPC': 'S&P 500', '^IXIC': 'NASDAQ',
        '^DJI': 'DOW', '^FTSE': 'FTSE 100', '^N225': 'NIKKEI',
        'USDBRL': 'USD/BRL', 'EURBRL': 'EUR/BRL', 'GBPBRL': 'GBP/BRL',
    };

    const FALLBACK_DATA = [
        { symbol: 'IBOV', price: '128.450', change: '+0,85%', direction: 'up' },
        { symbol: 'S&P 500', price: '5.234,18', change: '+0,42%', direction: 'up' },
        { symbol: 'NASDAQ', price: '16.428,82', change: '+0,67%', direction: 'up' },
        { symbol: 'DOW', price: '39.142,23', change: '-0,12%', direction: 'down' },
        { symbol: 'USD/BRL', price: '4,97', change: '+0,15%', direction: 'up' },
        { symbol: 'EUR/BRL', price: '5,42', change: '-0,23%', direction: 'down' },
        { symbol: 'GBP/BRL', price: '6,28', change: '+0,08%', direction: 'up' },
        { symbol: 'PETR4', price: '38,42', change: '+1,20%', direction: 'up' },
        { symbol: 'VALE3', price: '62,85', change: '-0,45%', direction: 'down' },
        { symbol: 'ITUB4', price: '34,12', change: '+0,72%', direction: 'up' },
        { symbol: 'BBDC4', price: '14,28', change: '-0,35%', direction: 'down' },
        { symbol: 'WEGE3', price: '36,90', change: '+1,05%', direction: 'up' },
        { symbol: 'ABEV3', price: '13,45', change: '+0,30%', direction: 'up' },
        { symbol: 'BTC', price: '67.842', change: '+2,34%', direction: 'up' },
        { symbol: 'ETH', price: '3.456', change: '+1,78%', direction: 'up' },
        { symbol: 'GOLD', price: '2.338,50', change: '+1,12%', direction: 'up' },
        { symbol: 'FTSE 100', price: '8.142,15', change: '+0,28%', direction: 'up' },
        { symbol: 'NIKKEI', price: '38.920,45', change: '+1,05%', direction: 'up' },
    ];

    // Escape HTML to prevent XSS from API data
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function formatPrice(value) {
        if (value == null) return '—';
        return value.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }

    function formatChange(value) {
        if (value == null) return '—';
        const sign = value >= 0 ? '+' : '';
        return sign + value.toFixed(2).replace('.', ',') + '%';
    }

    // Fetch with timeout via AbortController
    async function fetchWithTimeout(url, ms) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), ms);
        try {
            const res = await fetch(url, { signal: controller.signal });
            return res;
        } finally {
            clearTimeout(timer);
        }
    }

    async function fetchQuotes() {
        try {
            const allTickers = [...BR_TICKERS, ...INTL_TICKERS, ...CURRENCY_TICKERS].join(',');
            const response = await fetchWithTimeout(
                `${BRAPI_BASE}/quote/${encodeURIComponent(allTickers)}?fundamental=false`,
                FETCH_TIMEOUT
            );

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            if (!data.results || data.results.length === 0) throw new Error('No results');

            const items = data.results.map(q => ({
                symbol: DISPLAY_NAMES[q.symbol] || String(q.symbol),
                price: formatPrice(q.regularMarketPrice),
                change: formatChange(q.regularMarketChangePercent),
                direction: q.regularMarketChangePercent >= 0 ? 'up' : 'down',
            }));

            try {
                const cryptoRes = await fetchWithTimeout(
                    `${BRAPI_BASE}/v2/crypto?coin=BTC,ETH&currency=BRL`,
                    FETCH_TIMEOUT
                );
                if (cryptoRes.ok) {
                    const cryptoData = await cryptoRes.json();
                    if (cryptoData.coins) {
                        cryptoData.coins.forEach(c => {
                            items.push({
                                symbol: String(c.coin),
                                price: formatPrice(c.regularMarketPrice),
                                change: formatChange(c.regularMarketChangePercent),
                                direction: c.regularMarketChangePercent >= 0 ? 'up' : 'down',
                            });
                        });
                    }
                }
            } catch {
                FALLBACK_DATA
                    .filter(f => CRYPTO_TICKERS.includes(f.symbol))
                    .forEach(f => items.push(f));
            }

            return items;
        } catch {
            return FALLBACK_DATA;
        }
    }

    // Build DOM nodes instead of innerHTML (XSS-safe)
    function buildDOM(items, container) {
        const frag = document.createDocumentFragment();
        items.forEach((item, i) => {
            const span = document.createElement('span');
            span.className = 'ticker-item';

            const sym = document.createElement('span');
            sym.className = 'ticker-item__symbol';
            sym.textContent = item.symbol;

            const price = document.createElement('span');
            price.className = 'ticker-item__price';
            price.textContent = item.price;

            const change = document.createElement('span');
            change.className = `ticker-item__change ticker-item__change--${item.direction === 'up' ? 'up' : 'down'}`;
            change.textContent = item.change;

            span.appendChild(sym);
            span.appendChild(price);
            span.appendChild(change);
            frag.appendChild(span);

            if (i < items.length - 1) {
                const divider = document.createElement('span');
                divider.className = 'ticker-divider';
                divider.setAttribute('aria-hidden', 'true');
                frag.appendChild(divider);
            }
        });
        container.innerHTML = '';
        container.appendChild(frag);
    }

    function render(items) {
        const content = document.getElementById('tickerContent');
        const clone = document.getElementById('tickerContentClone');
        if (!content || !clone) return;

        buildDOM(items, content);
        buildDOM(items, clone);
    }

    function destroy() {
        if (refreshInterval) {
            clearInterval(refreshInterval);
            refreshInterval = null;
        }
    }

    async function init() {
        const items = await fetchQuotes();
        render(items);

        destroy(); // Clear any existing interval
        refreshInterval = setInterval(async () => {
            const updated = await fetchQuotes();
            render(updated);
        }, 5 * 60 * 1000);
    }

    return { init, destroy };
})();
