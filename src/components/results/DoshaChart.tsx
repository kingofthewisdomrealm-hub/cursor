"use client";

import { useEffect, useState } from "react";
import { DOSHA_PROFILES } from "@/data/dosha-profiles";
import type { DoshaPercentages, DoshaType } from "@/types";
import { cn } from "@/lib/utils";

export function DoshaChart({
  percentages,
  className,
}: {
  percentages: DoshaPercentages;
  className?: string;
}) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const items: { key: DoshaType; value: number }[] = [
    { key: "vata", value: percentages.vata },
    { key: "pitta", value: percentages.pitta },
    { key: "kapha", value: percentages.kapha },
  ];

  const colors: Record<DoshaType, string> = {
    vata: "bg-vata",
    pitta: "bg-pitta",
    kapha: "bg-kapha",
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex h-4 overflow-hidden rounded-full bg-sand-deep">
        {items.map((item) => (
          <div
            key={item.key}
            className={cn("h-full transition-all duration-1000 ease-out", colors[item.key])}
            style={{ width: animate ? `${item.value}%` : "0%" }}
            title={`${DOSHA_PROFILES[item.key].name}: ${item.value}%`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {items.map((item, i) => {
          const profile = DOSHA_PROFILES[item.key];
          return (
            <div
              key={item.key}
              className={cn(
                "rounded-2xl p-3 text-center animate-fade-up",
                profile.bgClass
              )}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <p className={cn("text-2xl font-display font-semibold", profile.colorClass)}>
                {animate ? item.value : 0}%
              </p>
              <p className="mt-0.5 text-xs font-medium text-ink-soft">{profile.name}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
