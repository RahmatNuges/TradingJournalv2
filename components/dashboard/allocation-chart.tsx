"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatCurrency } from "@/lib/calculations";

interface AllocationChartProps {
    data: Array<{ symbol: string; name: string; value: number }>;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export function AllocationChart({ data }: AllocationChartProps) {
    if (data.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Belum ada holding spot
            </div>
        );
    }

    const totalValue = data.reduce((sum, item) => sum + item.value, 0);

    const chartData = data.map(item => ({
        ...item,
        percentage: totalValue > 0 ? (item.value / totalValue) * 100 : 0,
    }));

    return (
        <div className="h-[300px]">
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
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                        }}
                    />
                    <Legend
                        formatter={(value, entry) => {
                            const item = chartData.find(d => d.symbol === value);
                            return `${value} (${item?.percentage.toFixed(1)}%)`;
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
