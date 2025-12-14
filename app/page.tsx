"use client";

import { useAuth } from "@/contexts/auth-context";
import { useSubscription } from "@/contexts/subscription-context";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { LandingHero } from "@/components/landing-page/hero";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { isSubscribed, isLoading: subLoading } = useSubscription();

  // Show loading while checking auth and subscription
  if (authLoading || (user && subLoading)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not logged in OR logged in but not subscribed -> show landing with pricing
  if (!user || !isSubscribed) {
    return <LandingHero />;
  }

  // Logged in AND subscribed -> show dashboard
  return <DashboardView />;
}
