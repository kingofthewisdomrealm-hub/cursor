import { motion } from 'framer-motion';

interface ScoreMeterProps {
  label: string;
  value: number;
  maxValue?: number;
  color: string;
  delay?: number;
  icon?: string;
}

export function ScoreMeter({
  label,
  value,
  maxValue = 100,
  color,
  delay = 0,
  icon,
}: ScoreMeterProps) {
  const pct = Math.min(100, (value / maxValue) * 100);

  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-white/90">
          {icon && <span>{icon}</span>}
          {label}
        </span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.5 }}
          className="font-display text-xl text-white"
        >
          {value}
        </motion.span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-black/50 ring-1 ring-white/10">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}
