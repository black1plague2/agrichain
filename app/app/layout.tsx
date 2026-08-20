import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { getLocale, hasLocaleCookie } from "@/lib/i18n/getLocale";
import { LanguagePicker } from "@/components/i18n/LanguagePicker";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "AgriChain — Supply Chain Traceability Platform",
  description:
    "Verified weight, locked pricing, automated settlement — a blockchain-backed supply chain ledger for agricultural trade on Polygon.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [locale, hasChosenLocale] = await Promise.all([getLocale(), hasLocaleCookie()]);

  return (
    <html lang={locale} className={`${plexSans.variable} ${plexMono.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        {!hasChosenLocale && <LanguagePicker />}
        {children}
      </body>
    </html>
  );
}
