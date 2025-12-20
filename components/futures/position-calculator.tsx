"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormatCurrency } from "@/hooks/use-format-currency";
import { Calculator, TrendingUp, TrendingDown, DollarSign, Percent, Scale } from "lucide-react";

export function PositionCalculator() {
    const { formatCurrency } = useFormatCurrency();

    // Input states
    const [entryPrice, setEntryPrice] = useState<string>("50000");
    const [slPrice, setSlPrice] = useState<string>("49000");
    const [tpPrice, setTpPrice] = useState<string>("52000");
    const [riskAmount, setRiskAmount] = useState<string>("100");
    const [leverage, setLeverage] = useState<string>("10");

    // Parse values
    const entry = parseFloat(entryPrice) || 0;
    const sl = parseFloat(slPrice) || 0;
    const tp = parseFloat(tpPrice) || 0;
    const risk = parseFloat(riskAmount) || 0;
    const lev = parseFloat(leverage) || 1;

    // Calculations
    const slDistance = Math.abs(entry - sl);
    const tpDistance = Math.abs(tp - entry);
    const slPercent = entry > 0 ? (slDistance / entry) * 100 : 0;
    const tpPercent = entry > 0 ? (tpDistance / entry) * 100 : 0;

    // Position Size = Risk Amount / SL Distance (in price)
    // This gives the quantity of the asset
    const positionSizeQty = slDistance > 0 ? risk / slDistance : 0;

    // Position Size in USD = Quantity * Entry Price
    const positionSizeUSD = positionSizeQty * entry;

    // Margin = Position Size / Leverage
    const marginRequired = positionSizeUSD / lev;

    // Reward = Quantity * TP Distance
    const potentialReward = positionSizeQty * tpDistance;

    // RRR
    const rrr = risk > 0 ? potentialReward / risk : 0;

    // Determine if Long or Short
    const isLong = tp > entry;

    return (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    Position Size Calculator
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Input Row 1: Prices */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="entry-price" className="flex items-center gap-1.5 text-xs">
                            <DollarSign className="h-3 w-3" /> Harga Entry
                        </Label>
                        <Input
                            id="entry-price"
                            type="number"
                            value={entryPrice}
                            onChange={(e) => setEntryPrice(e.target.value)}
                            placeholder="50000"
                            className="font-mono"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="sl-price" className="flex items-center gap-1.5 text-xs text-red-500">
                            <TrendingDown className="h-3 w-3" /> Harga SL
                        </Label>
                        <Input
                            id="sl-price"
                            type="number"
                            value={slPrice}
                            onChange={(e) => setSlPrice(e.target.value)}
                            placeholder="49000"
                            className="font-mono border-red-500/30 focus-visible:ring-red-500/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tp-price" className="flex items-center gap-1.5 text-xs text-emerald-500">
                            <TrendingUp className="h-3 w-3" /> Harga TP
                        </Label>
                        <Input
                            id="tp-price"
                            type="number"
                            value={tpPrice}
                            onChange={(e) => setTpPrice(e.target.value)}
                            placeholder="52000"
                            className="font-mono border-emerald-500/30 focus-visible:ring-emerald-500/50"
                        />
                    </div>
                </div>

                {/* Input Row 2: Risk & Leverage */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="risk-amount" className="flex items-center gap-1.5 text-xs">
                            <Percent className="h-3 w-3" /> Risk per Trade ($)
                        </Label>
                        <Input
                            id="risk-amount"
                            type="number"
                            value={riskAmount}
                            onChange={(e) => setRiskAmount(e.target.value)}
                            placeholder="100"
                            className="font-mono"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="leverage" className="flex items-center gap-1.5 text-xs">
                            <Scale className="h-3 w-3" /> Leverage
                        </Label>
                        <Input
                            id="leverage"
                            type="number"
                            value={leverage}
                            onChange={(e) => setLeverage(e.target.value)}
                            placeholder="10"
                            className="font-mono"
                        />
                    </div>
                </div>

                {/* Results */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border/50">
                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Position Size</Label>
                        <div className="h-10 px-3 py-2 bg-secondary rounded-md font-mono text-lg font-bold flex items-center">
                            {formatCurrency(positionSizeUSD)}
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                            ({positionSizeQty.toFixed(4)} units)
                        </p>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Margin Awal</Label>
                        <div className="h-10 px-3 py-2 bg-blue-500/10 rounded-md font-mono text-lg font-bold text-blue-500 flex items-center">
                            {formatCurrency(marginRequired)}
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                            SL: {slPercent.toFixed(2)}% dari entry
                        </p>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Reward (Potensi Profit)</Label>
                        <div className="h-10 px-3 py-2 bg-emerald-500/10 rounded-md font-mono text-lg font-bold text-emerald-500 flex items-center justify-between">
                            <span>{formatCurrency(potentialReward)}</span>
                            <span className="text-xs opacity-70">RRR 1:{rrr.toFixed(1)}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                            TP: {tpPercent.toFixed(2)}% dari entry
                        </p>
                    </div>
                </div>

                {/* Formula hint */}
                <p className="text-xs text-muted-foreground pt-2 border-t border-border/30">
                    <span className="font-medium">Formula:</span> Position Size = Risk ÷ |Entry - SL| × Entry Price |
                    Margin = Position Size ÷ Leverage |
                    Reward = Qty × |TP - Entry|
                </p>
            </CardContent>
        </Card>
    );
}
