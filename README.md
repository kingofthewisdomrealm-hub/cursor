# StayFlow — Modern Hotel & Airbnb Management Platform

StayFlow is a simplified Cloudbeds-style Property Management System (PMS) for hotels, hostels, vacation rentals, Airbnb operators, and property managers.

The **calendar is the center of the application** — rooms, reservations, occupancy, and revenue all orbit around stay dates.

## MVP Features

- **Authentication** — Sign up, login, password reset (demo local auth + optional Supabase)
- **Dashboard** — Occupancy, revenue, ADR, RevPAR, check-ins/outs
- **Property Management** — Hotels, hostels, Airbnb, apartments, vacation rentals
- **Room Management** — Capacity, rates, status cards
- **Reservation Management** — Guest, stay, financials, notes, status workflow
- **Calendar View** — Month / week / day / room timeline with drag-drop & resize
- **Revenue Dashboard** — Totals, deposits, outstanding balances, trends (Recharts)

## Tech Stack

- Next.js 15 · React 19 · TypeScript · Tailwind CSS 4
- Supabase (PostgreSQL + Auth) — optional
- FullCalendar · Recharts · Lucide icons

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo login

```
Email:    demo@stayflow.app
Password: demo1234
```

Other seeded roles: `manager@stayflow.app`, `front@stayflow.app`, `housekeeping@stayflow.app` (same password).

Demo mode stores data in `localStorage` and works without API keys.

### Optional: Supabase + OpenAI

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-your-openai-key
```

Run `supabase/migrations/001_stayflow.sql` in the Supabase SQL editor to provision the schema.

## Scripts

```bash
npm run dev
npm run build
npm start
npm run lint
```

## Out of scope (v1)

Airbnb / Booking.com integrations, channel manager, dynamic pricing, and payment processing are intentionally deferred.
