"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ClaimForm } from "@/components/claims/ClaimForm";
import { getClaim } from "@/lib/claim-store";
import type { Claim } from "@/types/claim";
import { ArrowLeft } from "lucide-react";

export default function EditClaimPage() {
  const params = useParams();
  const claimId = params.id as string;
  const [claim, setClaim] = useState<Claim | null>(null);

  useEffect(() => {
    setClaim(getClaim(claimId) || null);
  }, [claimId]);

  if (!claim) {
    return (
      <AppShell>
        <p className="text-zinc-500">Claim not found.</p>
        <Link href="/" className="text-blue-400 text-sm mt-2 inline-block">
          Back to dashboard
        </Link>
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

      <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">Edit Claim</h1>
      <p className="text-sm text-zinc-500 mb-8">Update claim and homeowner information</p>

      <ClaimForm mode="edit" claim={claim} />

      <div className="h-16 lg:hidden" />
    </AppShell>
  );
}
