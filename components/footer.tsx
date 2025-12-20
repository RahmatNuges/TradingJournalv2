"use client";

import Link from "next/link";
import Image from "next/image";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-border bg-background/50 backdrop-blur">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Image
                                src="/LogoLight.svg"
                                alt="Catat Cuanmu"
                                width={32}
                                height={32}
                                className="dark:hidden"
                            />
                            <Image
                                src="/LogoDark.svg"
                                alt="Catat Cuanmu"
                                width={32}
                                height={32}
                                className="hidden dark:block"
                            />
                            <span className="font-bold text-lg">Catat Cuanmu</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Platform trading journal profesional untuk crypto futures dan spot trader.
                        </p>
                    </div>

                    {/* Product */}
                    <div className="space-y-4">
                        <h3 className="font-semibold">Produk</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link href="/pricing" className="hover:text-primary transition-colors">
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <Link href="/login" className="hover:text-primary transition-colors">
                                    Login
                                </Link>
                            </li>
                            <li>
                                <Link href="/register" className="hover:text-primary transition-colors">
                                    Register
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="space-y-4">
                        <h3 className="font-semibold">Support</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <a href="mailto:support@catatcuanmu.com" className="hover:text-primary transition-colors">
                                    Email Support
                                </a>
                            </li>
                            <li>
                                <a href="https://wa.me/62812345678" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                                    WhatsApp
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className="space-y-4">
                        <h3 className="font-semibold">Legal</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link href="/terms" className="hover:text-primary transition-colors">
                                    Syarat & Ketentuan
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="hover:text-primary transition-colors">
                                    Kebijakan Privasi
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        © {currentYear} Catat Cuanmu. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Pembayaran via</span>
                        <span className="font-semibold">Transfer Bank BCA</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
