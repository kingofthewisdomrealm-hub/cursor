"use client";

import { AppShell } from "@/components/layout/AppShell";
import { SEED_PREDICTIONS, SEED_CLAIMS } from "@/lib/seed-data";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, Target, Percent, DollarSign } from "lucide-react";
import Link from "next/link";

export default function PredictionsPage() {
  const predictions = SEED_PREDICTIONS.map((pred) => {
    const claim = SEED_CLAIMS.find((c) => c.id === pred.claimId);
    return { ...pred, claim };
  }).filter((p) => p.claim);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Settlement Predictor
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          AI-powered settlement range estimates based on historical claim data
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {predictions.map((pred) => {
          const claim = pred.claim!;
          const rangeWidth = pred.likelyMax - pred.likelyMin;
          const currentPct =
            claim.currentValue > 0
              ? ((claim.currentValue - pred.likelyMin) / rangeWidth) * 100
              : 0;
          const potentialPct =
            ((pred.potentialFinalValue - pred.likelyMin) / rangeWidth) * 100;

          return (
            <Link
              key={pred.claimId}
              href={`/claims/${pred.claimId}`}
              className="block rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 hover:border-blue-500/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                    {claim.homeowner.name}
                  </h3>
                  <p className="text-xs text-zinc-500">{claim.propertyAddress}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-emerald-400">
                    {formatCurrency(pred.potentialFinalValue)}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                    Predicted Final
                  </p>
                </div>
              </div>

              {/* Range visualization */}
              <div className="mb-4">
                <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                  <span>{formatCurrency(pred.likelyMin)}</span>
                  <span>{formatCurrency(pred.likelyMax)}</span>
                </div>
                <div className="relative h-3 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-600/40 to-emerald-500/40"
                    style={{ width: "100%" }}
                  />
                  {claim.currentValue > 0 && (
                    <div
                      className="absolute top-0 h-full w-1 bg-white rounded-full shadow-lg"
                      style={{ left: `${Math.min(Math.max(currentPct, 2), 98)}%` }}
                      title={`Current: ${formatCurrency(claim.currentValue)}`}
                    />
                  )}
                  <div
                    className="absolute top-0 h-full w-1.5 bg-emerald-400 rounded-full shadow-lg shadow-emerald-500/50"
                    style={{ left: `${Math.min(Math.max(potentialPct, 2), 98)}%` }}
                    title={`Predicted: ${formatCurrency(pred.potentialFinalValue)}`}
                  />
                </div>
                <div className="flex justify-center gap-4 mt-2 text-[10px] text-zinc-500">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-0.5 bg-white rounded" /> Current
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-1 bg-emerald-400 rounded" /> Predicted
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <Target className="h-4 w-4 text-blue-400 mx-auto mb-1" />
                  <p className="text-sm font-bold text-white">{pred.confidence}%</p>
                  <p className="text-[9px] uppercase tracking-wider text-zinc-500">Confidence</p>
                </div>
                <div className="text-center">
                  <Percent className="h-4 w-4 text-amber-400 mx-auto mb-1" />
                  <p className="text-sm font-bold text-white">{pred.expectedApprovalPct}%</p>
                  <p className="text-[9px] uppercase tracking-wider text-zinc-500">Approval Rate</p>
                </div>
                <div className="text-center">
                  <DollarSign className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
                  <p className="text-sm font-bold text-white">
                    +{formatCurrency(pred.potentialFinalValue - claim.currentValue)}
                  </p>
                  <p className="text-[9px] uppercase tracking-wider text-zinc-500">Upside</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {predictions.length === 0 && (
        <div className="text-center py-16 text-zinc-500">
          <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No predictions available yet. Add claims to generate estimates.</p>
        </div>
      )}

      <div className="h-16 lg:hidden" />
    </AppShell>
  );
}
