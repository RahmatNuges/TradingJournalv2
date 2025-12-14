"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
}

export function Logo({ className }: LogoProps) {
    return (
        <div className={cn("relative flex items-center", className)}>
            {/* Mobile Logo (Short) */}
            <div className="md:hidden">
                <Image
                    src="/LogoDark.svg"
                    alt="Logo"
                    width={40}
                    height={40}
                    className="dark:block hidden w-10 h-10"
                />
                <Image
                    src="/LogoLight.svg"
                    alt="Logo"
                    width={40}
                    height={40}
                    className="block dark:hidden w-10 h-10"
                />
            </div>

            {/* Desktop Logo (Wide) */}
            <div className="hidden md:block">
                <Image
                    src="/LogoHorizontalForDark.svg"
                    alt="Logo"
                    width={200}
                    height={48}
                    className="dark:block hidden h-12 w-auto"
                    priority
                />
                <Image
                    src="/LogoHorizontalForLight.svg"
                    alt="Logo"
                    width={200}
                    height={48}
                    className="block dark:hidden h-12 w-auto"
                    priority
                />
            </div>
        </div>
    );
}
