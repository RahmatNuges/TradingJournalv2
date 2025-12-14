"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatCurrency } from "@/lib/calculations";

interface PortfolioDistributionProps {
    spotValue: number;
    futuresValue: number;
    compact?: boolean;
}

interface DataItem {
    name: string;
    value: number;
    percentage: number;
    [key: string]: string | number;
}

const COLORS = ['#10b981', '#3b82f6']; // Emerald (Spot) & Blue (Futures)

// Custom tooltip component for better visibility
interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ payload: DataItem; color: string }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
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
                <span className="font-semibold text-foreground">{data.name}</span>
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

export function PortfolioDistribution({ spotValue, futuresValue, compact = false }: PortfolioDistributionProps) {
    const totalValue = spotValue + futuresValue;
    const data: DataItem[] = [
        { name: 'Spot', value: spotValue, percentage: totalValue > 0 ? (spotValue / totalValue) * 100 : 0 },
        { name: 'Futures', value: futuresValue, percentage: totalValue > 0 ? (futuresValue / totalValue) * 100 : 0 },
    ];

    const height = compact ? 200 : 300;
    const innerRadius = compact ? 45 : 60;
    const outerRadius = compact ? 75 : 100;

    if (totalValue === 0) {
        return (
            <div className={`h-[${height}px] flex items-center justify-center text-muted-foreground`}>
                No portfolio data
            </div>
        );
    }

    return (
        <div style={{ height: `${height}px` }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={innerRadius}
                        outerRadius={outerRadius}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index]} stroke="none" />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        formatter={(value) => {
                            const item = data.find(d => d.name === value);
                            return `${value} (${item?.percentage.toFixed(1)}%)`;
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
