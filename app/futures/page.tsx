"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TradeTable } from "@/components/futures/trade-table";
import { TradeDialog } from "@/components/futures/trade-dialog";
import { BalanceDialog } from "@/components/futures/balance-dialog";
import { PositionCalculator } from "@/components/futures/position-calculator";
import { formatPercent } from "@/lib/calculations";
import { useFormatCurrency } from "@/hooks/use-format-currency";
import { getFuturesTrades, getFuturesStats, getCurrentBalance } from "@/lib/data-service";
import { useAuth } from "@/contexts/auth-context";
import { useSubscription } from "@/contexts/subscription-context";
import type { FuturesTrade } from "@/types";
import { Target, Scale, TrendingUp, BarChart2, ArrowUpRight, Wallet } from "lucide-react";

export default function FuturesPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { isSubscribed, isLoading: subLoading } = useSubscription();
    const { formatCurrency } = useFormatCurrency();
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

    // Redirect non-subscribers to home
    useEffect(() => {
        if (!authLoading && !subLoading) {
            if (!user || !isSubscribed) {
                router.push("/");
            }
        }
    }, [user, isSubscribed, authLoading, subLoading, router]);

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
        if (user && isSubscribed) {
            fetchData();
        }
    }, [fetchData, user, isSubscribed]);

    // Show loading while checking auth/subscription
    if (authLoading || subLoading || !user || !isSubscribed) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const handleTradeSaved = () => {
        fetchData();
    };

    const handleBalanceSaved = () => {
        fetchData();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Trading Futures</h1>
                    <p className="text-muted-foreground text-sm">Jurnal dan evaluasi trading</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsBalanceDialogOpen(true)} className="text-xs sm:text-sm">
                        <span className="hidden sm:inline">Sesuaikan</span> Saldo
                    </Button>
                    <Button size="sm" onClick={() => setIsTradeDialogOpen(true)} className="text-xs sm:text-sm">
                        + <span className="hidden sm:inline">Catat</span> Trade
                    </Button>
                </div>
            </div>

            {/* Balance Card */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
            </Card >

            {/* Stats Grid */}
            < div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3" >
                <Card>
                    <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                        <p className="text-xs text-muted-foreground uppercase font-medium">Win Rate</p>
                        <Target className="h-3 w-3 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <p className="text-xl font-bold font-mono text-profit">
                            {stats.winRate.toFixed(1)}%
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                        <p className="text-xs text-muted-foreground uppercase font-medium">Avg RRR</p>
                        <Scale className="h-3 w-3 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <p className="text-xl font-bold font-mono">
                            1:{stats.avgRRR.toFixed(1)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                        <p className="text-xs text-muted-foreground uppercase font-medium">Profit Factor</p>
                        <TrendingUp className="h-3 w-3 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <p className={`text-xl font-bold font-mono ${stats.profitFactor >= 1 ? "text-profit" : "text-loss"}`}>
                            {stats.profitFactor.toFixed(2)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                        <p className="text-xs text-muted-foreground uppercase font-medium">Total Trades</p>
                        <BarChart2 className="h-3 w-3 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <p className="text-xl font-bold font-mono">{stats.totalTrades}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                        <p className="text-xs text-muted-foreground uppercase font-medium">W / L / BE</p>
                        <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <p className="text-xl font-bold font-mono text-sm">
                            <span className="text-profit">{stats.wins}</span> / <span className="text-loss">{stats.losses}</span> / <span className="text-muted-foreground">{stats.breakevens}</span>
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                        <p className="text-xs text-muted-foreground uppercase font-medium">Net P&L</p>
                        <Wallet className="h-3 w-3 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
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
