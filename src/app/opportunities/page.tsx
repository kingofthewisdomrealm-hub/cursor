"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { OpportunityList } from "@/components/opportunities/OpportunityList";
import {
  listOpportunities,
  updateOpportunityStatus,
} from "@/lib/opportunity-store";
import type { OpportunityStatus, SavedOpportunity } from "@/types/storm";

export default function OpportunitiesPage() {
  const [items, setItems] = useState<SavedOpportunity[]>([]);

  useEffect(() => {
    setItems(listOpportunities());
  }, []);

  const onStatusChange = (id: string, status: OpportunityStatus) => {
    updateOpportunityStatus(id, status);
    setItems(listOpportunities());
  };

  return (
    <AppShell>
      <div className="mb-5">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--soa-ink)]">
          Saved opportunities
        </h1>
        <p className="text-sm text-[var(--soa-muted)] mt-1">
          CRM pipeline: New → Researching → Ready to canvass → Currently
          canvassing → Completed / Rejected
        </p>
      </div>
      <OpportunityList items={items} onStatusChange={onStatusChange} />
    </AppShell>
  );
}
