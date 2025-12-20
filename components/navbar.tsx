"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { CurrencySwitcher } from "@/components/currency-switcher";
import { Menu, X, LogOut, User, LayoutDashboard, TrendingUp, Wallet, Shield, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useSubscription } from "@/contexts/subscription-context";
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
    const { isSubscribed, isAdmin } = useSubscription();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Hide full nav on login/register pages
    const isAuthPage = pathname === "/login" || pathname === "/register";

    // Show nav links only if user is subscribed or admin
    const showNavLinks = user && (isSubscribed || isAdmin);

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

                {/* Desktop Navigation Links - only show when subscribed */}
                {!isAuthPage && showNavLinks && (
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
                                                className="gap-2 border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10"
                                            >
                                                <Shield className="h-4 w-4" />
                                                Admin
                                            </Button>
                                        </Link>
                                    )}
                                    {/* User Avatar Dropdown */}
                                    <div className="relative group">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="rounded-full bg-secondary hover:bg-secondary/80"
                                        >
                                            <User className="h-4 w-4" />
                                        </Button>
                                        {/* Dropdown Menu */}
                                        <div className="absolute right-0 top-full mt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                            <div className="rounded-lg border border-border bg-card shadow-lg p-2">
                                                <div className="px-3 py-2 border-b border-border mb-2">
                                                    <p className="text-xs text-muted-foreground">Masuk sebagai</p>
                                                    <p className="text-sm font-medium truncate">{user.email}</p>
                                                </div>
                                                <Link
                                                    href="/my-orders"
                                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md text-foreground hover:bg-secondary transition-colors"
                                                >
                                                    <ShoppingBag className="h-4 w-4" />
                                                    Orderan Saya
                                                </Link>
                                                <button
                                                    onClick={handleSignOut}
                                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md text-red-500 hover:bg-red-500/10 transition-colors"
                                                >
                                                    <LogOut className="h-4 w-4" />
                                                    Logout
                                                </button>
                                            </div>
                                        </div>
                                    </div>
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
                    {!isAuthPage && showNavLinks && (
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
            {mobileMenuOpen && showNavLinks && (
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
