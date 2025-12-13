"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EquityChart } from "@/components/dashboard/equity-chart";
import { CalendarHeatmap } from "@/components/dashboard/calendar-heatmap";
import { AllocationChart } from "@/components/dashboard/allocation-chart";
import { formatPercent } from "@/lib/calculations";
import { useFormatCurrency } from "@/hooks/use-format-currency";
import { getFuturesStats, getCurrentBalance, getSpotHoldingsSummary, getFuturesTrades } from "@/lib/data-service";

export default function DashboardPage() {
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

  // Mock prices for spot calculation
  const mockPrices: Record<string, number> = {
    BTC: 100500,
    ETH: 3850,
    SOL: 220,
  };

  const fetchData = useCallback(async () => {
    setLoading(true);

    const [stats, balance, holdings, trades] = await Promise.all([
      getFuturesStats(),
      getCurrentBalance(),
      getSpotHoldingsSummary(),
      getFuturesTrades(),
    ]);

    // Calculate spot values
    let spotValue = 0;
    let spotCost = 0;
    const allocation: Array<{ symbol: string; name: string; value: number }> = [];

    holdings.forEach(h => {
      const currentPrice = mockPrices[h.symbol] || h.avgBuyPrice;
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
  const totalPnLPercent = (data.futuresBalance + data.spotCost) > 0
    ? (totalPnL / (data.futuresBalance - data.futuresPnL + data.spotCost)) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview portfolio Anda</p>
      </div>

      {/* Total Portfolio Card */}
      <Card className="bg-gradient-to-br from-card to-secondary/20">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
              Total Portfolio Value
            </p>
            <p className="text-4xl font-bold font-mono mb-2">
              {loading ? "..." : formatCurrency(totalPortfolio)}
            </p>
            {!loading && (
              <Badge
                variant={totalPnL >= 0 ? "default" : "destructive"}
                className={totalPnL >= 0 ? "bg-profit hover:bg-green-700" : ""}
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
            <span>📈</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {loading ? "..." : formatCurrency(data.futuresBalance)}
            </div>
            <p className={`text-sm ${data.futuresPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
              P&L: {data.futuresPnL >= 0 ? '+' : ''}{formatCurrency(data.futuresPnL)}
            </p>
          </CardContent>
        </Card>

        {/* Spot Value */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Spot Portfolio
            </CardTitle>
            <span>💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {loading ? "..." : formatCurrency(data.spotValue)}
            </div>
            <p className={`text-sm ${data.spotPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
              P&L: {data.spotPnL >= 0 ? '+' : ''}{formatCurrency(data.spotPnL)}
            </p>
          </CardContent>
        </Card>

        {/* Win Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Win Rate
            </CardTitle>
            <span>🎯</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {data.winRate.toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground">
              {data.totalTrades} total trades
            </p>
          </CardContent>
        </Card>

        {/* Avg RRR */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Profit Factor
            </CardTitle>
            <span>⚖️</span>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold font-mono ${data.profitFactor >= 1 ? 'text-profit' : 'text-loss'}`}>
              {data.profitFactor.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">
              RRR: 1:{data.avgRRR.toFixed(1)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle>Trading Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <CalendarHeatmap data={calendarData} />
          </CardContent>
        </Card>

        {/* Allocation Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Spot Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <AllocationChart data={allocationData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
