import type { ReactNode } from 'react'
import { Filter, X } from 'lucide-react'
import { FLORIDA_AIRPORTS } from '../data/airports'
import { ALL_EVENT_TYPES, ALL_SEVERITIES } from '../lib/stormUtils'
import { SEVERITY_LABELS, STORM_EVENT_LABELS } from '../types/storm'
import type { StormFilters } from '../types/storm'

interface FilterPanelProps {
  filters: StormFilters
  onChange: (filters: StormFilters) => void
  isOpen: boolean
  onClose: () => void
  resultCount: number
}

export function FilterPanel({ filters, onChange, isOpen, onClose, resultCount }: FilterPanelProps) {
  if (!isOpen) return null

  const toggleEventType = (type: (typeof ALL_EVENT_TYPES)[number]) => {
    const next = filters.eventTypes.includes(type)
      ? filters.eventTypes.filter((item) => item !== type)
      : [...filters.eventTypes, type]
    onChange({ ...filters, eventTypes: next })
  }

  const toggleSeverity = (severity: (typeof ALL_SEVERITIES)[number]) => {
    const next = filters.severities.includes(severity)
      ? filters.severities.filter((item) => item !== severity)
      : [...filters.severities, severity]
    onChange({ ...filters, severities: next })
  }

  const resetFilters = () => {
    onChange({
      ...filters,
      eventTypes: [],
      minHailSize: 0,
      minWindSpeed: 0,
      severities: [],
      airportCode: null,
    })
  }

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/50 md:bg-black/30"
        onClick={onClose}
        aria-label="Close filters"
      />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-slate-900 shadow-2xl md:max-w-md">
        <div className="flex items-center justify-between border-b border-slate-700/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-sky-400" />
            <h2 className="font-semibold text-slate-100">Filters</h2>
            <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-xs text-sky-300">
              {resultCount} results
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800"
            aria-label="Close filters"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          <FilterSection label="Date Range">
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="mb-1 block text-xs text-slate-500">From</span>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
                  className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-slate-500">To</span>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
                  className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100"
                />
              </label>
            </div>
          </FilterSection>

          <FilterSection label="Storm Type">
            <div className="flex flex-wrap gap-2">
              {ALL_EVENT_TYPES.map((type) => (
                <ToggleChip
                  key={type}
                  label={STORM_EVENT_LABELS[type]}
                  active={filters.eventTypes.includes(type)}
                  onClick={() => toggleEventType(type)}
                />
              ))}
            </div>
          </FilterSection>

          <FilterSection label="Severity Level">
            <div className="flex flex-wrap gap-2">
              {ALL_SEVERITIES.map((severity) => (
                <ToggleChip
                  key={severity}
                  label={SEVERITY_LABELS[severity]}
                  active={filters.severities.includes(severity)}
                  onClick={() => toggleSeverity(severity)}
                />
              ))}
            </div>
          </FilterSection>

          <FilterSection label="Minimum Hail Size (inches)">
            <input
              type="range"
              min={0}
              max={3}
              step={0.25}
              value={filters.minHailSize}
              onChange={(e) => onChange({ ...filters, minHailSize: Number(e.target.value) })}
              className="w-full accent-sky-500"
            />
            <p className="mt-1 text-sm text-slate-400">
              {filters.minHailSize > 0 ? `${filters.minHailSize}"+` : 'Any size'}
            </p>
          </FilterSection>

          <FilterSection label="Minimum Wind Speed (mph)">
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={filters.minWindSpeed}
              onChange={(e) => onChange({ ...filters, minWindSpeed: Number(e.target.value) })}
              className="w-full accent-sky-500"
            />
            <p className="mt-1 text-sm text-slate-400">
              {filters.minWindSpeed > 0 ? `${filters.minWindSpeed}+ mph` : 'Any speed'}
            </p>
          </FilterSection>

          <FilterSection label="Airport">
            <select
              value={filters.airportCode ?? ''}
              onChange={(e) =>
                onChange({ ...filters, airportCode: e.target.value || null })
              }
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100"
            >
              <option value="">All airports</option>
              {FLORIDA_AIRPORTS.map((airport) => (
                <option key={airport.code} value={airport.code}>
                  {airport.code} — {airport.name}
                </option>
              ))}
            </select>
          </FilterSection>
        </div>

        <div className="border-t border-slate-700/60 p-4">
          <button
            type="button"
            onClick={resetFilters}
            className="w-full rounded-lg border border-slate-600 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
          >
            Reset Filters
          </button>
        </div>
      </aside>
    </>
  )
}

function FilterSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</h3>
      {children}
    </div>
  )
}

function ToggleChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
        active
          ? 'bg-sky-500 text-white'
          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
      }`}
    >
      {label}
    </button>
  )
}
