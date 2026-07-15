"use client";

import type { SavedOpportunity, OpportunityStatus, ScoredStorm, Territory } from "@/types/storm";

const STORAGE_KEY = "soa-opportunities-v1";

function read(): SavedOpportunity[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedOpportunity[]) : [];
  } catch {
    return [];
  }
}

function write(items: SavedOpportunity[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function listOpportunities(): SavedOpportunity[] {
  return read().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function saveOpportunity(input: {
  storm: ScoredStorm;
  territories: Territory[];
  status?: OpportunityStatus;
  notes?: string;
  routeUrl?: string;
}): SavedOpportunity {
  const now = new Date().toISOString();
  const items = read().filter((o) => o.stormId !== input.storm.id);
  const existing = read().find((o) => o.stormId === input.storm.id);
  const opp: SavedOpportunity = {
    id: existing?.id ?? `opp-${input.storm.id}`,
    stormId: input.storm.id,
    storm: input.storm,
    territories: input.territories,
    status: input.status ?? existing?.status ?? "new",
    notes: input.notes ?? existing?.notes ?? "",
    routeUrl: input.routeUrl ?? existing?.routeUrl,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  items.unshift(opp);
  write(items);
  return opp;
}

export function updateOpportunityStatus(
  id: string,
  status: OpportunityStatus
): SavedOpportunity | null {
  const items = read();
  const idx = items.findIndex((o) => o.id === id);
  if (idx < 0) return null;
  items[idx] = {
    ...items[idx],
    status,
    updatedAt: new Date().toISOString(),
  };
  write(items);
  return items[idx];
}

export function updateOpportunity(
  id: string,
  patch: Partial<Pick<SavedOpportunity, "status" | "notes" | "routeUrl" | "territories">>
): SavedOpportunity | null {
  const items = read();
  const idx = items.findIndex((o) => o.id === id);
  if (idx < 0) return null;
  items[idx] = {
    ...items[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  write(items);
  return items[idx];
}

export function deleteOpportunity(id: string) {
  write(read().filter((o) => o.id !== id));
}

export const OPPORTUNITY_STATUSES: { value: OpportunityStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "researching", label: "Researching" },
  { value: "ready_to_canvass", label: "Ready to canvass" },
  { value: "currently_canvassing", label: "Currently canvassing" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Rejected" },
];
