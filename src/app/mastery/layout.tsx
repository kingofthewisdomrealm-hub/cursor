import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Become dangerous — Cursor mastery pyramid",
  description:
    "Level-by-level climb from spectator to dangerous, diagnosed from your actual Cursor Cloud Agent history.",
};

export default function MasteryLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
