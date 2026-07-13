"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ClaimSubNav } from "@/components/claims/ClaimSubNav";
import { SupplementCard } from "@/components/supplement/SupplementCard";
import {
  getClaim,
  getSupplements,
  getClaimFiles,
  updateSupplementStatus,
  setSupplements,
} from "@/lib/claim-store";
import { buildSupplementPackage } from "@/lib/supplement-engine";
import type { Claim, SupplementOpportunity } from "@/types/claim";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, Sparkles, FileDown, Loader2 } from "lucide-react";

export default function SupplementsPage() {
  const params = useParams();
  const claimId = params.id as string;
  const [claim, setClaim] = useState<Claim | null>(null);
  const [supplements, setSupplementsState] = useState<SupplementOpportunity[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);

  const refresh = useCallback(() => {
    setClaim(getClaim(claimId) || null);
    setSupplementsState(getSupplements(claimId));
  }, [claimId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const files = getClaimFiles(claimId);
      const res = await fetch("/api/supplement/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claimId,
          hasCarrierEstimate: files.some((f) => f.category === "carrier_estimate"),
          hasContractorEstimate: files.some((f) => f.category === "contractor_estimate"),
          hasPhotos: files.some((f) => f.category === "photo"),
          notes: claim?.notes || "",
        }),
      });
      const data = await res.json();
      if (data.supplements) {
        setSupplements(claimId, data.supplements);
        refresh();
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApprove = (id: string) => {
    updateSupplementStatus(id, "approved");
    refresh();
  };

  const handleReject = (id: string) => {
    updateSupplementStatus(id, "rejected");
    refresh();
  };

  const handleGeneratePackage = () => {
    if (!claim) return;
    setGenerating(true);
    const pkg = buildSupplementPackage(claimId, claim, supplements);
    setGenerating(false);

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html><head><title>Supplement Package - ${claim.claimNumber}</title>
        <style>
          body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
          h1 { font-size: 18px; border-bottom: 2px solid #333; padding-bottom: 8px; }
          h2 { font-size: 14px; margin-top: 24px; color: #444; }
          .item { border: 1px solid #ddd; padding: 12px; margin: 8px 0; border-radius: 4px; }
          .value { font-weight: bold; color: #16a34a; }
          pre { white-space: pre-wrap; font-family: Georgia, serif; }
        </style></head><body>
        <h1>Supplement Package</h1>
        <p><strong>Claim:</strong> ${claim.claimNumber} | <strong>Insured:</strong> ${claim.homeowner.name}</p>
        <h2>Cover Letter</h2>
        <pre>${pkg.coverLetter}</pre>
        <h2>Scope Summary</h2>
        <pre>${pkg.scopeSummary}</pre>
        <h2>Missing Items Report</h2>
        ${pkg.missingItems.map((item) => `
          <div class="item">
            <strong>${item.lineItem}</strong> — <span class="value">${formatCurrency(item.estimatedValue)}</span>
            <br><small>${item.reason}</small>
            ${item.codeReference ? `<br><small>Code: ${item.codeReference}</small>` : ""}
          </div>
        `).join("")}
        <h2>Code Compliance References</h2>
        <ul>${pkg.codeReferences.map((r) => `<li>${r}</li>`).join("")}</ul>
        <h2>Contractor Justification</h2>
        <pre>${pkg.contractorNotes}</pre>
        </body></html>
      `);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  if (!claim) {
    return (
      <AppShell>
        <p className="text-zinc-500">Claim not found.</p>
      </AppShell>
    );
  }

  const pending = supplements.filter((s) => s.status === "pending");
  const approved = supplements.filter((s) => s.status === "approved");
  const totalPending = pending.reduce((s, sup) => s + sup.estimatedValue, 0);
  const totalApproved = approved.reduce((s, sup) => s + sup.estimatedValue, 0);

  return (
    <AppShell>
      <Link
        href={`/claims/${claimId}`}
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-blue-400 mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {claim.homeowner.name}
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Supplement Center</h1>
          <p className="text-sm text-zinc-500 mt-1">AI-powered supplement opportunity analysis</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 transition-all"
          >
            {analyzing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {analyzing ? "Analyzing..." : "Run AI Analysis"}
          </button>
          {supplements.length > 0 && (
            <button
              onClick={handleGeneratePackage}
              disabled={generating}
              className="flex items-center gap-2 rounded-xl border border-zinc-700 hover:border-blue-500/50 px-5 py-3 text-sm font-bold text-zinc-300 hover:text-white transition-all"
            >
              <FileDown className="h-4 w-4" />
              Export PDF
            </button>
          )}
        </div>
      </div>

      <ClaimSubNav claimId={claimId} />

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 text-center">
          <p className="text-2xl font-black text-white">{supplements.length}</p>
          <p className="text-[10px] uppercase tracking-widest text-zinc-500">Total Items</p>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-center">
          <p className="text-2xl font-black text-amber-400">{formatCurrency(totalPending)}</p>
          <p className="text-[10px] uppercase tracking-widest text-zinc-500">Pending</p>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
          <p className="text-2xl font-black text-emerald-400">{formatCurrency(totalApproved)}</p>
          <p className="text-[10px] uppercase tracking-widest text-zinc-500">Approved</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {supplements.map((opp) => (
          <SupplementCard
            key={opp.id}
            opportunity={opp}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        ))}
      </div>

      {supplements.length === 0 && (
        <div className="text-center py-16 text-zinc-500">
          <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm mb-4">Upload carrier and contractor estimates, then run AI analysis.</p>
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white"
          >
            <Sparkles className="h-4 w-4" />
            Run AI Analysis
          </button>
        </div>
      )}

      <div className="h-16 lg:hidden" />
    </AppShell>
  );
}
