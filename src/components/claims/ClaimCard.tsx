"use client";

import Link from "next/link";
import type { Claim } from "@/types/claim";
import { StatusBadge } from "./StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { MapPin, User, ChevronRight } from "lucide-react";

export function ClaimCard({ claim }: { claim: Claim }) {
  return (
    <Link
      href={`/claims/${claim.id}`}
      className="group block rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 sm:p-5 hover:border-blue-500/30 hover:bg-zinc-900/60 transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm sm:text-base font-bold text-white truncate group-hover:text-blue-300 transition-colors">
            {claim.homeowner.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-zinc-500">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {claim.propertyAddress}, {claim.city}
            </span>
          </div>
        </div>
        <StatusBadge status={claim.status} />
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm mb-3">
        <div>
          <p className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold">Carrier</p>
          <p className="text-zinc-300 font-medium">{claim.carrier}</p>
        </div>
        <div>
          <p className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold">Claim #</p>
          <p className="text-zinc-300 font-mono text-xs">{claim.claimNumber}</p>
        </div>
        <div>
          <p className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold">Date of Loss</p>
          <p className="text-zinc-300">{formatDate(claim.dateOfLoss)}</p>
        </div>
        <div>
          <p className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold">Assigned To</p>
          <div className="flex items-center gap-1.5 text-zinc-300">
            <User className="h-3 w-3" />
            <span className="truncate">{claim.assignedTo.name}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60">
        <div className="flex gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Claim Value</p>
            <p className="text-sm font-bold text-white">{formatCurrency(claim.currentValue)}</p>
          </div>
          {claim.potentialSupplementValue > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Supplement</p>
              <p className="text-sm font-bold text-emerald-400">
                +{formatCurrency(claim.potentialSupplementValue)}
              </p>
            </div>
          )}
        </div>
        <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-blue-400 transition-colors" />
      </div>
    </Link>
  );
}
