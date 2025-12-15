"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EquityChart } from "@/components/dashboard/equity-chart";
import { CalendarHeatmap } from "@/components/dashboard/calendar-heatmap";
import { AllocationChart } from "@/components/dashboard/allocation-chart";
import { PortfolioDistribution } from "@/components/dashboard/portfolio-distribution";
import { useFormatCurrency } from "@/hooks/use-format-currency";
import { TrendingUp, Wallet, Target, Scale, GripHorizontal } from "lucide-react";
import { useDashboardData } from "@/hooks/use-dashboard-data";

export function DashboardView() {
    const { formatCurrency } = useFormatCurrency();
    const { data, isLoading: loading } = useDashboardData();

    // Default values if data is loading or undefined
    const safeData = data || {
        futuresBalance: 0,
        futuresPnL: 0,
        spotValue: 0,
        spotCost: 0,
        spotPnL: 0,
        winRate: 0,
        avgRRR: 0,
        totalTrades: 0,
        profitFactor: 0,
        calendarData: [],
        allocationData: [],
    };

    const totalPortfolio = safeData.futuresBalance + safeData.spotValue;
    const totalPnL = safeData.futuresPnL + safeData.spotPnL;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground mt-1">Overview portfolio Anda</p>
            </div>

            {/* Total Portfolio Card + Distribution Chart - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Total Portfolio Card */}
                <Card className="relative overflow-hidden border-border shadow-lg bg-card text-card-foreground transition-all hover:shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
                    <div className="absolute top-0 right-0 p-6 opacity-0">
                        <GripHorizontal className="h-24 w-24 text-foreground" />
                    </div>
                    <CardContent className="pt-8 pb-8 relative z-10 h-full flex flex-col justify-center items-center text-center">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-3">
                            Total Net Worth
                        </p>
                        <div className="flex items-baseline justify-center gap-1 mb-6">
                            <span className="text-muted-foreground/50 text-2xl md:text-3xl font-bold">
                                {safeData.futuresBalance + safeData.spotValue < 0 ? "-" : ""}
                            </span>
                            <span className="text-4xl sm:text-5xl md:text-7xl font-bold font-mono tracking-tighter text-foreground drop-shadow-sm">
                                {loading ? "..." : formatCurrency(Math.abs(totalPortfolio)).replace(/[^0-9.,]/g, '')}
                            </span>
                            <span className="text-muted-foreground/50 text-sm md:text-xl font-bold ml-1">
                                {formatCurrency(0).replace(/[0-9.,]/g, '')}
                            </span>
                        </div>

                        {!loading && (
                            <div className="flex items-center gap-4">
                                <Badge
                                    variant="outline"
                                    className={`text-sm px-3 py-1 font-medium border-0 ${totalPnL >= 0
                                        ? "bg-emerald-500/10 text-emerald-500"
                                        : "bg-red-500/10 text-red-500"
                                        }`}
                                >
                                    {totalPnL >= 0 ? "+" : ""}{formatCurrency(totalPnL)}
                                </Badge>
                                <span className="text-muted-foreground/30">|</span>
                                <Badge
                                    variant="outline"
                                    className={`text-sm px-3 py-1 font-medium border-0 ${totalPnL >= 0
                                        ? "bg-emerald-500/10 text-emerald-500"
                                        : "bg-red-500/10 text-red-500"
                                        }`}
                                >
                                    {totalPnL >= 0 ? "+" : ""}{((totalPnL / (totalPortfolio - totalPnL)) * 100).toFixed(2)}%
                                </Badge>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Portfolio Distribution - Next to Portfolio Value */}
                <Card className="overflow-hidden bg-card hover:bg-accent/5 transition-colors border-border/50 shadow-sm">
                    <CardHeader className="pb-2 border-b">
                        <CardTitle className="flex items-center gap-2 text-base font-medium text-muted-foreground">
                            <div className="p-1.5 rounded-md bg-secondary">
                                <PieChartIcon className="h-4 w-4 text-foreground" />
                            </div>
                            Portfolio Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <PortfolioDistribution
                            spotValue={safeData.spotValue}
                            futuresValue={safeData.futuresBalance}
                            compact
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Summary Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Futures Balance - Blue Tint */}
                <Card className="relative overflow-hidden border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 transition-colors shadow-sm group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-500 group-hover:text-blue-400 transition-colors">
                            Futures Balance
                        </CardTitle>
                        <div className="p-2 bg-blue-500/10 rounded-full group-hover:bg-blue-500/20 transition-colors">
                            <TrendingUp className="h-4 w-4 text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-mono">
                            {loading ? "..." : formatCurrency(safeData.futuresBalance)}
                        </div>
                        <p className={`text-sm mt-1 font-medium flex items-center gap-1 ${safeData.futuresPnL >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {safeData.futuresPnL >= 0 ? '+' : ''}{formatCurrency(safeData.futuresPnL)}
                            <span className="text-[10px] opacity-70 text-muted-foreground">P&L</span>
                        </p>
                    </CardContent>
                </Card>

                {/* Spot Value - Emerald Tint */}
                <Card className="relative overflow-hidden border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors shadow-sm group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-500 group-hover:text-emerald-400 transition-colors">
                            Spot Portfolio
                        </CardTitle>
                        <div className="p-2 bg-emerald-500/10 rounded-full group-hover:bg-emerald-500/20 transition-colors">
                            <Wallet className="h-4 w-4 text-emerald-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-mono">
                            {loading ? "..." : formatCurrency(safeData.spotValue)}
                        </div>
                        <p className={`text-sm mt-1 font-medium flex items-center gap-1 ${safeData.spotPnL >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {safeData.spotPnL >= 0 ? '+' : ''}{formatCurrency(safeData.spotPnL)}
                            <span className="text-[10px] opacity-70 text-muted-foreground">P&L</span>
                        </p>
                    </CardContent>
                </Card>

                {/* Win Rate */}
                <Card className="bg-card hover:bg-card/80 transition-colors border-border/50 shadow-sm group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                            Win Rate
                        </CardTitle>
                        <div className="p-2 bg-secondary rounded-full group-hover:bg-secondary/80 transition-colors">
                            <Target className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold font-mono ${safeData.winRate >= 50 ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                            {safeData.winRate.toFixed(1)}%
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            {safeData.totalTrades} total trades
                        </p>
                    </CardContent>
                </Card>

                {/* Profit Factor */}
                <Card className="bg-card hover:bg-card/80 transition-colors border-border/50 shadow-sm group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                            Profit Factor
                        </CardTitle>
                        <div className="p-2 bg-secondary rounded-full group-hover:bg-secondary/80 transition-colors">
                            <Scale className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold font-mono ${safeData.profitFactor >= 1.5 ? 'text-emerald-500' : safeData.profitFactor >= 1 ? 'text-blue-500' : 'text-red-500'}`}>
                            {safeData.profitFactor.toFixed(2)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            RRR: 1:{safeData.avgRRR.toFixed(1)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trading Calendar */}
                <Card className="overflow-hidden bg-card hover:bg-card/80 transition-colors border-border/50 shadow-sm">
                    <CardHeader className="pb-2 border-b">
                        <CardTitle className="flex items-center gap-2 text-base font-medium text-muted-foreground">
                            <div className="p-1.5 rounded-md bg-secondary">
                                <LayoutGridIcon className="h-4 w-4 text-foreground" />
                            </div>
                            Trading Calendar
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <CalendarHeatmap data={safeData.calendarData} />
                    </CardContent>
                </Card>

                {/* Allocation Chart */}
                <Card className="overflow-hidden bg-card hover:bg-card/80 transition-colors border-border/50 shadow-sm">
                    <CardHeader className="pb-2 border-b">
                        <CardTitle className="flex items-center gap-2 text-base font-medium text-muted-foreground">
                            <div className="p-1.5 rounded-md bg-secondary">
                                <PieChartIcon className="h-4 w-4 text-foreground" />
                            </div>
                            Spot Allocation
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <AllocationChart data={safeData.allocationData} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function LayoutGridIcon(props: React.ComponentProps<'svg'>) {
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

function PieChartIcon(props: React.ComponentProps<'svg'>) {
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
