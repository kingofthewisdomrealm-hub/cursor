export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function daysSince(dateStr) {
  if (!dateStr) return null;
  const then = new Date(dateStr + 'T12:00:00');
  const now = new Date();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

export function formatDaysAgo(dateStr) {
  const days = daysSince(dateStr);
  if (days == null) return 'Never';
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

export function getRelationshipCounts(contacts) {
  const counts = { mentor: 0, friend: 0, client: 0, romantic: 0, collaborator: 0 };
  contacts.forEach((c) => {
    (c.tags || []).forEach((tag) => {
      if (counts[tag] != null) counts[tag]++;
    });
  });
  return counts;
}

export function getDormantContacts(contacts, thresholdDays = 14) {
  return contacts.filter((c) => {
    const days = daysSince(c.lastInteraction);
    return days != null && days >= thresholdDays;
  });
}

const RADAR_PROFILES = {
  toastmasters: {
    mentors: { names: ['John', 'Sarah', 'David'], reason: 'They own businesses and lead teams.' },
    friends: { names: ['Mike', 'Carlos', 'Priya'], reason: 'Similar interests in personal growth and communication.' },
    clients: { names: ['Rebecca', 'James'], reason: 'Needs public speaking help or presentation coaching.' },
  },
  networking: {
    mentors: { names: ['Elena', 'Marcus', 'Dr. Kim'], reason: 'Senior leaders open to sharing experience.' },
    friends: { names: ['Alex', 'Jordan', 'Sam'], reason: 'Peers in your industry building community.' },
    clients: { names: ['Taylor', 'Morgan'], reason: 'Potential buyers for your skills or services.' },
  },
  conference: {
    mentors: { names: ['Dr. Patel', 'Lisa Chen', 'Robert'], reason: 'Speakers and panelists with deep expertise.' },
    friends: { names: ['Nina', 'Chris', 'Dev'], reason: 'Attendees with shared professional interests.' },
    clients: { names: ['Amanda', 'Victor'], reason: 'Decision-makers exploring solutions you offer.' },
  },
  gym: {
    mentors: { names: ['Coach Ray', 'Diana'], reason: 'Fitness professionals with business experience.' },
    friends: { names: ['Tyler', 'Jess', 'Omar'], reason: 'Regulars with compatible schedules and energy.' },
    clients: { names: [], reason: '' },
  },
  coffee: {
    mentors: { names: ['Frank', 'Helen'], reason: 'Entrepreneurs who work from cafés.' },
    friends: { names: ['Jamie', 'Riley', 'Casey'], reason: 'Creative types and remote workers nearby.' },
    clients: { names: ['Morgan'], reason: 'Freelancers who might need your services.' },
  },
  party: {
    mentors: { names: ['Richard', 'Susan'], reason: 'Well-connected hosts and community leaders.' },
    friends: { names: ['Dani', 'Leo', 'Zoe', 'Kai'], reason: 'Social energy matches yours — easy rapport.' },
    clients: { names: [], reason: '' },
    romantic: { names: ['Emma', 'Lucas'], reason: 'Shared values and mutual attraction potential.' },
  },
  default: {
    mentors: { names: ['Alex', 'Jordan'], reason: 'People ahead of you on a path you admire.' },
    friends: { names: ['Sam', 'Taylor', 'Morgan'], reason: 'Compatible interests and conversational chemistry.' },
    clients: { names: ['Casey'], reason: 'Someone with a problem you can solve.' },
  },
};

function detectContextProfile(context) {
  const lower = context.toLowerCase();
  if (/toastmaster|public speak|speech/.test(lower)) return 'toastmasters';
  if (/network|mixer|meetup|professional/.test(lower)) return 'networking';
  if (/conference|summit|workshop|seminar/.test(lower)) return 'conference';
  if (/gym|fitness|workout|crossfit|yoga/.test(lower)) return 'gym';
  if (/coffee|café|cafe|cowork/.test(lower)) return 'coffee';
  if (/party|wedding|social|bar|dinner/.test(lower)) return 'party';
  return 'default';
}

export function generateOpportunityRadar(context) {
  const profile = RADAR_PROFILES[detectContextProfile(context)];
  const result = { context, generatedAt: new Date().toISOString(), categories: [] };

  const categoryDefs = [
    { key: 'mentors', label: 'Potential Mentors', icon: '🏛' },
    { key: 'friends', label: 'Potential Friends', icon: '🤝' },
    { key: 'clients', label: 'Potential Clients', icon: '💼' },
    { key: 'romantic', label: 'Potential Romantic', icon: '❤️' },
  ];

  categoryDefs.forEach(({ key, label, icon }) => {
    const data = profile[key];
    if (data && data.names.length > 0) {
      result.categories.push({
        key,
        label,
        icon,
        people: data.names.map((name) => ({ name })),
        reason: data.reason,
      });
    }
  });

  return result;
}

export function generateConversationMission(contactName, context = '') {
  const objectives = [
    { key: 'profession', label: 'Their profession', done: false },
    { key: 'goal', label: 'Their biggest goal', done: false },
    { key: 'challenge', label: 'Their biggest challenge', done: false },
  ];

  const openers = [
    `Hi ${contactName}, I noticed we share an interest in growth. What do you do professionally?`,
    `Great to meet you, ${contactName}! What's the biggest goal you're working toward right now?`,
    `${contactName}, I'm curious — what's the toughest challenge you're facing in your work or life?`,
  ];

  return {
    id: `${Date.now()}-mission`,
    contactName,
    context,
    objectives,
    openers,
    xpReward: 25,
    createdAt: new Date().toISOString(),
  };
}

export function getSuggestedNextAction(contact) {
  if (contact.nextAction?.trim()) return contact.nextAction;

  const days = daysSince(contact.lastInteraction);
  const tag = (contact.tags || [])[0];

  if (days != null && days >= 14) {
    return `Reconnect — it's been ${days} days since you last talked.`;
  }

  const actions = {
    mentor: 'Ask for advice on a specific challenge.',
    friend: 'Invite to an activity you both enjoy.',
    client: 'Follow up on how you can help them.',
    romantic: 'Suggest a low-pressure coffee or walk.',
    collaborator: 'Propose a small joint project or brainstorm.',
  };

  return actions[tag] || 'Send a thoughtful check-in message.';
}

export function getConnectionScore(dailyLogs, contacts) {
  const recentLogs = dailyLogs.slice(-7);
  const totals = recentLogs.reduce(
    (acc, log) => ({
      conversationsStarted: acc.conversationsStarted + (log.conversationsStarted || 0),
      contactsCollected: acc.contactsCollected + (log.contactsCollected || 0),
      followUpsSent: acc.followUpsSent + (log.followUpsSent || 0),
      eventsAttended: acc.eventsAttended + (log.eventsAttended || 0),
    }),
    { conversationsStarted: 0, contactsCollected: 0, followUpsSent: 0, eventsAttended: 0 }
  );

  const dormant = getDormantContacts(contacts, 14).length;
  const totalContacts = contacts.length;

  const courage = Math.min(100, totals.conversationsStarted * 15 + totals.eventsAttended * 10);
  const initiation = Math.min(100, totals.contactsCollected * 20 + totals.conversationsStarted * 10);
  const followUp = Math.min(100, totals.followUpsSent * 25);
  const maintenance = totalContacts === 0
    ? 0
    : Math.max(0, 100 - dormant * (100 / Math.max(totalContacts, 1)) * 1.5);

  const total = Math.round(
    courage * 0.25 + initiation * 0.25 + followUp * 0.25 + maintenance * 0.25
  );

  const strengths = [];
  const weaknesses = [];

  const factors = [
    { key: 'courage', label: 'Courage', score: courage },
    { key: 'initiation', label: 'Initiation', score: initiation },
    { key: 'followUp', label: 'Follow-up', score: followUp },
    { key: 'maintenance', label: 'Relationship maintenance', score: maintenance },
  ];

  factors.sort((a, b) => b.score - a.score);
  factors.slice(0, 2).forEach((f) => {
    if (f.score >= 50) strengths.push(f.label);
  });
  factors.slice(-2).forEach((f) => {
    if (f.score < 60) weaknesses.push(f.label);
  });

  if (strengths.length === 0) strengths.push('Getting started');
  if (weaknesses.length === 0 && total < 90) weaknesses.push('Consistency');

  let recommendedMission = 'Start one conversation today at your next event.';
  if (dormant >= 3) {
    recommendedMission = `Reconnect with ${Math.min(dormant, 3)} dormant contacts.`;
  } else if (totals.followUpsSent < 2) {
    recommendedMission = 'Send 3 follow-up messages to people you met recently.';
  } else if (totals.eventsAttended < 1) {
    recommendedMission = 'Attend one event this week and start 2 conversations.';
  }

  return {
    total: Math.min(100, total),
    factors: {
      courage: Math.round(courage),
      initiation: Math.round(initiation),
      followUp: Math.round(followUp),
      maintenance: Math.round(maintenance),
    },
    strengths,
    weaknesses,
    recommendedMission,
    dormantCount: dormant,
  };
}

const COACH_RESPONSES = [
  {
    patterns: [/what should i say|opening line|start.*conversation|approach/i],
    response: (ctx) => `**Opening move for ${ctx.name || 'them'}:**

1. Smile and make eye contact — confidence before words.
2. Use context: "First time at [event]?" or "How do you know [host]?"
3. Listen more than you talk in the first 60 seconds.

**Sample opener:**
"Hey, I'm [your name]. I noticed you [specific observation]. What brought you here tonight?"`,
  },
  {
    patterns: [/what questions|questions should i ask|ask them/i],
    response: () => `**High-value questions (pick 2–3):**

- "What are you working on that excites you right now?"
- "What's the hardest part of that?"
- "How did you get into [their field]?"
- "If you could solve one problem this year, what would it be?"
- "Who's been most helpful on your journey?"

**Pro tip:** Follow their energy. If they light up on a topic, go deeper there.`,
  },
  {
    patterns: [/deepen rapport|build rapport|connect deeper|connection/i],
    response: () => `**Rapport accelerators:**

1. **Mirror** — Match their pace and energy (not mimicry).
2. **Validate** — "That makes sense" or "I can see why that's important."
3. **Share briefly** — One vulnerable or honest detail from your life.
4. **Find overlap** — Shared interests, values, or struggles.
5. **Be present** — Put the phone away. Use their name once.

Rapport isn't performance — it's genuine curiosity.`,
  },
  {
    patterns: [/follow up|follow-up|after.*conversation|next step/i],
    response: (ctx) => `**Follow-up framework for ${ctx.name || 'your new contact'}:**

**Within 24 hours:**
"Great meeting you at [event]! I enjoyed our chat about [specific topic]. Would love to continue the conversation."

**Within 1 week (if no reply):**
One value-add message — share an article, intro, or resource related to what they mentioned.

**Long-term:**
- Mentors: Ask for specific advice, not generic "pick your brain."
- Friends: Invite to something low-stakes.
- Clients: Offer a clear next step to help with their challenge.

**Rule:** Reference something *they* said. Generic messages get ignored.`,
  },
  {
    patterns: [/nervous|anxious|scared|introvert|shy/i],
    response: () => `**Reframe the nerves:**

You're not trying to impress everyone — you're looking for *one* good conversation.

**Micro-goals:**
- Goal 1: Say hello to one person.
- Goal 2: Ask one question and listen fully.
- Goal 3: Exchange one piece of contact info.

**Breath:** 4 seconds in, 6 seconds out before you approach.

Courage is a skill. Every conversation is a rep. +10 Warrior XP awaits.`,
  },
];

export function getCoachResponse(question, context = {}) {
  for (const entry of COACH_RESPONSES) {
    if (entry.patterns.some((p) => p.test(question))) {
      return entry.response(context);
    }
  }

  return `**Zoom-Fu Coach:**

Great question. Here's a general framework:

1. **Clarify your intent** — Mentor? Friend? Client? Know before you approach.
2. **Lead with curiosity** — People love talking about what matters to them.
3. **Close with clarity** — "I'd love to stay in touch — what's the best way to reach you?"

Try asking me:
- "What should I say?"
- "What questions should I ask?"
- "How do I deepen rapport?"
- "How do I follow up?"`;
}

export function getInitials(name) {
  return (name || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function renderMarkdownLite(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^(.+)$/s, '<p>$1</p>');
}
