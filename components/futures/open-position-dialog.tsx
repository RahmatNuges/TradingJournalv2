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
import { Badge } from "@/components/ui/badge";
import { addFuturesTrade } from "@/lib/data-service";
import { useCurrency, Currency } from "@/contexts/currency-context";

interface OpenPositionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave?: () => void;
}

const PSYCHOLOGY_STATES = [
    { value: "confident", label: "Confident", color: "bg-green-500" },
    { value: "calm", label: "Calm", color: "bg-blue-500" },
    { value: "neutral", label: "Neutral", color: "bg-gray-500" },
    { value: "anxious", label: "Anxious", color: "bg-yellow-500" },
    { value: "fomo", label: "FOMO", color: "bg-orange-500" },
    { value: "revenge", label: "Revenge", color: "bg-red-500" },
    { value: "greedy", label: "Greedy", color: "bg-purple-500" },
];

export function OpenPositionDialog({ open, onOpenChange, onSave }: OpenPositionDialogProps) {
    const { exchangeRate } = useCurrency();
    const [saving, setSaving] = useState(false);
    const [inputCurrency, setInputCurrency] = useState<Currency>("USD");

    const [formData, setFormData] = useState({
        date: "",
        pair: "BTCUSDT",
        direction: "LONG" as "LONG" | "SHORT",
        leverage: "10",
        entryPrice: "",
        positionSize: "",
        stopLoss: "",
        takeProfit: "",
        feePercent: "0.05",
        technicalNotes: "",
        psychologyNotes: "",
        psychologyState: "neutral",
        plannedRR: "",
    });

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');

            setFormData(prev => ({
                ...prev,
                date: `${year}-${month}-${day}T${hours}:${minutes}`,
            }));
        }
    }, [open]);

    // Calculate planned R:R when SL/TP changes
    useEffect(() => {
        const entry = parseFloat(formData.entryPrice) || 0;
        const sl = parseFloat(formData.stopLoss) || 0;
        const tp = parseFloat(formData.takeProfit) || 0;

        if (entry > 0 && sl > 0 && tp > 0) {
            let risk: number;
            let reward: number;

            if (formData.direction === "LONG") {
                risk = Math.abs(entry - sl);
                reward = Math.abs(tp - entry);
            } else {
                risk = Math.abs(sl - entry);
                reward = Math.abs(entry - tp);
            }

            if (risk > 0) {
                const rr = (reward / risk).toFixed(2);
                setFormData(prev => ({ ...prev, plannedRR: rr }));
            }
        }
    }, [formData.entryPrice, formData.stopLoss, formData.takeProfit, formData.direction]);

    const convertToUSD = (val: string) => {
        const num = parseFloat(val) || 0;
        return inputCurrency === "IDR" ? num / exchangeRate : num;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const tradeData = {
            pair: formData.pair,
            direction: formData.direction,
            leverage: parseFloat(formData.leverage) || 10,
            entry_price: convertToUSD(formData.entryPrice),
            exit_price: 0, // Will be filled when closing
            position_size: convertToUSD(formData.positionSize),
            fee_percent: parseFloat(formData.feePercent),
            fee_amount: 0,
            pnl: 0,
            net_pnl: 0,
            pnl_percent: 0,
            rrr: null,
            result: "BE" as const,
            stop_loss: convertToUSD(formData.stopLoss) || null,
            take_profit: convertToUSD(formData.takeProfit) || null,
            strategy: null,
            notes: null,
            date: formData.date,
            // New open positions fields
            status: "OPEN" as const,
            technical_notes: formData.technicalNotes || null,
            psychology_notes: formData.psychologyNotes || null,
            psychology_state: formData.psychologyState || null,
            planned_rr: parseFloat(formData.plannedRR) || null,
        };

        const result = await addFuturesTrade(tradeData);
        setSaving(false);

        if (result) {
            onOpenChange(false);
            onSave?.();
            // Reset form
            setFormData({
                date: "",
                pair: "BTCUSDT",
                direction: "LONG",
                leverage: "10",
                entryPrice: "",
                positionSize: "",
                stopLoss: "",
                takeProfit: "",
                feePercent: "0.05",
                technicalNotes: "",
                psychologyNotes: "",
                psychologyState: "neutral",
                plannedRR: "",
            });
        }
    };

    const currencyPrefix = inputCurrency === "USD" ? "$" : "Rp";
    const currencyStep = inputCurrency === "USD" ? "0.01" : "1";

    const toggleCurrency = () => {
        setInputCurrency(inputCurrency === "USD" ? "IDR" : "USD");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="flex flex-row items-center justify-between">
                    <DialogTitle>Open Position</DialogTitle>
                    <button
                        type="button"
                        onClick={toggleCurrency}
                        className="flex items-center gap-1 p-1 rounded-full bg-secondary border border-border"
                    >
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${inputCurrency === "USD" ? "bg-primary text-primary-foreground" : ""}`}>
                            USD
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${inputCurrency === "IDR" ? "bg-primary text-primary-foreground" : ""}`}>
                            IDR
                        </span>
                    </button>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Row 1: Date, Pair, Direction */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Waktu Entry</Label>
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
                                    <SelectItem value="LONG">LONG</SelectItem>
                                    <SelectItem value="SHORT">SHORT</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Row 2: Entry, Size, Leverage */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Entry Price ({currencyPrefix})</Label>
                            <Input
                                type="number"
                                step={currencyStep}
                                value={formData.entryPrice}
                                onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Position Size ({currencyPrefix})</Label>
                            <Input
                                type="number"
                                step={currencyStep}
                                value={formData.positionSize}
                                onChange={(e) => setFormData({ ...formData, positionSize: e.target.value })}
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

                    {/* Row 3: SL, TP, Planned R:R */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Stop Loss ({currencyPrefix})</Label>
                            <Input
                                type="number"
                                step={currencyStep}
                                value={formData.stopLoss}
                                onChange={(e) => setFormData({ ...formData, stopLoss: e.target.value })}
                                placeholder="Optional"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Take Profit ({currencyPrefix})</Label>
                            <Input
                                type="number"
                                step={currencyStep}
                                value={formData.takeProfit}
                                onChange={(e) => setFormData({ ...formData, takeProfit: e.target.value })}
                                placeholder="Optional"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Planned R:R</Label>
                            <div className="flex items-center h-10 px-3 rounded-md border border-border bg-secondary/50">
                                {formData.plannedRR ? (
                                    <span className="font-bold text-primary">1 : {formData.plannedRR}</span>
                                ) : (
                                    <span className="text-muted-foreground text-sm">Set SL & TP</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Psychology State */}
                    <div className="space-y-2">
                        <Label>Kondisi Psikologis</Label>
                        <div className="flex flex-wrap gap-2">
                            {PSYCHOLOGY_STATES.map((state) => (
                                <button
                                    key={state.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, psychologyState: state.value })}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${formData.psychologyState === state.value
                                        ? `${state.color} text-white ring-2 ring-offset-2 ring-offset-background ring-${state.color}`
                                        : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                                        }`}
                                >
                                    {state.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Technical Notes */}
                    <div className="space-y-2">
                        <Label>Setup Teknikal</Label>
                        <Textarea
                            value={formData.technicalNotes}
                            onChange={(e) => setFormData({ ...formData, technicalNotes: e.target.value })}
                            placeholder="Contoh: Break of structure di H4, rejection di FVG, entry setelah CHoCH..."
                            rows={3}
                        />
                    </div>

                    {/* Psychology Notes */}
                    <div className="space-y-2">
                        <Label>Catatan Psikologi</Label>
                        <Textarea
                            value={formData.psychologyNotes}
                            onChange={(e) => setFormData({ ...formData, psychologyNotes: e.target.value })}
                            placeholder="Contoh: Sedikit ragu tapi tetap follow plan, tidak overtrade hari ini..."
                            rows={3}
                        />
                    </div>

                    {/* Submit */}
                    <Button type="submit" className="w-full" disabled={saving}>
                        {saving ? "Menyimpan..." : "Buka Posisi"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
