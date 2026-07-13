import { useEffect, useState } from 'react'
import { Activity } from 'lucide-react'

const STEPS = [
  'Parsing transcript structure…',
  'Mapping goals and aspirations…',
  'Detecting fears and limiting beliefs…',
  'Identifying emotional patterns…',
  'Finding contradictions and opportunities…',
  'Building navigation strategy…',
]

export function AnalysisLoader() {
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => (i < STEPS.length - 1 ? i + 1 : i))
    }, 450)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="loader-panel animate-fade-in">
      <div className="loader-ring">
        <Activity className="w-8 h-8 text-teal-600 animate-pulse" />
      </div>
      <h2 className="text-xl font-semibold text-slate-900 mt-6">Scanning conversation</h2>
      <p className="text-slate-500 mt-2 text-sm">{STEPS[stepIndex]}</p>

      <div className="progress-track mt-8">
        <div
          className="progress-fill"
          style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
        />
      </div>
    </div>
  )
}
