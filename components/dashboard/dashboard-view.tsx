"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EquityChart } from "@/components/dashboard/equity-chart";
import { CalendarHeatmap } from "@/components/dashboard/calendar-heatmap";
import { AllocationChart } from "@/components/dashboard/allocation-chart";
import { useFormatCurrency } from "@/hooks/use-format-currency";
import { getFuturesStats, getCurrentBalance, getSpotHoldingsSummary, getFuturesTrades } from "@/lib/data-service";
import { getCurrentPrices } from "@/lib/price-service";
import { TrendingUp, Wallet, Target, Scale, GripHorizontal } from "lucide-react";

export function DashboardView() {
    const { formatCurrency } = useFormatCurrency();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        futuresBalance: 0,
        futuresPnL: 0,
        spotValue: 0,
        spotCost: 0,
        spotPnL: 0,
        winRate: 0,
        avgRRR: 0,
        totalTrades: 0,
        profitFactor: 0,
    });
    const [calendarData, setCalendarData] = useState<Array<{ date: string; pnl: number }>>([]);
    const [allocationData, setAllocationData] = useState<Array<{ symbol: string; name: string; value: number }>>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);

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

        setData({
            futuresBalance: balance,
            futuresPnL: stats.totalPnL,
            spotValue,
            spotCost,
            spotPnL: spotValue - spotCost,
            winRate: stats.winRate,
            avgRRR: stats.avgRRR,
            totalTrades: stats.totalTrades,
            profitFactor: stats.profitFactor,
        });
        setCalendarData(calendar);
        setAllocationData(allocation);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const totalPortfolio = data.futuresBalance + data.spotValue;
    const totalPnL = data.futuresPnL + data.spotPnL;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground mt-1">Overview portfolio Anda</p>
            </div>

            {/* Total Portfolio Card */}
            <Card className="bg-gradient-to-br from-card to-secondary/30 border-primary/10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5">
                    <GripHorizontal className="h-24 w-24" />
                </div>
                <CardContent className="pt-6 relative z-10">
                    <div className="text-center">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-3">
                            Total Portfolio Value
                        </p>
                        <p className="text-4xl md:text-5xl font-bold font-mono tracking-tight mb-4">
                            {loading ? "..." : formatCurrency(totalPortfolio)}
                        </p>
                        {!loading && (
                            <Badge
                                variant={totalPnL >= 0 ? "default" : "destructive"}
                                className={`text-base px-4 py-1.5 transition-colors ${totalPnL >= 0
                                    ? "bg-profit/10 text-profit hover:bg-profit/20 border-profit/20 border"
                                    : "bg-loss/10 text-loss hover:bg-loss/20 border-loss/20 border"}`}
                            >
                                {totalPnL >= 0 ? "+" : ""}{formatCurrency(totalPnL)}
                            </Badge>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Summary Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Futures Balance */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Futures Balance
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-mono">
                            {loading ? "..." : formatCurrency(data.futuresBalance)}
                        </div>
                        <p className={`text-sm mt-1 font-medium ${data.futuresPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
                            {data.futuresPnL >= 0 ? '+' : ''}{formatCurrency(data.futuresPnL)} P&L
                        </p>
                    </CardContent>
                </Card>

                {/* Spot Value */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Spot Portfolio
                        </CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-mono">
                            {loading ? "..." : formatCurrency(data.spotValue)}
                        </div>
                        <p className={`text-sm mt-1 font-medium ${data.spotPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
                            {data.spotPnL >= 0 ? '+' : ''}{formatCurrency(data.spotPnL)} P&L
                        </p>
                    </CardContent>
                </Card>

                {/* Win Rate */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Win Rate
                        </CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold font-mono ${data.winRate >= 50 ? 'text-profit' : 'text-muted-foreground'}`}>
                            {data.winRate.toFixed(1)}%
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            {data.totalTrades} total trades
                        </p>
                    </CardContent>
                </Card>

                {/* Profit Factor */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Profit Factor
                        </CardTitle>
                        <Scale className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold font-mono ${data.profitFactor >= 1.5 ? 'text-profit' : data.profitFactor >= 1 ? 'text-primary' : 'text-loss'}`}>
                            {data.profitFactor.toFixed(2)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            RRR: 1:{data.avgRRR.toFixed(1)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Calendar Heatmap */}
                <Card className="overflow-hidden">
                    <CardHeader className="border-b bg-muted/40 pb-4">
                        <CardTitle className="flex items-center gap-2">
                            <LayoutGridIcon className="h-4 w-4 text-muted-foreground" />
                            Trading Calendar
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <CalendarHeatmap data={calendarData} />
                    </CardContent>
                </Card>

                {/* Allocation Chart */}
                <Card className="overflow-hidden">
                    <CardHeader className="border-b bg-muted/40 pb-4">
                        <CardTitle className="flex items-center gap-2">
                            <PieChartIcon className="h-4 w-4 text-muted-foreground" />
                            Spot Allocation
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <AllocationChart data={allocationData} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function LayoutGridIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="7" height="7" x="3" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="14" rx="1" />
            <rect width="7" height="7" x="3" y="14" rx="1" />
        </svg>
    )
}

function PieChartIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
            <path d="M22 12A10 10 0 0 0 12 2v10z" />
        </svg>
    )
}
