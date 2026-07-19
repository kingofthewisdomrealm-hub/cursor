# Cloud Agent Fleet

Inventory of Cursor Cloud agents for `kingofthewisdomrealm-hub/cursor`, organized for cleanup and follow-up.

Generated from live agent metadata (18 agents). Refresh by re-running a fleet organizer agent with the Cursor Cloud MCP (`list-cloud-agents`, `batch-fetch-details`).

## Snapshot

| Category | Count |
|----------|------:|
| Running | 1 |
| Idle | 17 |
| Merged PRs | 5 |
| Open PRs | 7 |
| Draft PRs | 7 |
| Duplicate topic (Communication Survival) | 2 |

## Active / running

| Agent | Status | Branch | PR | Next action |
|-------|--------|--------|----|-------------|
| [Development environment setup](https://cursor.com/agents/bc-1ed36dc6-9e11-4229-b65a-22b23b8d8b9a) | RUNNING | `cursor/setup-dev-environment-8b9a` | [#22](https://github.com/kingofthewisdomrealm-hub/cursor/pull/22) draft (1 file, +20) | Finish setup PR, then merge |

## Merged (candidates to archive)

| Agent | Branch | PR | Next action |
|-------|--------|----|-------------|
| [Communication survival game](https://cursor.com/agents/bc-019f77c4-1ffd-740c-b3e1-915917883675) | `cursor/communication-survival-3675` | [#20](https://github.com/kingofthewisdomrealm-hub/cursor/pull/20) merged | Archive agent |
| [Dosha yoga app MVP](https://cursor.com/agents/bc-019f631e-f74f-7d9a-a89d-93d60efd5c3f) | `cursor/dosha-yoga-mvp-5c3f` | [#18](https://github.com/kingofthewisdomrealm-hub/cursor/pull/18) merged | Archive agent |
| [ClaimPilot AI platform](https://cursor.com/agents/bc-019f5c81-7397-71dd-8f52-b10983dc1cd3) | `cursor/claimpilot-ai-platform-1cd3` | [#14](https://github.com/kingofthewisdomrealm-hub/cursor/pull/14) merged | Archive agent |
| [Florida storm map](https://cursor.com/agents/bc-019f5bce-f4c2-7ca9-938b-ec90cd13f8f2) | `cursor/florida-storm-map-f8f2` | [#11](https://github.com/kingofthewisdomrealm-hub/cursor/pull/11) merged | Archive agent |
| [Communicator merge game](https://cursor.com/agents/bc-019f59ab-d77a-78c3-9001-57163e8b960d) | `cursor/communicator-merge-game-960d` | [#9](https://github.com/kingofthewisdomrealm-hub/cursor/pull/9) merged | Archive agent |

## Open PRs (needs decision: merge / close / continue)

| Agent | Branch | PR | Diff | Next action |
|-------|--------|----|------|-------------|
| [Communication survival game](https://cursor.com/agents/bc-019f77c8-b100-7231-ba4f-7817e0870da7) | `cursor/communication-survival-0da7` | [#21](https://github.com/kingofthewisdomrealm-hub/cursor/pull/21) open | 45 files, +4252/−5196 | Continue if this is the active product; else close as superseded by merged #20 / main |
| [Storm opportunity agent](https://cursor.com/agents/bc-019f6322-408c-76e6-b4ca-0e2476371f3f) | `cursor/storm-opportunity-agent-1f3f` | [#19](https://github.com/kingofthewisdomrealm-hub/cursor/pull/19) open | 79 files, +3704/−3985 | Decide whether storm tooling is still wanted; likely conflicts with current MVP |
| [Intelligent conversation copilot](https://cursor.com/agents/bc-019f5bf1-3f78-7b04-a703-696e579a75c8) | `cursor/conversation-mri-mvp-75c8` | [#12](https://github.com/kingofthewisdomrealm-hub/cursor/pull/12) open | 39 files, +2161/−1826 | Close as superseded unless reviving conversation MRI |
| [Commerce architect game core](https://cursor.com/agents/bc-019f5bc1-8560-7335-a111-afb5a39f9342) | `cursor/commerce-architect-9342` | [#10](https://github.com/kingofthewisdomrealm-hub/cursor/pull/10) open | 50 files, +2657/−1841 | Close as superseded unless reviving commerce game |
| [Mapa de poder fiscal](https://cursor.com/agents/bc-019f587e-7bd0-7b9a-9ad4-3d7f1623269e) | `cursor/tax-power-mapper-269e` | [#8](https://github.com/kingofthewisdomrealm-hub/cursor/pull/8) open | 18 files, +7344/−572 | Close as superseded unless reviving tax mapper |
| [Card decision game](https://cursor.com/agents/bc-019f582e-8442-7a73-aa0a-279f7ed94a7c) | `cursor/situation-card-game-4a7c` | [#3](https://github.com/kingofthewisdomrealm-hub/cursor/pull/3) open | 23 files, +4009/−2 | Close as superseded unless reviving card game |

## Draft / unfinished work (sorted by files changed)

| Agent | Branch | PR | Diff | Next action |
|-------|--------|----|------|-------------|
| [Outcome agent app](https://cursor.com/agents/bc-019f5c2b-8a25-7c22-ab5e-51b5194d0cbc) | `cursor/outcome-agent-0cbc` | [#15](https://github.com/kingofthewisdomrealm-hub/cursor/pull/15) draft | 82 files, +10385/−3018 | Highest unfinished surface area — continue only if Outcome Agent is next product |
| [StayFlow application core](https://cursor.com/agents/bc-019f5d06-ae3b-7aab-91c3-8ee9386f9de7) | `cursor/stayflow-pms-mvp-9de7` | [#16](https://github.com/kingofthewisdomrealm-hub/cursor/pull/16) draft | 64 files, +5864/−3967 | Continue only if StayFlow PMS is prioritized |
| [Browser voice agent mvp](https://cursor.com/agents/bc-019f60b3-14c4-7062-95fd-3615218a1ba6) | `cursor/voice-agent-mvp-1ba6` | [#17](https://github.com/kingofthewisdomrealm-hub/cursor/pull/17) draft | 53 files, +2877/−4431 | Continue only if voice agent is prioritized |
| [Kill Tony Builder game](https://cursor.com/agents/bc-019f588b-c0a6-7ace-8ecd-83e0f883a1c4) | `cursor/kill-tony-builder-a1c4` | [#5](https://github.com/kingofthewisdomrealm-hub/cursor/pull/5) draft | 31 files, +4350/−724 | Close as superseded unless reviving |
| [Zoom-Fu operating system](https://cursor.com/agents/bc-019f58a8-5253-7852-9da9-f576530eed80) | `cursor/zoom-fu-mvp-ed80` | [#6](https://github.com/kingofthewisdomrealm-hub/cursor/pull/6) draft | 6 files, +1769/−1626 | Close as superseded unless reviving |
| [Human flow simulator](https://cursor.com/agents/bc-019f591f-2d02-7d43-bd9c-c01a3a439108) | `cursor/human-flow-simulator-9108` | [#7](https://github.com/kingofthewisdomrealm-hub/cursor/pull/7) draft | 6 files, +1416 | Close as superseded unless reviving |
| [Development environment setup](https://cursor.com/agents/bc-1ed36dc6-9e11-4229-b65a-22b23b8d8b9a) | `cursor/setup-dev-environment-8b9a` | [#22](https://github.com/kingofthewisdomrealm-hub/cursor/pull/22) draft | 1 file, +20 | Merge after review (small, additive) |

## Duplicates / superseded runs

- **Communication Survival** has two agents: merged [#20](https://github.com/kingofthewisdomrealm-hub/cursor/pull/20) (`…3675`) and open [#21](https://github.com/kingofthewisdomrealm-hub/cursor/pull/21) (`…0da7`). Prefer one active line of work; archive the merged agent and either continue or close #21.
- This repository historically replaces the product MVP on `main` (ClaimPilot → Dosha Yoga → Communication Survival, etc.). Older open/draft PRs that rewrite the whole app will conflict heavily with current `main` and are usually “close as superseded” rather than merge.

## Recommended cleanup order

1. **Archive** the five merged agents above (no more work needed).
2. **Merge or finish** [#22](https://github.com/kingofthewisdomrealm-hub/cursor/pull/22) (env setup / `AGENTS.md`) — small and additive.
3. **Decide on Communication Survival #21** — keep if it has follow-up work beyond merged #20; otherwise close and archive.
4. **Close superseded open/draft MVPs** that rewrite the app unless you explicitly plan to revive them (card game, tax mapper, commerce architect, conversation MRI, Kill Tony, Zoom-Fu, human flow).
5. **Pick at most 1–2 large drafts to finish** if changing product again: Outcome Agent (#15), StayFlow (#16), or Voice Agent (#17) — not all three.

## Highest-value drafts to finish (if prioritizing unfinished work)

1. [Outcome agent app](https://cursor.com/agents/bc-019f5c2b-8a25-7c22-ab5e-51b5194d0cbc) — PR #15 (82 files)
2. [StayFlow application core](https://cursor.com/agents/bc-019f5d06-ae3b-7aab-91c3-8ee9386f9de7) — PR #16 (64 files)
3. [Browser voice agent mvp](https://cursor.com/agents/bc-019f60b3-14c4-7062-95fd-3615218a1ba6) — PR #17 (53 files)

## Notes

- Agents are mostly from **mobile**; this setup agent is from **setup**.
- No agent was archived or killed when this file was written.
- This file is a snapshot; agent status and PR state will drift. Re-generate when cleaning the fleet again.
