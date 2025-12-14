
// Map of common symbols to their Binance pair equivalent if not standard
// Most are just SYMBOL + USDT
const SYMBOL_MAP: Record<string, string> = {
    // Add special cases if needed, but CryptoCompare usually handles standard symbols well
};

export async function getCurrentPrices(symbols: string[]): Promise<Record<string, number>> {
    if (!symbols.length) return {};

    const uniqueSymbols = Array.from(new Set(symbols.map(s => s.toUpperCase())));
    const prices: Record<string, number> = {};

    try {
        // CryptoCompare API supports CORS and multi-symbol fetching
        // Endpoint: https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH&tsyms=USD

        const fsyms = uniqueSymbols.join(',');
        const response = await fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${fsyms}&tsyms=USD`);

        if (!response.ok) {
            throw new Error('Failed to fetch prices from CryptoCompare');
        }

        const data = await response.json();
        // Response format: { "BTC": { "USD": 100000.50 }, "ETH": { "USD": 3000.00 } }

        uniqueSymbols.forEach(symbol => {
            if (data[symbol] && data[symbol]['USD']) {
                prices[symbol] = data[symbol]['USD'];
            } else {
                console.warn(`Price not found for ${symbol}`);
                prices[symbol] = 0;
            }
        });

        return prices;
    } catch (error) {
        console.error('Error fetching crypto prices:', error);
        return {};
    }
}
