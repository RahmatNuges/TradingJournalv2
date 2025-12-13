"use client";

import { useCurrency } from "@/contexts/currency-context";

/**
 * Hook to get currency formatting function based on context
 * Use this in components instead of formatCurrency from lib/calculations
 */
export function useFormatCurrency() {
    const { formatAmount, currency, exchangeRate, lastUpdated, isLoading } = useCurrency();

    // Format number as currency using context settings
    const formatCurrencyValue = (num: number): string => {
        return formatAmount(num);
    };

    // Format with sign prefix (+/-)
    const formatCurrencyWithSign = (num: number): string => {
        const formatted = formatAmount(Math.abs(num));
        if (currency === "IDR") {
            // For IDR, format already includes Rp
            const absFormatted = formatAmount(Math.abs(num));
            return num >= 0 ? absFormatted : `-${absFormatted}`;
        }
        return num >= 0 ? `+${formatted}` : `-${formatted}`;
    };

    return {
        formatCurrency: formatCurrencyValue,
        formatCurrencyWithSign,
        currency,
        exchangeRate,
        lastUpdated,
        isLoading,
    };
}
