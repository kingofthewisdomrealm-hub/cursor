import { useState } from 'react'
import { FileText, Sparkles, Upload } from 'lucide-react'
import { SAMPLE_TRANSCRIPT } from '../lib/mriAnalyzer'

interface TranscriptInputProps {
  onAnalyze: (transcript: string, participantName: string) => void
  error: string | null
}

export function TranscriptInput({ onAnalyze, error }: TranscriptInputProps) {
  const [transcript, setTranscript] = useState('')
  const [participantName, setParticipantName] = useState('')

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setTranscript(String(reader.result ?? ''))
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="input-panel animate-fade-in">
      <section className="hero-block">
        <p className="eyebrow">Conversation MRI</p>
        <h2 className="hero-title">
          Map the internal world behind every conversation
        </h2>
        <p className="hero-subtitle">
          Upload or paste a transcript. QuestionPilot analyzes goals, fears, values,
          emotions, patterns, and contradictions — then shows you how to navigate
          for breakthrough results.
        </p>
      </section>

      <div className="input-card">
        <label className="field-label" htmlFor="participant">
          Participant name (optional)
        </label>
        <input
          id="participant"
          type="text"
          className="text-input"
          placeholder="e.g. Client, Sarah, Team Member"
          value={participantName}
          onChange={(e) => setParticipantName(e.target.value)}
        />

        <div className="flex items-center justify-between mt-5 mb-2">
          <label className="field-label mb-0" htmlFor="transcript">
            Conversation transcript
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-ghost text-xs"
              onClick={() => setTranscript(SAMPLE_TRANSCRIPT)}
            >
              <FileText className="w-3.5 h-3.5" />
              Load sample
            </button>
            <label className="btn-ghost text-xs cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              Upload .txt
              <input
                type="file"
                accept=".txt,.md,.csv"
                className="sr-only"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>

        <textarea
          id="transcript"
          className="transcript-area"
          placeholder={`Paste a coaching, therapy, or sales conversation transcript.\n\nTip: Use "Speaker: text" format for best results.\n\nCoach: What's on your mind?\nClient: I've been feeling stuck...`}
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          rows={14}
        />

        <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
          <span>{transcript.split(/\s+/).filter(Boolean).length} words</span>
          <span>Minimum ~50 words recommended</span>
        </div>

        {error && <p className="error-banner mt-3">{error}</p>}

        <button
          type="button"
          className="btn-primary w-full mt-5"
          onClick={() => onAnalyze(transcript, participantName)}
          disabled={transcript.trim().length < 20}
        >
          <Sparkles className="w-4 h-4" />
          Generate Conversation MRI
        </button>
      </div>
    </div>
  )
}
