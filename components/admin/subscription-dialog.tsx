"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

interface SubscriptionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    subscription?: {
        id: string;
        user_id: string;
        user_email?: string;
        plan_name: string;
        expires_at: string;
        is_active: boolean;
    } | null;
    onSave: () => void;
}

export function SubscriptionDialog({ open, onOpenChange, subscription, onSave }: SubscriptionDialogProps) {
    const [loading, setLoading] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const [userId, setUserId] = useState(subscription?.user_id || "");
    const [planName, setPlanName] = useState(subscription?.plan_name || "Bulanan");
    const [expiresAt, setExpiresAt] = useState(
        subscription?.expires_at ? new Date(subscription.expires_at).toISOString().slice(0, 10) : ""
    );
    const [isActive, setIsActive] = useState(subscription?.is_active ?? true);
    const [searchResults, setSearchResults] = useState<{ id: string, email: string }[]>([]);

    // Search users by email
    const searchUsers = async (email: string) => {
        if (!supabase || email.length < 3) {
            setSearchResults([]);
            return;
        }

        const { data } = await supabase
            .from("auth.users")
            .select("id, email")
            .ilike("email", `%${email}%`)
            .limit(5);

        // Fallback: search from orders table
        const { data: orderUsers } = await supabase
            .from("orders")
            .select("user_id, user_email")
            .ilike("user_email", `%${email}%`)
            .limit(5);

        if (orderUsers) {
            const uniqueUsers = orderUsers.reduce((acc, curr) => {
                if (curr.user_id && !acc.find(u => u.id === curr.user_id)) {
                    acc.push({ id: curr.user_id, email: curr.user_email });
                }
                return acc;
            }, [] as { id: string, email: string }[]);
            setSearchResults(uniqueUsers);
        }
    };

    useEffect(() => {
        if (subscription) {
            setUserId(subscription.user_id);
            setUserEmail(subscription.user_email || "");
            setPlanName(subscription.plan_name);
            setExpiresAt(new Date(subscription.expires_at).toISOString().slice(0, 10));
            setIsActive(subscription.is_active);
        } else {
            resetForm();
        }
    }, [subscription, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase || !userId) return;

        setLoading(true);
        try {
            const data = {
                user_id: userId,
                plan_name: planName,
                expires_at: new Date(expiresAt).toISOString(),
                is_active: isActive,
                starts_at: new Date().toISOString(),
            };

            if (subscription?.id) {
                await supabase.from("subscriptions").update(data).eq("id", subscription.id);
            } else {
                // Check if user already has subscription
                const { data: existing } = await supabase
                    .from("subscriptions")
                    .select("id")
                    .eq("user_id", userId)
                    .single();

                if (existing) {
                    // Update existing
                    await supabase.from("subscriptions").update(data).eq("user_id", userId);
                } else {
                    // Insert new
                    await supabase.from("subscriptions").insert(data);
                }
            }

            onSave();
            onOpenChange(false);
            resetForm();
        } catch (error) {
            console.error("Error saving subscription:", error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setUserId("");
        setUserEmail("");
        setPlanName("Bulanan");
        setExpiresAt("");
        setIsActive(true);
        setSearchResults([]);
    };

    const selectUser = (user: { id: string, email: string }) => {
        setUserId(user.id);
        setUserEmail(user.email);
        setSearchResults([]);
    };

    // Quick duration buttons
    const setDuration = (days: number) => {
        const date = new Date();
        date.setDate(date.getDate() + days);
        setExpiresAt(date.toISOString().slice(0, 10));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{subscription ? "Edit Subscriber" : "Tambah Subscriber"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label>Cari User (Email)</Label>
                        <Input
                            value={userEmail}
                            onChange={(e) => {
                                setUserEmail(e.target.value);
                                searchUsers(e.target.value);
                            }}
                            placeholder="Ketik email untuk mencari..."
                            disabled={!!subscription}
                        />
                        {searchResults.length > 0 && (
                            <div className="mt-1 border rounded-md bg-background shadow-lg">
                                {searchResults.map((user) => (
                                    <button
                                        key={user.id}
                                        type="button"
                                        onClick={() => selectUser(user)}
                                        className="w-full text-left px-3 py-2 hover:bg-secondary text-sm"
                                    >
                                        {user.email}
                                    </button>
                                ))}
                            </div>
                        )}
                        {userId && (
                            <div className="mt-1 text-xs text-muted-foreground">
                                User ID: {userId}
                            </div>
                        )}
                    </div>

                    <div>
                        <Label>Nama Paket</Label>
                        <select
                            value={planName}
                            onChange={(e) => setPlanName(e.target.value)}
                            className="w-full h-10 px-3 rounded-md border border-input bg-background"
                        >
                            <option value="Mingguan">Mingguan (7 hari)</option>
                            <option value="Bulanan">Bulanan (30 hari)</option>
                            <option value="Tahunan">Tahunan (365 hari)</option>
                            <option value="Custom">Custom</option>
                        </select>
                    </div>

                    <div>
                        <Label>Berlaku Sampai</Label>
                        <div className="flex gap-2 mb-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => setDuration(7)}>+7 hari</Button>
                            <Button type="button" variant="outline" size="sm" onClick={() => setDuration(30)}>+30 hari</Button>
                            <Button type="button" variant="outline" size="sm" onClick={() => setDuration(365)}>+365 hari</Button>
                        </div>
                        <Input
                            type="date"
                            value={expiresAt}
                            onChange={(e) => setExpiresAt(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="sub_active"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="h-4 w-4"
                        />
                        <Label htmlFor="sub_active">Aktif</Label>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
                        <Button type="submit" disabled={loading || !userId}>{loading ? "Menyimpan..." : "Simpan"}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
