"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFormatCurrency } from "@/hooks/use-format-currency";
import type { FuturesTrade } from "@/types";
import { Clock, Target, AlertTriangle } from "lucide-react";

interface OpenPositionCardProps {
    trade: FuturesTrade;
    onClose: (trade: FuturesTrade) => void;
    onEdit?: (trade: FuturesTrade) => void;
}

const PSYCHOLOGY_STATE_LABELS: Record<string, { label: string; color: string }> = {
    confident: { label: "Confident", color: "text-green-500" },
    calm: { label: "Calm", color: "text-blue-500" },
    neutral: { label: "Neutral", color: "text-gray-500" },
    anxious: { label: "Anxious", color: "text-yellow-500" },
    fomo: { label: "FOMO", color: "text-orange-500" },
    revenge: { label: "Revenge", color: "text-red-500" },
    greedy: { label: "Greedy", color: "text-purple-500" },
};

export function OpenPositionCard({ trade, onClose, onEdit }: OpenPositionCardProps) {
    const { formatCurrency } = useFormatCurrency();

    const psychState = trade.psychology_state
        ? PSYCHOLOGY_STATE_LABELS[trade.psychology_state]
        : null;

    const isHighRisk = psychState && ["fomo", "revenge", "greedy", "anxious"].includes(trade.psychology_state || "");

    return (
        <Card className={`overflow-hidden border-l-4 ${trade.direction === "LONG" ? "border-l-green-500" : "border-l-red-500"
            } ${isHighRisk ? "ring-1 ring-yellow-500/50" : ""}`}>
            <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">{trade.pair}</span>
                            <Badge className={trade.direction === "LONG" ? "bg-green-500" : "bg-red-500"}>
                                {trade.direction} {trade.leverage}x
                            </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            {new Date(trade.date).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    </div>
                    <div className="text-right">
                        {trade.planned_rr && (
                            <div className="flex items-center gap-1 text-sm">
                                <Target className="h-4 w-4 text-primary" />
                                <span className="font-medium">R:R 1:{trade.planned_rr}</span>
                            </div>
                        )}
                        {psychState && (
                            <div className={`text-xs mt-1 ${psychState.color}`}>
                                {psychState.label}
                                {isHighRisk && <AlertTriangle className="h-3 w-3 inline ml-1 text-yellow-500" />}
                            </div>
                        )}
                    </div>
                </div>

                {/* Entry & Targets */}
                <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                    <div className="p-2 rounded bg-secondary/50">
                        <div className="text-xs text-muted-foreground">Entry</div>
                        <div className="font-mono font-medium">{formatCurrency(trade.entry_price)}</div>
                    </div>
                    {trade.stop_loss && (
                        <div className="p-2 rounded bg-red-500/10">
                            <div className="text-xs text-red-400">Stop Loss</div>
                            <div className="font-mono font-medium text-red-500">{formatCurrency(trade.stop_loss)}</div>
                        </div>
                    )}
                    {trade.take_profit && (
                        <div className="p-2 rounded bg-green-500/10">
                            <div className="text-xs text-green-400">Take Profit</div>
                            <div className="font-mono font-medium text-green-500">{formatCurrency(trade.take_profit)}</div>
                        </div>
                    )}
                </div>

                {/* Technical Notes */}
                {trade.technical_notes && (
                    <div className="mb-3 p-2 rounded bg-secondary/30 text-sm">
                        <div className="text-xs text-muted-foreground mb-1">Setup</div>
                        <div className="text-foreground/80 line-clamp-2">{trade.technical_notes}</div>
                    </div>
                )}

                {/* Psychology Notes */}
                {trade.psychology_notes && (
                    <div className="mb-3 p-2 rounded bg-secondary/30 text-sm">
                        <div className="text-xs text-muted-foreground mb-1">Psikologi</div>
                        <div className="text-foreground/80 line-clamp-2">{trade.psychology_notes}</div>
                    </div>
                )}

                {/* Position Size */}
                <div className="text-xs text-muted-foreground mb-3">
                    Size: {formatCurrency(trade.position_size)}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <Button
                        onClick={() => onClose(trade)}
                        className="flex-1"
                        variant="default"
                    >
                        Close Position
                    </Button>
                    {onEdit && (
                        <Button
                            onClick={() => onEdit(trade)}
                            variant="outline"
                            size="icon"
                        >
                            Edit
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
