"use client";

import { AppShell } from "@/components/layout/AppShell";
import { StormProvider, useStormApp } from "@/hooks/useStormApp";
import { StormFilters } from "@/components/storms/StormFilters";
import { StormList } from "@/components/storms/StormList";
import { StormDetailPanel } from "@/components/storms/StormDetailPanel";
import { StormMapClient } from "@/components/map/StormMapClient";
import { TerritoryGenerator } from "@/components/territory/TerritoryGenerator";
import { RouteBuilder } from "@/components/territory/RouteBuilder";
import { ScanButton } from "@/components/scan/ScanButton";
import { useRouter } from "next/navigation";

function DashboardInner() {
  const router = useRouter();
  const {
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
    saveCurrentOpportunity,
    routeUrl,
  } = useStormApp();

  const handleBeginCanvass = () => {
    saveCurrentOpportunity("currently_canvassing");
    router.push("/opportunities");
  };

  const handleSave = () => {
    saveCurrentOpportunity("ready_to_canvass");
  };

  const handleBuild = () => {
    const url = buildRoute();
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <AppShell>
      <section className="mb-5 sm:mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold text-[var(--soa-ink)] tracking-tight">
          Storm Opportunity Agent
        </h1>
        <p className="mt-1 text-sm text-[var(--soa-muted)] max-w-2xl">
          Scan Florida storm damage, score restoration opportunities, generate
          canvassing territories, and route your team.
        </p>
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          <ScanButton
            scanning={scanning}
            onScan={runScan}
            lastScanAt={lastScan?.scannedAt}
          />
          <StormFilters value={filter} onChange={setFilter} />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="h-[300px] sm:h-[380px] lg:h-[440px]">
            <StormMapClient
              storms={storms}
              selectedId={selectedId}
              onSelect={selectStorm}
              territories={territories}
            />
          </div>
          <div className="rounded-xl border border-[var(--soa-border)] bg-white/80 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-[var(--soa-border)] flex items-center justify-between">
              <h2 className="text-sm font-bold text-[var(--soa-ink)]">
                Recent storms
              </h2>
              <span className="text-xs text-[var(--soa-muted)] tabular-nums">
                {storms.length} reports
              </span>
            </div>
            <StormList
              storms={storms}
              selectedId={selectedId}
              onSelect={selectStorm}
            />
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-4">
          <StormDetailPanel storm={selected} />
          <TerritoryGenerator
            territories={territories}
            selectedIds={selectedTerritoryIds}
            onToggle={toggleTerritory}
            onGenerate={generateTerritory}
            disabled={!selected}
          />
          <RouteBuilder
            selectedCount={selectedTerritoryIds.length}
            routeUrl={routeUrl}
            onBuild={handleBuild}
            onSave={handleSave}
            onBeginCanvass={handleBeginCanvass}
            canSave={!!selected}
          />
        </div>
      </div>

      <p className="mt-6 text-[11px] text-[var(--soa-muted)] leading-relaxed max-w-3xl">
        Workflow: Run Storm Scan → View storms on map → Select a storm → Review
        Opportunity Score → Generate territory → Create route → Save opportunity
        → Begin canvassing. Sample data powers the MVP; modular sources are ready
        for NWS, airport observations, and public news feeds.
      </p>
    </AppShell>
  );
}

export default function HomePage() {
  return (
    <StormProvider>
      <DashboardInner />
    </StormProvider>
  );
}
