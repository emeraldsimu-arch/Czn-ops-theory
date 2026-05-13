# NEXUS — Complete Project Handoff Document
**For:** Fresh Claude instance taking over development
**Prepared by:** Claude Sonnet 4.6 (this conversation)
**Date:** May 13, 2026
**Current version:** v5.4 (live)
**Next version:** v5.5

---

## 1. WHAT THIS PROJECT IS

NEXUS is a personal game mission tracker and operations dashboard built for one user. It tracks daily tasks, weekly resets, endgame cycle clears, currency/pull planning, and long-term achievement progression across four priority games. It is a Progressive Web App (PWA) installed to the user's phone home screen, hosted on Netlify, with persistent data backed by a Notion database.

The user is an active gacha game player who plays all four games regularly. The tracker was built through an extended conversation — every design decision, data verification, and architectural choice was discussed and agreed upon collaboratively. The dual-pass methodology (developer lens + user lens before every build) is a standing requirement.

---

## 2. THE STACK

| Layer | Service | Details |
|---|---|---|
| Code storage | GitHub | Private repo: `Emereldsimu-arch/nexus` |
| Hosting | Netlify | `https://chaosnexuslora1202.netlify.app` |
| Database | Notion | NEXUS Operations Hub (3 databases) |
| PWA | Chrome Android | Installed to home screen |
| Fonts | Google Fonts | Orbitron, Syne, JetBrains Mono |

**Notion database IDs (do not change):**
- Hub page: `35d32a84-9d1c-8189-b7b0-c4adc31556a8`
- NEXUS_RECORD page: `35d32a84-9d1c-8112-9240-e598022bf1c8`
- NEXUS_RECORD datasource: `eec1b2bd-1e5b-481d-874a-51d8bc6f4368`
- NEXUS_ACHIEVEMENTS datasource: `96027bdd-f9d5-4f27-8edc-78e147d49177`
- NEXUS_SESSIONS datasource: `08655493-ca9f-456d-8165-ef138d50b152`

---

## 3. FILE STRUCTURE

```
nexus/
├── index.html          — app shell, PIN gate, tab structure
├── style.css           — complete design system, all CSS variables
├── app.js              — all logic, state, Notion sync, achievements
├── sw.js               — service worker (stale-while-revalidate)
├── manifest.json       — PWA install config
├── netlify.toml        — deployment, security headers, caching
├── README.md           — project documentation
└── data/
    ├── config.js       — ⭐ ONLY FILE TO TOUCH ON PATCH DAY
    ├── games.js        — task lists, endgame modes, calendar plan
    └── achievements.js — all achievement definitions
```

**Critical rule:** On patch day, only `data/config.js` changes. Patch end dates, cycle end dates, and event data all live there. Nothing else needs editing for a content update.

---

## 4. DESIGN SYSTEM — DO NOT CHANGE

The user explicitly approved and wants preserved:
- **Color palette:** Dark tactical dashboard (#08090c background, game accent colors)
- **Game accents:** CZN=#e84faa, WW=#2de8a0, HSR=#9d7ff5, SDS=#f5a623, ZZZ=#4ab8f0
- **Font stack:** Orbitron (headers/labels), Syne (body), JetBrains Mono (data/numbers)
- **Grid background:** Subtle dot grid with radial gradients
- **Per-game card accents:** CZN diagonal slash, WW wave repeat, HSR double bar, SDS cross motif
- **Achievement tier colors:** SIGNAL=blue, OPERATIVE=green, VANGUARD=purple, PHANTOM=gold

---

## 5. GAMES TRACKED

Priority order (user-defined, do not change):

| Priority | Game | Short | Accent | Reset Day |
|---|---|---|---|---|
| P1 | Chaos Zero Nightmare | CZN | #e84faa | Sunday 18:00 UTC |
| P2 | Wuthering Waves | WW | #2de8a0 | Monday |
| P3 | Honkai: Star Rail | HSR | #9d7ff5 | Monday |
| P4 | Seven Deadly Sins: Origin | 7DSO | #f5a623 | Monday |
| Passive | Zenless Zone Zero | ZZZ | #4ab8f0 | Monday |

**ZZZ is passive only** — minimal strip at bottom of tracker, not a full game card.

---

## 6. NEXUS LANGUAGE SYSTEM

The app has its own internal terminology. Use these consistently:

- **DISPATCHES** — weekly commendations, reset every Monday
- **SIGNAL → OPERATIVE → VANGUARD → PHANTOM** — permanent achievement tiers
- **NEXUS RECORD** — lifetime stats panel
- **Cycle clears** — endgame mode completions tied to in-game reset dates (NOT weekly)
- **Operator** — the user (you)

---

## 7. ACHIEVEMENT SYSTEM

**Two-tier system:**

**Dispatches (weekly, reset Monday):** 10 dispatches per week. Earning all 10 feeds permanent achievement tracking. Names are operational/mission themed.

**Permanent achievements (never reset):** Four tiers — SIGNAL (early), OPERATIVE (consistent), VANGUARD (months of play), PHANTOM (rare, earned). Names are game-specific lore references that get more obscure as tiers increase.

**PHANTOM tier names (user-selected, do not rename):**
- The SS Nightmare Recognizes You (CZN, 10 perfect weeks)
- Bella Has Stopped Asking (CZN, 60-day streak)
- The Express Doesn't Wait (HSR, HSR cycles ×12)
- The Trailblaze Continues (HSR, no critical events missed)
- A Hundred Fractures, All Remembered (WW, 100 cycle clears)
- The Sin That Remains (SDS, all achievements)
- What the Zero System Keeps (CZN, 100 total cycles)
- The Resonance Doesn't Ask Permission (WW, 3 perfect weeks all games)

**Achievement debounce rules (v5.4):**
- SIGNAL tier: 5-second debounce
- OPERATIVE and above: 60-second debounce
- Minimum 2 tasks completed before any permanent achievement fires
- This prevents accidental single-tap unlocks

---

## 8. CYCLE CLEAR ARCHITECTURE

This is the most important architectural decision. **Cycle clears are NOT weekly tasks.**

Endgame modes have their own reset schedules. The app stores cleared state with the actual cycle end date, not the Monday week key. When today crosses a cycle end date, the cleared state resets automatically.

**Four cycle types:**
1. `date` — fixed calendar date (most HSR, WW modes)
2. `patch` — resets when the game version ends
3. `weekly` — resets with the Monday week key (Spiral Tower, Thousand Gateways)
4. `permanent` — no reset (Sortie Mode ongoing)

**Current cycle end dates (as of May 12, 2026):**
- HSR Pure Fiction: May 11 (RESET TODAY)
- WW Whimpering Wastes: May 11 (RESET TODAY)
- HSR Memory of Chaos: May 25
- WW Tower of Adversity: May 25
- HSR Apocalyptic Shadow: June 8
- HSR Anomaly Arbitration: June 13
- WW Endstate Matrix: June 7 (version end)
- 7DSO Timespace Junction: Season ends August 26

**These dates must be updated in `data/config.js` when cycles roll over.**

---

## 9. PULL & PITY SYSTEM (verified May 12, 2026)

| Game | Currency | Per Pull | Soft Pity | Hard Pity | 50/50 | Pity Carries |
|---|---|---|---|---|---|---|
| HSR | Stellar Jade | 160 | Pull 74 | Pull 90 | Yes | Yes |
| WW | Astrite | 160 | ~Pull 62 | Pull 80 | Yes | Yes |
| CZN | Crystals | 160 | Pull 58 | Pull 70 | Yes (Combatant) | Yes |
| 7DSO | Star Fragments | 300 | None | Pull 80 (SSR, not featured) | No | No |

**7DSO note:** Pull 120 doubles featured rate but does NOT guarantee. No pity carryover between banners. Warn user about this.

---

## 10. DATA VERIFICATION STANDARD

**Always verify game data from at least 2 of these 3 sources before adding/changing anything:**
- Game8 (game8.co)
- Prydwen (prydwen.gg)
- GameWith or official wikis

**Never trust training data alone for:**
- Cycle end dates (change every 28+ days)
- Event deadlines (change every patch)
- Pull/pity numbers (occasionally adjust)
- New game modes (added mid-season)
- Weekly reset schedules (can shift)

---

## 11. NOTION SYNC BEHAVIOR

- Lifetime stats sync to NEXUS_RECORD on every meaningful task interaction (2.5s debounce)
- Achievement unlocks push to NEXUS_ACHIEVEMENTS with flavor text and unlock date
- Weekly sessions push to NEXUS_SESSIONS on Monday rollover via end-of-week modal
- Offline queue (outbox) holds up to 20 items, flushes on reconnect
- After 48 hours of failed sync, warning shown in achievements tab
- Sync confirmation: green dot pulse flash on success

---

## 12. CURRENT STATE — WHAT'S LIVE IN V5.4

**Working correctly:**
- All 4 game cards with accurate task data
- Endgame cycle clear system with date-based state
- Today's Priority panel (always shows calendar focus as P3 fallback)
- Urgency banner (suppresses >14 day modes on first load)
- Freshness banner (fires only within strict 7-day window)
- Weekly dispatch bar with pip indicators
- Achievement system with tiered debounce (60s for OPERATIVE+)
- PHANTOM unlock flash animation + persistent toast
- End-of-week modal with Notion session archiving
- Currency tracker with pull/pity calculator
- Weekly planner with live load bars
- NEXUS Record in achievements tab
- Notion sync with visual confirmation
- Service worker for offline support
- PWA manifest for home screen install
- ZZZ passive tracker
- Per-game card collapse/expand (CZN open by default)
- Per-game structural CSS accents

**Known flags for v5.5:**
See Section 13.

---

## 13. FLAGGED ITEMS FOR V5.5

These were identified during dual passes and deferred:

**Data fixes:**
- Duplicate endgame modes still appear in both weekly task list AND cycle clear rows for some games — agreed to resolve with Option A (merge: remove from weekly tasks, keep only as cycle clear rows). HSR MoC/PF/AS/AA, WW ToA/WW/EM/HZ, CZN Basin/FSO, SDS Timespace all affected.
- CZN weekly reset is Sunday 18:00 UTC but the app uses a Monday week key — CZN tasks may feel misaligned. Consider a per-game reset day visual note (already in g.resetNote field, displayed on card).
- 7DSO Cube Keys counter should be a stepper control (0–50) rather than a checkbox — prominent placement on card.
- Hazard Zone confirmed as a sub-zone of Tower of Adversity, not standalone — merge into single cycle row "Tower of Adversity (all zones incl. Hazard Zone)."

**UX improvements:**
- Cycle clear rows are buried below daily/weekly tasks — consider "quick clear" mode or pinned cycle section.
- No visual distinction between collapsed+complete card and collapsed+incomplete — complete cards should have green border glow.
- Debug cycle reset trigger — hidden behind long-press on footer version number.

---

## 14. PLANNED FUTURE FEATURES (v5.6+)

These were discussed and agreed upon but not yet built:

**v5.5/v5.6 scope:**
- Currency pull projection v2 — balance input → pull count → pity projection → "you need X more jade to guarantee Y"
- Per-game deep-dive pages (separate HTML files linked from game cards)
- Settings page — timezone, anchor day preference, game visibility toggles, color theme variants
- PWA push notifications — "WW Tower resets tomorrow, not cleared"

**Longer term roadmap:**
- Collaborative mode — share tracker read-only with a friend playing the same games
- Historical charts — weekly completion over time, pulls per game over time, streak history
- Pull history log — record when you pulled and what you got, feeds pity calculator
- Auto-event detection — web search on load to surface new limited events not yet in config
- Multi-account support — track a second account (alt account or different server)
- Export to PDF — weekly summary report for archiving

---

## 15. HOW TO DO A PATCH UPDATE

When the user says "patch update" or "game data is outdated":

1. Web search: `[game name] current version patch [current month year] endgame checklist game8`
2. Web fetch Game8 and Prydwen for the game
3. Update ONLY `data/config.js`:
   - Change `lastVerified` date
   - Update `patches[]` entry — version string and ends date
   - Update relevant `cycles{}` entries — new end dates
   - Add/remove/update `events[]` entries
4. If tasks changed (new modes, removed content), update `data/games.js`
5. Do a dual pass on the changes before giving the user the updated file
6. User pastes into GitHub, Netlify auto-deploys

---

## 16. HOW TO DO A FEATURE UPDATE

1. User describes what they want
2. Ask clarifying questions if needed (only when truly ambiguous)
3. Do a **developer pass** — think through the architecture, data model, edge cases
4. Do a **user pass** — think through the daily-use experience, friction points
5. Present both passes to user, discuss adjustments
6. Lock the scope explicitly before writing code
7. Build the files
8. User updates GitHub — Netlify deploys
9. Do another dual pass on the live version
10. Flag anything for next iteration

**This methodology is non-negotiable. Never skip the dual passes.**

---

## 17. DEPLOYMENT PROCESS

**To update any file:**
1. Go to `github.com/Emereldsimu-arch/nexus`
2. Click the file → pencil icon → select all → paste new content → commit
3. Netlify auto-deploys in ~30 seconds
4. Verify at `https://chaosnexuslora1202.netlify.app`

**Only two files change in most updates:**
- `app.js` — for logic/behavior fixes
- `data/config.js` — for patch/event/cycle data updates

**Only `style.css` changes for visual updates.**
**Only `data/games.js` changes if task lists change.**
**Only `data/achievements.js` if new achievements are added.**

---

## 18. WHAT THE USER VALUES

Things the user has explicitly approved and cares about:
- The NEXUS aesthetic — dark, tactical, neon accents. Never change this without asking.
- The NEXUS language system — Dispatches, tiers, Operator. Use it consistently.
- PHANTOM achievement names — these were chosen carefully, do not rename.
- Accuracy over assumptions — always verify game data before adding it.
- The dual-pass methodology — this is how we caught most bugs and improvements.
- Notion as permanent record — the data that matters most lives there, not in the app.
- GitHub as the foundation — private repo, version history, clean file separation.

Things the user has flagged as pain points:
- Losing progress due to localStorage instability (solved with Notion backend)
- App not working when reopened (solved with PWA + stable Netlify URL)
- Inaccurate game data (solved with multi-source verification protocol)
- Achievements firing on accidental taps (solved in v5.4 with debounce)

---

## 19. STARTING INSTRUCTIONS FOR NEXT CHAT

When the user opens a new chat and references this project:

1. Ask them to share this handoff document or the Netlify URL
2. Fetch the live app at `https://chaosnexuslora1202.netlify.app` to verify current state
3. Check Notion NEXUS_RECORD for current lifetime stats
4. Ask what they want to work on — data update, new feature, or bug fix
5. Follow the dual-pass methodology for any change
6. Reference this document for any decision that feels like it needs context

The user understands how this works and is a good collaborator. They will push back if something feels wrong. Trust their instincts — they caught the achievement debounce bug, the Guild Office daily/weekly mislabel, the Memory of Chaos weekly/cycle duplication, and several other real issues.

---

*This document was generated at the end of a long productive session. The project is in a good state. v5.4 is live and working. The next session should start with the dual pass on v5.4 and scope v5.5 from the flagged items list.*

*— Claude Sonnet 4.6, May 13, 2026*
