"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CurrencyInput } from "@/components/ui/currency-input";
import { addSpotTransaction } from "@/lib/data-service";

interface TransactionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave?: () => void;
}

export function TransactionDialog({ open, onOpenChange, onSave }: TransactionDialogProps) {
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        symbol: "",
        name: "",
        type: "BUY" as "BUY" | "SELL",
        quantity: "",
        priceUsd: "",
        date: new Date().toISOString().split("T")[0],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const result = await addSpotTransaction({
            symbol: formData.symbol,
            name: formData.name || undefined,
            type: formData.type,
            quantity: parseFloat(formData.quantity),
            price_usd: parseFloat(formData.priceUsd),
            date: formData.date,
        });

        setSaving(false);

        if (result) {
            onOpenChange(false);
            onSave?.();
            // Reset form
            setFormData({
                symbol: "",
                name: "",
                type: "BUY",
                quantity: "",
                priceUsd: "",
                date: new Date().toISOString().split("T")[0],
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Tambah Transaksi</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Symbol</Label>
                            <Input
                                value={formData.symbol}
                                onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                                placeholder="BTC"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Nama (opsional)</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Bitcoin"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Tipe Transaksi</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(v) => setFormData({ ...formData, type: v as "BUY" | "SELL" })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="BUY">🟢 BUY (Beli)</SelectItem>
                                <SelectItem value="SELL">🔴 SELL (Jual)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Quantity</Label>
                            <Input
                                type="number"
                                step="any"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                placeholder="0.5"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Harga</Label>
                            <CurrencyInput
                                value={formData.priceUsd}
                                onChange={(v) => setFormData({ ...formData, priceUsd: v })}
                                placeholder="42000"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Tanggal</Label>
                        <Input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>

                    <p className="text-xs text-muted-foreground">
                        💡 Transaksi disimpan terpisah. Average price dihitung otomatis (DCA support).
                    </p>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={saving}>
                            {saving ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
