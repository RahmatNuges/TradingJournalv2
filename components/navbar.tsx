"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/", label: "Dashboard", icon: "📊" },
    { href: "/futures", label: "Futures", icon: "📈" },
    { href: "/spot", label: "Spot", icon: "💰" },
];

export function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-14 max-w-7xl items-center px-4">
                {/* Brand */}
                <div className="mr-8 flex items-center space-x-2">
                    <span className="text-xl">📒</span>
                    <span className="font-bold text-lg">Trading Journal</span>
                </div>

                {/* Navigation Links */}
                <div className="flex items-center space-x-1">
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
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </div>

                {/* Right side - future: user menu or settings */}
                <div className="ml-auto flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">V2</span>
                </div>
            </div>
        </nav>
    );
}
