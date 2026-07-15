"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  AgentActivityEntry,
  SavedOpportunity,
  ScoredStorm,
  Territory,
  TimeFilter,
  ScanResult,
} from "@/types/storm";
import { scoreStorms } from "@/lib/scoring";
import { SAMPLE_STORMS } from "@/lib/sample-data";
import { filterStormsByTime } from "@/lib/time-filter";
import { generateTerritories } from "@/lib/territories";
import {
  listOpportunities,
  saveOpportunity,
  updateOpportunityStatus,
  updateOpportunity,
} from "@/lib/opportunity-store";
import { getLastScan, saveLastScan, listActivity, getActivitySummary } from "@/lib/activity-store";
import { openGoogleMapsRoute } from "@/lib/utils";
import type { OpportunityStatus } from "@/types/storm";

interface StormAppState {
  filter: TimeFilter;
  setFilter: (f: TimeFilter) => void;
  storms: ScoredStorm[];
  selectedId: string | null;
  selected: ScoredStorm | null;
  selectStorm: (id: string | null) => void;
  territories: Territory[];
  selectedTerritoryIds: string[];
  toggleTerritory: (id: string) => void;
  generateTerritory: () => void;
  buildRoute: () => string | null;
  scanning: boolean;
  runScan: () => Promise<void>;
  lastScan: ScanResult | null;
  activity: AgentActivityEntry[];
  activitySummary: ReturnType<typeof getActivitySummary>;
  opportunities: SavedOpportunity[];
  saveCurrentOpportunity: (status?: OpportunityStatus) => SavedOpportunity | null;
  setOpportunityStatus: (id: string, status: OpportunityStatus) => void;
  refreshOpportunities: () => void;
  routeUrl: string | null;
}

const Ctx = createContext<StormAppState | null>(null);

export function StormProvider({ children }: { children: ReactNode }) {
  const [filter, setFilter] = useState<TimeFilter>("7d");
  const [storms, setStorms] = useState<ScoredStorm[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [selectedTerritoryIds, setSelectedTerritoryIds] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState<ScanResult | null>(null);
  const [activity, setActivity] = useState<AgentActivityEntry[]>([]);
  const [opportunities, setOpportunities] = useState<SavedOpportunity[]>([]);
  const [routeUrl, setRouteUrl] = useState<string | null>(null);

  const hydrate = useCallback(() => {
    const filtered = filterStormsByTime(SAMPLE_STORMS, filter);
    setStorms(scoreStorms(filtered));
    setLastScan(getLastScan());
    setActivity(listActivity());
    setOpportunities(listOpportunities());
  }, [filter]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const selected = useMemo(
    () => storms.find((s) => s.id === selectedId) ?? null,
    [storms, selectedId]
  );

  const selectStorm = useCallback((id: string | null) => {
    setSelectedId(id);
    setTerritories([]);
    setSelectedTerritoryIds([]);
    setRouteUrl(null);
  }, []);

  const generateTerritory = useCallback(() => {
    if (!selected) return;
    const terr = generateTerritories(selected, 5);
    setTerritories(terr);
    setSelectedTerritoryIds(terr.slice(0, 3).map((t) => t.id));
  }, [selected]);

  const toggleTerritory = useCallback((id: string) => {
    setSelectedTerritoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const buildRoute = useCallback(() => {
    const points = territories
      .filter((t) => selectedTerritoryIds.includes(t.id))
      .sort((a, b) => b.priority - a.priority)
      .map((t) => ({ lat: t.lat, lng: t.lng, label: t.neighborhood }));
    if (points.length === 0) return null;
    const url = openGoogleMapsRoute(points);
    setRouteUrl(url);
    if (selected) {
      updateOpportunity(`opp-${selected.id}`, { routeUrl: url, territories });
      setOpportunities(listOpportunities());
    }
    return url;
  }, [territories, selectedTerritoryIds, selected]);

  const runScan = useCallback(async () => {
    setScanning(true);
    try {
      const res = await fetch("/api/storms/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filter }),
      });
      const data = (await res.json()) as ScanResult & { storms: ScoredStorm[] };
      saveLastScan(data);
      setLastScan(data);
      setActivity(listActivity());
      setStorms(data.storms);
      if (data.storms.length && !selectedId) {
        setSelectedId(data.storms[0].id);
      }
    } finally {
      setScanning(false);
    }
  }, [filter, selectedId]);

  const saveCurrentOpportunity = useCallback(
    (status?: OpportunityStatus) => {
      if (!selected) return null;
      const opp = saveOpportunity({
        storm: selected,
        territories,
        status: status ?? "new",
        routeUrl: routeUrl ?? undefined,
      });
      setOpportunities(listOpportunities());
      return opp;
    },
    [selected, territories, routeUrl]
  );

  const setOpportunityStatus = useCallback((id: string, status: OpportunityStatus) => {
    updateOpportunityStatus(id, status);
    setOpportunities(listOpportunities());
  }, []);

  const refreshOpportunities = useCallback(() => {
    setOpportunities(listOpportunities());
  }, []);

  const activitySummary = useMemo(
    () => getActivitySummary(activity),
    [activity]
  );

  const value: StormAppState = {
    filter,
    setFilter,
    storms,
    selectedId,
    selected,
    selectStorm,
    territories,
    selectedTerritoryIds,
    toggleTerritory,
    generateTerritory,
    buildRoute,
    scanning,
    runScan,
    lastScan,
    activity,
    activitySummary,
    opportunities,
    saveCurrentOpportunity,
    setOpportunityStatus,
    refreshOpportunities,
    routeUrl,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStormApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStormApp must be used within StormProvider");
  return ctx;
}
