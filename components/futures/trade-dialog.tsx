"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    calculatePnL,
    calculatePnLPercent,
    calculateFeeAmount,
    calculateRRR,
    determineResult,
    formatCurrency,
} from "@/lib/calculations";
import { useCurrency, Currency } from "@/contexts/currency-context";
import { addFuturesTrade } from "@/lib/data-service";
import { cn } from "@/lib/utils";

interface TradeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave?: () => void;
}

export function TradeDialog({ open, onOpenChange, onSave }: TradeDialogProps) {
    const { exchangeRate } = useCurrency();
    const [saving, setSaving] = useState(false);
    const [inputCurrency, setInputCurrency] = useState<Currency>("USD");

    // Store display values (in selected currency)
    const [displayData, setDisplayData] = useState({
        entryPrice: "",
        exitPrice: "",
        positionSize: "",
        stopLoss: "",
        takeProfit: "",
    });

    const [formData, setFormData] = useState({
        date: new Date().toISOString().slice(0, 16),
        pair: "BTCUSDT",
        direction: "LONG" as "LONG" | "SHORT",
        leverage: "10",
        feePercent: "0.05",
        strategy: "",
        notes: "",
    });

    // Calculated values (always in USD)
    const [usdValues, setUsdValues] = useState({
        entryPrice: 0,
        exitPrice: 0,
        positionSize: 0,
        stopLoss: 0,
        takeProfit: 0,
    });

    // Calculate USD values whenever display values or currency changes
    useEffect(() => {
        const convert = (val: string) => {
            const num = parseFloat(val) || 0;
            return inputCurrency === "IDR" ? num / exchangeRate : num;
        };

        setUsdValues({
            entryPrice: convert(displayData.entryPrice),
            exitPrice: convert(displayData.exitPrice),
            positionSize: convert(displayData.positionSize),
            stopLoss: convert(displayData.stopLoss),
            takeProfit: convert(displayData.takeProfit),
        });
    }, [displayData, inputCurrency, exchangeRate]);

    // Preview values
    const [preview, setPreview] = useState({
        pnl: 0,
        feeAmount: 0,
        netPnl: 0,
        pnlPercent: 0,
        rrr: null as number | null,
        result: "BE" as "WIN" | "LOSS" | "BE",
    });

    // Calculate preview whenever USD values change
    useEffect(() => {
        const entry = usdValues.entryPrice;
        const exit = usdValues.exitPrice;
        const size = usdValues.positionSize;
        const leverage = parseFloat(formData.leverage) || 1;
        const feePercent = parseFloat(formData.feePercent) || 0;
        const sl = usdValues.stopLoss || null;
        const tp = usdValues.takeProfit || null;

        if (entry > 0 && exit > 0 && size > 0) {
            const pnl = calculatePnL(formData.direction, entry, exit, size, leverage);
            const feeAmount = calculateFeeAmount(size, feePercent);
            const netPnl = pnl - feeAmount;
            const pnlPercent = calculatePnLPercent(formData.direction, entry, exit, leverage);
            const rrr = calculateRRR(formData.direction, entry, sl, tp);
            const result = determineResult(netPnl);

            setPreview({ pnl, feeAmount, netPnl, pnlPercent, rrr, result });
        } else {
            setPreview({ pnl: 0, feeAmount: 0, netPnl: 0, pnlPercent: 0, rrr: null, result: "BE" });
        }
    }, [usdValues, formData.direction, formData.leverage, formData.feePercent]);

    // Toggle currency - just switch mode, don't convert values
    const toggleCurrency = () => {
        setInputCurrency(inputCurrency === "USD" ? "IDR" : "USD");
        // Clear display values when switching currency to avoid confusion
        setDisplayData({
            entryPrice: "",
            exitPrice: "",
            positionSize: "",
            stopLoss: "",
            takeProfit: "",
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const tradeData = {
            pair: formData.pair,
            direction: formData.direction,
            leverage: parseFloat(formData.leverage) || 10,
            entry_price: usdValues.entryPrice,
            exit_price: usdValues.exitPrice,
            position_size: usdValues.positionSize,
            fee_percent: parseFloat(formData.feePercent),
            fee_amount: preview.feeAmount,
            pnl: preview.pnl,
            net_pnl: preview.netPnl,
            pnl_percent: preview.pnlPercent,
            rrr: preview.rrr,
            result: preview.result,
            stop_loss: usdValues.stopLoss || null,
            take_profit: usdValues.takeProfit || null,
            strategy: formData.strategy || null,
            notes: formData.notes || null,
            date: formData.date,
        };

        const result = await addFuturesTrade(tradeData);
        setSaving(false);

        if (result) {
            onOpenChange(false);
            onSave?.();
            // Reset form
            setDisplayData({
                entryPrice: "",
                exitPrice: "",
                positionSize: "",
                stopLoss: "",
                takeProfit: "",
            });
            setFormData({
                date: new Date().toISOString().slice(0, 16),
                pair: "BTCUSDT",
                direction: "LONG",
                leverage: "10",
                feePercent: "0.05",
                strategy: "",
                notes: "",
            });
            setInputCurrency("USD");
        }
    };

    const currencyPrefix = inputCurrency === "USD" ? "$" : "Rp";
    const currencyStep = inputCurrency === "USD" ? "0.01" : "1";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="flex flex-row items-center justify-between">
                    <DialogTitle>Catat Trade Baru</DialogTitle>
                    {/* Global Currency Switch - Toggle Style */}
                    <button
                        type="button"
                        onClick={toggleCurrency}
                        className="flex items-center gap-1 p-1 rounded-full bg-secondary border border-border"
                    >
                        <span
                            className={cn(
                                "px-3 py-1 rounded-full text-sm font-medium transition-all",
                                inputCurrency === "USD"
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            $ USD
                        </span>
                        <span
                            className={cn(
                                "px-3 py-1 rounded-full text-sm font-medium transition-all",
                                inputCurrency === "IDR"
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Rp IDR
                        </span>
                    </button>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Row 1: Date, Pair, Direction */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Tanggal & Waktu</Label>
                            <Input
                                type="datetime-local"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Trading Pair</Label>
                            <Input
                                value={formData.pair}
                                onChange={(e) => setFormData({ ...formData, pair: e.target.value.toUpperCase() })}
                                placeholder="BTCUSDT"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Arah</Label>
                            <Select
                                value={formData.direction}
                                onValueChange={(v) => setFormData({ ...formData, direction: v as "LONG" | "SHORT" })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LONG">🟢 LONG</SelectItem>
                                    <SelectItem value="SHORT">🔴 SHORT</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Row 2: Entry, Exit, Leverage */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Entry Price ({currencyPrefix})</Label>
                            <Input
                                type="number"
                                step={currencyStep}
                                value={displayData.entryPrice}
                                onChange={(e) => setDisplayData({ ...displayData, entryPrice: e.target.value })}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Exit Price ({currencyPrefix})</Label>
                            <Input
                                type="number"
                                step={currencyStep}
                                value={displayData.exitPrice}
                                onChange={(e) => setDisplayData({ ...displayData, exitPrice: e.target.value })}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Leverage</Label>
                            <Input
                                type="number"
                                value={formData.leverage}
                                onChange={(e) => setFormData({ ...formData, leverage: e.target.value })}
                                placeholder="10"
                            />
                        </div>
                    </div>

                    {/* Row 3: Position Size, Fee % */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Position Size ({currencyPrefix})</Label>
                            <Input
                                type="number"
                                step={currencyStep}
                                value={displayData.positionSize}
                                onChange={(e) => setDisplayData({ ...displayData, positionSize: e.target.value })}
                                placeholder="100"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Fee % (auto-calculate)</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.feePercent}
                                    onChange={(e) => setFormData({ ...formData, feePercent: e.target.value })}
                                    placeholder="0.05"
                                    className="flex-1"
                                />
                                <div className="px-3 py-2 bg-secondary rounded-md font-mono text-sm">
                                    Fee: {formatCurrency(preview.feeAmount)}
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Default 0.05% × 2 (entry + exit)
                            </p>
                        </div>
                    </div>

                    {/* Row 4: SL, TP (optional) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Stop Loss ({currencyPrefix}) - opsional</Label>
                            <Input
                                type="number"
                                step={currencyStep}
                                value={displayData.stopLoss}
                                onChange={(e) => setDisplayData({ ...displayData, stopLoss: e.target.value })}
                                placeholder="Untuk RRR"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Take Profit ({currencyPrefix}) - opsional</Label>
                            <Input
                                type="number"
                                step={currencyStep}
                                value={displayData.takeProfit}
                                onChange={(e) => setDisplayData({ ...displayData, takeProfit: e.target.value })}
                                placeholder="Untuk RRR"
                            />
                        </div>
                    </div>

                    {/* P&L Preview */}
                    <div className="grid grid-cols-4 gap-3 p-4 bg-secondary/50 rounded-lg">
                        <div className="text-center">
                            <p className="text-xs text-muted-foreground">Gross P&L</p>
                            <p className={`font-mono font-bold ${preview.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {preview.pnl >= 0 ? '+' : ''}{formatCurrency(preview.pnl)}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-muted-foreground">Net P&L</p>
                            <p className={`font-mono font-bold text-lg ${preview.netPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {preview.netPnl >= 0 ? '+' : ''}{formatCurrency(preview.netPnl)}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-muted-foreground">ROE</p>
                            <p className={`font-mono font-bold ${preview.pnlPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {preview.pnlPercent >= 0 ? '+' : ''}{preview.pnlPercent.toFixed(2)}%
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-muted-foreground">RRR</p>
                            <p className="font-mono font-bold">
                                {preview.rrr ? `1:${preview.rrr.toFixed(1)}` : '-'}
                            </p>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label>Catatan (opsional)</Label>
                        <Textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Alasan entry, evaluasi, dll..."
                            rows={3}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={saving}>
                            {saving ? "Menyimpan..." : "Simpan Trade"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
