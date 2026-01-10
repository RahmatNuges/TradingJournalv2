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
import { Badge } from "@/components/ui/badge";
import {
    calculatePnL,
    calculatePnLPercent,
    calculateFeeAmount,
    calculateRRR,
    determineResult,
} from "@/lib/calculations";
import { closePosition } from "@/lib/data-service";
import { useCurrency, Currency } from "@/contexts/currency-context";
import type { FuturesTrade } from "@/types";
import { useFormatCurrency } from "@/hooks/use-format-currency";

interface ClosePositionDialogProps {
    trade: FuturesTrade | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave?: () => void;
}

export function ClosePositionDialog({ trade, open, onOpenChange, onSave }: ClosePositionDialogProps) {
    const { exchangeRate } = useCurrency();
    const { formatCurrency } = useFormatCurrency();
    const [saving, setSaving] = useState(false);
    const [inputCurrency, setInputCurrency] = useState<Currency>("USD");
    const [exitPrice, setExitPrice] = useState("");
    const [feePercent, setFeePercent] = useState("");

    // Preview calculations
    const [preview, setPreview] = useState({
        pnl: 0,
        feeAmount: 0,
        netPnl: 0,
        pnlPercent: 0,
        rrr: null as number | null,
        result: "BE" as "WIN" | "LOSS" | "BE",
    });

    // Reset when dialog opens
    useEffect(() => {
        if (open && trade) {
            setExitPrice("");
            setFeePercent(trade.fee_percent?.toString() || "0.05");
            setInputCurrency("USD");
        }
    }, [open, trade]);

    // Calculate preview
    useEffect(() => {
        if (!trade) return;

        const exit = inputCurrency === "IDR"
            ? (parseFloat(exitPrice) || 0) / exchangeRate
            : parseFloat(exitPrice) || 0;

        const fee = parseFloat(feePercent) || 0;

        if (exit > 0) {
            const pnl = calculatePnL(trade.direction, trade.entry_price, exit, trade.position_size, trade.leverage);
            const feeAmount = calculateFeeAmount(trade.position_size, fee);
            const netPnl = pnl - feeAmount;
            const pnlPercent = calculatePnLPercent(trade.direction, trade.entry_price, exit, trade.leverage);
            const rrr = calculateRRR(trade.direction, trade.entry_price, trade.stop_loss, exit);
            const result = determineResult(netPnl);

            setPreview({ pnl, feeAmount, netPnl, pnlPercent, rrr, result });
        } else {
            setPreview({ pnl: 0, feeAmount: 0, netPnl: 0, pnlPercent: 0, rrr: null, result: "BE" });
        }
    }, [exitPrice, feePercent, trade, inputCurrency, exchangeRate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trade) return;

        setSaving(true);

        const exit = inputCurrency === "IDR"
            ? (parseFloat(exitPrice) || 0) / exchangeRate
            : parseFloat(exitPrice) || 0;

        const result = await closePosition(trade.id, {
            exit_price: exit,
            pnl: preview.pnl,
            net_pnl: preview.netPnl,
            pnl_percent: preview.pnlPercent,
            fee_amount: preview.feeAmount,
            rrr: preview.rrr,
            result: preview.result,
        });

        setSaving(false);

        if (result) {
            onOpenChange(false);
            onSave?.();
        }
    };

    if (!trade) return null;

    const currencyPrefix = inputCurrency === "USD" ? "$" : "Rp";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Close Position</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Position Info */}
                    <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-lg">{trade.pair}</span>
                            <Badge className={trade.direction === "LONG" ? "bg-green-500" : "bg-red-500"}>
                                {trade.direction} {trade.leverage}x
                            </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Entry: {formatCurrency(trade.entry_price)} | Size: {formatCurrency(trade.position_size)}
                        </div>
                        {trade.planned_rr && (
                            <div className="text-sm">
                                Planned R:R: <span className="text-primary font-medium">1:{trade.planned_rr}</span>
                            </div>
                        )}
                    </div>

                    {/* Exit Price and Fee Input */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Exit Price</Label>
                                <button
                                    type="button"
                                    onClick={() => setInputCurrency(inputCurrency === "USD" ? "IDR" : "USD")}
                                    className="text-xs px-2 py-1 rounded bg-secondary"
                                >
                                    {currencyPrefix}
                                </button>
                            </div>
                            <Input
                                type="number"
                                step="0.01"
                                value={exitPrice}
                                onChange={(e) => setExitPrice(e.target.value)}
                                placeholder="Harga exit"
                                autoFocus
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Fee (%)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={feePercent}
                                onChange={(e) => setFeePercent(e.target.value)}
                                placeholder="0.05"
                            />
                        </div>
                    </div>

                    {/* Preview */}
                    {parseFloat(exitPrice) > 0 && (
                        <div className={`p-4 rounded-lg border-2 ${preview.netPnl >= 0 ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10"
                            }`}>
                            <div className="text-center">
                                <div className={`text-2xl font-bold ${preview.netPnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                                    {preview.netPnl >= 0 ? "+" : ""}{formatCurrency(preview.netPnl)}
                                </div>
                                <div className={`text-sm ${preview.netPnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                                    {preview.pnlPercent >= 0 ? "+" : ""}{preview.pnlPercent.toFixed(2)}%
                                </div>
                                <Badge className={`mt-2 ${preview.result === "WIN" ? "bg-green-500" :
                                    preview.result === "LOSS" ? "bg-red-500" : "bg-gray-500"
                                    }`}>
                                    {preview.result}
                                </Badge>
                            </div>
                            <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground space-y-1">
                                <div className="flex justify-between">
                                    <span>Gross P&L:</span>
                                    <span>{formatCurrency(preview.pnl)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Fee ({feePercent}%):</span>
                                    <span>-{formatCurrency(preview.feeAmount)}</span>
                                </div>
                                {preview.rrr !== null && (
                                    <div className="flex justify-between">
                                        <span>Actual R:R:</span>
                                        <span>1:{preview.rrr.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Submit */}
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={saving || !parseFloat(exitPrice)}
                        variant={preview.netPnl >= 0 ? "default" : "destructive"}
                    >
                        {saving ? "Menyimpan..." : `Close ${preview.result}`}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
