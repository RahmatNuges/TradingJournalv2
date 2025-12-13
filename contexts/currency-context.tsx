"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export type Currency = "USD" | "IDR";

interface CurrencyContextType {
    currency: Currency;
    setCurrency: (currency: Currency) => void;
    formatAmount: (amount: number) => string;
    exchangeRate: number;
    lastUpdated: Date | null;
    isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Storage keys
const STORAGE_KEY_CURRENCY = "tjv2-currency";
const STORAGE_KEY_RATE = "tjv2-exchange-rate";
const STORAGE_KEY_RATE_TIME = "tjv2-rate-updated";

// Cache duration: 12 hours in milliseconds
const CACHE_DURATION = 12 * 60 * 60 * 1000;

// Default fallback rate
const DEFAULT_USD_TO_IDR = 15800;

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const [currency, setCurrencyState] = useState<Currency>("USD");
    const [exchangeRate, setExchangeRate] = useState<number>(DEFAULT_USD_TO_IDR);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch exchange rate from API
    const fetchExchangeRate = useCallback(async () => {
        setIsLoading(true);
        try {
            // Using exchangerate-api.com (free tier, no API key needed for basic)
            const response = await fetch(
                "https://api.exchangerate-api.com/v4/latest/USD"
            );

            if (response.ok) {
                const data = await response.json();
                const rate = data.rates?.IDR || DEFAULT_USD_TO_IDR;

                // Save to localStorage
                const now = new Date();
                localStorage.setItem(STORAGE_KEY_RATE, rate.toString());
                localStorage.setItem(STORAGE_KEY_RATE_TIME, now.toISOString());

                setExchangeRate(rate);
                setLastUpdated(now);
                console.log(`💱 Exchange rate updated: 1 USD = ${rate} IDR`);
            }
        } catch (error) {
            console.warn("Failed to fetch exchange rate, using default:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Check if should refresh rate (at 00:00 and 12:00)
    const shouldRefreshRate = useCallback(() => {
        const savedTime = localStorage.getItem(STORAGE_KEY_RATE_TIME);
        if (!savedTime) return true;

        const lastUpdate = new Date(savedTime);
        const now = new Date();
        const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

        // Refresh if more than 12 hours old
        if (hoursSinceUpdate >= 12) return true;

        // Also refresh at 00:00 and 12:00
        const currentHour = now.getHours();
        const lastUpdateHour = lastUpdate.getHours();

        if (currentHour === 0 || currentHour === 12) {
            if (lastUpdateHour !== 0 && lastUpdateHour !== 12) {
                return true;
            }
        }

        return false;
    }, []);

    // Load saved preferences on mount
    useEffect(() => {
        // Load currency preference
        const savedCurrency = localStorage.getItem(STORAGE_KEY_CURRENCY) as Currency;
        if (savedCurrency === "USD" || savedCurrency === "IDR") {
            setCurrencyState(savedCurrency);
        }

        // Load cached rate
        const savedRate = localStorage.getItem(STORAGE_KEY_RATE);
        const savedTime = localStorage.getItem(STORAGE_KEY_RATE_TIME);

        if (savedRate) {
            setExchangeRate(parseFloat(savedRate));
        }
        if (savedTime) {
            setLastUpdated(new Date(savedTime));
        }

        // Fetch new rate if needed
        if (shouldRefreshRate()) {
            fetchExchangeRate();
        }
    }, [fetchExchangeRate, shouldRefreshRate]);

    // Set up interval to check for refresh (every hour)
    useEffect(() => {
        const interval = setInterval(() => {
            if (shouldRefreshRate()) {
                fetchExchangeRate();
            }
        }, 60 * 60 * 1000); // Check every hour

        return () => clearInterval(interval);
    }, [fetchExchangeRate, shouldRefreshRate]);

    const setCurrency = (newCurrency: Currency) => {
        setCurrencyState(newCurrency);
        localStorage.setItem(STORAGE_KEY_CURRENCY, newCurrency);
    };

    const formatAmount = (amount: number): string => {
        if (currency === "IDR") {
            const amountInIDR = amount * exchangeRate;
            return new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(amountInIDR);
        }

        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    return (
        <CurrencyContext.Provider value={{
            currency,
            setCurrency,
            formatAmount,
            exchangeRate,
            lastUpdated,
            isLoading
        }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error("useCurrency must be used within a CurrencyProvider");
    }
    return context;
}
