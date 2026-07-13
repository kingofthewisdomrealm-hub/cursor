"use client";

import { useState } from "react";
import type { NegotiationEntry } from "@/types/claim";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";

interface Props {
  entries: NegotiationEntry[];
  initialOffer: number;
  onAdd: (entry: Omit<NegotiationEntry, "id" | "claimId">) => void;
}

export function NegotiationTracker({ entries, initialOffer, onAdd }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<NegotiationEntry["type"]>("additional_payment");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");

  const sorted = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const supplementsSubmitted = sorted
    .filter((e) => e.type === "supplement_submitted")
    .reduce((s, e) => s + e.amount, 0);

  const totalRecovered = sorted
    .filter((e) => e.type === "initial_offer" || e.type === "additional_payment" || e.type === "settlement")
    .reduce((s, e) => s + e.amount, 0);

  const outstanding = Math.max(0, supplementsSubmitted - (totalRecovered - (sorted.find((e) => e.type === "initial_offer")?.amount ?? initialOffer)));

  const stats = [
    { label: "Initial Offer", value: sorted.find((e) => e.type === "initial_offer")?.amount ?? initialOffer, color: "text-zinc-300" },
    { label: "Supplements Submitted", value: supplementsSubmitted, color: "text-amber-400" },
    { label: "Total Recovered", value: totalRecovered, color: "text-emerald-400" },
    { label: "Outstanding", value: outstanding, color: "text-orange-400" },
  ];

  const maxValue = Math.max(...sorted.map((e) => e.amount), initialOffer, 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount.replace(/,/g, ""));
    if (!num || num <= 0) return;
    onAdd({
      date,
      type,
      amount: num,
      description: description.trim() || type.replace(/_/g, " "),
    });
    setAmount("");
    setDescription("");
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          Add Entry
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as NegotiationEntry["type"])}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950/60 px-4 py-3 text-sm text-white"
              >
                <option value="initial_offer">Initial Offer</option>
                <option value="supplement_submitted">Supplement Submitted</option>
                <option value="additional_payment">Additional Payment</option>
                <option value="settlement">Settlement</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                Amount ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950/60 px-4 py-3 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950/60 px-4 py-3 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                Description
              </label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Supplement #1 approved"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950/60 px-4 py-3 text-sm text-white"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-400"
            >
              Cancel
            </button>
            <button type="submit" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">
              Save Entry
            </button>
          </div>
        </form>
      )}

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

      {sorted.length > 0 && (
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
                <div key={entry.id} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                  <span className="text-[9px] text-zinc-500 font-mono truncate w-full text-center">
                    {formatCurrency(entry.amount)}
                  </span>
                  <div
                    className={`w-full rounded-t-lg ${colors[entry.type]}`}
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
      )}

      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
          Negotiation Timeline
        </h3>
        {sorted.length === 0 ? (
          <p className="text-sm text-zinc-500 py-8 text-center">
            No negotiation entries yet. Add the carrier&apos;s initial offer to get started.
          </p>
        ) : (
          sorted.map((entry) => {
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
          })
        )}
      </div>
    </div>
  );
}
