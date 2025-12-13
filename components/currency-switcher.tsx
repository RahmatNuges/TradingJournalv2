"use client";

import { useCurrency, Currency } from "@/contexts/currency-context";
import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";

export function CurrencySwitcher() {
    const { currency, setCurrency } = useCurrency();

    const toggleCurrency = () => {
        setCurrency(currency === "USD" ? "IDR" : "USD");
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={toggleCurrency}
            className="font-mono text-xs gap-1"
            title={`Switch to ${currency === "USD" ? "IDR" : "USD"}`}
        >
            {currency === "USD" ? (
                <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    USD
                </span>
            ) : (
                <span>Rp IDR</span>
            )}
        </Button>
    );
}
