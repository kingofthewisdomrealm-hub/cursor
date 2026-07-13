export interface TranscriptSegment {
  speaker: string
  text: string
}

const SPEAKER_PATTERN = /^([A-Za-z][\w\s.'-]{0,30}?)\s*:\s*(.+)$/

export function parseTranscript(raw: string): TranscriptSegment[] {
  const lines = raw
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)

  const segments: TranscriptSegment[] = []

  for (const line of lines) {
    const match = line.match(SPEAKER_PATTERN)
    if (match) {
      segments.push({ speaker: match[1].trim(), text: match[2].trim() })
    } else if (segments.length > 0) {
      segments[segments.length - 1].text += ` ${line}`
    } else {
      segments.push({ speaker: 'Speaker', text: line })
    }
  }

  return segments
}

export function identifyClientSpeaker(segments: TranscriptSegment[]): string {
  if (segments.length === 0) return 'Client'

  const facilitatorHints = [
    'coach',
    'therapist',
    'facilitator',
    'consultant',
    'mentor',
    'interviewer',
    'agent',
  ]

  const speakers = [...new Set(segments.map((s) => s.speaker))]
  if (speakers.length === 1) return speakers[0]

  const nonFacilitator = speakers.find(
    (speaker) =>
      !facilitatorHints.some((hint) => speaker.toLowerCase().includes(hint)),
  )
  if (nonFacilitator) return nonFacilitator

  const wordCounts = new Map<string, number>()
  for (const segment of segments) {
    const count = segment.text.split(/\s+/).length
    wordCounts.set(segment.speaker, (wordCounts.get(segment.speaker) ?? 0) + count)
  }

  return [...wordCounts.entries()].sort((a, b) => b[1] - a[1])[0][0]
}

export function getClientText(segments: TranscriptSegment[], clientSpeaker: string): string {
  return segments
    .filter((s) => s.speaker === clientSpeaker)
    .map((s) => s.text)
    .join(' ')
}

export function extractSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 12)
}
