"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculatePositionSize, formatCurrency } from "@/lib/calculations";

export function PositionCalculator() {
    const [riskAmount, setRiskAmount] = useState<string>("100");
    const [stopLossPercent, setStopLossPercent] = useState<string>("2");
    const [leverage, setLeverage] = useState<string>("10");

    const risk = parseFloat(riskAmount) || 0;
    const sl = parseFloat(stopLossPercent) || 0;
    const lev = parseFloat(leverage) || 1;

    // Position Size = Risk Amount / (Stop Loss % / 100)
    const positionSize = calculatePositionSize(risk, sl);
    // Margin = Position Size / Leverage
    const marginRequired = positionSize / lev;

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    🧮 Position Size Calculator
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div className="space-y-2">
                        <Label htmlFor="risk-amount">Risk Amount ($)</Label>
                        <Input
                            id="risk-amount"
                            type="number"
                            value={riskAmount}
                            onChange={(e) => setRiskAmount(e.target.value)}
                            placeholder="100"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="stop-loss">Stop Loss (%)</Label>
                        <Input
                            id="stop-loss"
                            type="number"
                            value={stopLossPercent}
                            onChange={(e) => setStopLossPercent(e.target.value)}
                            placeholder="2"
                            step="0.1"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="leverage">Leverage</Label>
                        <Input
                            id="leverage"
                            type="number"
                            value={leverage}
                            onChange={(e) => setLeverage(e.target.value)}
                            placeholder="10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-muted-foreground">Position Size</Label>
                        <div className="h-9 px-3 py-2 bg-secondary rounded-md font-mono text-lg font-bold">
                            {formatCurrency(positionSize)}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-muted-foreground">Margin Required</Label>
                        <div className="h-9 px-3 py-2 bg-green-600/20 rounded-md font-mono text-lg font-bold text-green-500">
                            {formatCurrency(marginRequired)}
                        </div>
                    </div>
                </div>

                <p className="text-xs text-muted-foreground mt-3">
                    Formula: Position Size = Risk Amount ÷ (Stop Loss % ÷ 100)
                </p>
            </CardContent>
        </Card>
    );
}
