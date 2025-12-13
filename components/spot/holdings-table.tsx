"use client";

import { useState } from "react";
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency, formatPercent } from "@/lib/calculations";
import { deleteSpotTransaction } from "@/lib/data-service";

interface HoldingWithValues {
    symbol: string;
    name: string;
    totalQuantity: number;
    avgBuyPrice: number;
    totalCost: number;
    currentPrice: number;
    currentValue: number;
    pnl: number;
    pnlPercent: number;
    allocation: number;
    transactions: Array<{
        id: string;
        type: 'BUY' | 'SELL';
        quantity: number;
        price_usd: number;
        date: string;
    }>;
}

interface HoldingsTableProps {
    holdings: HoldingWithValues[];
    onRefresh?: () => void;
}

export function HoldingsTable({ holdings, onRefresh }: HoldingsTableProps) {
    const [selectedHolding, setSelectedHolding] = useState<HoldingWithValues | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDeleteTransaction = async (id: string) => {
        if (!confirm("Hapus transaksi ini?")) return;

        setDeletingId(id);
        await deleteSpotTransaction(id);
        setDeletingId(null);
        setSelectedHolding(null);
        onRefresh?.();
    };

    if (holdings.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                Belum ada holding. Klik &quot;+ Tambah Transaksi&quot; untuk menambah.
            </div>
        );
    }

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Coin</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Avg Buy</TableHead>
                        <TableHead className="text-right">Current</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                        <TableHead className="text-right">P&L</TableHead>
                        <TableHead className="text-right">Allocation</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {holdings.map((holding) => (
                        <TableRow
                            key={holding.symbol}
                            className="cursor-pointer hover:bg-secondary/50"
                            onClick={() => setSelectedHolding(holding)}
                        >
                            <TableCell>
                                <div>
                                    <span className="font-bold">{holding.symbol}</span>
                                    <span className="text-muted-foreground ml-2 text-sm">{holding.name}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right font-mono">
                                {holding.totalQuantity.toFixed(8).replace(/\.?0+$/, '')}
                            </TableCell>
                            <TableCell className="text-right font-mono text-muted-foreground">
                                ${holding.avgBuyPrice.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                                ${holding.currentPrice.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right font-mono font-bold">
                                {formatCurrency(holding.currentValue)}
                            </TableCell>
                            <TableCell className={`text-right font-mono font-bold ${holding.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                                {holding.pnl >= 0 ? '+' : ''}{formatCurrency(holding.pnl)}
                                <span className="text-xs ml-1">
                                    ({formatPercent(holding.pnlPercent)})
                                </span>
                            </TableCell>
                            <TableCell className="text-right font-mono">
                                {holding.allocation.toFixed(1)}%
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Transaction History Dialog */}
            <Dialog open={!!selectedHolding} onOpenChange={() => setSelectedHolding(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedHolding?.symbol} - Riwayat Transaksi (DCA)
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/50 rounded-lg">
                            <div>
                                <p className="text-xs text-muted-foreground">Total Quantity</p>
                                <p className="font-mono font-bold">
                                    {selectedHolding?.totalQuantity.toFixed(8).replace(/\.?0+$/, '')}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Avg Buy Price</p>
                                <p className="font-mono font-bold">${selectedHolding?.avgBuyPrice.toLocaleString()}</p>
                            </div>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">Qty</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedHolding?.transactions.map((tx) => (
                                    <TableRow key={tx.id}>
                                        <TableCell className="text-muted-foreground">
                                            {new Date(tx.date).toLocaleDateString('id-ID')}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={tx.type === "BUY" ? "default" : "destructive"}
                                                className={tx.type === "BUY" ? "bg-profit" : ""}>
                                                {tx.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">{tx.quantity}</TableCell>
                                        <TableCell className="text-right font-mono">${tx.price_usd.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteTransaction(tx.id)}
                                                disabled={deletingId === tx.id}
                                                className="text-loss hover:text-red-700"
                                            >
                                                {deletingId === tx.id ? "..." : "×"}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <Button variant="outline" className="w-full" onClick={() => setSelectedHolding(null)}>
                            Tutup
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
