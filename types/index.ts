// TypeScript types for Trading Journal V2

// ==========================================
// SPOT PORTFOLIO TYPES
// ==========================================

export interface SpotTransaction {
    id: string;
    user_id?: string;
    symbol: string;
    name?: string;
    quantity: number;
    price_usd: number;
    type: 'BUY' | 'SELL';
    date: string;
    created_at: string;
}

export interface SpotHolding {
    symbol: string;
    name?: string;
    totalQuantity: number;
    avgBuyPrice: number;
    totalCost: number;
    currentPrice: number;
    currentValue: number;
    pnl: number;
    pnlPercent: number;
    allocation: number;
    transactions: SpotTransaction[];
}

// ==========================================
// FUTURES TRADING TYPES
// ==========================================

export interface FuturesTrade {
    id: string;
    user_id?: string;
    pair: string;
    direction: 'LONG' | 'SHORT';
    leverage: number;
    entry_price: number;
    exit_price: number;
    position_size: number;
    fee_percent: number;
    fee_amount: number;
    pnl: number;
    net_pnl: number;
    pnl_percent: number;
    rrr: number | null;
    result: 'WIN' | 'LOSS' | 'BE';
    stop_loss: number | null;
    take_profit: number | null;
    strategy: string | null;
    notes: string | null;
    date: string;
    created_at: string;
}

export interface TradingStats {
    totalTrades: number;
    wins: number;
    losses: number;
    breakevens: number;
    winRate: number;
    avgRRR: number;
    profitFactor: number;
    totalPnL: number;
    avgWin: number;
    avgLoss: number;
    largestWin: number;
    largestLoss: number;
    bestStreak: number;
    worstStreak: number;
}

// ==========================================
// BALANCE TYPES
// ==========================================

export interface BalanceHistory {
    id: string;
    user_id?: string;
    type: 'INITIAL' | 'DEPOSIT' | 'WITHDRAW' | 'TRADE';
    amount: number;
    balance_after: number;
    note?: string;
    date: string;
    created_at: string;
}

export interface FuturesBalance {
    currentBalance: number;
    initialBalance: number;
    totalDeposits: number;
    totalWithdrawals: number;
    totalPnL: number;
}

// ==========================================
// SETTINGS TYPES
// ==========================================

export interface UserSettings {
    id: string;
    user_id?: string;
    default_fee_percent: number;
    default_leverage: number;
    theme: 'dark' | 'light';
}

// ==========================================
// CHART DATA TYPES
// ==========================================

export interface EquityCurvePoint {
    date: string;
    balance: number;
}

export interface CalendarDay {
    date: string;
    pnl: number;
    tradesCount: number;
}

export interface AllocationData {
    symbol: string;
    name: string;
    value: number;
    percentage: number;
}
