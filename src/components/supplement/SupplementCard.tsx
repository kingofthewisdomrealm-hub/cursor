"use client";

import type { SupplementOpportunity } from "@/types/claim";
import { formatCurrency, confidenceColor, confidenceBg } from "@/lib/utils";
import { Check, X, Camera, FileText, Shield } from "lucide-react";

interface Props {
  opportunity: SupplementOpportunity;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const CATEGORY_LABELS = {
  roofing: "Roofing",
  water_mitigation: "Water Mitigation",
  interior: "Interior",
  code: "Code Compliance",
  general: "General",
};

export function SupplementCard({ opportunity, onApprove, onReject }: Props) {
  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h4 className="text-sm sm:text-base font-bold text-white">{opportunity.lineItem}</h4>
          <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            {opportunity.category === "code" && <Shield className="h-3 w-3" />}
            {CATEGORY_LABELS[opportunity.category]}
          </span>
        </div>
        <div className={`rounded-lg border px-2.5 py-1 text-center ${confidenceBg(opportunity.confidence)}`}>
          <p className={`text-lg font-black ${confidenceColor(opportunity.confidence)}`}>
            {opportunity.confidence}%
          </p>
          <p className="text-[9px] uppercase tracking-wider text-zinc-500">Confidence</p>
        </div>
      </div>

      <p className="text-sm text-zinc-400 mb-3 leading-relaxed">{opportunity.reason}</p>

      {opportunity.codeReference && (
        <p className="text-xs text-blue-400 mb-3 font-mono bg-blue-500/5 rounded-lg px-3 py-1.5 border border-blue-500/10">
          {opportunity.codeReference}
        </p>
      )}

      <div className="flex items-center gap-4 mb-4 text-xs text-zinc-500">
        {opportunity.supportingPhotoIds.length > 0 && (
          <span className="flex items-center gap-1">
            <Camera className="h-3.5 w-3.5" />
            {opportunity.supportingPhotoIds.length} photo(s)
          </span>
        )}
        {opportunity.supportingDocIds.length > 0 && (
          <span className="flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" />
            {opportunity.supportingDocIds.length} doc(s)
          </span>
        )}
        <span className="ml-auto text-sm font-bold text-emerald-400">
          {formatCurrency(opportunity.estimatedValue)}
        </span>
      </div>

      {opportunity.status === "pending" ? (
        <div className="flex gap-2">
          <button
            onClick={() => onApprove(opportunity.id)}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 text-sm font-bold text-white transition-colors"
          >
            <Check className="h-4 w-4" />
            Approve
          </button>
          <button
            onClick={() => onReject(opportunity.id)}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-zinc-700 hover:border-red-500/50 hover:bg-red-500/10 py-3 text-sm font-bold text-zinc-300 hover:text-red-400 transition-colors"
          >
            <X className="h-4 w-4" />
            Reject
          </button>
        </div>
      ) : (
        <div
          className={`rounded-xl py-2.5 text-center text-sm font-bold ${
            opportunity.status === "approved"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {opportunity.status === "approved" ? "Approved" : "Rejected"}
        </div>
      )}
    </div>
  );
}
