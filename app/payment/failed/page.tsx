"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PaymentFailedPage() {
    return (
        <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-md w-full text-center">
                <CardContent className="pt-10 pb-8">
                    <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                        <XCircle className="h-10 w-10 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Pembayaran Gagal</h1>
                    <p className="text-muted-foreground mb-6">
                        Maaf, pembayaran Anda tidak dapat diproses. Silakan coba lagi atau hubungi customer support.
                    </p>
                    <div className="space-y-3">
                        <Link href="/pricing">
                            <Button className="w-full">Coba Lagi</Button>
                        </Link>
                        <Link href="/">
                            <Button variant="outline" className="w-full">Kembali ke Dashboard</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
