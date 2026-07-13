"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ClaimSubNav } from "@/components/claims/ClaimSubNav";
import { StatusBadge } from "@/components/claims/StatusBadge";
import { getClaim, getSupplements, getClaimFiles } from "@/lib/claim-store";
import type { Claim, SupplementOpportunity } from "@/types/claim";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, MapPin, Phone, Mail, User } from "lucide-react";

export default function ClaimOverviewPage() {
  const params = useParams();
  const claimId = params.id as string;
  const [claim, setClaim] = useState<Claim | null>(null);
  const [supplements, setSupplements] = useState<SupplementOpportunity[]>([]);
  const [fileCount, setFileCount] = useState(0);

  useEffect(() => {
    setClaim(getClaim(claimId) || null);
    setSupplements(getSupplements(claimId));
    setFileCount(getClaimFiles(claimId).length);
  }, [claimId]);

  if (!claim) {
    return (
      <AppShell>
        <p className="text-zinc-500">Claim not found.</p>
      </AppShell>
    );
  }

  const pendingSupplements = supplements.filter((s) => s.status === "pending");
  const approvedValue = supplements
    .filter((s) => s.status === "approved")
    .reduce((s, sup) => s + sup.estimatedValue, 0);

  return (
    <AppShell>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-blue-400 mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white">{claim.homeowner.name}</h1>
            <StatusBadge status={claim.status} />
          </div>
          <div className="flex items-center gap-1.5 text-sm text-zinc-400">
            <MapPin className="h-4 w-4" />
            {claim.propertyAddress}, {claim.city}, {claim.state} {claim.zip}
          </div>
        </div>
      </div>

      <ClaimSubNav claimId={claimId} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {[
          { label: "Claim Value", value: formatCurrency(claim.currentValue) },
          { label: "Supplement Potential", value: formatCurrency(claim.potentialSupplementValue) },
          { label: "Approved Supplements", value: formatCurrency(approvedValue) },
          { label: "Files", value: fileCount.toString() },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-1">
              {stat.label}
            </p>
            <p className="text-xl font-black text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">
            Claim Details
          </h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-500">Carrier</dt>
              <dd className="text-zinc-200 font-medium">{claim.carrier}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Claim Number</dt>
              <dd className="text-zinc-200 font-mono text-xs">{claim.claimNumber}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Date of Loss</dt>
              <dd className="text-zinc-200">{formatDate(claim.dateOfLoss)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Assigned To</dt>
              <dd className="flex items-center gap-1.5 text-zinc-200">
                <User className="h-3.5 w-3.5" />
                {claim.assignedTo.name}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">
            Homeowner Contact
          </h3>
          <dl className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-zinc-200">
              <Phone className="h-4 w-4 text-zinc-500" />
              {claim.homeowner.phone}
            </div>
            <div className="flex items-center gap-2 text-zinc-200">
              <Mail className="h-4 w-4 text-zinc-500" />
              {claim.homeowner.email}
            </div>
          </dl>
          {claim.notes && (
            <div className="mt-4 pt-4 border-t border-zinc-800/60">
              <p className="text-xs text-zinc-500 mb-1">Notes</p>
              <p className="text-sm text-zinc-300 leading-relaxed">{claim.notes}</p>
            </div>
          )}
        </div>
      </div>

      {pendingSupplements.length > 0 && (
        <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
          <h3 className="text-sm font-bold text-amber-400 mb-2">
            {pendingSupplements.length} Pending Supplement{pendingSupplements.length > 1 ? "s" : ""}
          </h3>
          <p className="text-sm text-zinc-400">
            Review and approve supplement opportunities in the{" "}
            <Link href={`/claims/${claimId}/supplements`} className="text-blue-400 hover:underline">
              Supplement Center
            </Link>
          </p>
        </div>
      )}

      <div className="h-16 lg:hidden" />
    </AppShell>
  );
}
