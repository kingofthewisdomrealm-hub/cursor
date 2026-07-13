"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ClaimPipeline, PipelineStats } from "@/components/claims/ClaimPipeline";
import { getClaims, searchClaims } from "@/lib/claim-store";
import type { Claim } from "@/types/claim";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardContent() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const [claims, setClaims] = useState<Claim[]>([]);
  const [view, setView] = useState<"pipeline" | "list">("pipeline");

  useEffect(() => {
    const data = search ? searchClaims(search) : getClaims();
    setClaims(data);
  }, [search]);

  return (
    <AppShell>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Claims Pipeline
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {search ? `Results for "${search}"` : "Manage claims from FNOL through settlement"}
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
        </div>
      </div>

      <PipelineStats claims={claims} />
      <ClaimPipeline claims={claims} view={view} />

      {claims.length === 0 && (
        <div className="text-center py-16 text-zinc-500">
          <p className="text-sm">No claims found.</p>
        </div>
      )}

      <div className="h-16 lg:hidden" />
    </AppShell>
  );
}
