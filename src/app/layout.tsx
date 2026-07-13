import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { MissionNav } from "@/components/MissionNav";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="font-sans">
        <MissionNav />
        <main className="mission-grid min-h-screen">{children}</main>
      </body>
    </html>
  );
}
