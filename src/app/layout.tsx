import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
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
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
