import { MapPin, TrendingUp, AlertTriangle, Zap } from 'lucide-react'

interface DashboardProps {
  totalThisMonth: number
  severeThisMonth: number
  majorThisMonth: number
  mostActiveRegion: string
}

export function Dashboard({
  totalThisMonth,
  severeThisMonth,
  majorThisMonth,
  mostActiveRegion,
}: DashboardProps) {
  const stats = [
    {
      label: 'Storms This Month',
      value: totalThisMonth,
      icon: MapPin,
      accent: 'text-sky-400',
      bg: 'bg-sky-500/10',
    },
    {
      label: 'Severe',
      value: severeThisMonth,
      icon: AlertTriangle,
      accent: 'text-orange-400',
      bg: 'bg-orange-500/10',
    },
    {
      label: 'Major',
      value: majorThisMonth,
      icon: Zap,
      accent: 'text-red-400',
      bg: 'bg-red-500/10',
    },
    {
      label: 'Most Active Region',
      value: mostActiveRegion,
      icon: TrendingUp,
      accent: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      isText: true,
    },
  ]

  return (
    <section className="border-b border-slate-700/60 bg-slate-900/95 backdrop-blur-sm">
      <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-4 sm:gap-3 sm:p-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-slate-700/50 bg-slate-800/80 p-2.5 sm:p-3"
          >
            <div className="mb-1 flex items-center gap-1.5">
              <span className={`rounded-md p-1 ${stat.bg}`}>
                <stat.icon className={`h-3.5 w-3.5 ${stat.accent}`} />
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400 sm:text-xs">
                {stat.label}
              </span>
            </div>
            <p
              className={`font-semibold text-slate-100 ${stat.isText ? 'text-sm leading-tight sm:text-base' : 'text-xl sm:text-2xl'}`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
