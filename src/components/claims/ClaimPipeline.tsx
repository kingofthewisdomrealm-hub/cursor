"use client";

import type { Claim } from "@/types/claim";
import { CLAIM_STATUS_LABELS, CLAIM_STATUS_ORDER } from "@/types/claim";
import { ClaimCard } from "./ClaimCard";

interface Props {
  claims: Claim[];
  view: "pipeline" | "list";
}

export function ClaimPipeline({ claims, view }: Props) {
  if (view === "list") {
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {claims.map((claim) => (
          <ClaimCard key={claim.id} claim={claim} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 snap-x">
      {CLAIM_STATUS_ORDER.map((status) => {
        const statusClaims = claims.filter((c) => c.status === status);
        if (statusClaims.length === 0) return null;

        return (
          <div
            key={status}
            className="flex-shrink-0 w-72 sm:w-80 snap-start"
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                {CLAIM_STATUS_LABELS[status]}
              </h3>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-400">
                {statusClaims.length}
              </span>
            </div>
            <div className="space-y-3">
              {statusClaims.map((claim) => (
                <ClaimCard key={claim.id} claim={claim} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function PipelineStats({ claims }: { claims: Claim[] }) {
  const totalValue = claims.reduce((s, c) => s + c.currentValue, 0);
  const totalSupplement = claims.reduce((s, c) => s + c.potentialSupplementValue, 0);
  const activeClaims = claims.filter((c) => c.status !== "closed").length;

  const stats = [
    { label: "Active Claims", value: activeClaims.toString() },
    { label: "Total Claim Value", value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(totalValue) },
    { label: "Supplement Potential", value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(totalSupplement) },
    { label: "Avg Supplement", value: activeClaims > 0 ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(Math.round(totalSupplement / activeClaims)) : "$0" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4"
        >
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-1">
            {stat.label}
          </p>
          <p className="text-xl sm:text-2xl font-black text-white">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
