import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart2, ShieldCheck, Wallet } from "lucide-react";

export function LandingHero() {
    return (
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 flex flex-col items-center text-center">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center space-y-4 text-center">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
                            Catat Cuanmu With Precision
                        </h1>
                        <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                            The professional trading journal for crypto futures and spot portfolios. Track your P&L, analyze your strategy, and grow your wealth.
                        </p>
                    </div>
                    <div className="space-x-4">
                        <Link href="/login">
                            <Button size="lg" className="h-12 px-8 text-lg font-semibold shadow-lg hover:shadow-xl transition-all">
                                Mulai Sekarang <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="/register">
                            <Button variant="outline" size="lg" className="h-12 px-8 text-lg">
                                Buat Akun Gratis
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Feature Grid */}
            <div className="container px-4 md:px-6 mt-16 md:mt-24">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    <div className="flex flex-col items-center space-y-2 p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <BarChart2 className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold">Analytics Mendalam</h3>
                        <p className="text-center text-muted-foreground">Analisis performa trading futures dan spot Anda dengan visualisasi data yang akurat.</p>
                    </div>
                    <div className="flex flex-col items-center space-y-2 p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <Wallet className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold">Multi-Currency</h3>
                        <p className="text-center text-muted-foreground">Pantau portfolio dalam USD maupun IDR dengan kurs real-time yang selalu update.</p>
                    </div>
                    <div className="flex flex-col items-center space-y-2 p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <ShieldCheck className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold">Data Terisolasi</h3>
                        <p className="text-center text-muted-foreground">Keamanan data terjamin. Catatan trading Anda private dan hanya bisa diakses oleh Anda.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
