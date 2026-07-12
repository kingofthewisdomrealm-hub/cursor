export type Answer = 'yes' | 'no';

export interface Situation {
  text: string;
  emoji: string;
  answer: Answer;
}

export const SITUATIONS: Situation[] = [
  { text: 'A friend asks you to cover their shift last-minute — again.', emoji: '🔄', answer: 'no' },
  { text: "Someone offers you a free class in something you've always wanted to learn.", emoji: '🎓', answer: 'yes' },
  { text: 'Your coworker wants you to do their work because they "forgot."', emoji: '📋', answer: 'no' },
  { text: 'A neighbor invites you to a community garden potluck.', emoji: '🌻', answer: 'yes' },
  { text: 'An ex texts at 2 AM asking to "talk."', emoji: '📱', answer: 'no' },
  { text: "Your doctor recommends a screening you've been putting off.", emoji: '🩺', answer: 'yes' },
  { text: "A relative guilt-trips you into lending money you can't spare.", emoji: '💸', answer: 'no' },
  { text: "A friend asks you to be their plus-one to a wedding you'd enjoy.", emoji: '💒', answer: 'yes' },
  { text: 'Someone pressures you to share a password "just this once."', emoji: '🔐', answer: 'no' },
  { text: 'You get invited to join a book club with people you like.', emoji: '📚', answer: 'yes' },
  { text: 'A date keeps rescheduling and cancels again last minute.', emoji: '📅', answer: 'no' },
  { text: "Your team asks you to lead a project you're excited about.", emoji: '🚀', answer: 'yes' },
  { text: 'A stranger on the street asks for your home address.', emoji: '🏠', answer: 'no' },
  { text: 'A mentor offers 30 minutes to review your resume.', emoji: '🤝', answer: 'yes' },
  { text: 'Friends plan a trip but expect you to pay upfront for everyone.', emoji: '✈️', answer: 'no' },
  { text: "You're offered a paid speaking gig on a topic you know well.", emoji: '🎤', answer: 'yes' },
  { text: 'Someone says "it\'s just a joke" after insulting you.', emoji: '😤', answer: 'no' },
  { text: 'A gym buddy invites you to try a new workout class together.', emoji: '💪', answer: 'yes' },
  { text: "A brand offers free product only if you post without disclosing it's an ad.", emoji: '📸', answer: 'no' },
  { text: "Your kid's school needs a volunteer for one afternoon you're free.", emoji: '🏫', answer: 'yes' },
];

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getResultMessage(pct: number): string {
  if (pct === 100) return 'Perfect! You know your boundaries.';
  if (pct >= 80) return 'Great instincts — trust yourself more often.';
  if (pct >= 60) return 'Solid effort! Saying yes and no gets easier with practice.';
  return 'Keep playing — every round builds your confidence.';
}
