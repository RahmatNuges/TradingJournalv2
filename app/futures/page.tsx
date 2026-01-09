"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TradeTable } from "@/components/futures/trade-table";
import { TradeDialog } from "@/components/futures/trade-dialog";
import { BalanceDialog } from "@/components/futures/balance-dialog";
import { PositionCalculator } from "@/components/futures/position-calculator";
import { OpenPositionDialog } from "@/components/futures/open-position-dialog";
import { ClosePositionDialog } from "@/components/futures/close-position-dialog";
import { OpenPositionCard } from "@/components/futures/open-position-card";
import { formatPercent } from "@/lib/calculations";
import { useFormatCurrency } from "@/hooks/use-format-currency";
import { useFuturesData } from "@/hooks/use-futures-data";
import { getOpenTrades, getClosedTrades } from "@/lib/data-service";
import { useAuth } from "@/contexts/auth-context";
import { useSubscription } from "@/contexts/subscription-context";
import type { FuturesTrade } from "@/types";
import { Target, Scale, TrendingUp, BarChart2, ArrowUpRight, Wallet, Rocket, History } from "lucide-react";

export default function FuturesPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { isSubscribed, isLoading: subLoading } = useSubscription();
    const { formatCurrency } = useFormatCurrency();

    // Dialog states
    const [isTradeDialogOpen, setIsTradeDialogOpen] = useState(false);
    const [isBalanceDialogOpen, setIsBalanceDialogOpen] = useState(false);
    const [isOpenPositionDialogOpen, setIsOpenPositionDialogOpen] = useState(false);
    const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
    const [selectedOpenTrade, setSelectedOpenTrade] = useState<FuturesTrade | null>(null);

    // Open positions
    const [openTrades, setOpenTrades] = useState<FuturesTrade[]>([]);
    const [closedTrades, setClosedTrades] = useState<FuturesTrade[]>([]);
    const [loadingTrades, setLoadingTrades] = useState(true);

    // Use React Query hook for balance and stats
    const { data, isLoading: dataLoading, refetch } = useFuturesData();
    const loading = dataLoading || authLoading || subLoading;

    // Default empty data if loading
    const safeData = data || {
        trades: [],
        balance: 0,
        stats: {
            totalTrades: 0,
            wins: 0,
            losses: 0,
            breakevens: 0,
            winRate: 0,
            avgRRR: 0,
            profitFactor: 0,
            totalPnL: 0,
        }
    };

    const { balance: currentBalance, stats } = safeData;

    // Fetch open and closed trades
    const fetchTrades = async () => {
        setLoadingTrades(true);
        const [open, closed] = await Promise.all([
            getOpenTrades(),
            getClosedTrades()
        ]);
        setOpenTrades(open);
        setClosedTrades(closed);
        setLoadingTrades(false);
    };

    useEffect(() => {
        if (user && isSubscribed) {
            fetchTrades();
        }
    }, [user, isSubscribed]);

    // Redirect non-subscribers to home
    useEffect(() => {
        if (!authLoading && !subLoading) {
            if (!user || !isSubscribed) {
                router.push("/");
            }
        }
    }, [user, isSubscribed, authLoading, subLoading, router]);

    // Show loading while checking auth/subscription
    if (authLoading || subLoading || !user || !isSubscribed) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const handleTradeSaved = () => {
        refetch();
        fetchTrades();
    };

    const handleBalanceSaved = () => {
        refetch();
    };

    const handleClosePosition = (trade: FuturesTrade) => {
        setSelectedOpenTrade(trade);
        setIsCloseDialogOpen(true);
    };

    const handlePositionClosed = () => {
        refetch();
        fetchTrades();
        setSelectedOpenTrade(null);
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
                    <Button size="sm" onClick={() => setIsOpenPositionDialogOpen(true)} className="text-xs sm:text-sm bg-primary">
                        🚀 Open Position
                    </Button>
                </div>
            </div>

            {/* Open Positions Alert */}
            {openTrades.length > 0 && (
                <Card className="border-primary/50 bg-primary/5">
                    <CardContent className="py-3 px-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Rocket className="h-5 w-5 text-primary" />
                            <span className="font-medium">{openTrades.length} Posisi Terbuka</span>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => document.querySelector('[data-value="open"]')?.dispatchEvent(new Event('click', { bubbles: true }))}>
                            Lihat Posisi
                        </Button>
                    </CardContent>
                </Card>
            )}

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
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
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

            {/* Tabs: Open Positions & Trade History */}
            <Tabs defaultValue="open" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="open" className="flex items-center gap-2" data-value="open">
                        <Rocket className="h-4 w-4" />
                        Open Positions
                        {openTrades.length > 0 && (
                            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                                {openTrades.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Riwayat Trade
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="open">
                    {loadingTrades ? (
                        <div className="text-center py-8 text-muted-foreground">Memuat...</div>
                    ) : openTrades.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Rocket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">Tidak ada posisi terbuka</h3>
                                <p className="text-muted-foreground text-sm mb-4">
                                    Catat kondisi psikologis dan setup teknikal saat membuka posisi baru!
                                </p>
                                <Button onClick={() => setIsOpenPositionDialogOpen(true)}>
                                    🚀 Open Position
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {openTrades.map((trade) => (
                                <OpenPositionCard
                                    key={trade.id}
                                    trade={trade}
                                    onClose={handleClosePosition}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="history">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Riwayat Trade ({closedTrades.length})</CardTitle>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsTradeDialogOpen(true)}
                                className="text-xs"
                            >
                                + Catat Manual
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <TradeTable trades={closedTrades} onRefresh={() => { refetch(); fetchTrades(); }} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Dialogs */}
            <OpenPositionDialog
                open={isOpenPositionDialogOpen}
                onOpenChange={setIsOpenPositionDialogOpen}
                onSave={handleTradeSaved}
            />
            <ClosePositionDialog
                trade={selectedOpenTrade}
                open={isCloseDialogOpen}
                onOpenChange={setIsCloseDialogOpen}
                onSave={handlePositionClosed}
            />
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
