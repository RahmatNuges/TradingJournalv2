"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { CurrencySwitcher } from "@/components/currency-switcher";
import { Menu, X, LogOut, User, LayoutDashboard, TrendingUp, Wallet, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { Logo } from "@/components/ui/logo";

const navItems = [
    { href: "/", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/futures", label: "Futures", icon: <TrendingUp className="h-4 w-4" /> },
    { href: "/spot", label: "Spot", icon: <Wallet className="h-4 w-4" /> },
];

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading, signOut } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Hide full nav on login/register pages
    const isAuthPage = pathname === "/login" || pathname === "/register";

    const handleSignOut = async () => {
        await signOut();
        router.push("/login");
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-14 max-w-7xl items-center px-4">
                {/* Brand */}
                <Link href="/" className="mr-4 md:mr-8 flex items-center">
                    <Logo />
                </Link>

                {/* Desktop Navigation Links - only show when logged in */}
                {!isAuthPage && user && (
                    <div className="hidden md:flex items-center space-x-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                                    pathname === item.href
                                        ? "bg-secondary text-foreground"
                                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                                )}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Right side */}
                <div className="ml-auto flex items-center space-x-1 sm:space-x-2">
                    <CurrencySwitcher />
                    <ThemeSwitcher />

                    {/* User Menu */}
                    {!loading && (
                        <>
                            {user ? (
                                <div className="hidden md:flex items-center gap-2">
                                    {/* Admin Button - only show if is_admin */}
                                    {user.user_metadata?.is_admin === true && (
                                        <Link href="/admin">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-2 border-purple-500/50 text-purple-500 hover:bg-purple-500/10"
                                            >
                                                <Shield className="h-4 w-4" />
                                                Admin
                                            </Button>
                                        </Link>
                                    )}
                                    <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-secondary/50">
                                        <User className="h-4 w-4" />
                                        <span className="text-sm text-muted-foreground max-w-[150px] truncate">
                                            {user.email}
                                        </span>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={handleSignOut} title="Logout">
                                        <LogOut className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                !isAuthPage && (
                                    <Link href="/login">
                                        <Button size="sm">Login</Button>
                                    </Link>
                                )
                            )}
                        </>
                    )}

                    {/* Mobile hamburger */}
                    {!isAuthPage && user && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    )}
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && user && (
                <div className="md:hidden border-t border-border/40 bg-background">
                    <div className="container mx-auto px-4 py-2 space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors",
                                    pathname === item.href
                                        ? "bg-secondary text-foreground"
                                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                                )}
                            >
                                <span className="text-lg">{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        ))}

                        {/* Mobile Logout */}
                        <div className="pt-2 mt-2 border-t border-border/40">
                            <div className="px-4 py-2 text-sm text-muted-foreground">
                                {user.email}
                            </div>
                            <button
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    handleSignOut();
                                }}
                                className="flex items-center gap-3 w-full px-4 py-3 rounded-md text-sm font-medium text-loss hover:bg-loss-muted transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
