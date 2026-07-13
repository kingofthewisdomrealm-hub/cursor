"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ClaimSubNav } from "@/components/claims/ClaimSubNav";
import { DamageAnalysis } from "@/components/claims/DamageAnalysis";
import { getClaim, getClaimFiles, DATA_CHANGE_EVENT } from "@/lib/claim-store";
import type { Claim, ClaimFile } from "@/types/claim";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";

export default function DamagePage() {
  const params = useParams();
  const claimId = params.id as string;
  const [claim, setClaim] = useState<Claim | null>(null);
  const [photoFiles, setPhotoFiles] = useState<ClaimFile[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  const refresh = useCallback(() => {
    setClaim(getClaim(claimId) || null);
    setPhotoFiles(getClaimFiles(claimId).filter((f) => f.category === "photo"));
  }, [claimId]);

  useEffect(() => {
    refresh();
    window.addEventListener(DATA_CHANGE_EVENT, refresh);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, refresh);
  }, [refresh]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/damage/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoCount: photoFiles.length, categories: ["photo"] }),
      });
      const data = await res.json();
      if (data.suggestions) setSuggestions(data.suggestions);
    } finally {
      setAnalyzing(false);
    }
  };

  if (!claim) {
    return (
      <AppShell>
        <p className="text-zinc-500">Claim not found.</p>
      </AppShell>
    );
  }

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
          <h1 className="text-2xl font-black text-white">Damage Analysis</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Photos from your Files tab appear here automatically
          </p>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={analyzing || photoFiles.length === 0}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 transition-all"
        >
          {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {analyzing ? "Analyzing..." : "Suggest Documentation"}
        </button>
      </div>

      <ClaimSubNav claimId={claimId} />
      <DamageAnalysis photoFiles={photoFiles} suggestions={suggestions} />

      <div className="h-16 lg:hidden" />
    </AppShell>
  );
}
