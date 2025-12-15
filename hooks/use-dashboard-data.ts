
import { useQuery } from '@tanstack/react-query';
import { getFuturesStats, getCurrentBalance, getSpotHoldingsSummary, getFuturesTrades } from "@/lib/data-service";
import { getCurrentPrices } from "@/lib/price-service";

export interface DashboardData {
    futuresBalance: number;
    futuresPnL: number;
    spotValue: number;
    spotCost: number;
    spotPnL: number;
    winRate: number;
    avgRRR: number;
    totalTrades: number;
    profitFactor: number;
    calendarData: Array<{ date: string; pnl: number }>;
    allocationData: Array<{ symbol: string; name: string; value: number }>;
}

export function useDashboardData() {
    return useQuery({
        queryKey: ['dashboard'],
        queryFn: async (): Promise<DashboardData> => {
            const [stats, balance, holdings, trades] = await Promise.all([
                getFuturesStats(),
                getCurrentBalance(),
                getSpotHoldingsSummary(),
                getFuturesTrades(),
            ]);

            // Get unique symbols to fetch prices
            const symbols = holdings.map(h => h.symbol);
            const prices = await getCurrentPrices(symbols);

            // Calculate spot values
            let spotValue = 0;
            let spotCost = 0;
            const allocation: Array<{ symbol: string; name: string; value: number }> = [];

            holdings.forEach(h => {
                const currentPrice = prices[h.symbol] || h.avgBuyPrice; // Fallback to avg buy price if not found
                const value = h.totalQuantity * currentPrice;
                spotValue += value;
                spotCost += h.totalCost;
                allocation.push({
                    symbol: h.symbol,
                    name: h.name,
                    value: value,
                });
            });

            // Calculate calendar data from trades (group by date)
            const tradesByDate: Record<string, number> = {};
            trades.forEach(t => {
                const date = t.date.split('T')[0];
                tradesByDate[date] = (tradesByDate[date] || 0) + t.net_pnl;
            });
            const calendar = Object.entries(tradesByDate).map(([date, pnl]) => ({ date, pnl }));

            return {
                futuresBalance: balance,
                futuresPnL: stats.totalPnL,
                spotValue,
                spotCost,
                spotPnL: spotValue - spotCost,
                winRate: stats.winRate,
                avgRRR: stats.avgRRR,
                totalTrades: stats.totalTrades,
                profitFactor: stats.profitFactor,
                calendarData: calendar,
                allocationData: allocation,
            };
        }
    });
}
