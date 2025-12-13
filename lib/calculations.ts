// Trading calculation utilities

/**
 * Calculate P&L for a futures trade
 */
export function calculatePnL(
    direction: 'LONG' | 'SHORT',
    entryPrice: number,
    exitPrice: number,
    positionSize: number,
    leverage: number
): number {
    let pnlPercent: number;

    if (direction === 'LONG') {
        pnlPercent = ((exitPrice - entryPrice) / entryPrice) * 100;
    } else {
        pnlPercent = ((entryPrice - exitPrice) / entryPrice) * 100;
    }

    return (pnlPercent / 100) * positionSize * leverage;
}

/**
 * Calculate P&L percentage (ROE)
 */
export function calculatePnLPercent(
    direction: 'LONG' | 'SHORT',
    entryPrice: number,
    exitPrice: number,
    leverage: number
): number {
    if (direction === 'LONG') {
        return ((exitPrice - entryPrice) / entryPrice) * 100 * leverage;
    } else {
        return ((entryPrice - exitPrice) / entryPrice) * 100 * leverage;
    }
}

/**
 * Calculate fee amount from percentage
 * Fee is charged on entry and exit, so multiply by 2
 */
export function calculateFeeAmount(
    positionSize: number,
    feePercent: number
): number {
    return positionSize * (feePercent / 100) * 2;
}

/**
 * Calculate Risk-Reward Ratio
 */
export function calculateRRR(
    direction: 'LONG' | 'SHORT',
    entryPrice: number,
    stopLoss: number | null,
    takeProfit: number | null
): number | null {
    if (!stopLoss || !takeProfit) return null;

    let risk: number;
    let reward: number;

    if (direction === 'LONG') {
        risk = Math.abs(entryPrice - stopLoss);
        reward = Math.abs(takeProfit - entryPrice);
    } else {
        risk = Math.abs(stopLoss - entryPrice);
        reward = Math.abs(entryPrice - takeProfit);
    }

    if (risk === 0) return null;
    return reward / risk;
}

/**
 * Calculate Position Size from Risk Amount
 * Formula: Position Size = Risk Amount / (Stop Loss % / 100)
 */
export function calculatePositionSize(
    riskAmount: number,
    stopLossPercent: number
): number {
    if (stopLossPercent <= 0) return 0;
    return riskAmount / (stopLossPercent / 100);
}

/**
 * Determine trade result based on net P&L
 */
export function determineResult(netPnl: number): 'WIN' | 'LOSS' | 'BE' {
    if (netPnl > 0.01) return 'WIN';
    if (netPnl < -0.01) return 'LOSS';
    return 'BE';
}

/**
 * Calculate average buy price from transactions (DCA)
 */
export function calculateAveragePrice(
    transactions: Array<{ quantity: number; price_usd: number; type: 'BUY' | 'SELL' }>
): { avgPrice: number; totalQuantity: number; totalCost: number } {
    let totalBought = 0;
    let totalCost = 0;
    let totalSold = 0;

    transactions.forEach((tx) => {
        if (tx.type === 'BUY') {
            totalBought += tx.quantity;
            totalCost += tx.quantity * tx.price_usd;
        } else {
            totalSold += tx.quantity;
        }
    });

    const totalQuantity = totalBought - totalSold;
    const avgPrice = totalBought > 0 ? totalCost / totalBought : 0;

    return { avgPrice, totalQuantity, totalCost };
}

/**
 * Format number with specified decimals
 */
export function formatNumber(num: number, decimals: number = 2): string {
    if (isNaN(num)) return '0';
    return Number(num).toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

/**
 * Format currency
 */
export function formatCurrency(num: number, decimals: number = 2): string {
    const formatted = formatNumber(Math.abs(num), decimals);
    return num >= 0 ? `$${formatted}` : `-$${formatted}`;
}

/**
 * Format percentage
 */
export function formatPercent(num: number, decimals: number = 2): string {
    const formatted = formatNumber(num, decimals);
    return num >= 0 ? `+${formatted}%` : `${formatted}%`;
}
