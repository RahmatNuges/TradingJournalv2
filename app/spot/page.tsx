"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HoldingsTable } from "@/components/spot/holdings-table";
import { TransactionDialog } from "@/components/spot/transaction-dialog";
import { formatPercent } from "@/lib/calculations";
import { useFormatCurrency } from "@/hooks/use-format-currency";
import { useAuth } from "@/contexts/auth-context";
import { useSubscription } from "@/contexts/subscription-context";
import { Wallet, CircleDollarSign, TrendingUp, Percent } from "lucide-react";
import { useSpotData } from "@/hooks/use-spot-data";

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
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { isSubscribed, isLoading: subLoading } = useSubscription();
    const { formatCurrency } = useFormatCurrency();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Use React Query hook
    const { data, isLoading: dataLoading, refetch } = useSpotData();
    const loading = dataLoading || authLoading || subLoading;

    // Default empty data if loading
    const safeData = data || {
        holdings: [],
        totalValue: 0,
        totalCost: 0,
        totalPnL: 0,
        totalPnLPercent: 0
    };

    const {
        holdings: holdingsWithAllocation,
        totalValue,
        totalCost,
        totalPnL,
        totalPnLPercent
    } = safeData;

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

    const handleTransactionSaved = () => {
        refetch();
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="relative overflow-hidden border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <Wallet className="h-24 w-24 text-emerald-500" />
                    </div>
                    <CardHeader className="p-6 pb-2 relative z-10">
                        <p className="text-sm font-medium text-emerald-500">Total Asset Value</p>
                    </CardHeader>
                    <CardContent className="p-6 pt-0 relative z-10">
                        <p className="text-2xl sm:text-3xl font-bold font-mono tracking-tight truncate" title={formatCurrency(totalValue)}>
                            {loading ? "..." : formatCurrency(totalValue)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Estimasi nilai aset saat ini</p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden hover:bg-card/80 transition-colors">
                    <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between space-y-0">
                        <p className="text-sm font-medium text-muted-foreground">Total Cost</p>
                        <div className="p-2 bg-secondary rounded-lg">
                            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                        <p className="text-xl sm:text-2xl font-bold font-mono text-muted-foreground/80 truncate" title={formatCurrency(totalCost)}>
                            {loading ? "..." : formatCurrency(totalCost)}
                        </p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden hover:bg-card/80 transition-colors">
                    <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between space-y-0">
                        <p className="text-sm font-medium text-muted-foreground">Total P&L</p>
                        <div className={`p-2 rounded-lg ${totalPnL >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                            <TrendingUp className={`h-4 w-4 ${totalPnL >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                        <p className={`text-xl sm:text-2xl font-bold font-mono ${totalPnL >= 0 ? 'text-emerald-500' : 'text-red-500'} truncate`} title={formatCurrency(totalPnL)}>
                            {loading ? "..." : `${totalPnL >= 0 ? '+' : ''}${formatCurrency(totalPnL)}`}
                        </p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden hover:bg-card/80 transition-colors">
                    <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between space-y-0">
                        <p className="text-sm font-medium text-muted-foreground">Return %</p>
                        <div className={`p-2 rounded-lg ${totalPnLPercent >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                            <Percent className={`h-4 w-4 ${totalPnLPercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                        {!loading && (
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${totalPnLPercent >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                                }`}>
                                {formatPercent(totalPnLPercent)}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Holdings Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Holdings ({holdingsWithAllocation.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <HoldingsTable holdings={holdingsWithAllocation} onRefresh={refetch} />
                </CardContent>
            </Card>

            {/* Portfolio Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Allocation Overview */}
                <Card className="border-emerald-500/10 shadow-lg shadow-emerald-500/5">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                                <Wallet className="h-4 w-4 text-emerald-500" />
                            </div>
                            Alokasi Portfolio
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {holdingsWithAllocation.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                <CircleDollarSign className="h-12 w-12 mb-3 text-muted-foreground/20" />
                                <p>Belum ada aset</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {holdingsWithAllocation.slice(0, 5).map((holding) => (
                                    <div key={holding.symbol} className="group">
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="font-medium group-hover:text-emerald-500 transition-colors">{holding.symbol}</span>
                                            <span className="text-muted-foreground font-mono">
                                                {holding.allocation?.toFixed(1) || '0.0'}%
                                            </span>
                                        </div>
                                        <div className="h-2.5 bg-secondary/50 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500 ease-out group-hover:shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                                style={{ width: `${Math.min(holding.allocation || 0, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                                {holdingsWithAllocation.length > 5 && (
                                    <p className="text-xs text-center text-muted-foreground pt-2">
                                        +{holdingsWithAllocation.length - 5} aset lainnya
                                    </p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="border-primary/10 shadow-lg shadow-primary/5">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <TrendingUp className="h-4 w-4 text-primary" />
                            </div>
                            Statistik Cepat
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors border border-transparent hover:border-border/50">
                            <p className="text-sm text-muted-foreground mb-1">Total Aset</p>
                            <p className="text-2xl font-bold">{holdingsWithAllocation.length}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors border border-emerald-500/10">
                            <p className="text-sm text-muted-foreground mb-1">Aset Profit</p>
                            <p className="text-2xl font-bold text-emerald-500">
                                {holdingsWithAllocation.filter(h => (h.pnl || 0) > 0).length}
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-red-500/5 hover:bg-red-500/10 transition-colors border border-red-500/10">
                            <p className="text-sm text-muted-foreground mb-1">Aset Loss</p>
                            <p className="text-2xl font-bold text-red-500">
                                {holdingsWithAllocation.filter(h => (h.pnl || 0) < 0).length}
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors border border-transparent hover:border-border/50">
                            <p className="text-sm text-muted-foreground mb-1">Avg Cost</p>
                            <p className="text-xl font-bold font-mono truncate" title={formatCurrency(holdingsWithAllocation.length > 0 ? totalCost / holdingsWithAllocation.length : 0)}>
                                {holdingsWithAllocation.length > 0
                                    ? formatCurrency(totalCost / holdingsWithAllocation.length)
                                    : formatCurrency(0)
                                }
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Trading Tips */}
            <Card className="bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent border-emerald-500/20">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-emerald-500">
                        <div className="p-1.5 bg-emerald-500/20 rounded-md">
                            💡
                        </div>
                        Tips DCA & HODL
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-card/50 backdrop-blur border border-border/50 p-5 rounded-xl hover:border-emerald-500/30 transition-colors">
                            <p className="font-semibold mb-2 text-emerald-500 flex items-center gap-2">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">Strategy</span>
                                Dollar Cost Averaging
                            </p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Beli secara berkala (misal setiap bulan) untuk meratakan harga beli rata-rata Anda dan mengurangi dampak volatilitas.
                            </p>
                        </div>
                        <div className="bg-card/50 backdrop-blur border border-border/50 p-5 rounded-xl hover:border-emerald-500/30 transition-colors">
                            <p className="font-semibold mb-2 text-emerald-500 flex items-center gap-2">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">Risk</span>
                                Diversifikasi
                            </p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Jangan taruh semua telur di satu keranjang. Spread modal ke beberapa aset bluechip dan potensial.
                            </p>
                        </div>
                        <div className="bg-card/50 backdrop-blur border border-border/50 p-5 rounded-xl hover:border-emerald-500/30 transition-colors">
                            <p className="font-semibold mb-2 text-emerald-500 flex items-center gap-2">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">Mindset</span>
                                Long-term Vision
                            </p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                HODL dengan sabar. Market crypto volatile dalam jangka pendek, fokus pada fundamental jangka panjang.
                            </p>
                        </div>
                    </div>
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
