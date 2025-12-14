"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Crown, Star } from "lucide-react";

interface Product {
    id: string;
    name: string;
    description: string;
    price_idr: number;
    duration_days: number;
}

export default function PricingPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        if (!supabase) return;

        const { data } = await supabase
            .from("products")
            .select("*")
            .eq("is_active", true)
            .order("sort_order");

        if (data) setProducts(data);
        setLoading(false);
    };

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getIcon = (index: number) => {
        switch (index) {
            case 0:
                return <Zap className="h-8 w-8 text-yellow-500" />;
            case 1:
                return <Star className="h-8 w-8 text-blue-500" />;
            case 2:
                return <Crown className="h-8 w-8 text-purple-500" />;
            default:
                return <Zap className="h-8 w-8" />;
        }
    };

    const handleSelectPlan = (productId: string) => {
        if (!user) {
            router.push("/login?redirect=/pricing");
            return;
        }
        router.push(`/checkout?product=${productId}`);
    };

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Pilih Paket Langganan</h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Catat semua trading Anda dengan mudah. Pilih paket yang sesuai dengan kebutuhan Anda.
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center">
                    <div className="animate-pulse text-muted-foreground">Memuat paket...</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {products.map((product, index) => (
                        <Card
                            key={product.id}
                            className={`relative overflow-hidden transition-all hover:scale-105 hover:shadow-xl ${index === 1 ? "border-primary ring-2 ring-primary/20" : ""
                                }`}
                        >
                            {index === 1 && (
                                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
                                    POPULER
                                </div>
                            )}
                            {index === 2 && (
                                <div className="absolute top-0 right-0 bg-purple-500 text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
                                    HEMAT
                                </div>
                            )}
                            <CardHeader className="text-center pb-4">
                                <div className="mx-auto mb-4 p-3 rounded-full bg-secondary w-fit">
                                    {getIcon(index)}
                                </div>
                                <CardTitle className="text-2xl">{product.name}</CardTitle>
                                <p className="text-muted-foreground text-sm mt-2">
                                    {product.description}
                                </p>
                            </CardHeader>
                            <CardContent className="text-center">
                                <div className="mb-6">
                                    <span className="text-4xl font-bold">{formatRupiah(product.price_idr)}</span>
                                    <span className="text-muted-foreground">/{product.duration_days} hari</span>
                                </div>

                                <ul className="space-y-3 mb-6 text-left">
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-green-500" />
                                        <span className="text-sm">Akses penuh semua fitur</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-green-500" />
                                        <span className="text-sm">Trade journal futures & spot</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-green-500" />
                                        <span className="text-sm">Kalkulator posisi</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-green-500" />
                                        <span className="text-sm">Statistik & analisis</span>
                                    </li>
                                </ul>

                                <Button
                                    className="w-full"
                                    variant={index === 1 ? "default" : "outline"}
                                    onClick={() => handleSelectPlan(product.id)}
                                >
                                    Pilih Paket
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <div className="text-center mt-12 text-muted-foreground text-sm">
                <p>Pembayaran aman melalui Xendit. Support QRIS, Transfer Bank, E-Wallet.</p>
            </div>
        </div>
    );
}
