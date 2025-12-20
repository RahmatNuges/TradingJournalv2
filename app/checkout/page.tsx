"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Tag, Check, X, Copy, Upload, CheckCircle, Building2 } from "lucide-react";

interface Product {
    id: string;
    name: string;
    description: string;
    price_idr: number;
    discount_price_idr: number | null;
    duration_days: number;
}

// Bank Details Constants
const BANK_NAME = "BCA";
const BANK_ACCOUNT = "0512172529";
const BANK_HOLDER = "RAHMAT NUGROHONING GESANG";

function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const productId = searchParams.get("product");

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [copied, setCopied] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Payment form states
    const [senderName, setSenderName] = useState("");
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [uploadError, setUploadError] = useState("");

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

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(BANK_ACCOUNT);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
                    product_price: product.discount_price_idr || product.price_idr,
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setUploadError("");

        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            setUploadError("File harus berupa gambar (JPG, PNG)");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setUploadError("Ukuran file maksimal 5MB");
            return;
        }

        setProofFile(file);
    };

    const handleSubmit = async () => {
        if (!user || !product || !senderName.trim() || !proofFile) return;
        if (!supabase) return;

        setProcessing(true);
        setUploadError("");

        try {
            // 1. Upload proof image to Supabase Storage
            const fileExt = proofFile.name.split('.').pop();
            const fileName = `${user.id}_${Date.now()}.${fileExt}`;
            const filePath = `proofs/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("payment-proofs")
                .upload(filePath, proofFile);

            if (uploadError) {
                throw new Error("Gagal mengupload bukti transfer: " + uploadError.message);
            }

            // 2. Get public URL
            const { data: urlData } = supabase.storage
                .from("payment-proofs")
                .getPublicUrl(filePath);

            const proofUrl = urlData.publicUrl;

            // 3. Calculate final price
            const basePrice = product.discount_price_idr || product.price_idr;
            const discountAmount = couponApplied?.discount || 0;
            const finalPrice = Math.max(0, basePrice - discountAmount);

            // 4. Create order in database
            const externalId = `MANUAL_${Date.now()}_${user.id.slice(0, 8)}`;

            const { error: orderError } = await supabase
                .from("orders")
                .insert({
                    user_id: user.id,
                    user_email: user.email,
                    product_id: product.id,
                    external_id: externalId,
                    bank_name: BANK_NAME,
                    bank_account_name: senderName.trim(),
                    payment_proof_url: proofUrl,
                    amount_original: product.price_idr,
                    discount_amount: discountAmount,
                    amount_final: finalPrice,
                    status: "PENDING",
                    admin_viewed: false,
                });

            if (orderError) {
                throw new Error("Gagal membuat pesanan: " + orderError.message);
            }

            // 5. Show success state
            setSubmitted(true);

        } catch (error: any) {
            setUploadError(error.message || "Terjadi kesalahan. Silakan coba lagi.");
        } finally {
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

    // Success State
    if (submitted) {
        return (
            <div className="container mx-auto px-4 py-12 max-w-lg">
                <Card className="border-green-500/20">
                    <CardContent className="pt-8 pb-8 text-center space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold">Pembayaran Diterima!</h2>
                        <p className="text-muted-foreground">
                            Bukti transfer Anda sedang diverifikasi oleh admin.
                            Anda akan mendapatkan akses setelah pembayaran dikonfirmasi.
                        </p>
                        <div className="pt-4">
                            <Button onClick={() => router.push("/")}>
                                Kembali ke Beranda
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const basePrice = product.discount_price_idr || product.price_idr;
    const finalPrice = couponApplied
        ? Math.max(0, basePrice - couponApplied.discount)
        : basePrice;

    const canSubmit = senderName.trim() && proofFile && !processing;

    return (
        <div className="container mx-auto px-4 py-12 max-w-lg">
            <h1 className="text-3xl font-bold text-center mb-2">Checkout</h1>
            <p className="text-center text-muted-foreground mb-8">Transfer manual ke rekening BCA</p>

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
                                {product.discount_price_idr ? (
                                    <>
                                        <div className="text-sm text-muted-foreground line-through">
                                            {formatRupiah(product.price_idr)}
                                        </div>
                                        <div className="font-bold text-lg text-emerald-500">
                                            {formatRupiah(product.discount_price_idr)}
                                        </div>
                                    </>
                                ) : (
                                    <div className="font-bold text-lg">{formatRupiah(product.price_idr)}</div>
                                )}
                                <div className="text-xs text-muted-foreground">{product.duration_days} hari akses</div>
                            </div>
                        </div>
                    </div>

                    {/* Bank Transfer Details */}
                    <div className="space-y-3">
                        <Label className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Transfer ke Rekening
                        </Label>
                        <div className="p-4 rounded-lg border border-border bg-card">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Bank</span>
                                    <span className="font-bold">{BANK_NAME}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">No. Rekening</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold">{BANK_ACCOUNT}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 px-2"
                                            onClick={copyToClipboard}
                                        >
                                            {copied ? (
                                                <Check className="h-3.5 w-3.5 text-green-500" />
                                            ) : (
                                                <Copy className="h-3.5 w-3.5" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Atas Nama</span>
                                    <span className="font-medium">{BANK_HOLDER}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sender Name Input */}
                    <div className="space-y-2">
                        <Label htmlFor="senderName">Nama Pengirim (Sesuai Rekening)</Label>
                        <Input
                            id="senderName"
                            value={senderName}
                            onChange={(e) => setSenderName(e.target.value)}
                            placeholder="Masukkan nama sesuai rekening pengirim"
                        />
                    </div>

                    {/* File Upload */}
                    <div className="space-y-2">
                        <Label>Upload Bukti Transfer</Label>
                        <div
                            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
                                ${proofFile ? 'border-green-500/50 bg-green-500/5' : 'border-border hover:border-primary/50'}
                            `}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            {proofFile ? (
                                <div className="flex items-center justify-center gap-2 text-green-500">
                                    <Check className="h-5 w-5" />
                                    <span className="font-medium">{proofFile.name}</span>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                        Klik untuk upload bukti transfer
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Format: JPG, PNG. Klip pembayaran terlihat jelas.
                                    </p>
                                </div>
                            )}
                        </div>
                        {uploadError && (
                            <p className="text-sm text-red-500">{uploadError}</p>
                        )}
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
                            {product.discount_price_idr ? (
                                <div className="text-right">
                                    <span className="line-through text-muted-foreground mr-2">{formatRupiah(product.price_idr)}</span>
                                    <span className="text-emerald-500">{formatRupiah(product.discount_price_idr)}</span>
                                </div>
                            ) : (
                                <span>{formatRupiah(product.price_idr)}</span>
                            )}
                        </div>
                        {couponApplied && (
                            <div className="flex justify-between text-sm text-green-500">
                                <span>Diskon ({couponApplied.display})</span>
                                <span>-{formatRupiah(couponApplied.discount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                            <span>Total Transfer</span>
                            <span>{formatRupiah(finalPrice)}</span>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                        className="w-full h-12 text-lg"
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                    >
                        {processing ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                Mengirim...
                            </>
                        ) : (
                            "Saya Sudah Transfer"
                        )}
                    </Button>

                    {/* Info */}
                    <p className="text-xs text-center text-muted-foreground">
                        Pembayaran akan diverifikasi dalam 1x24 jam kerja
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
