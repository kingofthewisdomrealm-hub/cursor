import type { NavigationPlan, RecommendedQuestion } from '../types/mri'
import { AlertTriangle, Compass, Lightbulb, MessageCircleQuestion, Navigation } from 'lucide-react'

interface NavigationGuideProps {
  navigation: NavigationPlan
  questions: RecommendedQuestion[]
}

const PRIORITY_STYLES = {
  critical: 'priority-critical',
  high: 'priority-high',
  medium: 'priority-medium',
  low: 'priority-low',
}

export function NavigationGuide({ navigation, questions }: NavigationGuideProps) {
  return (
    <div className="nav-guide">
      <div className="strategy-hero">
        <div className="strategy-icon">
          <Compass className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
            Navigation Strategy
          </p>
          <h3 className="text-lg font-semibold text-slate-900 mt-1">
            {navigation.overallStrategy}
          </h3>
          <p className="text-sm text-slate-600 mt-2">{navigation.summary}</p>
        </div>
      </div>

      <div className="approach-card">
        <Navigation className="w-4 h-4 text-teal-600" />
        <div>
          <h4 className="font-medium text-slate-900">Recommended Approach</h4>
          <p className="text-sm text-slate-600 mt-1">{navigation.recommendedApproach}</p>
        </div>
      </div>

      {navigation.breakthroughLevers.length > 0 && (
        <div className="lever-list">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Breakthrough Levers
          </h4>
          <div className="flex flex-wrap gap-2 mt-2">
            {navigation.breakthroughLevers.map((lever) => (
              <span key={lever} className="lever-chip">{lever}</span>
            ))}
          </div>
        </div>
      )}

      {navigation.priorityAreas.length > 0 && (
        <section>
          <h4 className="text-sm font-semibold text-slate-900 mb-3">Priority Navigation Areas</h4>
          <div className="priority-list">
            {navigation.priorityAreas.map((area) => (
              <div key={area.dimension} className="priority-card">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`priority-badge ${PRIORITY_STYLES[area.priority]}`}>
                    {area.priority}
                  </span>
                  <h5 className="font-medium text-slate-900">{area.dimension}</h5>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="nav-do">
                    <span className="nav-do-label">Do</span>
                    <p>{area.approach}</p>
                  </div>
                  <div className="nav-avoid">
                    <span className="nav-avoid-label">Avoid</span>
                    <p>{area.avoid}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {navigation.cautions.length > 0 && (
        <div className="caution-box">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <ul className="text-sm text-amber-900">
            {navigation.cautions.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      <section className="questions-section">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-3">
          <MessageCircleQuestion className="w-4 h-4 text-violet-600" />
          Recommended Questions
        </h4>
        <div className="question-list">
          {questions.map((q, i) => (
            <div key={q.id} className="question-card">
              <div className="flex items-center gap-2 mb-2">
                <span className="question-num">{i + 1}</span>
                <span className={`timing-badge timing-${q.timing}`}>{q.timing}</span>
                <span className="text-xs text-slate-500">{q.targetArea}</span>
              </div>
              <p className="font-medium text-slate-900">{q.question}</p>
              <p className="text-sm text-slate-600 mt-2">{q.rationale}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
