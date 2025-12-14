"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PaymentSuccessPage() {
    return (
        <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-md w-full text-center">
                <CardContent className="pt-10 pb-8">
                    <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                        <CheckCircle className="h-10 w-10 text-green-500" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Pembayaran Berhasil!</h1>
                    <p className="text-muted-foreground mb-6">
                        Terima kasih! Langganan Anda telah aktif. Sekarang Anda dapat menggunakan semua fitur premium.
                    </p>
                    <div className="space-y-3">
                        <Link href="/">
                            <Button className="w-full">Mulai Trading Journal</Button>
                        </Link>
                        <Link href="/pricing">
                            <Button variant="outline" className="w-full">Lihat Paket Lain</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
