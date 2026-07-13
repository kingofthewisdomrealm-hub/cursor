"use client";

import type { NegotiationEntry } from "@/types/claim";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Props {
  entries: NegotiationEntry[];
  initialOffer: number;
}

export function NegotiationTracker({ entries, initialOffer }: Props) {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const supplementsSubmitted = sorted
    .filter((e) => e.type === "supplement_submitted")
    .reduce((s, e) => s + e.amount, 0);

  const additionalPayments = sorted
    .filter((e) => e.type === "additional_payment" || e.type === "settlement")
    .reduce((s, e) => s + e.amount, 0);

  const totalRecovered = additionalPayments;
  const outstanding = supplementsSubmitted - (additionalPayments - initialOffer);

  const stats = [
    { label: "Initial Offer", value: initialOffer, color: "text-zinc-300" },
    { label: "Supplements Submitted", value: supplementsSubmitted, color: "text-amber-400" },
    { label: "Total Recovered", value: totalRecovered, color: "text-emerald-400" },
    { label: "Outstanding", value: Math.max(0, outstanding), color: "text-orange-400" },
  ];

  const maxValue = Math.max(...sorted.map((e) => e.amount), initialOffer, 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4"
          >
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-1">
              {stat.label}
            </p>
            <p className={`text-lg sm:text-xl font-black ${stat.color}`}>
              {formatCurrency(stat.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Growth chart */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">
          Claim Value Growth
        </h3>
        <div className="flex items-end gap-2 h-40">
          {sorted.map((entry) => {
            const height = (entry.amount / maxValue) * 100;
            const colors: Record<string, string> = {
              initial_offer: "bg-zinc-500",
              supplement_submitted: "bg-amber-500",
              additional_payment: "bg-emerald-500",
              settlement: "bg-blue-500",
            };
            return (
              <div key={entry.id} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[9px] text-zinc-500 font-mono">
                  {formatCurrency(entry.amount)}
                </span>
                <div
                  className={`w-full rounded-t-lg ${colors[entry.type]} transition-all`}
                  style={{ height: `${Math.max(height, 8)}%` }}
                />
                <span className="text-[8px] text-zinc-600 truncate w-full text-center">
                  {formatDate(entry.date)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
          Negotiation Timeline
        </h3>
        {sorted.map((entry) => {
          const typeLabels: Record<string, string> = {
            initial_offer: "Initial Offer",
            supplement_submitted: "Supplement Submitted",
            additional_payment: "Additional Payment",
            settlement: "Settlement",
          };
          return (
            <div
              key={entry.id}
              className="flex items-center gap-4 rounded-xl border border-zinc-800/80 bg-zinc-900/40 px-4 py-3"
            >
              <div className="text-xs text-zinc-500 font-mono w-20 shrink-0">
                {formatDate(entry.date)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-200">{typeLabels[entry.type]}</p>
                <p className="text-xs text-zinc-500 truncate">{entry.description}</p>
              </div>
              <p className="text-sm font-bold text-white shrink-0">
                {formatCurrency(entry.amount)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
