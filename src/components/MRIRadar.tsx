import type { DimensionScore } from '../types/mri'

interface MRIRadarProps {
  dimensions: DimensionScore[]
}

const DIMENSION_ORDER = [
  'clarity',
  'emotionalOpenness',
  'motivation',
  'selfAwareness',
  'resistance',
  'trust',
] as const

export function MRIRadar({ dimensions }: MRIRadarProps) {
  const cx = 150
  const cy = 150
  const maxR = 100
  const levels = [0.25, 0.5, 0.75, 1]

  const ordered = DIMENSION_ORDER.map(
    (d) => dimensions.find((dim) => dim.dimension === d)!,
  )

  const angleStep = (2 * Math.PI) / ordered.length

  const pointAt = (index: number, value: number) => {
    const angle = index * angleStep - Math.PI / 2
    const r = value * maxR
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    }
  }

  const dataPoints = ordered.map((d, i) => pointAt(i, d.score))
  const polygon = dataPoints.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <div className="radar-wrap">
      <svg viewBox="0 0 300 300" className="w-full max-w-xs mx-auto" role="img" aria-label="Conversation MRI radar chart">
        {levels.map((level) => (
          <polygon
            key={level}
            points={ordered
              .map((_, i) => {
                const p = pointAt(i, level)
                return `${p.x},${p.y}`
              })
              .join(' ')}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-slate-200"
          />
        ))}

        {ordered.map((d, i) => {
          const outer = pointAt(i, 1)
          return (
            <line
              key={d.dimension}
              x1={cx}
              y1={cy}
              x2={outer.x}
              y2={outer.y}
              stroke="currentColor"
              strokeWidth="1"
              className="text-slate-200"
            />
          )
        })}

        <polygon
          points={polygon}
          fill="rgba(13, 148, 136, 0.25)"
          stroke="rgb(13, 148, 136)"
          strokeWidth="2"
        />

        {dataPoints.map((p, i) => (
          <circle key={ordered[i].dimension} cx={p.x} cy={p.y} r="4" fill="rgb(13, 148, 136)" />
        ))}

        {ordered.map((d, i) => {
          const label = pointAt(i, 1.28)
          return (
            <text
              key={`label-${d.dimension}`}
              x={label.x}
              y={label.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-slate-600 text-[9px] font-medium"
            >
              {d.label.split(' ')[0]}
            </text>
          )
        })}
      </svg>

      <div className="dimension-legend">
        {ordered.map((d) => (
          <div key={d.dimension} className="dimension-row">
            <span className="dimension-name">{d.label}</span>
            <div className="dimension-bar-track">
              <div className="dimension-bar-fill" style={{ width: `${d.score * 100}%` }} />
            </div>
            <span className="dimension-score">{Math.round(d.score * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
