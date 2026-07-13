"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ClaimSubNav } from "@/components/claims/ClaimSubNav";
import { StatusBadge } from "@/components/claims/StatusBadge";
import {
  getClaim,
  getSupplements,
  getClaimFiles,
  updateClaimStatus,
  deleteClaim,
  DATA_CHANGE_EVENT,
} from "@/lib/claim-store";
import type { Claim, SupplementOpportunity, ClaimStatus } from "@/types/claim";
import { CLAIM_STATUS_LABELS, CLAIM_STATUS_ORDER } from "@/types/claim";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, MapPin, Phone, Mail, User, Pencil, Trash2 } from "lucide-react";

export default function ClaimOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const claimId = params.id as string;
  const [claim, setClaim] = useState<Claim | null>(null);
  const [supplements, setSupplements] = useState<SupplementOpportunity[]>([]);
  const [fileCount, setFileCount] = useState(0);

  const refresh = useCallback(() => {
    setClaim(getClaim(claimId) || null);
    setSupplements(getSupplements(claimId));
    setFileCount(getClaimFiles(claimId).length);
  }, [claimId]);

  useEffect(() => {
    refresh();
    window.addEventListener(DATA_CHANGE_EVENT, refresh);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, refresh);
  }, [refresh]);

  const handleStatusChange = (status: ClaimStatus) => {
    updateClaimStatus(claimId, status);
    refresh();
  };

  const handleDelete = () => {
    if (
      confirm(
        `Delete claim for ${claim?.homeowner.name}? This cannot be undone.`
      )
    ) {
      deleteClaim(claimId);
      router.push("/");
    }
  };

  if (!claim) {
    return (
      <AppShell>
        <p className="text-zinc-500">Claim not found.</p>
        <Link href="/claims/new" className="text-blue-400 text-sm mt-2 inline-block">
          Create a new claim
        </Link>
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
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white">{claim.homeowner.name}</h1>
            <StatusBadge status={claim.status} />
          </div>
          <div className="flex items-center gap-1.5 text-sm text-zinc-400">
            <MapPin className="h-4 w-4 shrink-0" />
            {claim.propertyAddress}, {claim.city}, {claim.state} {claim.zip}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            href={`/claims/${claimId}/edit`}
            className="flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-bold text-zinc-300 hover:border-blue-500/50 hover:text-white transition-all"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-bold text-zinc-500 hover:border-red-500/50 hover:text-red-400 transition-all"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ClaimSubNav claimId={claimId} />

      <div className="mb-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
          Move claim in pipeline
        </label>
        <select
          value={claim.status}
          onChange={(e) => handleStatusChange(e.target.value as ClaimStatus)}
          className="w-full sm:w-auto rounded-xl border border-zinc-700 bg-zinc-950/60 px-4 py-3 text-sm text-white focus:border-blue-500/50 focus:outline-none"
        >
          {CLAIM_STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {CLAIM_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

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
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500 shrink-0">Carrier</dt>
              <dd className="text-zinc-200 font-medium text-right">{claim.carrier}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500 shrink-0">Claim Number</dt>
              <dd className="text-zinc-200 font-mono text-xs text-right">{claim.claimNumber}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500 shrink-0">Date of Loss</dt>
              <dd className="text-zinc-200">{formatDate(claim.dateOfLoss)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500 shrink-0">Assigned To</dt>
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
            {claim.homeowner.phone && (
              <div className="flex items-center gap-2 text-zinc-200">
                <Phone className="h-4 w-4 text-zinc-500" />
                <a href={`tel:${claim.homeowner.phone}`} className="hover:text-blue-400">
                  {claim.homeowner.phone}
                </a>
              </div>
            )}
            {claim.homeowner.email && (
              <div className="flex items-center gap-2 text-zinc-200">
                <Mail className="h-4 w-4 text-zinc-500" />
                <a href={`mailto:${claim.homeowner.email}`} className="hover:text-blue-400">
                  {claim.homeowner.email}
                </a>
              </div>
            )}
            {!claim.homeowner.phone && !claim.homeowner.email && (
              <p className="text-zinc-500 text-sm">No contact info — edit claim to add</p>
            )}
          </dl>
          {claim.notes && (
            <div className="mt-4 pt-4 border-t border-zinc-800/60">
              <p className="text-xs text-zinc-500 mb-1">Loss Notes</p>
              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{claim.notes}</p>
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
            Review in the{" "}
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
