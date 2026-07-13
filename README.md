# ClaimPilot AI

Public adjusting and supplement platform for public adjusters, roofing contractors, restoration companies, and supplement specialists.

Manage insurance claims from first notice of loss through final settlement while identifying missed scope items and generating supplement packages.

## Features

### Core Dashboard
- Kanban pipeline: New Loss → Inspection Scheduled → Inspection Complete → Estimate Received → Supplementing → Negotiation → Settlement → Closed
- Claim cards with homeowner info, property address, carrier, claim number, date of loss, values, status, and assigned team member
- Pipeline and list views with fast search

### Claim File Management
- Upload carrier estimates, contractor estimates, PA estimates, photos, videos, engineer reports, weather reports, invoices, receipts, and correspondence
- Files automatically organized by claim and category

### AI Supplement Engine
- Analyzes carrier vs. contractor estimates and claim notes
- Identifies missing line items with confidence scores
- Flags code-related items, roofing, water mitigation, and interior restoration gaps
- Examples: starter strip, drip edge, ice barrier, valley metal, flashing, permit fees, dumpster, detach/reset, paint matching

### Supplement Opportunity Center
- Review AI recommendations with reasons, supporting docs, estimated value, and confidence
- Approve or reject each opportunity

### AI Supplement Package Builder
- One-click generation of cover letter, scope summary, missing item report, documentation list, photo references, and code compliance references
- Export to PDF via print dialog

### Damage Analysis
- AI categorizes damage: roof, interior, exterior, water, wind, hail, fire
- Auto-groups photos and suggests additional documentation

### Weather Intelligence
- Interactive storm event map with hail, wind, tornado, and severe weather reports
- Storm verification data linked to claim addresses

### Negotiation Center
- Track initial offers, supplements submitted, additional payments, total recovered, and outstanding amounts
- Visual claim value growth chart

### Settlement Predictor
- Likely settlement range, expected supplement approval percentage, and potential final claim value
- Visual range indicators per claim

## Tech Stack

- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS 4** — professional insurance software aesthetic with dark/light mode
- **Supabase** — optional backend (demo uses localStorage)
- **OpenAI API** — optional AI analysis (demo uses intelligent fallback)

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo Mode

Works without API keys. Claims and data are stored in browser localStorage with realistic seed data.

### Full Setup

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=sk-your-openai-key
```

## Build

```bash
npm run build
npm start
```
