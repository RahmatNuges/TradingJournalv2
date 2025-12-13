"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

// Mock equity data - will be replaced with real balance history
const mockEquityData = [
    { date: "1 Dec", balance: 5000 },
    { date: "2 Dec", balance: 5120 },
    { date: "3 Dec", balance: 4980 },
    { date: "4 Dec", balance: 5250 },
    { date: "5 Dec", balance: 5180 },
    { date: "6 Dec", balance: 5420 },
    { date: "7 Dec", balance: 5380 },
    { date: "8 Dec", balance: 5550 },
    { date: "9 Dec", balance: 5620 },
    { date: "10 Dec", balance: 5480 },
    { date: "11 Dec", balance: 5720 },
    { date: "12 Dec", balance: 5850 },
    { date: "13 Dec", balance: 5920 },
];

export function EquityChart() {
    const minBalance = Math.min(...mockEquityData.map((d) => d.balance)) * 0.98;
    const maxBalance = Math.max(...mockEquityData.map((d) => d.balance)) * 1.02;

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={mockEquityData}
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis
                        dataKey="date"
                        stroke="#888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        domain={[minBalance, maxBalance]}
                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#1c1c1c",
                            border: "1px solid #333",
                            borderRadius: "8px",
                        }}
                        labelStyle={{ color: "#888" }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, "Balance"]}
                    />
                    <Line
                        type="monotone"
                        dataKey="balance"
                        stroke="#22c55e"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: "#22c55e" }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
