# AI App Integrations

Outcome Agent can delegate mission tasks to connected AI apps. Each app has specific capabilities and may require user approval before external actions.

## Built-in Apps

| App | Capabilities |
|-----|-------------|
| OpenAI Mission Worker | General execution, research, outreach, social, prospects |
| Research Scout | Research, strategy, prospect lists |
| Outreach Composer | Outreach messages and emails |
| Prospect Mapper | Prospect lists and research |
| Social Pulse | Social posts and announcements |
| Custom Webhook | Connect any external AI via HTTP |

## Webhook Payload

When a task is delegated to a Custom Webhook app, Outcome Agent POSTs:

```json
{
  "event": "task.execute",
  "mission_id": "uuid",
  "task_id": "uuid",
  "capability": "outreach_writing",
  "mission_title": "Fill seminar with 30 people",
  "outcome": "Help me fill my seminar...",
  "task": {
    "title": "Contact five Toastmasters clubs",
    "description": "...",
    "instructions": "...",
    "expected_result": "..."
  },
  "context": {}
}
```

### Expected Response

```json
{
  "output": "Your completed work product as markdown or text",
  "summary": "Optional short summary"
}
```

## Security

- External actions (outreach, publishing) always require user approval
- API keys are stored in browser localStorage (demo) or Supabase (production)
- The agent never auto-sends messages or spends money

## Adding a Custom AI App

1. Go to **AI Apps** in the nav
2. Connect **Custom AI App (Webhook)**
3. Enter your endpoint URL and optional API key
4. On any task, tap **Run with AI App**

Compatible with Zapier, Make, n8n, or any API that accepts JSON POST requests.
