import type { Metadata, Viewport } from "next";
import { Instrument_Sans, IBM_Plex_Mono, Inter, Sora, DM_Sans, Onest } from "next/font/google";
import { GeistSans, GeistMono } from "geist/font";
import "./globals.css";
import { SyncStatusIndicator } from "@/components/ui/OfflineIndicator";
import { Providers } from "@/components/ui/Providers";


const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
  variable: "--font-instrument",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

const sora = Sora({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
  variable: "--font-sora",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
  variable: "--font-dm-sans",
});

const onest = Onest({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
  variable: "--font-onest",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "The Long Game | Precision Running Training",
  description:
    "Training that adapts to you. Built on Hansons, Daniels, Seiler, and Dicharry methodologies. Every pace calculated. Every workout prescribed.",
  keywords: [
    "marathon training",
    "running",
    "VDOT",
    "Hansons",
    "Daniels",
    "training plan",
    "endurance",
  ],
  authors: [{ name: "The Long Game" }],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "The Long Game | Precision Running Training",
    description: "Training that adapts to you. Built on science. Not opinions.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0D1B2A",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${instrumentSans.variable} ${inter.variable} ${sora.variable} ${dmSans.variable} ${onest.variable} ${GeistSans.variable} ${GeistMono.variable} ${plexMono.variable}`}>
      <body>
        <Providers>
          {children}
        </Providers>
        <SyncStatusIndicator />
      </body>
    </html>
  );
}
