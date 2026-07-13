"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ClaimSubNav } from "@/components/claims/ClaimSubNav";
import { NegotiationTracker } from "@/components/claims/NegotiationTracker";
import { getClaim, getNegotiations } from "@/lib/claim-store";
import type { Claim, NegotiationEntry } from "@/types/claim";
import { ArrowLeft } from "lucide-react";

export default function NegotiationPage() {
  const params = useParams();
  const claimId = params.id as string;
  const [claim, setClaim] = useState<Claim | null>(null);
  const [entries, setEntries] = useState<NegotiationEntry[]>([]);

  useEffect(() => {
    setClaim(getClaim(claimId) || null);
    setEntries(getNegotiations(claimId));
  }, [claimId]);

  if (!claim) {
    return (
      <AppShell>
        <p className="text-zinc-500">Claim not found.</p>
      </AppShell>
    );
  }

  const initialOffer =
    entries.find((e) => e.type === "initial_offer")?.amount || claim.currentValue;

  return (
    <AppShell>
      <Link
        href={`/claims/${claimId}`}
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-blue-400 mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {claim.homeowner.name}
      </Link>

      <h1 className="text-2xl font-black text-white mb-1">Negotiation Center</h1>
      <p className="text-sm text-zinc-500 mb-6">
        Track offers, supplements, and claim value growth
      </p>

      <ClaimSubNav claimId={claimId} />
      <NegotiationTracker entries={entries} initialOffer={initialOffer} />

      <div className="h-16 lg:hidden" />
    </AppShell>
  );
}
