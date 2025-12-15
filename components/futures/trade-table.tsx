"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPercent } from "@/lib/calculations";
import { deleteFuturesTrade } from "@/lib/data-service";
import type { FuturesTrade } from "@/types";
import { useState } from "react";
import { TradeDetailDialog } from "./trade-detail-dialog";

interface TradeTableProps {
    trades: FuturesTrade[];
    onRefresh?: () => void;
}

export function TradeTable({ trades, onRefresh }: TradeTableProps) {
    const [selectedTrade, setSelectedTrade] = useState<FuturesTrade | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm("Hapus trade ini?")) return;

        setDeletingId(id);
        await deleteFuturesTrade(id);
        setDeletingId(null);
        onRefresh?.();
    };

    if (trades.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                Belum ada trade. Klik &quot;+ Catat Trade&quot; untuk menambah.
            </div>
        );
    }

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Pair</TableHead>
                        <TableHead>Arah</TableHead>
                        <TableHead className="text-right">Entry</TableHead>
                        <TableHead className="text-right">Exit</TableHead>
                        <TableHead className="text-right">Size</TableHead>
                        <TableHead className="text-right">P&L</TableHead>
                        <TableHead className="text-center">Result</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {trades.map((trade) => (
                        <TableRow
                            key={trade.id}
                            className="cursor-pointer hover:bg-secondary/50"
                            onClick={() => setSelectedTrade(trade)}
                        >
                            <TableCell className="text-muted-foreground">
                                {new Date(trade.date).toLocaleDateString('id-ID', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </TableCell>
                            <TableCell className="font-medium">
                                {trade.pair}
                                {trade.notes && (
                                    <span className="ml-2 inline-block w-2 h-2 rounded-full bg-blue-500" title="Has notes" />
                                )}
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant="outline"
                                    className={
                                        trade.direction === "LONG"
                                            ? "border-green-500 text-profit bg-green-500/5"
                                            : "border-red-500 text-loss bg-red-500/5"
                                    }
                                >
                                    {trade.direction}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right font-mono">
                                {trade.entry_price.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                                {trade.exit_price.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                                ${trade.position_size}
                            </TableCell>
                            <TableCell
                                className={`text-right font-mono font-bold ${trade.net_pnl >= 0 ? "text-profit" : "text-loss"
                                    }`}
                            >
                                {trade.net_pnl >= 0 ? "+" : ""}{formatCurrency(trade.net_pnl)}
                                <span className="text-xs ml-1 text-muted-foreground">
                                    ({formatPercent(trade.pnl_percent)})
                                </span>
                            </TableCell>
                            <TableCell className="text-center">
                                <Badge
                                    variant={
                                        trade.result === "WIN"
                                            ? "default"
                                            : trade.result === "LOSS"
                                                ? "destructive"
                                                : "secondary"
                                    }
                                    className={trade.result === "WIN" ? "bg-profit" : ""}
                                >
                                    {trade.result}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => handleDelete(e, trade.id)}
                                    disabled={deletingId === trade.id}
                                    className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 h-8 w-8 p-0"
                                >
                                    {deletingId === trade.id ? "..." : "×"}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <TradeDetailDialog
                trade={selectedTrade}
                open={!!selectedTrade}
                onOpenChange={(open) => !open && setSelectedTrade(null)}
            />
        </>
    );
}
