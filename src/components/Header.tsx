import { Brain, RotateCcw } from 'lucide-react'

interface HeaderProps {
  onReset?: () => void
}

export function Header({ onReset }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="flex items-center gap-3">
        <div className="logo-mark">
          <Brain className="w-5 h-5" strokeWidth={2.2} />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">
            QuestionPilot AI
          </h1>
          <p className="text-xs text-slate-500">Conversation MRI</p>
        </div>
      </div>

      {onReset && (
        <button type="button" onClick={onReset} className="btn-ghost">
          <RotateCcw className="w-4 h-4" />
          New scan
        </button>
      )}
    </header>
  )
}
