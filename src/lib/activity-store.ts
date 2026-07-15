"use client";

import type { AgentActivityEntry, ScanResult } from "@/types/storm";

const ACTIVITY_KEY = "soa-activity-v1";
const LAST_SCAN_KEY = "soa-last-scan-v1";

export function listActivity(): AgentActivityEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    return raw ? (JSON.parse(raw) as AgentActivityEntry[]) : [];
  } catch {
    return [];
  }
}

export function appendActivity(entries: AgentActivityEntry[]) {
  const prev = listActivity();
  const next = [...entries, ...prev].slice(0, 500);
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(next));
}

export function getLastScan(): ScanResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LAST_SCAN_KEY);
    return raw ? (JSON.parse(raw) as ScanResult) : null;
  } catch {
    return null;
  }
}

export function saveLastScan(result: ScanResult) {
  localStorage.setItem(LAST_SCAN_KEY, JSON.stringify(result));
  appendActivity(result.activity);
}

export function getActivitySummary(activity: AgentActivityEntry[] = listActivity()) {
  return {
    websitesChecked: activity.filter((a) => a.type === "website_checked").length,
    reportsFound: activity.filter((a) => a.type === "report_found").length,
    opportunitiesCreated: activity.filter((a) => a.type === "opportunity_created").length,
    errors: activity.filter((a) => a.type === "error").length,
    lastScanAt: getLastScan()?.scannedAt ?? null,
  };
}
