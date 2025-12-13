"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TradeTable } from "@/components/futures/trade-table";
import { TradeDialog } from "@/components/futures/trade-dialog";
import { BalanceDialog } from "@/components/futures/balance-dialog";
import { PositionCalculator } from "@/components/futures/position-calculator";
import { formatCurrency, formatPercent } from "@/lib/calculations";
import { getFuturesTrades, getFuturesStats, getCurrentBalance } from "@/lib/data-service";
import type { FuturesTrade } from "@/types";

export default function FuturesPage() {
    const [isTradeDialogOpen, setIsTradeDialogOpen] = useState(false);
    const [isBalanceDialogOpen, setIsBalanceDialogOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // Data from Supabase
    const [trades, setTrades] = useState<FuturesTrade[]>([]);
    const [currentBalance, setCurrentBalance] = useState(0);
    const [stats, setStats] = useState({
        totalTrades: 0,
        wins: 0,
        losses: 0,
        breakevens: 0,
        winRate: 0,
        avgRRR: 0,
        profitFactor: 0,
        totalPnL: 0,
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        const [tradesData, statsData, balance] = await Promise.all([
            getFuturesTrades(),
            getFuturesStats(),
            getCurrentBalance(),
        ]);
        setTrades(tradesData);
        setStats(statsData);
        setCurrentBalance(balance);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleTradeSaved = () => {
        fetchData();
    };

    const handleBalanceSaved = () => {
        fetchData();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Trading Futures</h1>
                    <p className="text-muted-foreground">Jurnal dan evaluasi trading</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsBalanceDialogOpen(true)}>
                        Sesuaikan Saldo
                    </Button>
                    <Button onClick={() => setIsTradeDialogOpen(true)}>
                        + Catat Trade
                    </Button>
                </div>
            </div>

            {/* Balance Card */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Current Balance</p>
                            <p className="text-3xl font-bold font-mono">
                                {loading ? "..." : formatCurrency(currentBalance)}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Total P&L</p>
                            <Badge
                                variant={stats.totalPnL >= 0 ? "default" : "destructive"}
                                className={`text-lg px-3 py-1 ${stats.totalPnL >= 0 ? "bg-green-600" : ""}`}
                            >
                                {stats.totalPnL >= 0 ? "+" : ""}{formatCurrency(stats.totalPnL)}
                                {currentBalance > 0 && (
                                    <span className="ml-1 text-xs">
                                        ({formatPercent((stats.totalPnL / currentBalance) * 100)})
                                    </span>
                                )}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <Card>
                    <CardContent className="pt-4 text-center">
                        <p className="text-xs text-muted-foreground uppercase">Win Rate</p>
                        <p className="text-xl font-bold font-mono text-profit">
                            {stats.winRate.toFixed(1)}%
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4 text-center">
                        <p className="text-xs text-muted-foreground uppercase">Avg RRR</p>
                        <p className="text-xl font-bold font-mono">
                            1:{stats.avgRRR.toFixed(1)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4 text-center">
                        <p className="text-xs text-muted-foreground uppercase">Profit Factor</p>
                        <p className={`text-xl font-bold font-mono ${stats.profitFactor >= 1 ? "text-profit" : "text-loss"}`}>
                            {stats.profitFactor.toFixed(2)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4 text-center">
                        <p className="text-xs text-muted-foreground uppercase">Total Trades</p>
                        <p className="text-xl font-bold font-mono">{stats.totalTrades}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4 text-center">
                        <p className="text-xs text-muted-foreground uppercase">W/L/BE</p>
                        <p className="text-xl font-bold font-mono">
                            <span className="text-profit">{stats.wins}</span>/
                            <span className="text-loss">{stats.losses}</span>/
                            <span className="text-muted-foreground">{stats.breakevens}</span>
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4 text-center">
                        <p className="text-xs text-muted-foreground uppercase">Net P&L</p>
                        <p className={`text-xl font-bold font-mono ${stats.totalPnL >= 0 ? "text-profit" : "text-loss"}`}>
                            {stats.totalPnL >= 0 ? "+" : ""}{formatCurrency(stats.totalPnL)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Position Size Calculator */}
            <PositionCalculator />

            {/* Trade History Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Riwayat Trade ({trades.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <TradeTable trades={trades} onRefresh={fetchData} />
                </CardContent>
            </Card>

            {/* Dialogs */}
            <TradeDialog
                open={isTradeDialogOpen}
                onOpenChange={setIsTradeDialogOpen}
                onSave={handleTradeSaved}
            />
            <BalanceDialog
                open={isBalanceDialogOpen}
                onOpenChange={setIsBalanceDialogOpen}
                onSave={handleBalanceSaved}
                currentBalance={currentBalance}
            />
        </div>
    );
}
