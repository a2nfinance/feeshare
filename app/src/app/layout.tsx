import Layout from "@/components/Layout";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import '@rainbow-me/rainbowkit/styles.css';
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./provider";
// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "FeeShare Platform",
  description: "Manage Incentive Programs for Ecosystem Growth",
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
        className={`antialiased`}
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
