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

    // Calculate totals (using mock current prices for now)
    // In real app, you'd fetch current prices from an API
    const mockPrices: Record<string, number> = {
        BTC: 100500,
        ETH: 3850,
        SOL: 220,
        // Add more as needed
    };

    const holdingsWithValues = holdings.map(h => {
        const currentPrice = mockPrices[h.symbol] || h.avgBuyPrice;
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

    const fetchData = useCallback(async () => {
        setLoading(true);
        const data = await getSpotHoldingsSummary();
        setHoldings(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
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
                    <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">Total Value</p>
                        <p className="text-2xl font-bold font-mono">
                            {loading ? "..." : formatCurrency(totalValue)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">Total Cost</p>
                        <p className="text-2xl font-bold font-mono text-muted-foreground">
                            {loading ? "..." : formatCurrency(totalCost)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">Total P&L</p>
                        <p className={`text-2xl font-bold font-mono ${totalPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
                            {loading ? "..." : `${totalPnL >= 0 ? '+' : ''}${formatCurrency(totalPnL)}`}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">P&L %</p>
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
