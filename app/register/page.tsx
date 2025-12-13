"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";

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
            <div className="min-h-[80vh] flex items-center justify-center px-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="text-4xl mb-2">✅</div>
                        <CardTitle className="text-2xl">Cek Email Anda</CardTitle>
                        <CardDescription>
                            Kami sudah kirim link konfirmasi ke <strong>{email}</strong>.
                            Klik link tersebut untuk mengaktifkan akun Anda.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/login">
                            <Button className="w-full">Kembali ke Login</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="text-4xl mb-2">📒</div>
                    <CardTitle className="text-2xl">Buat Akun Baru</CardTitle>
                    <CardDescription>Daftar untuk mulai tracking trading Anda</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-loss bg-loss-muted rounded-md">
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
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Mendaftar..." : "Daftar"}
                        </Button>

                        <p className="text-center text-sm text-muted-foreground">
                            Sudah punya akun?{" "}
                            <Link href="/login" className="text-primary hover:underline">
                                Masuk
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
