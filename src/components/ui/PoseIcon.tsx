import {
  Wind,
  Flame,
  Mountain,
  Flower2,
  Cloud,
  PersonStanding,
  Heart,
  Sparkles,
  Moon,
  Sun,
  Waves,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DoshaType } from "@/types";

const poseIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  breath: Wind,
  child: Cloud,
  mountain: Mountain,
  catcow: Waves,
  sun: Sun,
  moon: Moon,
  lunge: PersonStanding,
  warrior1: PersonStanding,
  warrior2: PersonStanding,
  warrior3: PersonStanding,
  triangle: Sparkles,
  chair: Mountain,
  tree: Flower2,
  twist: Waves,
  pigeon: Heart,
  forwardfold: Cloud,
  plank: Mountain,
  boat: Waves,
  bridge: Mountain,
  legswall: Cloud,
  savasana: Moon,
  reflect: Sparkles,
  sphinx: Sun,
  goddess: Flower2,
};

export function PoseIcon({
  image,
  className,
  dosha,
}: {
  image: string;
  className?: string;
  dosha?: DoshaType;
}) {
  const Icon = poseIcons[image] ?? Circle;
  const color =
    dosha === "vata"
      ? "text-vata bg-vata-soft"
      : dosha === "pitta"
        ? "text-pitta bg-pitta-soft"
        : dosha === "kapha"
          ? "text-kapha bg-kapha-soft"
          : "text-leaf bg-mist";

  return (
    <div
      className={cn(
        "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl",
        color,
        className
      )}
    >
      <Icon className="h-7 w-7" />
    </div>
  );
}

export function DoshaGlyph({
  dosha,
  className,
  size = "md",
}: {
  dosha: DoshaType;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const Icon = dosha === "vata" ? Wind : dosha === "pitta" ? Flame : Mountain;
  const sizes = { sm: "h-8 w-8", md: "h-12 w-12", lg: "h-16 w-16" };
  const iconSizes = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8" };
  const bg =
    dosha === "vata"
      ? "bg-vata-soft text-vata"
      : dosha === "pitta"
        ? "bg-pitta-soft text-pitta"
        : "bg-kapha-soft text-kapha";

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full",
        bg,
        sizes[size],
        className
      )}
    >
      <Icon className={iconSizes[size]} />
    </div>
  );
}
