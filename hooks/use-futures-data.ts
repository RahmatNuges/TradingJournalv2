
import { useQuery } from '@tanstack/react-query';
import { getFuturesTrades, getFuturesStats, getCurrentBalance } from "@/lib/data-service";
import type { FuturesTrade } from "@/types";

export interface FuturesData {
    trades: FuturesTrade[];
    balance: number;
    stats: {
        totalTrades: number;
        wins: number;
        losses: number;
        breakevens: number;
        winRate: number;
        avgRRR: number;
        profitFactor: number;
        totalPnL: number;
    };
}

export function useFuturesData() {
    return useQuery({
        queryKey: ['futures'],
        queryFn: async (): Promise<FuturesData> => {
            const [trades, stats, balance] = await Promise.all([
                getFuturesTrades(),
                getFuturesStats(),
                getCurrentBalance(),
            ]);

            return {
                trades,
                stats,
                balance,
            };
        },
    });
}
