"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BarChart2, ShieldCheck, Wallet, Check, Zap, Star, Crown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";

interface Product {
    id: string;
    name: string;
    description: string;
    price_idr: number;
    duration_days: number;
}

export function LandingHero() {
    const { user } = useAuth();
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        if (!supabase) {
            setLoading(false);
            return;
        }

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
                return <Crown className="h-8 w-8 text-emerald-500" />;
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
        <div className="w-full">
            {/* Hero Section */}
            <section className="w-full py-12 md:py-20 lg:py-28">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left: Text Content */}
                        <div className="flex flex-col space-y-6 text-center lg:text-left">
                            <div className="space-y-4">
                                <Badge variant="outline" className="w-fit mx-auto lg:mx-0 text-sm px-4 py-1">
                                    🚀 Trading Journal #1 di Indonesia
                                </Badge>
                                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-emerald-500 to-primary">
                                    Catat Cuanmu
                                    <br />
                                    <span className="text-foreground">With Precision</span>
                                </h1>
                                <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
                                    Platform trading journal profesional untuk crypto futures dan spot.
                                    Analisis performa, track P&L, dan tingkatkan profitabilitas trading Anda.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                {user ? (
                                    <Link href="#pricing">
                                        <Button size="lg" className="h-12 px-8 text-lg font-semibold shadow-lg hover:shadow-xl transition-all w-full sm:w-auto">
                                            Pilih Paket <ArrowRight className="ml-2 h-5 w-5" />
                                        </Button>
                                    </Link>
                                ) : (
                                    <>
                                        <Link href="/login">
                                            <Button size="lg" className="h-12 px-8 text-lg font-semibold shadow-lg hover:shadow-xl transition-all w-full sm:w-auto">
                                                Mulai Sekarang <ArrowRight className="ml-2 h-5 w-5" />
                                            </Button>
                                        </Link>
                                        <Link href="/register">
                                            <Button variant="outline" size="lg" className="h-12 px-8 text-lg w-full sm:w-auto">
                                                Buat Akun Gratis
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Right: Dashboard Mockup */}
                        <div className="relative lg:block">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-primary/20 rounded-2xl blur-3xl"></div>
                            <div className="relative">
                                <img
                                    src="/dashboard-mockup.png"
                                    alt="Dashboard Preview"
                                    className="rounded-xl shadow-2xl border border-border/50 w-full"
                                />
                                <div className="absolute -bottom-4 -right-4 bg-green-500/90 text-white px-4 py-2 rounded-lg shadow-lg">
                                    <span className="font-bold">+24.5%</span> PnL Bulan Ini
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feature Grid */}
                <div className="container px-4 md:px-6 mx-auto mt-20">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="flex flex-col items-center space-y-3 p-6 rounded-xl border bg-card/50 backdrop-blur text-card-foreground shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-4 bg-primary/10 rounded-full">
                                <BarChart2 className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold">Analytics Mendalam</h3>
                            <p className="text-center text-muted-foreground text-sm">Analisis performa trading futures dan spot Anda dengan visualisasi data yang akurat.</p>
                        </div>
                        <div className="flex flex-col items-center space-y-3 p-6 rounded-xl border bg-card/50 backdrop-blur text-card-foreground shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-4 bg-primary/10 rounded-full">
                                <Wallet className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold">Multi-Currency</h3>
                            <p className="text-center text-muted-foreground text-sm">Pantau portfolio dalam USD maupun IDR dengan kurs real-time yang selalu update.</p>
                        </div>
                        <div className="flex flex-col items-center space-y-3 p-6 rounded-xl border bg-card/50 backdrop-blur text-card-foreground shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-4 bg-primary/10 rounded-full">
                                <ShieldCheck className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold">Data Terisolasi</h3>
                            <p className="text-center text-muted-foreground text-sm">Keamanan data terjamin. Catatan trading Anda private dan hanya bisa diakses oleh Anda.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="w-full py-16 md:py-24 bg-secondary/20">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Pilih Paket Langganan</h2>
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
                                        <div className="absolute top-0 right-0 bg-emerald-500 text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
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
            </section>
        </div>
    );
}
