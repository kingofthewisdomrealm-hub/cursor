import type { InsightItem, InternalWorld } from '../types/mri'
import { InsightCard } from './InsightCard'

interface InternalWorldMapProps {
  world: InternalWorld
}

const SECTIONS: {
  key: keyof InternalWorld
  title: string
  color: string
  filter?: (item: unknown) => boolean
}[] = [
  { key: 'goals', title: 'Goals & Aspirations', color: 'emerald' },
  { key: 'fears', title: 'Fears & Concerns', color: 'rose' },
  { key: 'values', title: 'Core Values', color: 'violet' },
  { key: 'limitingBeliefs', title: 'Limiting Beliefs', color: 'amber' },
]

export function InternalWorldMap({ world }: InternalWorldMapProps) {
  return (
    <div className="world-map">
      {SECTIONS.map(({ key, title, color }) => {
        const items = world[key] as InsightItem[]
        if (!items?.length) return null
        return (
          <section key={key} className="world-section">
            <h3 className={`section-title text-${color}-700`}>{title}</h3>
            <div className="insight-grid">
              {items.map((item) => (
                <InsightCard key={item.id} item={item} accent={color} />
              ))}
            </div>
          </section>
        )
      })}

      {world.emotions.length > 0 && (
        <section className="world-section">
          <h3 className="section-title text-sky-700">Emotional Landscape</h3>
          <div className="emotion-chips">
            {world.emotions.map((e) => (
              <div key={e.emotion} className={`emotion-chip valence-${e.valence}`}>
                <span className="emotion-name">{e.emotion}</span>
                <span className="emotion-intensity">{Math.round(e.intensity * 100)}%</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {world.patterns.length > 0 && (
        <section className="world-section">
          <h3 className="section-title text-indigo-700">Recurring Patterns</h3>
          <div className="insight-grid">
            {world.patterns.map((p) => (
              <div key={p.id} className="pattern-card">
                <h4 className="font-medium text-slate-900">{p.name}</h4>
                <p className="text-sm text-slate-600 mt-1">{p.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {world.contradictions.length > 0 && (
        <section className="world-section">
          <h3 className="section-title text-orange-700">Contradictions & Tensions</h3>
          {world.contradictions.map((c) => (
            <div key={c.id} className="contradiction-card">
              <div className="contra-side">
                <span className="contra-label">A</span>
                <p>{c.statementA}</p>
              </div>
              <div className="contra-bridge">⟷</div>
              <div className="contra-side">
                <span className="contra-label">B</span>
                <p>{c.statementB}</p>
              </div>
              <p className="contra-tension">{c.tension}</p>
            </div>
          ))}
        </section>
      )}

      {world.opportunities.length > 0 && (
        <section className="world-section">
          <h3 className="section-title text-teal-700">Breakthrough Opportunities</h3>
          <div className="opp-grid">
            {world.opportunities.map((o) => (
              <div key={o.id} className={`opp-card leverage-${o.leverage}`}>
                <span className="opp-badge">{o.leverage} leverage</span>
                <h4 className="font-medium text-slate-900">{o.area}</h4>
                <p className="text-sm text-slate-600 mt-1">{o.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
