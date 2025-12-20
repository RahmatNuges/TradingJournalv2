"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle, Package } from "lucide-react";
import Link from "next/link";

interface Order {
    id: string;
    external_id: string;
    amount_original: number;
    discount_amount: number;
    amount_final: number;
    status: string;
    created_at: string;
    paid_at: string | null;
    products: { name: string; duration_days: number } | null;
}

export default function MyOrdersPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            router.push("/login");
            return;
        }

        loadOrders();
    }, [user, authLoading, router]);

    const loadOrders = async () => {
        if (!supabase || !user) return;

        const { data, error } = await supabase
            .from("orders")
            .select("*, products(name, duration_days)")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error loading orders:", error);
        }

        if (data) {
            setOrders(data);
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

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case "PAID":
                return {
                    label: "Lunas",
                    icon: <CheckCircle className="h-4 w-4" />,
                    className: "bg-green-500/10 text-green-500 border-green-500/20",
                    description: "Pembayaran telah dikonfirmasi. Anda sudah bisa menggunakan fitur premium.",
                };
            case "PENDING":
                return {
                    label: "Menunggu Konfirmasi",
                    icon: <Clock className="h-4 w-4" />,
                    className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
                    description: "Bukti transfer sedang diverifikasi oleh admin. Mohon tunggu 1x24 jam kerja.",
                };
            case "REJECTED":
                return {
                    label: "Ditolak",
                    icon: <XCircle className="h-4 w-4" />,
                    className: "bg-red-500/10 text-red-500 border-red-500/20",
                    description: "Pembayaran ditolak oleh admin. Silakan hubungi support jika ada pertanyaan.",
                };
            case "EXPIRED":
                return {
                    label: "Kadaluarsa",
                    icon: <AlertCircle className="h-4 w-4" />,
                    className: "bg-gray-500/10 text-gray-500 border-gray-500/20",
                    description: "Order sudah kadaluarsa.",
                };
            default:
                return {
                    label: status,
                    icon: <AlertCircle className="h-4 w-4" />,
                    className: "bg-gray-500/10 text-gray-500 border-gray-500/20",
                    description: "",
                };
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-pulse text-muted-foreground">Memuat...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Orderan Saya</h1>
                    <p className="text-muted-foreground text-sm">Riwayat transaksi dan status pembayaran</p>
                </div>
            </div>

            {/* Orders List */}
            {orders.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Belum Ada Order</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                            Anda belum memiliki riwayat order.
                        </p>
                        <Link href="/pricing">
                            <Button>Lihat Paket Langganan</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => {
                        const statusInfo = getStatusInfo(order.status);

                        return (
                            <Card key={order.id} className="overflow-hidden">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg">
                                                {order.products?.name || "Paket Langganan"}
                                            </CardTitle>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                ID: {order.external_id}
                                            </p>
                                        </div>
                                        <Badge className={statusInfo.className}>
                                            <span className="flex items-center gap-1">
                                                {statusInfo.icon}
                                                {statusInfo.label}
                                            </span>
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {/* Status Description */}
                                    <div className={`p-3 rounded-lg text-sm ${order.status === "PENDING" ? "bg-yellow-500/5 border border-yellow-500/20" :
                                            order.status === "PAID" ? "bg-green-500/5 border border-green-500/20" :
                                                order.status === "REJECTED" ? "bg-red-500/5 border border-red-500/20" :
                                                    "bg-secondary/50"
                                        }`}>
                                        {statusInfo.description}
                                    </div>

                                    {/* Order Details */}
                                    <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t border-border">
                                        <div>
                                            <span className="text-muted-foreground block">Durasi</span>
                                            <span className="font-medium">{order.products?.duration_days || 30} hari</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground block">Tanggal Order</span>
                                            <span className="font-medium">{formatDate(order.created_at)}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground block">Total Bayar</span>
                                            <span className="font-bold text-lg">{formatRupiah(order.amount_final)}</span>
                                        </div>
                                        {order.paid_at && (
                                            <div>
                                                <span className="text-muted-foreground block">Dikonfirmasi</span>
                                                <span className="font-medium text-green-500">{formatDate(order.paid_at)}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Discount Info */}
                                    {order.discount_amount > 0 && (
                                        <div className="text-xs text-muted-foreground">
                                            Harga asli: {formatRupiah(order.amount_original)} • Diskon: -{formatRupiah(order.discount_amount)}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
