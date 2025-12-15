
"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercent } from "@/lib/calculations";
import type { FuturesTrade } from "@/types";
import { Calendar, Target, TrendingUp, Scale, FileText, ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface TradeDetailDialogProps {
    trade: FuturesTrade | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TradeDetailDialog({ trade, open, onOpenChange }: TradeDetailDialogProps) {
    if (!trade) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader className="pr-10">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl flex items-center gap-2">
                            {trade.pair}
                            <Badge
                                variant="outline"
                                className={
                                    trade.direction === "LONG"
                                        ? "border-green-500 text-green-500 bg-green-500/10"
                                        : "border-red-500 text-red-500 bg-red-500/10"
                                }
                            >
                                {trade.direction} {trade.leverage}x
                            </Badge>
                        </DialogTitle>
                        <Badge
                            variant={
                                trade.result === "WIN"
                                    ? "default"
                                    : trade.result === "LOSS"
                                        ? "destructive"
                                        : "secondary"
                            }
                            className={`text-base px-3 py-1 ${trade.result === "WIN" ? "bg-green-500 hover:bg-green-600" : ""}`}
                        >
                            {trade.result}
                        </Badge>
                    </div>
                    <DialogDescription>
                        {new Date(trade.date).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    {/* Financials */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" /> Financials
                        </h4>
                        <div className="bg-secondary/30 p-4 rounded-lg space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm">Position Size</span>
                                <span className="font-mono font-medium">{formatCurrency(trade.position_size)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm">Net P&L</span>
                                <span className={`font-mono font-bold text-lg ${trade.net_pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                                    {trade.net_pnl >= 0 ? "+" : ""}{formatCurrency(trade.net_pnl)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm">ROI</span>
                                <span className={`font-mono font-medium ${trade.pnl_percent >= 0 ? "text-green-500" : "text-red-500"}`}>
                                    {trade.pnl_percent >= 0 ? "+" : ""}{formatPercent(trade.pnl_percent)}
                                </span>
                            </div>
                            <Separator className="bg-border/50" />
                            <div className="flex justify-between items-center text-sm text-muted-foreground">
                                <span>Fees</span>
                                <span>{formatCurrency(trade.fee_amount)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Technicals */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Target className="h-4 w-4" /> Technicals
                        </h4>
                        <div className="bg-secondary/30 p-4 rounded-lg space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm">Entry Price</span>
                                <span className="font-mono">{formatCurrency(trade.entry_price)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm">Exit Price</span>
                                <span className="font-mono">{formatCurrency(trade.exit_price)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm">Risk/Reward</span>
                                <span className="font-mono">{trade.rrr ? `1:${trade.rrr}` : '-'}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Setup/Strategy</span>
                                <span className="font-medium">{trade.strategy || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Notes & Analysis
                    </h4>
                    <div className="bg-secondary/30 p-4 rounded-lg min-h-[100px] text-sm leading-relaxed whitespace-pre-wrap">
                        {trade.notes || <span className="text-muted-foreground italic">Tidak ada catatan untuk trade ini.</span>}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
