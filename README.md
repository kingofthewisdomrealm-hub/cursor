# Voice Agent MVP

Browser-based speech-to-speech voice agent built with **Next.js**, the **OpenAI Agents SDK** (`RealtimeAgent` + `RealtimeSession`), and the **OpenAI Realtime API over WebRTC**.

Press **Start Conversation**, allow the microphone, and talk naturally with your agent. Interrupt anytime. End when you are done.

## What you get

- Communication Coach default agent (editable personality)
- Start / Mute / Unmute / End controls
- Live status: Ready, Connecting, Listening, Thinking, Speaking, Disconnected, Error
- Live scrolling transcript (User / Agent)
- Admin settings saved in `localStorage`:
  - Agent name
  - Description
  - Instructions
  - Opening greeting
  - Voice
  - Speaking speed
  - Maximum response length
- Secure `/api/session` endpoint that mints a short-lived Realtime client secret
- Permanent `OPENAI_API_KEY` never sent to the browser

## Requirements

- Node.js 18+
- An OpenAI API key with Realtime API access
- A modern browser with microphone + WebRTC support (Chrome, Safari, Edge)
- `localhost` or HTTPS (required for microphone permissions)

## Install

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local`:

```env
OPENAI_API_KEY=sk-your-openai-api-key
```

## Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

1. Optionally open the settings gear and adjust the agent.
2. Press **Start Conversation**.
3. Allow microphone access when prompted.
4. Speak naturally. Interrupt the agent by talking over it.
5. Press **End Conversation** when finished.

## How it works

1. The browser calls `POST /api/session`.
2. The Next.js route uses your server-side `OPENAI_API_KEY` to request an ephemeral client secret from `https://api.openai.com/v1/realtime/client_secrets`.
3. The browser creates a `RealtimeAgent` + `RealtimeSession` and connects with that ephemeral key over WebRTC.
4. The SDK handles microphone capture, playback, interruptions, and turn-taking.
5. Transcripts update from Realtime history / transcription events.

## Default agent

**Name:** Communication Coach

**Opening greeting:**  
“Welcome. What communication skill would you like to practice today?”

**Personality:** Direct, intelligent, energetic. Short responses. One question at a time. Brief feedback, then a stronger retry.

## Error messages to expect

| Situation | What you will see |
| --- | --- |
| Missing `OPENAI_API_KEY` | Clear server error from `/api/session` |
| Mic permission denied | Instruction to allow microphone access and retry |
| No microphone found | Prompt to connect/enable a mic |
| Mic already in use | Prompt to close the other app |
| OpenAI API failure | The API error message, without exposing your permanent key |

## Scripts

```bash
npm run dev      # local development
npm run build    # production build
npm run start    # serve production build
npm run lint     # eslint
```

## MVP limits

Intentionally not included:

- Twilio / phone numbers
- User accounts
- Payments
- Database
- CRM / calendar integrations
- Outbound calls
- Multi-user analytics

Validate whether the coach is useful to talk to first. Then add specialized agents, accounts, and telephone access later.
