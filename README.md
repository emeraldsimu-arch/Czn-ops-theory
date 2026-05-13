# NEXUS — Game Mission Tracker v5.3

Personal mission tracker for **Chaos Zero Nightmare**, **Wuthering Waves**, **Honkai: Star Rail**, and **Seven Deadly Sins: Origin**. Built as a Progressive Web App — install to home screen for a native app experience.

---

## Stack

- **Frontend:** Vanilla HTML/CSS/JS — no build step, no dependencies
- **Persistence:** localStorage (weekly state) + Notion (lifetime stats, achievements, session history)
- **Hosting:** Netlify (password-protected, HTTPS)
- **PWA:** Service worker with stale-while-revalidate caching

---

## File Structure

```
nexus/
├── index.html          — app shell, layout, tabs
├── style.css           — all design, CSS variables, animations
├── app.js              — all application logic, state management, Notion sync
├── sw.js               — service worker (PWA + offline)
├── manifest.json       — PWA install config
├── data/
│   ├── config.js       — ⭐ UPDATE THIS ON PATCH DAY
│   ├── games.js        — task lists, endgame modes, calendar plan
│   └── achievements.js — all achievement definitions (SIGNAL/OPERATIVE/VANGUARD/PHANTOM)
└── assets/
    ├── icon-192.png    — PWA icon (192×192)
    └── icon-512.png    — PWA icon (512×512)
```

---

## Updating Patch Data

**On patch day, only `data/config.js` needs to change.** Open the file, find the relevant section, update the dates. Nothing else needs to touch.

1. Update `lastVerified` date
2. Update the relevant entry in `patches[]` — change `version` and `ends`
3. Update relevant entries in `cycles{}` — change `ends` dates for modes that reset
4. Add or remove entries in `events[]` as needed
5. Save, commit, Netlify auto-deploys

---

## NEXUS Achievement Tiers

| Tier | Color | Description |
|---|---|---|
| SIGNAL | Blue | Early milestones — first week |
| OPERATIVE | Green | Consistent play — weeks of effort |
| VANGUARD | Purple | Sustained excellence — months |
| PHANTOM | Gold | Rare, long-term, earned |

Weekly **Dispatches** reset every Monday and feed into permanent achievement progress.

---

## Notion Databases

Three databases in the NEXUS Operations Hub:

- `NEXUS_RECORD` — one row, lifetime stats, always updating
- `NEXUS_ACHIEVEMENTS` — one row per permanent achievement unlock
- `NEXUS_SESSIONS` — one row per week, complete play history

---

## Data Sources

Game data verified against: **Game8 · Prydwen · GameWith · Official Wikis**  
Last full verification: **May 12, 2026**
