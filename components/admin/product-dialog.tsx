"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

interface ProductDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product?: {
        id: string;
        name: string;
        description: string;
        price_idr: number;
        discount_price_idr: number | null;
        duration_days: number;
        is_active: boolean;
    } | null;
    onSave: () => void;
}

export function ProductDialog({ open, onOpenChange, product, onSave }: ProductDialogProps) {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [priceIdr, setPriceIdr] = useState("");
    const [discountPriceIdr, setDiscountPriceIdr] = useState("");
    const [durationDays, setDurationDays] = useState("30");
    const [isActive, setIsActive] = useState(true);

    // Reset form when dialog opens/closes or product changes
    useEffect(() => {
        if (open) {
            setName(product?.name || "");
            setDescription(product?.description || "");
            setPriceIdr(product?.price_idr?.toString() || "");
            setDiscountPriceIdr(product?.discount_price_idr?.toString() || "");
            setDurationDays(product?.duration_days?.toString() || "30");
            setIsActive(product?.is_active ?? true);
        }
    }, [open, product]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase) return;

        setLoading(true);
        try {
            const data = {
                name,
                description,
                price_idr: parseInt(priceIdr),
                discount_price_idr: discountPriceIdr ? parseInt(discountPriceIdr) : null,
                duration_days: parseInt(durationDays),
                is_active: isActive,
            };

            if (product?.id) {
                await supabase.from("products").update(data).eq("id", product.id);
            } else {
                await supabase.from("products").insert(data);
            }

            onSave();
            onOpenChange(false);
        } catch (error) {
            console.error("Error saving product:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{product ? "Edit Produk" : "Tambah Produk"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label>Nama Produk</Label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div>
                        <Label>Deskripsi</Label>
                        <Input value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Harga Normal (IDR)</Label>
                            <Input
                                type="number"
                                value={priceIdr}
                                onChange={(e) => setPriceIdr(e.target.value)}
                                required
                                placeholder="99000"
                            />
                        </div>
                        <div>
                            <Label>Harga Diskon (IDR) <span className="text-muted-foreground text-xs">- opsional</span></Label>
                            <Input
                                type="number"
                                value={discountPriceIdr}
                                onChange={(e) => setDiscountPriceIdr(e.target.value)}
                                placeholder="Kosongkan jika tidak ada diskon"
                                className="placeholder:text-xs"
                            />
                        </div>
                    </div>
                    <div>
                        <Label>Durasi (hari)</Label>
                        <Input type="number" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} required />
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="h-4 w-4"
                        />
                        <Label htmlFor="is_active">Aktif</Label>
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
