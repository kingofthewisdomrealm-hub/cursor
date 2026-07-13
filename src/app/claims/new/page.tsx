"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ClaimForm } from "@/components/claims/ClaimForm";
import { ArrowLeft } from "lucide-react";

export default function NewClaimPage() {
  return (
    <AppShell>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-blue-400 mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">New Claim</h1>
      <p className="text-sm text-zinc-500 mb-8">
        Enter FNOL details to open a new claim file
      </p>

      <ClaimForm mode="create" onCancel={() => window.history.back()} />

      <div className="h-16 lg:hidden" />
    </AppShell>
  );
}
