interface ScoreboardProps {
  correct: number;
  streak: number;
  remaining: number;
}

export default function Scoreboard({ correct, streak, remaining }: ScoreboardProps) {
  return (
    <div className="flex justify-center gap-2.5">
      <Stat label="Correct" value={correct} color="text-[var(--color-yes)]" />
      <Stat label="Streak" value={streak} color="text-[var(--color-yellow)]" />
      <Stat label="Left" value={remaining} color="text-[var(--color-cyan)]" />
    </div>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="min-w-[4.5rem] rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-sm">
      <span className="block text-[0.65rem] tracking-wider uppercase opacity-60">
        {label}
      </span>
      <span className={`block text-2xl font-bold ${color}`}>{value}</span>
    </div>
  );
}
