import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-space",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
  variable: "--font-instrument",
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
  openGraph: {
    title: "The Long Game | Precision Running Training",
    description: "Training that adapts to you. Built on science. Not opinions.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${instrumentSans.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
