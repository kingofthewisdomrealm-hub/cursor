# Zoom-Fu — Human Connection Operating System

> **Core question:** "What should I do next to build the life I want through people?"

A web app MVP for intentional relationship-building — scan opportunities in real-world contexts, run conversation missions, classify contacts, maintain a relationship CRM, get AI coaching, and track your Human Connection Score.

## Screens

### 1. Dashboard
- **Current Stats** — King, Warrior, Lover, Magician archetype levels
- **Relationship Assets** — Mentors, Friends, Clients, Romantic counts
- **Today's XP** — Points earned from missions and activities
- Quick links to Radar, Mission, Coach, and Connection Score

### 2. Opportunity Radar
Enter where you are (e.g. *"I am at a Toastmasters meeting."*) and get AI-targeted suggestions:
- Potential Mentors, Friends, Clients (and Romantic at social events)
- Names to talk to with reasons
- One-click to start a Conversation Mission

### 3. Conversation Mission
Before approaching someone, get a structured mission:
- **Learn:** profession, biggest goal, biggest challenge
- **Reward:** +25 XP on completion
- Suggested openers and checkable objectives

### 4. Sifting Board
After a conversation, drag people into categories:
- Mentor · Friend · Client · Romantic · Collaborator · Not a Fit
- Notes saved to your relationship database

### 5. Relationship CRM
For each person:
- Photo/avatar, name, tags
- Last interaction, suggested next action
- Edit, delete, and launch new missions

### 6. Zoom-Fu AI Coach
Chat-style coach for:
- "What should I say?"
- "What questions should I ask?"
- "How do I deepen rapport?"
- "How do I follow up?"

### Killer Feature: Human Connection Score
Daily input:
- Conversations started
- Contacts collected
- Follow-ups sent
- Events attended

Output:
- **Zoom-Fu Score** (0–100)
- Strengths and weaknesses (Courage, Initiation, Follow-up, Maintenance)
- Recommended mission (e.g. reconnect with dormant contacts)

## Run locally

```bash
python3 -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

Data persists in browser `localStorage`. No build step or external dependencies.

## Tech stack

- HTML5, CSS3, JavaScript (ES modules)
- Context-aware heuristics for Radar and Coach (MVP — plug in OpenAI/ChatGPT API for production)
- Responsive layout with sidebar navigation

## Sample data

The app ships with seed contacts (Sarah, John, Mike, Rebecca) and archetype stats matching the MVP spec so you can explore immediately.
