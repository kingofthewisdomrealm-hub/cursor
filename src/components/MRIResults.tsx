import { useState } from 'react'
import type { ConversationMRI } from '../types/mri'
import { MRIRadar } from './MRIRadar'
import { InternalWorldMap } from './InternalWorldMap'
import { NavigationGuide } from './NavigationGuide'
import { Map, Navigation, Scan } from 'lucide-react'

type ResultTab = 'mri' | 'world' | 'navigate'

interface MRIResultsProps {
  mri: ConversationMRI
  onNewAnalysis: () => void
}

export function MRIResults({ mri, onNewAnalysis }: MRIResultsProps) {
  const [tab, setTab] = useState<ResultTab>('mri')

  const tabs: { id: ResultTab; label: string; icon: typeof Scan }[] = [
    { id: 'mri', label: 'MRI Scan', icon: Scan },
    { id: 'world', label: 'Internal World', icon: Map },
    { id: 'navigate', label: 'Navigate', icon: Navigation },
  ]

  return (
    <div className="results-panel animate-fade-in">
      <div className="results-header">
        <div>
          <p className="eyebrow">Analysis complete</p>
          <h2 className="text-2xl font-semibold text-slate-900">
            {mri.participantName}&apos;s Conversation MRI
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {mri.wordCount} words analyzed ·{' '}
            {new Date(mri.analyzedAt).toLocaleString()}
          </p>
        </div>
      </div>

      <nav className="tab-bar" aria-label="MRI result sections">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`tab-btn ${tab === id ? 'tab-active' : ''}`}
            onClick={() => setTab(id)}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </nav>

      <div className="tab-content">
        {tab === 'mri' && (
          <div className="mri-tab">
            <p className="text-sm text-slate-600 mb-6">
              Six-dimensional scan of conversational dynamics. Higher scores indicate
              stronger presence of that quality in the transcript.
            </p>
            <MRIRadar dimensions={mri.dimensions} />
            <div className="interpretation-grid mt-8">
              {mri.dimensions.map((d) => (
                <div key={d.dimension} className="interpretation-card">
                  <h4 className="font-medium text-slate-900">{d.label}</h4>
                  <p className="text-sm text-slate-600 mt-1">{d.interpretation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'world' && <InternalWorldMap world={mri.internalWorld} />}

        {tab === 'navigate' && (
          <NavigationGuide navigation={mri.navigation} questions={mri.questions} />
        )}
      </div>

      <div className="results-footer">
        <button type="button" className="btn-secondary" onClick={onNewAnalysis}>
          Analyze another conversation
        </button>
      </div>
    </div>
  )
}
