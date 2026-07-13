import { useMemo, useState } from 'react'
import { CloudRain } from 'lucide-react'
import { STORM_EVENTS } from '../data/storms'
import { useSavedStorms } from '../hooks/useSavedStorms'
import {
  filterStorms,
  getDashboardStats,
  getDefaultFilters,
} from '../lib/stormUtils'
import { AppNavigation, FilterButton } from '../components/AppNavigation'
import { Dashboard } from '../components/Dashboard'
import { FilterPanel } from '../components/FilterPanel'
import { MapLegend } from '../components/MapLegend'
import { StormDetailPanel } from '../components/StormDetailPanel'
import { StormMap } from '../components/StormMap'
import type { StormEvent, StormFilters } from '../types/storm'

function countActiveFilters(filters: StormFilters, defaults: StormFilters): number {
  let count = 0
  if (filters.eventTypes.length > 0) count++
  if (filters.severities.length > 0) count++
  if (filters.minHailSize > 0) count++
  if (filters.minWindSpeed > 0) count++
  if (filters.airportCode) count++
  if (filters.dateFrom !== defaults.dateFrom || filters.dateTo !== defaults.dateTo) count++
  return count
}

export function MapPage() {
  const defaultFilters = useMemo(() => getDefaultFilters(STORM_EVENTS), [])
  const [filters, setFilters] = useState<StormFilters>(defaultFilters)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedStorm, setSelectedStorm] = useState<StormEvent | null>(null)
  const { isSaved, toggleSave } = useSavedStorms()

  const filteredStorms = useMemo(() => filterStorms(STORM_EVENTS, filters), [filters])
  const stats = useMemo(() => getDashboardStats(STORM_EVENTS), [])
  const activeFilterCount = countActiveFilters(filters, defaultFilters)

  const handleSelectStorm = (storm: StormEvent) => {
    setSelectedStorm(storm)
  }

  const handleCloseDetail = () => {
    setSelectedStorm(null)
  }

  return (
    <div className="flex h-full flex-col bg-slate-950">
      <header className="shrink-0 border-b border-slate-700/60 bg-slate-900 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CloudRain className="h-6 w-6 text-sky-400" />
            <div>
              <h1 className="text-base font-bold text-slate-100 sm:text-lg">Florida Storm Map</h1>
              <p className="text-[11px] text-slate-500">Severe weather intelligence</p>
            </div>
          </div>
        </div>
      </header>

      <Dashboard
        totalThisMonth={stats.totalThisMonth}
        severeThisMonth={stats.severeThisMonth}
        majorThisMonth={stats.majorThisMonth}
        mostActiveRegion={stats.mostActiveRegion}
      />

      <div className="relative flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="relative min-h-0 flex-1">
          <div className="absolute right-3 top-3 z-[1000]">
            <FilterButton onClick={() => setFiltersOpen(true)} activeCount={activeFilterCount} />
          </div>
          <MapLegend />
          <StormMap
            storms={filteredStorms}
            selectedStorm={selectedStorm}
            onSelectStorm={handleSelectStorm}
          />
        </div>

        {selectedStorm && (
          <div className="h-[45vh] shrink-0 md:h-auto md:w-96">
            <StormDetailPanel
              storm={selectedStorm}
              isSaved={isSaved(selectedStorm.id)}
              onToggleSave={() => toggleSave(selectedStorm)}
              onClose={handleCloseDetail}
            />
          </div>
        )}
      </div>

      <FilterPanel
        filters={filters}
        onChange={setFilters}
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        resultCount={filteredStorms.length}
      />

      <AppNavigation />
    </div>
  )
}
