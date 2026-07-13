import { useState } from 'react'
import type { AppStep, ConversationMRI } from './types/mri'
import { analyzeTranscript } from './lib/mriAnalyzer'
import { Header } from './components/Header'
import { TranscriptInput } from './components/TranscriptInput'
import { AnalysisLoader } from './components/AnalysisLoader'
import { MRIResults } from './components/MRIResults'

export default function App() {
  const [step, setStep] = useState<AppStep>('input')
  const [mri, setMri] = useState<ConversationMRI | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async (transcript: string, participantName: string) => {
    if (transcript.trim().length < 50) {
      setError('Please provide at least a few sentences of conversation to analyze.')
      return
    }

    setError(null)
    setStep('analyzing')

    try {
      const result = await analyzeTranscript(transcript, participantName)
      setMri(result)
      setStep('results')
    } catch {
      setError('Analysis failed. Please try again.')
      setStep('input')
    }
  }

  const handleReset = () => {
    setMri(null)
    setStep('input')
    setError(null)
  }

  return (
    <div className="app-shell">
      <Header onReset={step === 'results' ? handleReset : undefined} />

      <main className="app-main">
        {step === 'input' && (
          <TranscriptInput onAnalyze={handleAnalyze} error={error} />
        )}
        {step === 'analyzing' && <AnalysisLoader />}
        {step === 'results' && mri && <MRIResults mri={mri} onNewAnalysis={handleReset} />}
      </main>
    </div>
  )
}
