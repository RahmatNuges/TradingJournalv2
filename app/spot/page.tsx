"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HoldingsTable } from "@/components/spot/holdings-table";
import { TransactionDialog } from "@/components/spot/transaction-dialog";
import { formatPercent } from "@/lib/calculations";
import { useFormatCurrency } from "@/hooks/use-format-currency";
import { getSpotHoldingsSummary } from "@/lib/data-service";
import { Wallet, CircleDollarSign, TrendingUp, Percent } from "lucide-react";
import { getCurrentPrices } from "@/lib/price-service";

interface HoldingSummary {
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
}

export default function SpotPage() {
    const { formatCurrency } = useFormatCurrency();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [holdings, setHoldings] = useState<HoldingSummary[]>([]);
    const [prices, setPrices] = useState<Record<string, number>>({});

    const fetchData = useCallback(async () => {
        setLoading(true);
        const data = await getSpotHoldingsSummary();
        setHoldings(data);

        // Fetch real prices for holdings
        if (data.length > 0) {
            const symbols = data.map(h => h.symbol);
            const currentPrices = await getCurrentPrices(symbols);
            setPrices(currentPrices);
        }

        setLoading(false);
    }, []);

    const holdingsWithValues = holdings.map(h => {
        const currentPrice = prices[h.symbol] || h.avgBuyPrice; // Fallback to avgBuyPrice if fetching fails yet
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

    const totalValue = holdingsWithValues.reduce((sum, h) => sum + h.currentValue, 0);
    const totalCost = holdingsWithValues.reduce((sum, h) => sum + h.totalCost, 0);
    const totalPnL = totalValue - totalCost;
    const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

    // Add allocation percentage
    const holdingsWithAllocation = holdingsWithValues.map(h => ({
        ...h,
        allocation: totalValue > 0 ? (h.currentValue / totalValue) * 100 : 0,
    }));



    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchData();
        // Set up polling for real-time updates every 30 seconds
        const interval = setInterval(() => {
            fetchData();
        }, 30000);

        return () => clearInterval(interval);
    }, [fetchData]);

    const handleTransactionSaved = () => {
        fetchData();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Portfolio Spot</h1>
                    <p className="text-muted-foreground text-sm">DCA & HODL Investing</p>
                </div>
                <Button size="sm" onClick={() => setIsDialogOpen(true)} className="w-fit">
                    + Tambah Transaksi
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <Card>
                    <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                        <p className="text-xs text-muted-foreground uppercase font-medium">Total Value</p>
                        <Wallet className="h-3 w-3 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <p className="text-2xl font-bold font-mono">
                            {loading ? "..." : formatCurrency(totalValue)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                        <p className="text-xs text-muted-foreground uppercase font-medium">Total Cost</p>
                        <CircleDollarSign className="h-3 w-3 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <p className="text-2xl font-bold font-mono text-muted-foreground">
                            {loading ? "..." : formatCurrency(totalCost)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                        <p className="text-xs text-muted-foreground uppercase font-medium">Total P&L</p>
                        <TrendingUp className="h-3 w-3 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <p className={`text-2xl font-bold font-mono ${totalPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
                            {loading ? "..." : `${totalPnL >= 0 ? '+' : ''}${formatCurrency(totalPnL)}`}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                        <p className="text-xs text-muted-foreground uppercase font-medium">P&L %</p>
                        <Percent className="h-3 w-3 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        {!loading && (
                            <Badge
                                variant={totalPnLPercent >= 0 ? "default" : "destructive"}
                                className={`text-lg px-3 py-1 ${totalPnLPercent >= 0 ? "bg-profit" : ""}`}
                            >
                                {formatPercent(totalPnLPercent)}
                            </Badge>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Holdings Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Holdings ({holdings.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <HoldingsTable holdings={holdingsWithAllocation} onRefresh={fetchData} />
                </CardContent>
            </Card>

            {/* Transaction Dialog */}
            <TransactionDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSave={handleTransactionSaved}
            />
        </div>
    );
}
