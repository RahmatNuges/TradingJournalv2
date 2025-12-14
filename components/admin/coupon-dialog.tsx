"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

interface CouponDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    coupon?: {
        id: string;
        code: string;
        discount_percent: number | null;
        discount_amount: number | null;
        max_uses: number | null;
        valid_until: string | null;
        is_active: boolean;
    } | null;
    onSave: () => void;
}

export function CouponDialog({ open, onOpenChange, coupon, onSave }: CouponDialogProps) {
    const [loading, setLoading] = useState(false);
    const [code, setCode] = useState(coupon?.code || "");
    const [discountType, setDiscountType] = useState<"percent" | "amount">(
        coupon?.discount_percent ? "percent" : "amount"
    );
    const [discountValue, setDiscountValue] = useState(
        coupon?.discount_percent?.toString() || coupon?.discount_amount?.toString() || ""
    );
    const [maxUses, setMaxUses] = useState(coupon?.max_uses?.toString() || "");
    const [validUntil, setValidUntil] = useState(
        coupon?.valid_until ? new Date(coupon.valid_until).toISOString().slice(0, 10) : ""
    );
    const [isActive, setIsActive] = useState(coupon?.is_active ?? true);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase) return;

        setLoading(true);
        try {
            const data = {
                code: code.toUpperCase(),
                discount_percent: discountType === "percent" ? parseInt(discountValue) : null,
                discount_amount: discountType === "amount" ? parseInt(discountValue) : null,
                max_uses: maxUses ? parseInt(maxUses) : null,
                valid_until: validUntil ? new Date(validUntil).toISOString() : null,
                is_active: isActive,
            };

            if (coupon?.id) {
                await supabase.from("coupons").update(data).eq("id", coupon.id);
            } else {
                await supabase.from("coupons").insert(data);
            }

            onSave();
            onOpenChange(false);
            resetForm();
        } catch (error) {
            console.error("Error saving coupon:", error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setCode("");
        setDiscountType("percent");
        setDiscountValue("");
        setMaxUses("");
        setValidUntil("");
        setIsActive(true);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{coupon ? "Edit Kupon" : "Tambah Kupon"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label>Kode Kupon</Label>
                        <Input
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="DISKON50"
                            required
                        />
                    </div>
                    <div>
                        <Label>Tipe Diskon</Label>
                        <div className="flex gap-4 mt-1">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    checked={discountType === "percent"}
                                    onChange={() => setDiscountType("percent")}
                                />
                                Persen (%)
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    checked={discountType === "amount"}
                                    onChange={() => setDiscountType("amount")}
                                />
                                Nominal (Rp)
                            </label>
                        </div>
                    </div>
                    <div>
                        <Label>Nilai Diskon</Label>
                        <Input
                            type="number"
                            value={discountValue}
                            onChange={(e) => setDiscountValue(e.target.value)}
                            placeholder={discountType === "percent" ? "50" : "10000"}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Maks Penggunaan (kosongkan = unlimited)</Label>
                            <Input type="number" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} />
                        </div>
                        <div>
                            <Label>Berlaku Sampai</Label>
                            <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="coupon_active"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="h-4 w-4"
                        />
                        <Label htmlFor="coupon_active">Aktif</Label>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
                        <Button type="submit" disabled={loading}>{loading ? "Menyimpan..." : "Simpan"}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
