import { Bookmark, BookmarkCheck, X } from 'lucide-react'
import { AIRPORT_BY_CODE } from '../data/airports'
import { formatDate, formatHailSize, formatWindSpeed, getEventIcon } from '../lib/format'
import {
  DATA_SOURCE_LABELS,
  SEVERITY_COLORS,
  SEVERITY_LABELS,
  STORM_EVENT_LABELS,
} from '../types/storm'
import type { ImpactRadiusMiles, StormEvent } from '../types/storm'

const RADIUS_OPTIONS: ImpactRadiusMiles[] = [1, 3, 5, 10]

interface StormDetailPanelProps {
  storm: StormEvent
  impactRadius: ImpactRadiusMiles | null
  onImpactRadiusChange: (radius: ImpactRadiusMiles | null) => void
  isSaved: boolean
  onToggleSave: () => void
  onClose: () => void
}

export function StormDetailPanel({
  storm,
  impactRadius,
  onImpactRadiusChange,
  isSaved,
  onToggleSave,
  onClose,
}: StormDetailPanelProps) {
  const airport = AIRPORT_BY_CODE[storm.airportCode]

  return (
    <aside className="flex h-full flex-col border-t border-slate-700/60 bg-slate-900 md:border-t-0 md:border-l">
      <div className="flex items-center justify-between border-b border-slate-700/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: SEVERITY_COLORS[storm.severity] }}
          />
          <h2 className="text-base font-semibold text-slate-100">
            {STORM_EVENT_LABELS[storm.eventType]}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleSave}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-sky-400"
            aria-label={isSaved ? 'Remove from saved storms' : 'Save storm'}
          >
            {isSaved ? (
              <BookmarkCheck className="h-5 w-5 text-sky-400" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
            aria-label="Close storm details"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4 flex items-center gap-3 rounded-lg bg-slate-800/80 p-3">
          <div className="rounded-lg bg-slate-700/80 p-2 text-sky-400">
            {getEventIcon(storm.eventType, 'h-6 w-6')}
          </div>
          <div>
            <p className="font-medium text-slate-100">
              {storm.city}, {storm.county} County
            </p>
            <p className="text-sm text-slate-400">
              {formatDate(storm.date)} at {storm.time}
            </p>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <DetailItem label="Severity" value={SEVERITY_LABELS[storm.severity]} highlight />
          <DetailItem label="Airport" value={`${airport?.name ?? storm.airportCode} (${storm.airportCode})`} />
          <DetailItem label="Max Wind" value={formatWindSpeed(storm.windSpeed)} />
          <DetailItem label="Hail Size" value={formatHailSize(storm.hailSize)} />
          <DetailItem label="Source" value={DATA_SOURCE_LABELS[storm.source]} className="col-span-2" />
        </dl>

        {storm.notes && (
          <div className="mt-4 rounded-lg border border-slate-700/50 bg-slate-800/50 p-3">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Notes</p>
            <p className="text-sm leading-relaxed text-slate-300">{storm.notes}</p>
          </div>
        )}

        <div className="mt-5 rounded-lg border border-sky-500/30 bg-sky-500/5 p-3">
          <p className="mb-2 text-sm font-semibold text-sky-300">Estimated Impact Area</p>
          <div className="mb-3 flex flex-wrap gap-2">
            {RADIUS_OPTIONS.map((radius) => (
              <button
                key={radius}
                type="button"
                onClick={() =>
                  onImpactRadiusChange(impactRadius === radius ? null : radius)
                }
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  impactRadius === radius
                    ? 'bg-sky-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {radius} mi
              </button>
            ))}
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500">
            This radius is an estimate for planning and visualization purposes only and does
            not confirm property damage.
          </p>
        </div>
      </div>
    </aside>
  )
}

function DetailItem({
  label,
  value,
  highlight,
  className = '',
}: {
  label: string
  value: string
  highlight?: boolean
  className?: string
}) {
  return (
    <div className={`rounded-lg bg-slate-800/60 p-2.5 ${className}`}>
      <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className={`mt-0.5 font-medium ${highlight ? 'text-sky-300' : 'text-slate-200'}`}>
        {value}
      </dd>
    </div>
  )
}
