
import { useQuery } from '@tanstack/react-query';
import { getSpotHoldingsSummary } from "@/lib/data-service";
import { getCurrentPrices } from "@/lib/price-service";

export interface HoldingSummary {
    symbol: string;
    name: string;
    totalQuantity: number;
    avgBuyPrice: number;
    totalCost: number;
    transactions: Array<{
        id: string;
        type: 'BUY' | 'SELL';
        quantity: number;
        price_usd: number;
        date: string;
    }>;
    currentPrice?: number;
    currentValue?: number;
    pnl?: number;
    pnlPercent?: number;
    allocation?: number;
}

export function useSpotData() {
    return useQuery({
        queryKey: ['spotSteps'],
        queryFn: async () => {
            const data = await getSpotHoldingsSummary();

            // Fetch real prices for holdings
            let prices: Record<string, number> = {};
            if (data.length > 0) {
                const symbols = data.map(h => h.symbol);
                prices = await getCurrentPrices(symbols);
            }

            // Calculate derived values
            const holdingsWithValues = data.map(h => {
                const currentPrice = prices[h.symbol] || h.avgBuyPrice;
                const currentValue = h.totalQuantity * currentPrice;
                const pnl = currentValue - h.totalCost;
                const pnlPercent = h.totalCost > 0 ? (pnl / h.totalCost) * 100 : 0;

                return {
                    ...h,
                    currentPrice,
                    currentValue,
                    pnl,
                    pnlPercent,
                };
            });

            const totalValue = holdingsWithValues.reduce((sum, h) => sum + (h.currentValue || 0), 0);
            const totalCost = holdingsWithValues.reduce((sum, h) => sum + h.totalCost, 0);
            const totalPnL = totalValue - totalCost;
            const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

            const holdingsWithAllocation = holdingsWithValues.map(h => ({
                ...h,
                allocation: totalValue > 0 ? ((h.currentValue || 0) / totalValue) * 100 : 0,
            }));

            return {
                holdings: holdingsWithAllocation,
                totalValue,
                totalCost,
                totalPnL,
                totalPnLPercent
            };
        },
        refetchInterval: 30000, // Poll every 30s
    });
}
