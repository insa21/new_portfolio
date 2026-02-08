import type { Metadata } from "next";
import { Inter, Space_Grotesk, Instrument_Serif } from "next/font/google"; // Updated per latest requirements
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { DataProvider } from "@/components/providers/data-provider";
import { NotificationProvider } from "@/components/providers/notification-provider";
import { DynamicFavicon } from "@/components/dynamic-favicon";
import { BackgroundEngine } from "@/components/BackgroundEngine";
import { cn } from "@/lib/utils";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Portfolio | Fullstack Engineer & AI Developer",
  description: "Building scalable web products and AI-powered automation for real-world impact.",
  keywords: ["Fullstack Engineer", "AI Developer", "Next.js", "React", "Portfolio"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn(
          inter.variable,
          spaceGrotesk.variable,
          instrumentSerif.variable,
          "antialiased min-h-screen relative font-sans"
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NotificationProvider>
            <DataProvider>
              <BackgroundEngine>
                <DynamicFavicon />
                <div className="grain-overlay" />
                {children}
              </BackgroundEngine>
            </DataProvider>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
