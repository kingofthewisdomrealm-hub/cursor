import { MapPin } from 'lucide-react'

interface NeighborhoodListProps {
  neighborhoods: string[]
  className?: string
}

export function NeighborhoodList({ neighborhoods, className = '' }: NeighborhoodListProps) {
  if (neighborhoods.length === 0) return null

  return (
    <div className={`rounded-lg border border-slate-700/50 bg-slate-800/50 p-3 ${className}`}>
      <div className="mb-2 flex items-center gap-1.5">
        <MapPin className="h-3.5 w-3.5 text-sky-400" />
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Neighborhoods Hit
        </p>
      </div>
      <ul className="flex flex-wrap gap-1.5">
        {neighborhoods.map((neighborhood) => (
          <li
            key={neighborhood}
            className="rounded-full border border-slate-600/80 bg-slate-700/60 px-2.5 py-1 text-xs font-medium text-slate-200"
          >
            {neighborhood}
          </li>
        ))}
      </ul>
    </div>
  )
}
