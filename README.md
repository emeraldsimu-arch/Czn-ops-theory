# NEXUS — Game Mission Tracker

A personal operations dashboard and mission tracker for four priority gacha games. Built as a Progressive Web App — install to your home screen for a full-screen native app experience.

**Live:** `https://emeraldsimu-arch.github.io/czn-ops-theory/`
**Version:** v5.6
**Last updated:** May 2026

---

## What It Does

NEXUS tracks everything across four games in one place:

- **Daily tasks** — reset at each game's actual server reset time, not midnight
- **Weekly tasks** — reset on Monday per game schedule
- **Endgame cycle clears** — tracked against real cycle end dates, not weekly resets
- **Currency & pull planning** — balance input, pull count, pity tracker per game
- **Achievement system** — four tiers (SIGNAL → OPERATIVE → VANGUARD → PHANTOM) with weekly Dispatches
- **Session planner** — daily calendar view showing what to prioritize, time budget, and what can wait
- **Notion sync** — lifetime stats, achievement unlocks, and weekly sessions archived automatically

---

## Games Tracked

| Priority | Game | Reset |
|---|---|---|
| P1 | Chaos Zero Nightmare (CZN) | Sunday 18:00 UTC |
| P2 | Wuthering Waves (WW) | Monday 20:00 UTC |
| P3 | Honkai: Star Rail (HSR) | Monday 10:00 UTC |
| P4 | Zenless Zone Zero (ZZZ) | Monday 10:00 UTC |

---

## Stack

| Layer | Service |
|---|---|
| Hosting | GitHub Pages |
| Database | Notion (via Anthropic MCP) |
| PWA | Chrome Android / iOS Safari |
| Fonts | Google Fonts — Orbitron, Syne, JetBrains Mono |

---

## File Structure

```
czn-ops-theory/
├── index.html          — app shell, PIN gate, tab structure
├── style.css           — design system, all CSS variables
├── app.js              — all logic, state management, Notion sync
├── sw.js               — service worker (offline support, cache busting)
├── manifest.json       — PWA install config
├── .nojekyll           — disables Jekyll processing on GitHub Pages
└── data/
    ├── config.js       — patch dates, cycle dates, events (update on patch day)
    ├── games.js        — task lists, endgame modes, weekly calendar plan
    └── achievements.js — all achievement and dispatch definitions
```

**Patch day rule:** Only `data/config.js` needs updating when a new patch drops.

---

## Install as PWA

**Android (Chrome):**
1. Open the live URL in Chrome
2. Tap the three-dot menu
3. Tap "Add to Home screen"
4. Tap Add

**iOS (Safari):**
1. Open the live URL in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"
4. Tap Add

Once installed, the app opens full-screen with no browser chrome — just like a native app.

---

## Development

### Branch workflow
All changes go through a branch — never commit directly to `main` during a multi-file update.

```
1. Create branch (e.g. v5-7)
2. Commit all changed files to the branch
3. Create pull request → review diff
4. Merge to main → GitHub Pages deploys automatically
```

One merge = one deploy. Keep deploys to one per session.

### Important — file naming
GitHub Pages runs on Linux (case-sensitive). All filenames must be **lowercase** when committing. `app.js` not `App.js`. Uppercase filenames cause 404s.

### Patch updates
When game data is outdated:
1. Verify new dates on Game8 and Icy Veins (two sources minimum)
2. Update `data/config.js` only — change `lastVerified`, patch ends, cycle ends, events
3. Create branch → commit → merge → one deploy

---

## Security

- PIN gate authentication on app load
- No passwords, financial data, or personal information in the codebase
- Notion database IDs are present in config but are useless without a Notion integration token, which is never stored in the repo
- All user data lives in localStorage (device) and Notion (server) — nothing sensitive in the source code

---

*Personal project — not accepting contributions.*
