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
import { TrendingUp, Shield, BarChart3 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const { signIn } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const { error } = await signIn(email, password);

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            window.location.href = "/";
        }
    };

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
                        Kelola Trading Anda dengan{" "}
                        <span className="text-primary">Lebih Baik</span>
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

            {/* Right: Login Form */}
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
                        <CardTitle className="text-2xl">Welcome Back</CardTitle>
                        <CardDescription>Masuk ke Trading Journal Anda</CardDescription>
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
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-11"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">
                                    Ingat saya
                                </Label>
                            </div>

                            <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                                {loading ? "Masuk..." : "Masuk"}
                            </Button>

                            <p className="text-center text-sm text-muted-foreground">
                                Belum punya akun?{" "}
                                <Link href="/register" className="text-primary font-medium hover:underline">
                                    Daftar Sekarang
                                </Link>
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
