"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BarChart2, TrendingUp, Wallet, Check, Zap, Star, Crown, LineChart, PiggyBank } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";

interface Product {
    id: string;
    name: string;
    description: string;
    price_idr: number;
    discount_price_idr: number | null;
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

    const getDiscountPercent = (original: number, discounted: number) => {
        return Math.round((1 - discounted / original) * 100);
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
                                    ✨ Trading Journal Buat Kamu yang Serius Profit
                                </Badge>
                                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-6xl">
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-emerald-500 to-primary">
                                        Pisahin Porto
                                    </span>
                                    <br />
                                    <span className="text-foreground">Trading & Investing</span>
                                </h1>
                                <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
                                    Biar nggak bingung! <strong>Trading harian</strong> ya dicatat terpisah dari <strong>investasi long-term</strong>.
                                    Track profit, analisis performa, dan jadi trader yang lebih disiplin.
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
                                    src="/dashboard-mockup.webp"
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

                {/* Value Proposition - Why Separate? */}
                <div className="container px-4 md:px-6 mx-auto mt-20">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-bold mb-2">Kenapa Harus Dipisah?</h2>
                        <p className="text-muted-foreground">Ini yang bikin banyak trader pemula bingung...</p>
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 max-w-4xl mx-auto">
                        <div className="flex flex-col space-y-3 p-6 rounded-xl border bg-card/50 backdrop-blur text-card-foreground shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-orange-500/10 rounded-full">
                                    <LineChart className="h-6 w-6 text-orange-500" />
                                </div>
                                <h3 className="text-xl font-bold">Trading (Futures)</h3>
                            </div>
                            <p className="text-muted-foreground text-sm">
                                Harian, leverage, perlu track entry/exit, winrate, risk-reward ratio.
                                <span className="text-foreground font-medium"> Fokus cuan cepat, tapi risikonya juga tinggi.</span>
                            </p>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                                <li>✓ Track setiap trade harian</li>
                                <li>✓ Analisis winrate & P&L</li>
                                <li>✓ Kalkulator posisi & risk</li>
                            </ul>
                        </div>
                        <div className="flex flex-col space-y-3 p-6 rounded-xl border bg-card/50 backdrop-blur text-card-foreground shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-emerald-500/10 rounded-full">
                                    <PiggyBank className="h-6 w-6 text-emerald-500" />
                                </div>
                                <h3 className="text-xl font-bold">Investasi (Spot)</h3>
                            </div>
                            <p className="text-muted-foreground text-sm">
                                Long-term, DCA bulanan, hold berbulan-bulan sampai bertahun-tahun.
                                <span className="text-foreground font-medium"> Fokus growth jangka panjang.</span>
                            </p>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                                <li>✓ Track portfolio spot</li>
                                <li>✓ Pantau alokasi aset</li>
                                <li>✓ Monitor investasi DCA</li>
                            </ul>
                        </div>
                    </div>
                    <p className="text-center text-muted-foreground text-sm mt-6">
                        💡 <span className="text-foreground">Dengan dipisah</span>, kamu tahu mana yang profit dari trading, mana dari investasi. Gak campur aduk!
                    </p>
                </div>

                {/* Feature Grid */}
                <div className="container px-4 md:px-6 mx-auto mt-16">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="flex flex-col items-center space-y-3 p-6 rounded-xl border bg-card/50 backdrop-blur text-card-foreground shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-4 bg-primary/10 rounded-full">
                                <BarChart2 className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold">Analytics yang Jelas</h3>
                            <p className="text-center text-muted-foreground text-sm">Lihat winrate, total P&L, dan performa trading kamu dalam dashboard yang simpel.</p>
                        </div>
                        <div className="flex flex-col items-center space-y-3 p-6 rounded-xl border bg-card/50 backdrop-blur text-card-foreground shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-4 bg-primary/10 rounded-full">
                                <Wallet className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold">Multi-Currency</h3>
                            <p className="text-center text-muted-foreground text-sm">Mau track dalam USD atau IDR? Bisa keduanya! Kurs update otomatis.</p>
                        </div>
                        <div className="flex flex-col items-center space-y-3 p-6 rounded-xl border bg-card/50 backdrop-blur text-card-foreground shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-4 bg-primary/10 rounded-full">
                                <TrendingUp className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold">Jadi Lebih Disiplin</h3>
                            <p className="text-center text-muted-foreground text-sm">Dengan tracking rutin, kamu bisa evaluasi kesalahan dan improve strategi.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="w-full py-16 md:py-24 bg-secondary/20">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="text-center mb-12">
                        <Badge className="bg-red-500/10 text-red-500 border-red-500/20 mb-4">
                            🔥 Promo Terbatas
                        </Badge>
                        <h2 className="text-3xl font-bold mb-4">Harga Spesial Buat Kamu!</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Investasi kecil untuk jadi trader yang lebih profitable. Pilih yang cocok buat kamu.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center">
                            <div className="animate-pulse text-muted-foreground">Memuat paket...</div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            {products.map((product, index) => {
                                const hasDiscount = product.discount_price_idr && product.discount_price_idr < product.price_idr;
                                const displayPrice = hasDiscount ? product.discount_price_idr! : product.price_idr;

                                return (
                                    <Card
                                        key={product.id}
                                        className={`relative overflow-hidden transition-all hover:scale-105 hover:shadow-xl ${index === 1 ? "border-primary ring-2 ring-primary/20" : ""
                                            }`}
                                    >
                                        {hasDiscount && (
                                            <div className="absolute top-0 left-0 bg-red-500 text-white px-3 py-1 text-xs font-bold rounded-br-lg">
                                                DISKON {getDiscountPercent(product.price_idr, product.discount_price_idr!)}%
                                            </div>
                                        )}
                                        {index === 1 && (
                                            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
                                                POPULER
                                            </div>
                                        )}
                                        {index === 2 && !hasDiscount && (
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
                                                {hasDiscount && (
                                                    <div className="text-muted-foreground line-through text-lg mb-1">
                                                        {formatRupiah(product.price_idr)}
                                                    </div>
                                                )}
                                                <span className={`text-4xl font-bold ${hasDiscount ? "text-emerald-500" : ""}`}>
                                                    {formatRupiah(displayPrice)}
                                                </span>
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
                                );
                            })}
                        </div>
                    )}

                    <div className="text-center mt-12 text-muted-foreground text-sm">
                        <p>Pembayaran via Transfer Bank BCA. Proses aktivasi dalam 1x24 jam.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
