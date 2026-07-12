export function parseTechniqueCard(text: string): { name: string; instruction: string } {
  const dash = text.indexOf(' — ');
  if (dash !== -1) {
    return {
      name: text.slice(0, dash).trim(),
      instruction: text.slice(dash + 3).trim(),
    };
  }
  return { name: text, instruction: text };
}

export async function generateTechniqueBridge(
  observation: string,
  _techniqueId: string,
  techniqueText: string,
): Promise<string> {
  const { name, instruction } = parseTechniqueCard(techniqueText);
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;

  if (apiKey) {
    try {
      return await callOpenAI(observation, name, instruction, apiKey);
    } catch {
      return generateFromInstruction(observation, name, instruction);
    }
  }

  return generateFromInstruction(observation, name, instruction);
}

async function callOpenAI(
  observation: string,
  techniqueName: string,
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
      temperature: 0.95,
      max_tokens: 150,
      messages: [
        {
          role: 'system',
          content:
            'You are a stand-up comedy writer. The technique card tells you exactly what to do. Write ONLY the resulting comedy line — no quotes, labels, or explanation. One or two sentences max. Be funny and specific.',
        },
        {
          role: 'user',
          content: `OBSERVATION (the setup):\n"${observation}"\n\nTECHNIQUE CARD:\n"${techniqueName} — ${techniqueInstruction}"\n\nWrite the comedy line that does EXACTLY what this technique card says. Apply "${techniqueInstruction}" to the observation. This is the middle of a joke — do NOT write the punchline.`,
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

function lowerFirst(text: string): string {
  const trimmed = text.replace(/\.$/, '');
  return trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
}

function generateFromInstruction(
  observation: string,
  techniqueName: string,
  instruction: string,
): string {
  const lower = instruction.toLowerCase();
  const nameLower = techniqueName.toLowerCase();
  const obs = lowerFirst(observation);

  if (lower.includes('flip') || lower.includes('expectation') || nameLower.includes('misdirection')) {
    return `You'd think ${obs} — but plot twist:`;
  }

  if (lower.includes('eleven') || lower.includes('crank') || nameLower.includes('exaggeration')) {
    return `And I'm not exaggerating when I say ${obs} — it's actually worse. Like, catastrophically worse.`;
  }

  if (lower.includes('earlier') || lower.includes('callback') || nameLower.includes('callback')) {
    return `Which reminds me — ${obs} Same energy, different day.`;
  }

  if (lower.includes('third') || lower.includes('rule of three') || nameLower.includes('rule of three')) {
    return `${observation.replace(/\.$/, '')}. First time, awkward. Second time, concerning. Third time, my entire personality.`;
  }

  if (lower.includes('yourself') || lower.includes('punchline before') || nameLower.includes('self-deprecation')) {
    return `Look, I'm not saying ${obs} — but I'm definitely the type of person it happens to.`;
  }

  if (lower.includes('grocery') || lower.includes('mundane') || lower.includes('deadpan') || nameLower.includes('deadpan')) {
    return `${observation.replace(/\.$/, '')}. Anyway, moving on.`;
  }

  if (lower.includes('reference') || lower.includes('call back')) {
    return `Speaking of which — ${obs} — yeah, that tracks for me.`;
  }

  if (lower.includes('absurd')) {
    return `So naturally, ${obs} and somehow that's the NORMAL part of my week.`;
  }

  if (lower.includes('contrast') || lower.includes('compare')) {
    return `On one hand, ${obs} On the other hand, I paid money to experience this.`;
  }

  // Generic: literally apply whatever the card instruction says
  const action = instruction.replace(/\.$/, '').toLowerCase();
  return `${obs.charAt(0).toUpperCase() + obs.slice(1)} — so I ${action}, and honestly? Nailed it.`;
}
