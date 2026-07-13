import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { MissionNav } from "@/components/MissionNav";
import { BrowserCompatScript } from "@/components/BrowserCompatScript";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Outcome Agent — Mission Control",
  description:
    "Transform vague outcomes into executable missions. Your AI project manager for achieving real results.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Outcome Agent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <head>
        <BrowserCompatScript />
      </head>
      <body className="font-sans">
        <MissionNav />
        <main className="mission-grid min-h-screen">{children}</main>
      </body>
    </html>
  );
}
