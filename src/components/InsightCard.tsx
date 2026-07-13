import type { InsightItem } from '../types/mri'
import { Quote } from 'lucide-react'

interface InsightCardProps {
  item: InsightItem
  accent: string
}

export function InsightCard({ item, accent }: InsightCardProps) {
  return (
    <div className={`insight-card accent-${accent}`}>
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-medium text-slate-900">{item.label}</h4>
        <span className="intensity-badge">{Math.round(item.intensity * 100)}%</span>
      </div>
      <p className="text-sm text-slate-600 mt-1.5">{item.description}</p>
      {item.evidence.length > 0 && (
        <blockquote className="evidence-quote">
          <Quote className="w-3 h-3 shrink-0 mt-0.5 opacity-50" />
          <span>{item.evidence[0].text}</span>
        </blockquote>
      )}
    </div>
  )
}
