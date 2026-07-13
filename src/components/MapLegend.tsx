import { SEVERITY_COLORS, SEVERITY_LABELS } from '../types/storm'

export function MapLegend() {
  return (
    <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] rounded-lg border border-slate-700/50 bg-slate-900/90 p-2.5 shadow-lg backdrop-blur-sm">
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        Severity
      </p>
      <div className="space-y-1">
        {(Object.keys(SEVERITY_LABELS) as Array<keyof typeof SEVERITY_LABELS>).map((key) => (
          <div key={key} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full border border-white/80"
              style={{ backgroundColor: SEVERITY_COLORS[key] }}
            />
            <span className="text-[11px] text-slate-300">{SEVERITY_LABELS[key]}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 border-t border-slate-700/50 pt-2 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full border border-dashed border-orange-400/80 bg-orange-400/20" />
          <span className="text-[11px] text-slate-300">Danger Zone</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 items-center justify-center rounded-sm bg-sky-500 text-[6px] text-white">
            ✈
          </span>
          <span className="text-[11px] text-slate-300">Airport</span>
        </div>
      </div>
    </div>
  )
}
