"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { TrendingUp, Shield, BarChart3, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const { signUp } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (password !== confirmPassword) {
            setError("Password tidak cocok");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Password minimal 6 karakter");
            setLoading(false);
            return;
        }

        const { error } = await signUp(email, password);

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setSuccess(true);
        }
    };

    if (success) {
        return (
            <div className="min-h-[85vh] flex items-center justify-center px-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <div className="mx-auto mb-4 p-4 bg-green-500/10 rounded-full w-fit">
                            <CheckCircle2 className="h-12 w-12 text-green-500" />
                        </div>
                        <CardTitle className="text-2xl">Cek Email Anda</CardTitle>
                        <CardDescription className="text-base">
                            Kami sudah kirim link konfirmasi ke <strong className="text-foreground">{email}</strong>.
                            Klik link tersebut untuk mengaktifkan akun Anda.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/login">
                            <Button className="w-full h-11">Kembali ke Login</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-[85vh] flex">
            {/* Left: Illustration/Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-500/10 via-primary/10 to-background items-center justify-center p-12">
                <div className="max-w-md space-y-8">
                    <div className="flex items-center gap-3">
                        <Image
                            src="/LogoLight.svg"
                            alt="Catat Cuanmu"
                            width={48}
                            height={48}
                            className="dark:hidden"
                        />
                        <Image
                            src="/LogoDark.svg"
                            alt="Catat Cuanmu"
                            width={48}
                            height={48}
                            className="hidden dark:block"
                        />
                        <span className="text-2xl font-bold">Catat Cuanmu</span>
                    </div>

                    <h2 className="text-3xl font-bold">
                        Mulai Perjalanan Trading Anda yang{" "}
                        <span className="text-primary">Lebih Terstruktur</span>
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-card/50 rounded-lg border">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <TrendingUp className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Track P&L Real-time</h3>
                                <p className="text-sm text-muted-foreground">Pantau profit dan loss secara akurat</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-card/50 rounded-lg border">
                            <div className="p-2 bg-green-500/10 rounded-lg">
                                <BarChart3 className="h-6 w-6 text-green-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Analytics Mendalam</h3>
                                <p className="text-sm text-muted-foreground">Analisis strategi trading Anda</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-card/50 rounded-lg border">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Shield className="h-6 w-6 text-blue-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Data Aman & Private</h3>
                                <p className="text-sm text-muted-foreground">Hanya Anda yang bisa akses</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Register Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 lg:hidden">
                            <Image
                                src="/LogoLight.svg"
                                alt="Catat Cuanmu"
                                width={48}
                                height={48}
                                className="dark:hidden mx-auto"
                            />
                            <Image
                                src="/LogoDark.svg"
                                alt="Catat Cuanmu"
                                width={48}
                                height={48}
                                className="hidden dark:block mx-auto"
                            />
                        </div>
                        <CardTitle className="text-2xl">Buat Akun Baru</CardTitle>
                        <CardDescription>Daftar gratis dan mulai tracking trading Anda</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-md">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Minimal 6 karakter"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Ulangi password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="h-11"
                                />
                            </div>

                            <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                                {loading ? "Mendaftar..." : "Daftar Sekarang"}
                            </Button>

                            <p className="text-center text-sm text-muted-foreground">
                                Sudah punya akun?{" "}
                                <Link href="/login" className="text-primary font-medium hover:underline">
                                    Masuk di sini
                                </Link>
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
