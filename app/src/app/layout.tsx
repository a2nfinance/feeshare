import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Layout from "@/components/Layout";
import '@rainbow-me/rainbowkit/styles.css';
import "./globals.css";
import { Providers } from "./provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FeeShare AVS",
  description: "Create Incentive Programs for EcoSystem Growth Up",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <Layout>{children}</Layout>

          </Providers>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
