"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Tag, Check, X } from "lucide-react";

interface Product {
    id: string;
    name: string;
    description: string;
    price_idr: number;
    duration_days: number;
}

function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();

    const productId = searchParams.get("product");

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Coupon states
    const [couponCode, setCouponCode] = useState("");
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponApplied, setCouponApplied] = useState<{
        code: string;
        discount: number;
        display: string;
    } | null>(null);
    const [couponError, setCouponError] = useState("");

    useEffect(() => {
        if (!user) {
            router.push("/login?redirect=/pricing");
            return;
        }

        if (!productId) {
            router.push("/pricing");
            return;
        }

        loadProduct();
    }, [user, productId, router]);

    const loadProduct = async () => {
        if (!supabase || !productId) return;

        const { data } = await supabase
            .from("products")
            .select("*")
            .eq("id", productId)
            .eq("is_active", true)
            .single();

        if (data) {
            setProduct(data);
        } else {
            router.push("/pricing");
        }
        setLoading(false);
    };

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const verifyCoupon = async () => {
        if (!couponCode.trim() || !product) return;

        setCouponLoading(true);
        setCouponError("");
        setCouponApplied(null);

        try {
            const response = await fetch("/api/payment/verify-coupon", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    coupon_code: couponCode.toUpperCase(),
                    product_price: product.price_idr,
                }),
            });

            const data = await response.json();

            if (data.valid) {
                setCouponApplied({
                    code: data.coupon.code,
                    discount: data.coupon.calculated_discount,
                    display: data.coupon.discount_display,
                });
            } else {
                setCouponError(data.error || "Kupon tidak valid");
            }
        } catch {
            setCouponError("Gagal memverifikasi kupon");
        } finally {
            setCouponLoading(false);
        }
    };

    const removeCoupon = () => {
        setCouponApplied(null);
        setCouponCode("");
        setCouponError("");
    };

    const handlePayment = async () => {
        if (!user || !product) return;

        setProcessing(true);

        try {
            const response = await fetch("/api/payment/create-invoice", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    product_id: product.id,
                    coupon_code: couponApplied?.code || null,
                    user_id: user.id,
                    user_email: user.email,
                }),
            });

            const data = await response.json();

            if (data.invoice_url) {
                // Redirect to Xendit payment page
                window.location.href = data.invoice_url;
            } else {
                alert(data.error || "Gagal membuat invoice");
                setProcessing(false);
            }
        } catch {
            alert("Terjadi kesalahan. Silakan coba lagi.");
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!product) return null;

    const finalPrice = couponApplied
        ? Math.max(0, product.price_idr - couponApplied.discount)
        : product.price_idr;

    return (
        <div className="container mx-auto px-4 py-16 max-w-lg">
            <h1 className="text-3xl font-bold text-center mb-8">Checkout</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Ringkasan Pesanan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Product Info */}
                    <div className="p-4 rounded-lg bg-secondary/50">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-medium text-lg">{product.name}</h3>
                                <p className="text-sm text-muted-foreground">{product.description}</p>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-lg">{formatRupiah(product.price_idr)}</div>
                                <div className="text-xs text-muted-foreground">{product.duration_days} hari</div>
                            </div>
                        </div>
                    </div>

                    {/* Coupon Input */}
                    <div className="space-y-2">
                        <Label>Kode Kupon (Opsional)</Label>
                        {couponApplied ? (
                            <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                <div className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span className="font-mono font-medium">{couponApplied.code}</span>
                                    <Badge className="bg-green-500/20 text-green-500">
                                        -{couponApplied.display}
                                    </Badge>
                                </div>
                                <Button variant="ghost" size="sm" onClick={removeCoupon}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        placeholder="Masukkan kode kupon"
                                        className="pl-10 uppercase"
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={verifyCoupon}
                                    disabled={couponLoading || !couponCode.trim()}
                                >
                                    {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Pakai"}
                                </Button>
                            </div>
                        )}
                        {couponError && (
                            <p className="text-sm text-red-500">{couponError}</p>
                        )}
                    </div>

                    {/* Price Summary */}
                    <div className="space-y-2 pt-4 border-t border-border">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Harga</span>
                            <span>{formatRupiah(product.price_idr)}</span>
                        </div>
                        {couponApplied && (
                            <div className="flex justify-between text-sm text-green-500">
                                <span>Diskon ({couponApplied.display})</span>
                                <span>-{formatRupiah(couponApplied.discount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                            <span>Total</span>
                            <span>{formatRupiah(finalPrice)}</span>
                        </div>
                    </div>

                    {/* Pay Button */}
                    <Button
                        className="w-full h-12 text-lg"
                        onClick={handlePayment}
                        disabled={processing}
                    >
                        {processing ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                Memproses...
                            </>
                        ) : (
                            `Bayar ${formatRupiah(finalPrice)}`
                        )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                        Anda akan diarahkan ke halaman pembayaran Xendit
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}
