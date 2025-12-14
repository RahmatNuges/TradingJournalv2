"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useCurrency, Currency } from "@/contexts/currency-context";
import { cn } from "@/lib/utils";

interface CurrencyInputProps {
    value: string;
    onChange: (valueInUSD: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

/**
 * Input field with currency toggle (USD/IDR)
 * Always returns value in USD for database storage
 * Shows real-time conversion to the alternative currency
 */
export function CurrencyInput({
    value,
    onChange,
    placeholder = "0.00",
    className,
    disabled,
}: CurrencyInputProps) {
    const { exchangeRate } = useCurrency();
    const [inputCurrency, setInputCurrency] = useState<Currency>("USD");
    const [displayValue, setDisplayValue] = useState(value);

    // Convert input to USD when currency changes or value changes
    const handleValueChange = (inputValue: string) => {
        setDisplayValue(inputValue);

        const numValue = parseFloat(inputValue) || 0;

        if (inputCurrency === "IDR") {
            // Convert IDR to USD
            const usdValue = numValue / exchangeRate;
            onChange(usdValue.toFixed(2));
        } else {
            onChange(inputValue);
        }
    };

    // Toggle currency and convert existing value
    const toggleCurrency = () => {
        const numValue = parseFloat(displayValue) || 0;

        if (inputCurrency === "USD") {
            // Switching to IDR - convert USD to IDR
            const idrValue = numValue * exchangeRate;
            setDisplayValue(idrValue > 0 ? Math.round(idrValue).toString() : "");
            setInputCurrency("IDR");
        } else {
            // Switching to USD - convert IDR to USD
            const usdValue = numValue / exchangeRate;
            setDisplayValue(usdValue > 0 ? usdValue.toFixed(2) : "");
            setInputCurrency("USD");
        }
    };

    // Calculate conversion preview
    const numValue = parseFloat(displayValue) || 0;
    const conversionValue = inputCurrency === "USD"
        ? numValue * exchangeRate
        : numValue / exchangeRate;

    const conversionText = inputCurrency === "USD"
        ? `≈ Rp ${Math.round(conversionValue).toLocaleString("id-ID")}`
        : `≈ $${conversionValue.toFixed(2)}`;

    return (
        <div className="space-y-1">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        {inputCurrency === "USD" ? "$" : "Rp"}
                    </span>
                    <Input
                        type="number"
                        step="any"
                        value={displayValue}
                        onChange={(e) => handleValueChange(e.target.value)}
                        placeholder={placeholder}
                        className={cn("pl-9", className)}
                        disabled={disabled}
                    />
                </div>
                <button
                    type="button"
                    onClick={toggleCurrency}
                    disabled={disabled}
                    className={cn(
                        "px-3 py-2 rounded-md text-sm font-medium border transition-colors",
                        "bg-secondary hover:bg-secondary/80 border-border",
                        "flex items-center gap-1.5 min-w-[80px] justify-center",
                        disabled && "opacity-50 cursor-not-allowed"
                    )}
                >
                    <span className={inputCurrency === "USD" ? "font-bold text-foreground" : "text-muted-foreground"}>
                        $
                    </span>
                    <span className="text-muted-foreground">/</span>
                    <span className={inputCurrency === "IDR" ? "font-bold text-foreground" : "text-muted-foreground"}>
                        Rp
                    </span>
                </button>
            </div>
            {numValue > 0 && (
                <p className="text-xs text-muted-foreground pl-1">
                    {conversionText}
                </p>
            )}
        </div>
    );
}
