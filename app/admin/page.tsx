"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ShoppingCart, Package, Ticket, Users, TrendingUp, Plus, Pencil, Trash2, Eye, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { ProductDialog } from "@/components/admin/product-dialog";
import { CouponDialog } from "@/components/admin/coupon-dialog";
import { SubscriptionDialog } from "@/components/admin/subscription-dialog";
import Image from "next/image";

// Types
interface Order {
    id: string;
    user_id: string;
    user_email: string;
    product_id: string;
    external_id: string;
    amount_original: number;
    discount_amount: number;
    amount_final: number;
    status: string;
    created_at: string;
    paid_at: string | null;
    bank_name: string | null;
    bank_account_name: string | null;
    payment_proof_url: string | null;
    admin_viewed: boolean;
    products: { name: string; duration_days: number } | null;
}

interface Product {
    id: string;
    name: string;
    description: string;
    price_idr: number;
    discount_price_idr: number | null;
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

interface Subscription {
    id: string;
    user_id: string;
    user_email?: string;
    plan_name: string;
    starts_at: string;
    expires_at: string;
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
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [stats, setStats] = useState<Stats>({
        totalOrders: 0,
        paidOrders: 0,
        totalRevenue: 0,
        activeSubscriptions: 0,
    });

    // Dialog states
    const [productDialogOpen, setProductDialogOpen] = useState(false);
    const [couponDialogOpen, setCouponDialogOpen] = useState(false);
    const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

    // Order review states
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

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
            const { data: ordersData, error: ordersError } = await supabase
                .from("orders")
                .select("*, products(name)")
                .order("created_at", { ascending: false })
                .limit(50);

            if (ordersError) {
                console.error("Error loading orders:", ordersError);
            }
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

            // Load subscriptions with user emails from orders
            const { data: subsData } = await supabase
                .from("subscriptions")
                .select("*")
                .order("expires_at", { ascending: false });

            if (subsData) {
                // Enrich with user emails from orders
                const enrichedSubs = await Promise.all(subsData.map(async (sub) => {
                    if (!supabase) return { ...sub, user_email: "Unknown" };
                    const { data: orderData } = await supabase
                        .from("orders")
                        .select("user_email")
                        .eq("user_id", sub.user_id)
                        .limit(1)
                        .single();
                    return { ...sub, user_email: orderData?.user_email || "Unknown" };
                }));
                setSubscriptions(enrichedSubs);
            }

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
            case "REJECTED":
                return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Ditolak</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    // CRUD handlers
    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setProductDialogOpen(true);
    };

    const handleAddProduct = () => {
        setEditingProduct(null);
        setProductDialogOpen(true);
    };

    const handleDeleteProduct = async (id: string) => {
        if (!supabase || !confirm("Yakin ingin menghapus produk ini?")) return;
        await supabase.from("products").delete().eq("id", id);
        loadData();
    };

    const handleEditCoupon = (coupon: Coupon) => {
        setEditingCoupon(coupon);
        setCouponDialogOpen(true);
    };

    const handleAddCoupon = () => {
        setEditingCoupon(null);
        setCouponDialogOpen(true);
    };

    const handleDeleteCoupon = async (id: string) => {
        if (!supabase || !confirm("Yakin ingin menghapus kupon ini?")) return;
        await supabase.from("coupons").delete().eq("id", id);
        loadData();
    };

    const handleEditSubscription = (subscription: Subscription) => {
        setEditingSubscription(subscription);
        setSubscriptionDialogOpen(true);
    };

    const handleAddSubscription = () => {
        setEditingSubscription(null);
        setSubscriptionDialogOpen(true);
    };

    const handleDeleteSubscription = async (id: string) => {
        if (!supabase || !confirm("Yakin ingin menghapus subscription ini?")) return;
        await supabase.from("subscriptions").delete().eq("id", id);
        loadData();
    };

    // Order review handlers
    const handleMarkAsViewed = async (orderId: string) => {
        if (!supabase) return;
        await supabase
            .from("orders")
            .update({ admin_viewed: true })
            .eq("id", orderId);

        // Update local state
        setOrders(prev => prev.map(o =>
            o.id === orderId ? { ...o, admin_viewed: true } : o
        ));
    };

    const handleApprove = async (order: Order) => {
        if (!supabase) return;
        if (!confirm("Setujui pembayaran ini? User akan otomatis berlangganan.")) return;

        setIsProcessing(true);
        try {
            // 1. Update order status to PAID
            const { error: orderError } = await supabase
                .from("orders")
                .update({
                    status: "PAID",
                    paid_at: new Date().toISOString(),
                    admin_viewed: true
                })
                .eq("id", order.id);

            if (orderError) throw orderError;

            // 2. Create subscription
            const durationDays = order.products?.duration_days || 30;
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + durationDays);

            const { error: subError } = await supabase
                .from("subscriptions")
                .upsert({
                    user_id: order.user_id,
                    order_id: order.id,
                    plan_name: order.products?.name || "Premium",
                    starts_at: new Date().toISOString(),
                    expires_at: expiresAt.toISOString(),
                    is_active: true,
                }, { onConflict: "user_id" });

            if (subError) throw subError;

            setSelectedOrder(null);
            loadData();
        } catch (error) {
            console.error("Error approving order:", error);
            alert("Gagal menyetujui order. Cek console untuk detail.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async (order: Order) => {
        if (!supabase) return;
        if (!confirm("Tolak pembayaran ini?")) return;

        setIsProcessing(true);
        try {
            const { error } = await supabase
                .from("orders")
                .update({
                    status: "REJECTED",
                    admin_viewed: true
                })
                .eq("id", order.id);

            if (error) throw error;

            setSelectedOrder(null);
            loadData();
        } catch (error) {
            console.error("Error rejecting order:", error);
            alert("Gagal menolak order.");
        } finally {
            setIsProcessing(false);
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
                    <TabsTrigger value="subscribers" className="gap-2">
                        <Users className="h-4 w-4" /> Subscribers
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
                                            <th className="text-right py-3 px-2 font-medium">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order) => (
                                            <tr
                                                key={order.id}
                                                className={`border-b border-border/50 hover:bg-secondary/30 cursor-pointer transition-colors
                                                    ${order.status === "PENDING" && !order.admin_viewed ? "bg-yellow-500/5" : ""}`}
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    if (order.status === "PENDING" && !order.admin_viewed) {
                                                        handleMarkAsViewed(order.id);
                                                    }
                                                }}
                                            >
                                                <td className="py-3 px-2">
                                                    <div className="flex items-center gap-2">
                                                        {order.user_email}
                                                        {order.status === "PENDING" && !order.admin_viewed && (
                                                            <span className="relative flex h-2 w-2">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-2">{order.products?.name || "-"}</td>
                                                <td className="py-3 px-2 text-right font-mono">{formatRupiah(order.amount_original)}</td>
                                                <td className="py-3 px-2 text-right font-mono text-green-500">
                                                    {order.discount_amount > 0 ? `-${formatRupiah(order.discount_amount)}` : "-"}
                                                </td>
                                                <td className="py-3 px-2 text-right font-mono font-medium">{formatRupiah(order.amount_final)}</td>
                                                <td className="py-3 px-2 text-center">{getStatusBadge(order.status)}</td>
                                                <td className="py-3 px-2 text-right text-muted-foreground">{formatDate(order.created_at)}</td>
                                                <td className="py-3 px-2 text-right">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedOrder(order);
                                                            if (order.status === "PENDING" && !order.admin_viewed) {
                                                                handleMarkAsViewed(order.id);
                                                            }
                                                        }}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {orders.length === 0 && (
                                            <tr>
                                                <td colSpan={8} className="py-8 text-center text-muted-foreground">
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
                            <Button size="sm" onClick={handleAddProduct}>
                                <Plus className="h-4 w-4 mr-1" /> Tambah Produk
                            </Button>
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
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                {product.discount_price_idr ? (
                                                    <>
                                                        <div className="text-sm text-muted-foreground line-through">
                                                            {formatRupiah(product.price_idr)}
                                                        </div>
                                                        <div className="text-xl font-bold text-emerald-500">
                                                            {formatRupiah(product.discount_price_idr)}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="text-xl font-bold">{formatRupiah(product.price_idr)}</div>
                                                )}
                                            </div>
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.id)} className="text-red-500 hover:text-red-600">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
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
                            <Button size="sm" onClick={handleAddCoupon}>
                                <Plus className="h-4 w-4 mr-1" /> Tambah Kupon
                            </Button>
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
                                            <th className="text-center py-3 px-2 font-medium">Aksi</th>
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
                                                <td className="py-3 px-2 text-center">
                                                    <div className="flex gap-1 justify-center">
                                                        <Button variant="ghost" size="icon" onClick={() => handleEditCoupon(coupon)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteCoupon(coupon.id)} className="text-red-500 hover:text-red-600">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {coupons.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="py-8 text-center text-muted-foreground">
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

                {/* Subscribers Tab */}
                <TabsContent value="subscribers">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Daftar Subscriber</CardTitle>
                            <Button size="sm" onClick={handleAddSubscription}>
                                <Plus className="h-4 w-4 mr-1" /> Tambah Subscriber
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left py-3 px-2 font-medium">Email</th>
                                            <th className="text-left py-3 px-2 font-medium">Paket</th>
                                            <th className="text-left py-3 px-2 font-medium">Mulai</th>
                                            <th className="text-left py-3 px-2 font-medium">Berakhir</th>
                                            <th className="text-center py-3 px-2 font-medium">Status</th>
                                            <th className="text-center py-3 px-2 font-medium">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subscriptions.map((sub) => {
                                            const isExpired = new Date(sub.expires_at) < new Date();
                                            return (
                                                <tr key={sub.id} className="border-b border-border/50 hover:bg-secondary/30">
                                                    <td className="py-3 px-2">{sub.user_email}</td>
                                                    <td className="py-3 px-2">{sub.plan_name}</td>
                                                    <td className="py-3 px-2 text-muted-foreground">
                                                        {formatDate(sub.starts_at)}
                                                    </td>
                                                    <td className="py-3 px-2 text-muted-foreground">
                                                        {formatDate(sub.expires_at)}
                                                    </td>
                                                    <td className="py-3 px-2 text-center">
                                                        {sub.is_active && !isExpired ? (
                                                            <Badge className="bg-green-500/10 text-green-500">Aktif</Badge>
                                                        ) : isExpired ? (
                                                            <Badge className="bg-red-500/10 text-red-500">Expired</Badge>
                                                        ) : (
                                                            <Badge variant="outline">Nonaktif</Badge>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-2 text-center">
                                                        <div className="flex gap-1 justify-center">
                                                            <Button variant="ghost" size="icon" onClick={() => handleEditSubscription(sub)}>
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteSubscription(sub.id)} className="text-red-500 hover:text-red-600">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {subscriptions.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="py-8 text-center text-muted-foreground">
                                                    Belum ada subscriber
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

            {/* Dialogs */}
            <ProductDialog
                open={productDialogOpen}
                onOpenChange={setProductDialogOpen}
                product={editingProduct}
                onSave={loadData}
            />
            <CouponDialog
                open={couponDialogOpen}
                onOpenChange={setCouponDialogOpen}
                coupon={editingCoupon}
                onSave={loadData}
            />
            <SubscriptionDialog
                open={subscriptionDialogOpen}
                onOpenChange={setSubscriptionDialogOpen}
                subscription={editingSubscription}
                onSave={loadData}
            />

            {/* Order Review Dialog */}
            <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Review Pembayaran</DialogTitle>
                        <DialogDescription>ID: {selectedOrder?.external_id}</DialogDescription>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="grid gap-6">
                            {/* Order Details */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground block">Email User</span>
                                    <span className="font-medium">{selectedOrder.user_email}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Paket</span>
                                    <span className="font-medium">{selectedOrder.products?.name || "-"}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Bank Pengirim</span>
                                    <span className="font-medium">{selectedOrder.bank_name || "-"}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Nama Rekening</span>
                                    <span className="font-medium">{selectedOrder.bank_account_name || "-"}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Nominal</span>
                                    <span className="font-bold text-lg">{formatRupiah(selectedOrder.amount_final)}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Waktu Upload</span>
                                    <span className="font-medium">{formatDate(selectedOrder.created_at)}</span>
                                </div>
                            </div>

                            {/* Payment Proof */}
                            {selectedOrder.payment_proof_url && (
                                <div className="space-y-2">
                                    <span className="text-sm text-muted-foreground">Bukti Transfer</span>
                                    <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-border bg-secondary/20">
                                        <Image
                                            src={selectedOrder.payment_proof_url}
                                            alt="Bukti Transfer"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                    <a
                                        href={selectedOrder.payment_proof_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-primary hover:underline flex items-center gap-1"
                                    >
                                        <ExternalLink className="h-3 w-3" />
                                        Buka gambar asli dalam tab baru
                                    </a>
                                </div>
                            )}

                            {/* Actions */}
                            {selectedOrder.status === "PENDING" && (
                                <div className="flex gap-3 pt-4 border-t border-border">
                                    <Button
                                        variant="destructive"
                                        className="flex-1"
                                        onClick={() => handleReject(selectedOrder)}
                                        disabled={isProcessing}
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Tolak
                                    </Button>
                                    <Button
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                        onClick={() => handleApprove(selectedOrder)}
                                        disabled={isProcessing}
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Setujui & Aktifkan
                                    </Button>
                                </div>
                            )}

                            {/* Status Info for non-pending */}
                            {selectedOrder.status !== "PENDING" && (
                                <div className="text-center py-4">
                                    {getStatusBadge(selectedOrder.status)}
                                    {selectedOrder.paid_at && (
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Dibayar: {formatDate(selectedOrder.paid_at)}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
