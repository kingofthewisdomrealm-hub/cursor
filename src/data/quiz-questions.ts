import type { QuizQuestion } from "@/types";

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    category: "Body frame",
    question: "How would you describe your natural body frame?",
    options: [
      { id: "q1a", label: "Light, slender, or bony with prominent joints", doshaType: "vata", points: 1 },
      { id: "q1b", label: "Medium, athletic, and well-proportioned", doshaType: "pitta", points: 1 },
      { id: "q1c", label: "Solid, sturdy, or fuller with strong build", doshaType: "kapha", points: 1 },
    ],
  },
  {
    id: "q2",
    category: "Skin characteristics",
    question: "How does your skin typically feel and appear?",
    options: [
      { id: "q2a", label: "Dry, thin, or cool to the touch", doshaType: "vata", points: 1 },
      { id: "q2b", label: "Warm, sensitive, or prone to redness", doshaType: "pitta", points: 1 },
      { id: "q2c", label: "Smooth, thick, soft, and well-hydrated", doshaType: "kapha", points: 1 },
    ],
  },
  {
    id: "q3",
    category: "Hair characteristics",
    question: "Which best describes your natural hair?",
    options: [
      { id: "q3a", label: "Dry, frizzy, thin, or curly", doshaType: "vata", points: 1 },
      { id: "q3b", label: "Fine, straight, early graying, or thinning", doshaType: "pitta", points: 1 },
      { id: "q3c", label: "Thick, lustrous, wavy, and abundant", doshaType: "kapha", points: 1 },
    ],
  },
  {
    id: "q4",
    category: "Appetite",
    question: "How would you describe your appetite?",
    options: [
      { id: "q4a", label: "Irregular — sometimes strong, sometimes forget to eat", doshaType: "vata", points: 1 },
      { id: "q4b", label: "Strong and sharp — I get irritable if I miss meals", doshaType: "pitta", points: 1 },
      { id: "q4c", label: "Steady but mild — I can skip meals without discomfort", doshaType: "kapha", points: 1 },
    ],
  },
  {
    id: "q5",
    category: "Digestion",
    question: "What is your typical digestion like?",
    options: [
      { id: "q5a", label: "Variable — gas, bloating, or irregular elimination", doshaType: "vata", points: 1 },
      { id: "q5b", label: "Strong and fast — may feel burning or intense hunger", doshaType: "pitta", points: 1 },
      { id: "q5c", label: "Slow and steady — feel heavy after large meals", doshaType: "kapha", points: 1 },
    ],
  },
  {
    id: "q6",
    category: "Sleep",
    question: "How do you typically sleep?",
    options: [
      { id: "q6a", label: "Light sleeper — easily disturbed, may wake at night", doshaType: "vata", points: 1 },
      { id: "q6b", label: "Sound but short — need less sleep, wake refreshed quickly", doshaType: "pitta", points: 1 },
      { id: "q6c", label: "Deep and long — hard to wake, love sleep", doshaType: "kapha", points: 1 },
    ],
  },
  {
    id: "q7",
    category: "Energy levels",
    question: "How would you describe your natural energy?",
    options: [
      { id: "q7a", label: "Quick bursts of energy followed by fatigue", doshaType: "vata", points: 1 },
      { id: "q7b", label: "Strong, focused, and intense", doshaType: "pitta", points: 1 },
      { id: "q7c", label: "Steady but slow to get started", doshaType: "kapha", points: 1 },
    ],
  },
  {
    id: "q8",
    category: "Body temperature",
    question: "How do you usually experience body temperature?",
    options: [
      { id: "q8a", label: "Often cold — hands and feet especially", doshaType: "vata", points: 1 },
      { id: "q8b", label: "Often warm or hot — prefer cooler spaces", doshaType: "pitta", points: 1 },
      { id: "q8c", label: "Comfortable and cool — take time to warm up", doshaType: "kapha", points: 1 },
    ],
  },
  {
    id: "q9",
    category: "Communication style",
    question: "Which communication style feels most natural?",
    options: [
      { id: "q9a", label: "Talkative, lively, jump between topics", doshaType: "vata", points: 1 },
      { id: "q9b", label: "Direct, precise, and persuasive", doshaType: "pitta", points: 1 },
      { id: "q9c", label: "Calm, thoughtful, and a good listener", doshaType: "kapha", points: 1 },
    ],
  },
  {
    id: "q10",
    category: "Decision-making style",
    question: "How do you usually make decisions?",
    options: [
      { id: "q10a", label: "Quickly, then often change my mind", doshaType: "vata", points: 1 },
      { id: "q10b", label: "Decisively and confidently once I have facts", doshaType: "pitta", points: 1 },
      { id: "q10c", label: "Slowly and carefully, sticking with choices", doshaType: "kapha", points: 1 },
    ],
  },
  {
    id: "q11",
    category: "Stress response",
    question: "When stressed, what tends to happen?",
    options: [
      { id: "q11a", label: "I become anxious, restless, or overwhelmed", doshaType: "vata", points: 1 },
      { id: "q11b", label: "I become irritable, critical, or intense", doshaType: "pitta", points: 1 },
      { id: "q11c", label: "I withdraw, feel stuck, or seek comfort", doshaType: "kapha", points: 1 },
    ],
  },
  {
    id: "q12",
    category: "Emotional tendencies",
    question: "Which emotional pattern feels most familiar?",
    options: [
      { id: "q12a", label: "Excitement and worry come and go quickly", doshaType: "vata", points: 1 },
      { id: "q12b", label: "Passion and frustration intensify easily", doshaType: "pitta", points: 1 },
      { id: "q12c", label: "Emotions are steady, deep, and lasting", doshaType: "kapha", points: 1 },
    ],
  },
  {
    id: "q13",
    category: "Movement speed",
    question: "How do you naturally move through your day?",
    options: [
      { id: "q13a", label: "Quickly, lightly, sometimes rushing", doshaType: "vata", points: 1 },
      { id: "q13b", label: "Purposefully, with intensity and drive", doshaType: "pitta", points: 1 },
      { id: "q13c", label: "Slowly, steadily, with ease and grace", doshaType: "kapha", points: 1 },
    ],
  },
  {
    id: "q14",
    category: "Routine preferences",
    question: "How do you relate to daily routines?",
    options: [
      { id: "q14a", label: "I prefer variety — routines feel confining", doshaType: "vata", points: 1 },
      { id: "q14b", label: "I like productive structure with clear goals", doshaType: "pitta", points: 1 },
      { id: "q14c", label: "I thrive with familiar, consistent routines", doshaType: "kapha", points: 1 },
    ],
  },
  {
    id: "q15",
    category: "Climate preferences",
    question: "Which climate feels best for your body?",
    options: [
      { id: "q15a", label: "Warm, humid, and cozy", doshaType: "vata", points: 1 },
      { id: "q15b", label: "Cool, breezy, and open", doshaType: "pitta", points: 1 },
      { id: "q15c", label: "Warm, dry, and stimulating", doshaType: "kapha", points: 1 },
    ],
  },
  {
    id: "q16",
    category: "Body frame",
    question: "How does your weight typically respond?",
    options: [
      { id: "q16a", label: "Hard to gain, easy to lose", doshaType: "vata", points: 1 },
      { id: "q16b", label: "Steady — gains and losses are moderate", doshaType: "pitta", points: 1 },
      { id: "q16c", label: "Easy to gain, harder to lose", doshaType: "kapha", points: 1 },
    ],
  },
  {
    id: "q17",
    category: "Energy levels",
    question: "How do you approach new projects?",
    options: [
      { id: "q17a", label: "Enthusiastic start, then lose momentum", doshaType: "vata", points: 1 },
      { id: "q17b", label: "Dive in hard and push to finish", doshaType: "pitta", points: 1 },
      { id: "q17c", label: "Slow start, then sustain with dedication", doshaType: "kapha", points: 1 },
    ],
  },
  {
    id: "q18",
    category: "Emotional tendencies",
    question: "Under social pressure, you tend to…",
    options: [
      { id: "q18a", label: "Overthink and feel unsettled", doshaType: "vata", points: 1 },
      { id: "q18b", label: "Debate, defend, or take charge", doshaType: "pitta", points: 1 },
      { id: "q18c", label: "Keep the peace and accommodate", doshaType: "kapha", points: 1 },
    ],
  },
  {
    id: "q19",
    category: "Sleep",
    question: "What disrupts your rest most easily?",
    options: [
      { id: "q19a", label: "Noise, change, or a busy mind", doshaType: "vata", points: 1 },
      { id: "q19b", label: "Heat, late eating, or unfinished tasks", doshaType: "pitta", points: 1 },
      { id: "q19c", label: "Very little — I sleep deeply almost anywhere", doshaType: "kapha", points: 1 },
    ],
  },
  {
    id: "q20",
    category: "Movement speed",
    question: "In yoga or exercise, you naturally prefer…",
    options: [
      { id: "q20a", label: "Creative flows and lots of variety", doshaType: "vata", points: 1 },
      { id: "q20b", label: "Challenging sequences with clear progress", doshaType: "pitta", points: 1 },
      { id: "q20c", label: "Familiar, grounding movement that feels safe", doshaType: "kapha", points: 1 },
    ],
  },
];
