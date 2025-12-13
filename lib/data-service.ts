import { supabase, isSupabaseConfigured } from './supabase';
import type { SpotTransaction, FuturesTrade, BalanceHistory } from '@/types';

// =====================================================
// SPOT TRANSACTIONS (DCA Support)
// =====================================================

export async function getSpotTransactions(): Promise<SpotTransaction[]> {
    if (!supabase) {
        console.warn('Supabase not configured');
        return [];
    }

    const { data, error } = await supabase
        .from('spot_transactions')
        .select('*')
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching spot transactions:', error);
        return [];
    }

    return data || [];
}

export async function addSpotTransaction(transaction: Omit<SpotTransaction, 'id' | 'created_at'>): Promise<SpotTransaction | null> {
    if (!supabase) {
        console.warn('Supabase not configured');
        return null;
    }

    const { data, error } = await supabase
        .from('spot_transactions')
        .insert([transaction])
        .select()
        .single();

    if (error) {
        console.error('Error adding spot transaction:', error);
        return null;
    }

    return data;
}

export async function deleteSpotTransaction(id: string): Promise<boolean> {
    if (!supabase) {
        console.warn('Supabase not configured');
        return false;
    }

    const { error } = await supabase
        .from('spot_transactions')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting spot transaction:', error);
        return false;
    }

    return true;
}

// =====================================================
// FUTURES TRADES
// =====================================================

export async function getFuturesTrades(): Promise<FuturesTrade[]> {
    if (!supabase) {
        console.warn('Supabase not configured');
        return [];
    }

    const { data, error } = await supabase
        .from('futures_trades')
        .select('*')
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching futures trades:', error);
        return [];
    }

    return data || [];
}

export async function addFuturesTrade(trade: Omit<FuturesTrade, 'id' | 'created_at'>): Promise<FuturesTrade | null> {
    if (!supabase) {
        console.warn('Supabase not configured');
        return null;
    }

    const { data, error } = await supabase
        .from('futures_trades')
        .insert([trade])
        .select()
        .single();

    if (error) {
        console.error('Error adding futures trade:', error);
        return null;
    }

    return data;
}

export async function updateFuturesTrade(id: string, updates: Partial<FuturesTrade>): Promise<FuturesTrade | null> {
    if (!supabase) {
        console.warn('Supabase not configured');
        return null;
    }

    const { data, error } = await supabase
        .from('futures_trades')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating futures trade:', error);
        return null;
    }

    return data;
}

export async function deleteFuturesTrade(id: string): Promise<boolean> {
    if (!supabase) {
        console.warn('Supabase not configured');
        return false;
    }

    const { error } = await supabase
        .from('futures_trades')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting futures trade:', error);
        return false;
    }

    return true;
}

// =====================================================
// BALANCE HISTORY
// =====================================================

export async function getBalanceHistory(): Promise<BalanceHistory[]> {
    if (!supabase) {
        console.warn('Supabase not configured');
        return [];
    }

    const { data, error } = await supabase
        .from('balance_history')
        .select('*')
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching balance history:', error);
        return [];
    }

    return data || [];
}

export async function addBalanceEntry(entry: Omit<BalanceHistory, 'id' | 'created_at'>): Promise<BalanceHistory | null> {
    if (!supabase) {
        console.warn('Supabase not configured');
        return null;
    }

    const { data, error } = await supabase
        .from('balance_history')
        .insert([entry])
        .select()
        .single();

    if (error) {
        console.error('Error adding balance entry:', error);
        return null;
    }

    return data;
}

// =====================================================
// AGGREGATION HELPERS
// =====================================================

export async function getSpotHoldingsSummary() {
    const transactions = await getSpotTransactions();

    // Group by symbol
    const holdingsMap: Record<string, {
        symbol: string;
        name: string;
        totalBought: number;
        totalSold: number;
        totalCost: number;
        transactions: SpotTransaction[];
    }> = {};

    transactions.forEach((tx) => {
        if (!holdingsMap[tx.symbol]) {
            holdingsMap[tx.symbol] = {
                symbol: tx.symbol,
                name: tx.name || tx.symbol,
                totalBought: 0,
                totalSold: 0,
                totalCost: 0,
                transactions: [],
            };
        }

        if (tx.type === 'BUY') {
            holdingsMap[tx.symbol].totalBought += tx.quantity;
            holdingsMap[tx.symbol].totalCost += tx.quantity * tx.price_usd;
        } else {
            holdingsMap[tx.symbol].totalSold += tx.quantity;
        }

        holdingsMap[tx.symbol].transactions.push(tx);
    });

    // Calculate summary for each holding
    return Object.values(holdingsMap).map((h) => {
        const totalQuantity = h.totalBought - h.totalSold;
        const avgBuyPrice = h.totalBought > 0 ? h.totalCost / h.totalBought : 0;

        return {
            symbol: h.symbol,
            name: h.name,
            totalQuantity,
            avgBuyPrice,
            totalCost: h.totalCost,
            transactions: h.transactions,
        };
    }).filter((h) => h.totalQuantity > 0);
}

export async function getFuturesStats() {
    const trades = await getFuturesTrades();

    if (trades.length === 0) {
        return {
            totalTrades: 0,
            wins: 0,
            losses: 0,
            breakevens: 0,
            winRate: 0,
            totalPnL: 0,
            avgRRR: 0,
            profitFactor: 0,
        };
    }

    const wins = trades.filter((t) => t.result === 'WIN');
    const losses = trades.filter((t) => t.result === 'LOSS');
    const breakevens = trades.filter((t) => t.result === 'BE');

    const totalWinAmount = wins.reduce((sum, t) => sum + t.net_pnl, 0);
    const totalLossAmount = Math.abs(losses.reduce((sum, t) => sum + t.net_pnl, 0));

    const rrrTrades = trades.filter((t) => t.rrr !== null);
    const avgRRR = rrrTrades.length > 0
        ? rrrTrades.reduce((sum, t) => sum + (t.rrr || 0), 0) / rrrTrades.length
        : 0;

    return {
        totalTrades: trades.length,
        wins: wins.length,
        losses: losses.length,
        breakevens: breakevens.length,
        winRate: (wins.length / trades.length) * 100,
        totalPnL: trades.reduce((sum, t) => sum + t.net_pnl, 0),
        avgRRR,
        profitFactor: totalLossAmount > 0 ? totalWinAmount / totalLossAmount : totalWinAmount,
    };
}

export async function getCurrentBalance(): Promise<number> {
    const [history, trades] = await Promise.all([
        getBalanceHistory(),
        getFuturesTrades(),
    ]);

    // Get initial/deposit/withdraw balance
    let baseBalance = 0;
    if (history.length > 0) {
        // Get the latest balance_after value from balance history
        baseBalance = history[0]?.balance_after || 0;
    }

    // If no balance history but there are trades, use total PnL as balance
    // This allows the app to work even without setting initial balance
    const totalPnL = trades.reduce((sum, t) => sum + t.net_pnl, 0);

    // If user has set initial balance, add PnL to it
    // If no initial balance set, just show total PnL
    if (history.length === 0 && trades.length > 0) {
        return totalPnL;
    }

    return baseBalance + totalPnL;
}
