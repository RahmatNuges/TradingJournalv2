import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { CurrencyProvider } from "@/contexts/currency-context";
import { SubscriptionProvider } from "@/contexts/subscription-context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Catat Cuanmu - Professional Trading Journal",
  description: "Track your crypto futures and spot portfolio with professional analytics",
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/LogoLight.svg",
        href: "/LogoLight.svg",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/LogoDark.svg",
        href: "/LogoDark.svg",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased min-h-screen bg-background flex flex-col`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <CurrencyProvider>
            <AuthProvider>
              <SubscriptionProvider>
                <Navbar />
                <main className="container mx-auto px-4 py-6 max-w-7xl flex-1">
                  {children}
                </main>
                <Footer />
              </SubscriptionProvider>
            </AuthProvider>
          </CurrencyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}



