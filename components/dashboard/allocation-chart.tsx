"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";


interface AllocationChartProps {
    data: Array<{ symbol: string; name: string; value: number }>;
}

interface ChartDataItem {
    symbol: string;
    name: string;
    value: number;
    percentage: number;
    [key: string]: string | number;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

// Custom tooltip component for better visibility
interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ payload: ChartDataItem; color: string }>;
    formatCurrency: (value: number) => string;
}

function CustomTooltip({ active, payload, formatCurrency }: CustomTooltipProps) {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload;
    const color = payload[0].color;

    return (
        <div className="bg-popover border border-border rounded-lg shadow-xl p-3 min-w-[140px]">
            <div
                className="flex items-center gap-2 mb-2 px-2 py-1 rounded-md"
                style={{ backgroundColor: `${color}20` }}
            >
                <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                />
                <span className="font-semibold text-foreground">{data.symbol}</span>
            </div>
            <div className="space-y-1 text-sm">
                <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Value:</span>
                    <span className="font-mono font-medium text-foreground">{formatCurrency(data.value)}</span>
                </div>
                <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Share:</span>
                    <span className="font-mono font-medium text-foreground">{data.percentage.toFixed(1)}%</span>
                </div>
            </div>
        </div>
    );
}

import { useFormatCurrency } from "@/hooks/use-format-currency";

export function AllocationChart({ data }: AllocationChartProps) {
    const { formatCurrency } = useFormatCurrency();
    if (data.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Belum ada holding spot
            </div>
        );
    }

    const totalValue = data.reduce((sum, item) => sum + item.value, 0);

    const chartData: ChartDataItem[] = data.map(item => ({
        ...item,
        percentage: totalValue > 0 ? (item.value / totalValue) * 100 : 0,
    }));

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="symbol"
                        stroke="none"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
                    <Legend
                        formatter={(value) => {
                            const item = chartData.find(d => d.symbol === value);
                            return `${value} (${item?.percentage.toFixed(1)}%)`;
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
