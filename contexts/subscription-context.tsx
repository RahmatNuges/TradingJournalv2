"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";

interface Subscription {
    id: string;
    plan_name: string;
    starts_at: string;
    expires_at: string;
    is_active: boolean;
}

interface SubscriptionContextType {
    subscription: Subscription | null;
    isSubscribed: boolean;
    isAdmin: boolean;
    isLoading: boolean;
    daysRemaining: number;
    refresh: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check if user is admin
    const isAdmin = user?.user_metadata?.is_admin === true;

    const fetchSubscription = async () => {
        if (!supabase || !user) {
            setSubscription(null);
            setIsLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from("subscriptions")
                .select("*")
                .eq("user_id", user.id)
                .single();

            if (error || !data) {
                setSubscription(null);
            } else {
                setSubscription(data);
            }
        } catch {
            setSubscription(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscription();
    }, [user]);

    // Check if subscription is active and not expired
    // ADMIN ALWAYS HAS ACCESS
    const isSubscribed = (() => {
        // Admin always has access
        if (isAdmin) return true;

        if (!subscription) return false;
        if (!subscription.is_active) return false;

        const expiresAt = new Date(subscription.expires_at);
        const now = new Date();
        return expiresAt > now;
    })();

    // Calculate days remaining
    const daysRemaining = (() => {
        if (isAdmin) return 999; // Admin has unlimited
        if (!subscription) return 0;
        const expiresAt = new Date(subscription.expires_at);
        const now = new Date();
        const diff = expiresAt.getTime() - now.getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    })();

    return (
        <SubscriptionContext.Provider value={{
            subscription,
            isSubscribed,
            isAdmin,
            isLoading,
            daysRemaining,
            refresh: fetchSubscription,
        }}>
            {children}
        </SubscriptionContext.Provider>
    );
}

export function useSubscription() {
    const context = useContext(SubscriptionContext);
    if (context === undefined) {
        throw new Error("useSubscription must be used within a SubscriptionProvider");
    }
    return context;
}
