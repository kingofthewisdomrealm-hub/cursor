import { cn } from "@/lib/utils";

export function Disclaimer({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "text-xs leading-relaxed text-ink-soft/80",
        className
      )}
    >
      Dosha Yoga provides general educational and wellness guidance based on
      traditional Ayurvedic concepts and yoga principles. It is{" "}
      <span className="font-medium text-ink-soft">
        not a medical diagnosis
      </span>{" "}
      or a substitute for professional healthcare. Always consult a qualified
      practitioner for health concerns.
    </p>
  );
}
