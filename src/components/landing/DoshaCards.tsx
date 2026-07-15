import { DOSHA_PROFILES } from "@/data/dosha-profiles";
import { DoshaGlyph } from "@/components/ui/PoseIcon";
import type { DoshaType } from "@/types";
import { cn } from "@/lib/utils";
import { Wind, Flame, Mountain } from "lucide-react";

const icons = { vata: Wind, pitta: Flame, kapha: Mountain };

export function DoshaPreviewCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {(["vata", "pitta", "kapha"] as DoshaType[]).map((dosha, i) => {
        const profile = DOSHA_PROFILES[dosha];
        const Icon = icons[dosha];
        return (
          <div
            key={dosha}
            className={cn(
              "rounded-3xl border border-white/60 p-5 shadow-sm backdrop-blur-sm animate-fade-up",
              profile.bgClass
            )}
            style={{ animationDelay: `${150 + i * 120}ms` }}
          >
            <div
              className={cn(
                "mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70",
                profile.colorClass
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="font-display text-xl font-semibold text-ink">{profile.name}</h3>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-ink-soft/70">
              {profile.element}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              {profile.qualities.slice(0, 3).join(" · ")}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Take the dosha assessment",
      body: "Answer 20 gentle questions about your body, energy, and tendencies.",
    },
    {
      n: "02",
      title: "See your unique balance",
      body: "Receive Vata, Pitta, and Kapha percentages with primary and secondary doshas.",
    },
    {
      n: "03",
      title: "Practice what you need today",
      body: "Check in on mood, energy, and stress—then get a routine shaped for this moment.",
    },
  ];

  return (
    <div className="space-y-4">
      {steps.map((step, i) => (
        <div
          key={step.n}
          className="flex gap-4 rounded-3xl bg-white/55 p-4 animate-fade-up"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-leaf/10 font-display text-sm font-semibold text-leaf-deep">
            {step.n}
          </div>
          <div>
            <h3 className="font-medium text-ink">{step.title}</h3>
            <p className="mt-1 text-sm text-ink-soft">{step.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DoshaResultBadge({
  dosha,
  label,
}: {
  dosha: DoshaType;
  label: string;
}) {
  const profile = DOSHA_PROFILES[dosha];
  return (
    <div className={cn("rounded-3xl border p-4", profile.bgClass, profile.accentClass)}>
      <p className="text-xs font-medium uppercase tracking-wider text-ink-soft">{label}</p>
      <div className="mt-2 flex items-center gap-3">
        <DoshaGlyph dosha={dosha} size="md" />
        <div>
          <p className={cn("font-display text-2xl font-semibold", profile.colorClass)}>
            {profile.name}
          </p>
          <p className="text-xs text-ink-soft">{profile.element}</p>
        </div>
      </div>
    </div>
  );
}
