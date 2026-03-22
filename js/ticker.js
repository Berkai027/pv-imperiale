/**
 * ═══════════════════════════════════════
 * TICKER TAPE — Market Data
 * Fetches real-time quotes from Brapi API (free tier)
 * Falls back to static data if API is unavailable
 * ═══════════════════════════════════════
 */

const Ticker = (() => {
    'use strict';

    // Brapi free API — real B3 + international data
    const BRAPI_BASE = 'https://brapi.dev/api';

    // Tickers to display: B3 stocks + indices + currencies + crypto
    const BR_TICKERS = ['PETR4', 'VALE3', 'ITUB4', 'BBDC4', 'WEGE3', 'ABEV3'];
    const INTL_TICKERS = ['^BVSP', '^GSPC', '^IXIC', '^DJI', '^FTSE', '^N225'];
    const CURRENCY_TICKERS = ['USDBRL', 'EURBRL', 'GBPBRL'];
    const CRYPTO_TICKERS = ['BTC', 'ETH'];

    // Friendly names for indices
    const DISPLAY_NAMES = {
        '^BVSP': 'IBOV',
        '^GSPC': 'S&P 500',
        '^IXIC': 'NASDAQ',
        '^DJI': 'DOW',
        '^FTSE': 'FTSE 100',
        '^N225': 'NIKKEI',
        'USDBRL': 'USD/BRL',
        'EURBRL': 'EUR/BRL',
        'GBPBRL': 'GBP/BRL',
    };

    // Static fallback data (used when API is unavailable)
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

    // Format number to Brazilian locale
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

    // Fetch quotes from Brapi
    async function fetchQuotes() {
        try {
            const allTickers = [...BR_TICKERS, ...INTL_TICKERS, ...CURRENCY_TICKERS].join(',');
            const response = await fetch(`${BRAPI_BASE}/quote/${encodeURIComponent(allTickers)}?fundamental=false`);

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();

            if (!data.results || data.results.length === 0) throw new Error('No results');

            const items = data.results.map(q => ({
                symbol: DISPLAY_NAMES[q.symbol] || q.symbol,
                price: formatPrice(q.regularMarketPrice),
                change: formatChange(q.regularMarketChangePercent),
                direction: q.regularMarketChangePercent >= 0 ? 'up' : 'down',
            }));

            // Add crypto separately (Brapi has a different endpoint)
            try {
                const cryptoRes = await fetch(`${BRAPI_BASE}/v2/crypto?coin=BTC,ETH&currency=BRL`);
                if (cryptoRes.ok) {
                    const cryptoData = await cryptoRes.json();
                    if (cryptoData.coins) {
                        cryptoData.coins.forEach(c => {
                            items.push({
                                symbol: c.coin,
                                price: formatPrice(c.regularMarketPrice),
                                change: formatChange(c.regularMarketChangePercent),
                                direction: c.regularMarketChangePercent >= 0 ? 'up' : 'down',
                            });
                        });
                    }
                }
            } catch {
                // Crypto fetch failed silently — use fallback for crypto only
                FALLBACK_DATA
                    .filter(f => CRYPTO_TICKERS.includes(f.symbol))
                    .forEach(f => items.push(f));
            }

            return items;
        } catch (err) {
            console.warn('[Ticker] API indisponível, usando dados estáticos:', err.message);
            return FALLBACK_DATA;
        }
    }

    // Build HTML for ticker items
    function buildHTML(items) {
        return items.map((item, i) => {
            const divider = i < items.length - 1
                ? '<span class="ticker-divider" aria-hidden="true"></span>'
                : '';
            return `
                <span class="ticker-item">
                    <span class="ticker-item__symbol">${item.symbol}</span>
                    <span class="ticker-item__price">${item.price}</span>
                    <span class="ticker-item__change ticker-item__change--${item.direction}">${item.change}</span>
                </span>
                ${divider}
            `;
        }).join('');
    }

    // Render ticker
    function render(items) {
        const content = document.getElementById('tickerContent');
        const clone = document.getElementById('tickerContentClone');
        if (!content || !clone) return;

        const html = buildHTML(items);
        content.innerHTML = html;
        clone.innerHTML = html;
    }

    // Public init
    async function init() {
        const items = await fetchQuotes();
        render(items);

        // Refresh every 5 minutes
        setInterval(async () => {
            const updated = await fetchQuotes();
            render(updated);
        }, 5 * 60 * 1000);
    }

    return { init };
})();
