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
import { addBalanceEntry } from "@/lib/data-service";

interface BalanceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave?: () => void;
    currentBalance?: number;
}

export function BalanceDialog({ open, onOpenChange, onSave, currentBalance = 0 }: BalanceDialogProps) {
    const [saving, setSaving] = useState(false);
    const [type, setType] = useState<"set" | "deposit" | "withdraw">("set");
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const amountNum = parseFloat(amount) || 0;
        let balanceAfter = currentBalance;
        let entryType: 'INITIAL' | 'DEPOSIT' | 'WITHDRAW' = 'INITIAL';

        if (type === "set") {
            balanceAfter = amountNum;
            entryType = 'INITIAL';
        } else if (type === "deposit") {
            balanceAfter = currentBalance + amountNum;
            entryType = 'DEPOSIT';
        } else {
            balanceAfter = currentBalance - amountNum;
            entryType = 'WITHDRAW';
        }

        const result = await addBalanceEntry({
            type: entryType,
            amount: amountNum,
            balance_after: balanceAfter,
            note: note || undefined,
            date: new Date().toISOString(),
        });

        setSaving(false);

        if (result) {
            onOpenChange(false);
            onSave?.();
            setAmount("");
            setNote("");
            setType("set");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Sesuaikan Saldo</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Tipe</Label>
                        <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="set">Set Saldo Awal</SelectItem>
                                <SelectItem value="deposit">Deposit (Tambah Dana)</SelectItem>
                                <SelectItem value="withdraw">Withdraw (Tarik Dana)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Jumlah ($)</Label>
                        <Input
                            type="number"
                            step="any"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Catatan (opsional)</Label>
                        <Input
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Keterangan"
                        />
                    </div>

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

