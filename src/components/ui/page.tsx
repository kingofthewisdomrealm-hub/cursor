import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-14 text-center",
        className
      )}
    >
      <h3 className="font-display text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-slate-500 md:text-base">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function KpiCard({
  label,
  value,
  hint,
  accent = "teal",
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "teal" | "blue" | "amber" | "slate" | "rose";
}) {
  const accents = {
    teal: "from-teal-500/10 to-transparent text-teal-800",
    blue: "from-blue-500/10 to-transparent text-blue-800",
    amber: "from-amber-500/10 to-transparent text-amber-800",
    slate: "from-slate-500/10 to-transparent text-slate-800",
    rose: "from-rose-500/10 to-transparent text-rose-800",
  };
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        "transition-transform duration-300 hover:-translate-y-0.5"
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80",
          accents[accent].split(" ").slice(0, 2).join(" ")
        )}
      />
      <p className="relative text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
        {label}
      </p>
      <p className={cn("relative mt-2 font-display text-3xl font-semibold", accents[accent].split(" ").slice(2).join(" "))}>
        {value}
      </p>
      {hint ? <p className="relative mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}
