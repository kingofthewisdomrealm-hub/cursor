# Outcome Agent

Transform vague outcomes into executable missions. Outcome Agent is your AI project manager — it converts goals like "fill my seminar with 30 people" into practical execution plans with daily tasks, progress tracking, and adaptive strategy.

## Features

- **Outcome Input** — Describe what you want to achieve in plain language
- **Mission Clarification** — AI asks only the essential questions (3–5 max)
- **Mission Plan Generation** — Structured plan with stages, tasks, and next best action
- **Mission Dashboard** — Progress bar, current stage, deadline, and active tasks
- **Task Execution** — Approve, edit, complete, or skip tasks with suggested content
- **Daily Agent Briefing** — Today's priorities and agent recommendations
- **Learning Loop** — Submit results; agent adapts strategy based on conversion data

## Tech Stack

- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS 4** — dark mission-control UI
- **Supabase** — authentication and database (optional)
- **OpenAI API** — mission planning and task generation (optional)

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo Mode

The app works without API keys. Without OpenAI configured, it uses intelligent demo plans. Without Supabase, missions are stored in browser localStorage.

### Full Setup

1. Create a [Supabase](https://supabase.com) project
2. Run the migration in `supabase/migrations/001_initial.sql`
3. Add your Supabase URL and anon key to `.env.local`
4. Add your OpenAI API key to `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=sk-your-openai-key
```

## User Flow

1. **Enter Outcome** — "Help me fill The Sifting Method seminar with 30 people."
2. **Clarify Mission** — Answer deadline, format, audience questions
3. **Generate Plan** — Review stages, tasks, and next best action
4. **Mission Dashboard** — Track progress and current stage
5. **Execute Tasks** — Approve outreach, edit messages, mark complete
6. **Daily Briefing** — See today's priorities and agent recommendations
7. **Learning Loop** — Report results; agent updates strategy

## Database Tables

- `users` — user profiles (extends Supabase auth)
- `missions` — mission goals and metadata
- `mission_questions` — clarification Q&A
- `mission_stages` — execution stages
- `tasks` — actionable tasks with status
- `task_results` — learning loop data
- `agent_recommendations` — strategy and briefing updates

## Agent Capabilities (V1)

- Research strategies
- Break outcomes into tasks
- Generate outreach messages
- Create social posts
- Create prospect lists
- Recommend next actions
- Track progress
- Adapt plans based on results

**Safety:** The agent never automatically spends money, sends messages, or accesses financial accounts. External actions require user approval.

## Build

```bash
npm run build
npm start
```
