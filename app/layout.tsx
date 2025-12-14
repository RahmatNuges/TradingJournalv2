import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { CurrencyProvider } from "@/contexts/currency-context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Catat Cuanmu - Professional Trading Journal",
  description: "Track your crypto futures and spot portfolio with professional analytics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased min-h-screen bg-background`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <CurrencyProvider>
            <AuthProvider>
              <Navbar />
              <main className="container mx-auto px-4 py-6 max-w-7xl">
                {children}
              </main>
            </AuthProvider>
          </CurrencyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}



