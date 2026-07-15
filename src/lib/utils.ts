import type { DesiredOutcome, DoshaType, Mood } from "@/types";

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s === 0 ? `${m} min` : `${m}m ${s}s`;
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function outcomeLabel(outcome: DesiredOutcome): string {
  const map: Record<DesiredOutcome, string> = {
    reduce_stress: "Reduce stress",
    increase_energy: "Increase energy",
    improve_sleep: "Improve sleep",
    improve_flexibility: "Improve flexibility",
    improve_focus: "Improve focus",
    ground_nervous_system: "Ground the nervous system",
    cool_the_body: "Cool the body",
    build_strength: "Build strength",
  };
  return map[outcome];
}

export function moodLabel(mood: Mood): string {
  return capitalize(mood.replace("_", " "));
}

export function doshaGradient(dosha: DoshaType): string {
  if (dosha === "vata") return "from-vata/30 via-vata-soft to-transparent";
  if (dosha === "pitta") return "from-pitta/30 via-pitta-soft to-transparent";
  return "from-kapha/30 via-kapha-soft to-transparent";
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
