"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ClaimPipeline, PipelineStats } from "@/components/claims/ClaimPipeline";
import { useClaims } from "@/hooks/useClaims";
import { searchClaims } from "@/lib/claim-store";
import { LayoutGrid, List, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

export default function DashboardContent() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const allClaims = useClaims();
  const [view, setView] = useState<"pipeline" | "list">("list");

  const claims = useMemo(
    () => (search ? searchClaims(search) : allClaims),
    [search, allClaims]
  );

  return (
    <AppShell>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Claims Pipeline
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {search ? `Results for "${search}"` : "Your active claims — data saves in this browser"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-zinc-800 bg-zinc-900/40 p-1">
            <button
              onClick={() => setView("pipeline")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all",
                view === "pipeline" ? "bg-blue-500/10 text-blue-400" : "text-zinc-500"
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Pipeline
            </button>
            <button
              onClick={() => setView("list")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all",
                view === "list" ? "bg-blue-500/10 text-blue-400" : "text-zinc-500"
              )}
            >
              <List className="h-3.5 w-3.5" />
              List
            </button>
          </div>
          <Link
            href="/claims/new"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Claim</span>
            <span className="sm:hidden">New</span>
          </Link>
        </div>
      </div>

      {claims.length > 0 && <PipelineStats claims={claims} />}
      <ClaimPipeline claims={claims} view={view} />

      {claims.length === 0 && (
        <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/20 py-16 px-6 text-center">
          <p className="text-lg font-bold text-white mb-2">No claims yet</p>
          <p className="text-sm text-zinc-500 mb-6 max-w-sm mx-auto">
            Create your first claim to start tracking files, supplements, and negotiations.
          </p>
          <Link
            href="/claims/new"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-blue-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create New Claim
          </Link>
        </div>
      )}

      <div className="h-16 lg:hidden" />
    </AppShell>
  );
}
