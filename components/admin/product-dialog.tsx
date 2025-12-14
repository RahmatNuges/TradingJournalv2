"use client";

import { useState } from "react";
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
        duration_days: number;
        is_active: boolean;
    } | null;
    onSave: () => void;
}

export function ProductDialog({ open, onOpenChange, product, onSave }: ProductDialogProps) {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState(product?.name || "");
    const [description, setDescription] = useState(product?.description || "");
    const [priceIdr, setPriceIdr] = useState(product?.price_idr?.toString() || "");
    const [durationDays, setDurationDays] = useState(product?.duration_days?.toString() || "30");
    const [isActive, setIsActive] = useState(product?.is_active ?? true);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase) return;

        setLoading(true);
        try {
            const data = {
                name,
                description,
                price_idr: parseInt(priceIdr),
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
            resetForm();
        } catch (error) {
            console.error("Error saving product:", error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setName("");
        setDescription("");
        setPriceIdr("");
        setDurationDays("30");
        setIsActive(true);
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
                            <Label>Harga (IDR)</Label>
                            <Input type="number" value={priceIdr} onChange={(e) => setPriceIdr(e.target.value)} required />
                        </div>
                        <div>
                            <Label>Durasi (hari)</Label>
                            <Input type="number" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} required />
                        </div>
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
