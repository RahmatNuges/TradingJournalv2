"use client";

import { useAuth } from "@/contexts/auth-context";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { LandingHero } from "@/components/landing-page/hero";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <LandingHero />;
  }

  return <DashboardView />;
}
