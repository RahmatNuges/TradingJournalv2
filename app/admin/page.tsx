"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Package, Ticket, Users, TrendingUp } from "lucide-react";

// Types
interface Order {
    id: string;
    user_email: string;
    amount_original: number;
    discount_amount: number;
    amount_final: number;
    status: string;
    created_at: string;
    paid_at: string | null;
    products: { name: string } | null;
    coupons: { code: string } | null;
}

interface Product {
    id: string;
    name: string;
    description: string;
    price_idr: number;
    duration_days: number;
    is_active: boolean;
}

interface Coupon {
    id: string;
    code: string;
    discount_percent: number | null;
    discount_amount: number | null;
    max_uses: number | null;
    used_count: number;
    valid_until: string | null;
    is_active: boolean;
}

interface Stats {
    totalOrders: number;
    paidOrders: number;
    totalRevenue: number;
    activeSubscriptions: number;
}

export default function AdminPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("orders");

    // Data states
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [stats, setStats] = useState<Stats>({
        totalOrders: 0,
        paidOrders: 0,
        totalRevenue: 0,
        activeSubscriptions: 0,
    });

    // Check admin status
    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            router.push("/login");
            return;
        }

        // Check is_admin in user metadata
        const adminStatus = user.user_metadata?.is_admin === true;
        setIsAdmin(adminStatus);

        if (!adminStatus) {
            router.push("/");
            return;
        }

        loadData();
    }, [user, authLoading, router]);

    const loadData = async () => {
        if (!supabase) return;
        setLoading(true);

        try {
            // Load orders
            const { data: ordersData } = await supabase
                .from("orders")
                .select("*, products(name), coupons(code)")
                .order("created_at", { ascending: false })
                .limit(50);

            if (ordersData) setOrders(ordersData);

            // Load products
            const { data: productsData } = await supabase
                .from("products")
                .select("*")
                .order("sort_order");

            if (productsData) setProducts(productsData);

            // Load coupons
            const { data: couponsData } = await supabase
                .from("coupons")
                .select("*")
                .order("created_at", { ascending: false });

            if (couponsData) setCoupons(couponsData);

            // Calculate stats
            const paidOrders = ordersData?.filter(o => o.status === "PAID") || [];
            const totalRevenue = paidOrders.reduce((sum, o) => sum + o.amount_final, 0);

            const { count: activeSubsCount } = await supabase
                .from("subscriptions")
                .select("*", { count: "exact", head: true })
                .eq("is_active", true)
                .gt("expires_at", new Date().toISOString());

            setStats({
                totalOrders: ordersData?.length || 0,
                paidOrders: paidOrders.length,
                totalRevenue,
                activeSubscriptions: activeSubsCount || 0,
            });
        } catch (error) {
            console.error("Error loading admin data:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PAID":
                return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Lunas</Badge>;
            case "PENDING":
                return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Menunggu</Badge>;
            case "EXPIRED":
                return <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20">Kadaluarsa</Badge>;
            case "FAILED":
                return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Gagal</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-pulse text-muted-foreground">Memuat...</div>
            </div>
        );
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Order</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalOrders}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Order Lunas</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">{stats.paidOrders}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Pendapatan</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatRupiah(stats.totalRevenue)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Subscriber Aktif</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                    <TabsTrigger value="orders" className="gap-2">
                        <ShoppingCart className="h-4 w-4" /> Orders
                    </TabsTrigger>
                    <TabsTrigger value="products" className="gap-2">
                        <Package className="h-4 w-4" /> Products
                    </TabsTrigger>
                    <TabsTrigger value="coupons" className="gap-2">
                        <Ticket className="h-4 w-4" /> Coupons
                    </TabsTrigger>
                </TabsList>

                {/* Orders Tab */}
                <TabsContent value="orders">
                    <Card>
                        <CardHeader>
                            <CardTitle>Daftar Order</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left py-3 px-2 font-medium">Email</th>
                                            <th className="text-left py-3 px-2 font-medium">Produk</th>
                                            <th className="text-right py-3 px-2 font-medium">Harga</th>
                                            <th className="text-right py-3 px-2 font-medium">Diskon</th>
                                            <th className="text-right py-3 px-2 font-medium">Total</th>
                                            <th className="text-center py-3 px-2 font-medium">Status</th>
                                            <th className="text-right py-3 px-2 font-medium">Tanggal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order) => (
                                            <tr key={order.id} className="border-b border-border/50 hover:bg-secondary/30">
                                                <td className="py-3 px-2">{order.user_email}</td>
                                                <td className="py-3 px-2">{order.products?.name || "-"}</td>
                                                <td className="py-3 px-2 text-right font-mono">{formatRupiah(order.amount_original)}</td>
                                                <td className="py-3 px-2 text-right font-mono text-green-500">
                                                    {order.discount_amount > 0 ? `-${formatRupiah(order.discount_amount)}` : "-"}
                                                </td>
                                                <td className="py-3 px-2 text-right font-mono font-medium">{formatRupiah(order.amount_final)}</td>
                                                <td className="py-3 px-2 text-center">{getStatusBadge(order.status)}</td>
                                                <td className="py-3 px-2 text-right text-muted-foreground">{formatDate(order.created_at)}</td>
                                            </tr>
                                        ))}
                                        {orders.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="py-8 text-center text-muted-foreground">
                                                    Belum ada order
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Products Tab */}
                <TabsContent value="products">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Daftar Produk</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                {products.map((product) => (
                                    <div
                                        key={product.id}
                                        className="flex items-center justify-between p-4 rounded-lg border border-border bg-secondary/20"
                                    >
                                        <div>
                                            <div className="font-medium flex items-center gap-2">
                                                {product.name}
                                                {!product.is_active && (
                                                    <Badge variant="outline" className="text-xs">Nonaktif</Badge>
                                                )}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {product.description} • {product.duration_days} hari
                                            </div>
                                        </div>
                                        <div className="text-xl font-bold">{formatRupiah(product.price_idr)}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Coupons Tab */}
                <TabsContent value="coupons">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Daftar Kupon</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left py-3 px-2 font-medium">Kode</th>
                                            <th className="text-left py-3 px-2 font-medium">Diskon</th>
                                            <th className="text-center py-3 px-2 font-medium">Penggunaan</th>
                                            <th className="text-left py-3 px-2 font-medium">Berlaku Sampai</th>
                                            <th className="text-center py-3 px-2 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {coupons.map((coupon) => (
                                            <tr key={coupon.id} className="border-b border-border/50 hover:bg-secondary/30">
                                                <td className="py-3 px-2 font-mono font-medium">{coupon.code}</td>
                                                <td className="py-3 px-2">
                                                    {coupon.discount_percent
                                                        ? `${coupon.discount_percent}%`
                                                        : formatRupiah(coupon.discount_amount || 0)}
                                                </td>
                                                <td className="py-3 px-2 text-center">
                                                    {coupon.used_count} / {coupon.max_uses || "∞"}
                                                </td>
                                                <td className="py-3 px-2 text-muted-foreground">
                                                    {coupon.valid_until ? formatDate(coupon.valid_until) : "Selamanya"}
                                                </td>
                                                <td className="py-3 px-2 text-center">
                                                    {coupon.is_active ? (
                                                        <Badge className="bg-green-500/10 text-green-500">Aktif</Badge>
                                                    ) : (
                                                        <Badge variant="outline">Nonaktif</Badge>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {coupons.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="py-8 text-center text-muted-foreground">
                                                    Belum ada kupon
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
