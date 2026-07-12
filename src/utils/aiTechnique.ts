const TECHNIQUE_PROMPTS: Record<string, string> = {
  'tech-misdirection': 'Use misdirection: set up one expectation, then subtly flip it.',
  'tech-exaggeration': 'Use exaggeration: take the truth and crank it to eleven.',
  'tech-callback': 'Use a callback: reference the observation in a surprising way.',
  'tech-rule-of-three': 'Use the rule of three: two normal beats, then an absurd third.',
  'tech-self-deprecation': 'Use self-deprecation: make yourself the punchline before they can.',
  'tech-deadpan': 'Use deadpan delivery: state something wild like it is mundane.',
};

function getTechniqueInstruction(techniqueId: string, techniqueText: string): string {
  return TECHNIQUE_PROMPTS[techniqueId] ?? techniqueText;
}

export async function generateTechniqueBridge(
  observation: string,
  techniqueId: string,
  techniqueText: string,
): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
  const instruction = getTechniqueInstruction(techniqueId, techniqueText);

  if (apiKey) {
    try {
      return await callOpenAI(observation, instruction, apiKey);
    } catch {
      return generateLocalBridge(observation, techniqueId, instruction);
    }
  }

  return generateLocalBridge(observation, techniqueId, instruction);
}

async function callOpenAI(
  observation: string,
  techniqueInstruction: string,
  apiKey: string,
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.9,
      max_tokens: 120,
      messages: [
        {
          role: 'system',
          content:
            'You are a stand-up comedy writing coach. Write short, punchy comedy bridges. Output only the bridge line — no quotes, labels, or explanation. Keep it to 1-2 sentences max.',
        },
        {
          role: 'user',
          content: `Observation: "${observation}"\n\nTechnique: ${techniqueInstruction}\n\nWrite a funny bridge that applies this technique to the observation. This connects the setup to a punchline — do NOT write the punchline.`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = (await response.json()) as {
    choices: { message: { content: string } }[];
  };

  const text = data.choices[0]?.message?.content?.trim();
  if (!text) throw new Error('Empty AI response');
  return text.replace(/^["']|["']$/g, '');
}

const LOCAL_BRIDGES: Record<string, (obs: string) => string> = {
  'tech-misdirection': (obs) =>
    `You'd think ${lowerFirst(obs)} — but plot twist:`,
  'tech-exaggeration': (obs) =>
    `And I'm not exaggerating when I say ${lowerFirst(obs)} — it's actually worse.`,
  'tech-callback': (obs) =>
    `Which reminds me — ${lowerFirst(obs)} Same energy, different day.`,
  'tech-rule-of-three': (obs) =>
    `${obs} First time, awkward. Second time, concerning. Third time, my entire personality.`,
  'tech-self-deprecation': (obs) =>
    `Look, I'm not saying ${lowerFirst(obs)} — but I'm definitely the type of person it happens to.`,
  'tech-deadpan': (obs) =>
    `${obs} Anyway, moving on.`,
};

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function generateLocalBridge(
  observation: string,
  techniqueId: string,
  instruction: string,
): string {
  const generator = LOCAL_BRIDGES[techniqueId];
  if (generator) return generator(observation);

  const topic = observation.split(' ').slice(0, 4).join(' ');
  return `So using ${instruction.split(':')[0].toLowerCase()} on "${topic}..." — here's where it gets interesting.`;
}
