import { Fraunces } from "next/font/google";
import { ProgressClient } from "@/components/progress/ProgressClient";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-fraunces",
  display: "swap",
});

export default function ProgressPage() {
  return (
    <div className={fraunces.variable}>
      <ProgressClient />
    </div>
  );
}
