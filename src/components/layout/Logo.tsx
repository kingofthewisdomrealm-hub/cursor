import Link from "next/link";
import { Flower2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl sm:text-4xl",
  };
  const iconSizes = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-8 w-8 sm:h-10 sm:w-10",
  };

  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2.5 font-display font-semibold tracking-tight text-ink",
        sizes[size],
        className
      )}
    >
      <span className="relative flex items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-leaf/15 animate-breathe" />
        <Flower2 className={cn("relative text-leaf", iconSizes[size])} />
      </span>
      <span>
        Dosha <span className="text-leaf">Yoga</span>
      </span>
    </Link>
  );
}
