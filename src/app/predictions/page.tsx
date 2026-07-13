"use client";

import { useMemo } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useClaims } from "@/hooks/useClaims";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, Target, Percent, DollarSign } from "lucide-react";

function predictForClaim(claim: { id: string; currentValue: number; potentialSupplementValue: number }) {
  const supplement = claim.potentialSupplementValue;
  const current = claim.currentValue;
  const likelyMin = current + supplement * 0.5;
  const likelyMax = current + supplement * 1.1;
  const potentialFinalValue = current + supplement * 0.75;
  return {
    claimId: claim.id,
    likelyMin: Math.round(likelyMin),
    likelyMax: Math.round(Math.max(likelyMax, likelyMin + 1000)),
    expectedApprovalPct: supplement > 0 ? 68 : 0,
    potentialFinalValue: Math.round(potentialFinalValue),
    confidence: supplement > 0 ? 72 : 45,
  };
}

export default function PredictionsPage() {
  const allClaims = useClaims();
  const claims = useMemo(
    () => allClaims.filter((x) => x.status !== "closed"),
    [allClaims]
  );

  const predictions = claims.map((claim) => ({
    ...predictForClaim(claim),
    claim,
  }));

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Settlement Predictor
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Estimates based on your claim values and supplement potential
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {predictions.map((pred) => {
          const claim = pred.claim;
          const rangeWidth = pred.likelyMax - pred.likelyMin || 1;
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

              <div className="mb-4">
                <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                  <span>{formatCurrency(pred.likelyMin)}</span>
                  <span>{formatCurrency(pred.likelyMax)}</span>
                </div>
                <div className="relative h-3 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-600/40 to-emerald-500/40 w-full"
                  />
                  {claim.currentValue > 0 && (
                    <div
                      className="absolute top-0 h-full w-1 bg-white rounded-full shadow-lg"
                      style={{ left: `${Math.min(Math.max(currentPct, 2), 98)}%` }}
                    />
                  )}
                  <div
                    className="absolute top-0 h-full w-1.5 bg-emerald-400 rounded-full shadow-lg shadow-emerald-500/50"
                    style={{ left: `${Math.min(Math.max(potentialPct, 2), 98)}%` }}
                  />
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
                  <p className="text-[9px] uppercase tracking-wider text-zinc-500">Approval</p>
                </div>
                <div className="text-center">
                  <DollarSign className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
                  <p className="text-sm font-bold text-white">
                    +{formatCurrency(Math.max(0, pred.potentialFinalValue - claim.currentValue))}
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
          <p className="text-sm mb-4">Create claims to see settlement predictions.</p>
          <Link href="/claims/new" className="text-blue-400 text-sm font-bold hover:underline">
            Create New Claim
          </Link>
        </div>
      )}

      <div className="h-16 lg:hidden" />
    </AppShell>
  );
}
