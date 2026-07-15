import type { Metadata } from "next";
import { Archivo, DM_Sans } from "next/font/google";
import "./globals.css";

const display = Archivo({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800"],
});

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Storm Opportunity Agent",
  description:
    "Identify Florida storm-damage opportunities and convert them into prioritized canvassing territories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
