# NEXUS — Complete Project Handoff Document
**For:** Fresh Claude instance taking over development
**Prepared by:** Claude Sonnet 4.6
**Date:** May 14, 2026
**Current version:** v5.6 (deployed)
**Next version:** v5.7

---

## 1. WHAT THIS PROJECT IS

NEXUS is a personal game mission tracker and operations dashboard built for one user. It tracks daily tasks, weekly resets, endgame cycle clears, currency/pull planning, and long-term achievement progression across four priority games. It is a Progressive Web App (PWA) — install via Chrome Android or iOS Safari to home screen, hosted on Netlify, with persistent data backed by a Notion database.

The user is an active gacha game player who plays all four games regularly. The tracker was built through an extended conversation — every design decision, data verification, and architectural choice was discussed and agreed upon collaboratively. The dual-pass methodology (developer lens + user lens before every build) is a standing requirement.

**Important:** The dual-pass is not an exercise in arguing. The developer pass catches technical issues. The user pass catches real UX friction. Neither pass should second-guess decisions that are already correct. If a decision is right, both passes confirm it and move on.

---

## 2. THE STACK

| Layer | Service | Details |
|---|---|---|
| Code storage | GitHub | Private repo: `Emereldsimu-arch/nexus` |
| Hosting | GitHub Pages | `https://emeraldsimu-arch.github.io/czn-ops-theory/` |
| Database | Notion | NEXUS Operations Hub (3 databases) |
| PWA | Chrome Android / iOS Safari | Install to home screen for full-screen app experience |
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
├── sw.js               — service worker (stale-while-revalidate + cache busting)
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
- **Game accents:** CZN=#e84faa, WW=#2de8a0, HSR=#9d7ff5, ZZZ=#4ab8f0
- **Font stack:** Orbitron (headers/labels), Syne (body), JetBrains Mono (data/numbers)
- **Grid background:** Subtle dot grid with radial gradients
- **Per-game card accents:** CZN diagonal slash, WW wave repeat, HSR double bar, ZZZ horizontal scan lines
- **Achievement tier colors:** SIGNAL=blue, OPERATIVE=green, VANGUARD=purple, PHANTOM=gold

---

## 5. GAMES TRACKED

Priority order (user-defined, do not change):

| Priority | Game | Short | Accent | Reset |
|---|---|---|---|---|
| P1 | Chaos Zero Nightmare | CZN | #e84faa | Sunday 18:00 UTC (weekly only, no daily reset) |
| P2 | Wuthering Waves | WW | #2de8a0 | Daily 20:00 UTC (4AM UTC+8) / Weekly Monday |
| P3 | Honkai: Star Rail | HSR | #9d7ff5 | Daily 10:00 UTC (4AM UTC-5) / Weekly Monday |
| P4 | Zenless Zone Zero | ZZZ | #4ab8f0 | Daily 10:00 UTC (4AM UTC-5) / Weekly Monday |

All HoYoverse games (WW, HSR, ZZZ) are on the **America server**. Reset times are verified against Game8, Fandom wiki, and Dexerto (May 2026).

**7DSO was removed in v5.5.** Do not re-add without being asked.
**ZZZ was promoted to full P4 game card in v5.5.** No passive strip.

---

## 6. NEXUS LANGUAGE SYSTEM

- **DISPATCHES** — weekly commendations, reset every Monday
- **SIGNAL → OPERATIVE → VANGUARD → PHANTOM** — permanent achievement tiers
- **NEXUS RECORD** — lifetime stats panel
- **Cycle clears** — endgame mode completions tied to in-game reset dates (NOT weekly)
- **Operator** — the user

---

## 7. ACHIEVEMENT SYSTEM

**Dispatches (weekly, reset Monday):** 10 per week. All 10 feeds permanent achievement tracking.

**Permanent achievements (never reset):** Four tiers. Names are game-specific lore references.

**PHANTOM tier names (user-selected, do not rename):**
- The SS Nightmare Recognizes You
- Bella Has Stopped Asking
- The Express Doesn't Wait
- The Trailblaze Continues *(redesigned in v5.6 — see below)*
- A Hundred Fractures, All Remembered
- The Zero System Has Seen Everything
- What the Zero System Keeps
- The Resonance Doesn't Ask Permission

**v5.6 achievement fixes:**
- `o_event` redesigned — was permanently locked (criticalEventsCompleted never written). New condition: complete all dailies for any one game on 3 separate days in a week. Reads `lt.dailyCompletions[gid]`.
- `p_trailblaze` redesigned — was permanently locked (criticalEventsMissed never written). New condition: complete all HSR dailies on 4 separate days AND all 4 HSR endgame modes cleared that same week.
- `v_tacet` index corrected — was checking `weekly[1]`, now correctly checks `weekly[0]` after `ww_tg` was moved out of WW weekly array.

**Achievement debounce rules (unchanged):**
- SIGNAL tier: 5-second debounce
- OPERATIVE and above: 60-second debounce
- Minimum 2 tasks completed before any permanent achievement fires

---

## 8. STATE OWNERSHIP — CRITICAL ARCHITECTURE (v5.6)

This is the most important architectural rule added in v5.6. **One owner per field, no exceptions.**

| Field | Owner | Trigger |
|---|---|---|
| Daily task state | `setv()` via `togT()` | User tap — reads from `dk(gid)` |
| Weekly task state | `setv()` via `togT()` | User tap — reads from `wk(gid)` |
| Cycle clear state | `setCy()` / `setCyWeekly()` via `togCy()` | User tap |
| `totalCycleClears` | `togCy()` ONLY | Clear tap (not→cleared only) |
| `*LifetimeCycleClears` | `togCy()` ONLY | Clear tap (not→cleared only) |
| `totalPerfectWeeks` | `checkWeekRollover()` ONLY | Monday rollover |
| `totalTasksCompleted` | `updateLT()` | Any task tap (Math.max) |
| `dailyCompletions` | `updateLT()` | Any task tap (flat count per game per week) |
| `weeksTracked` | `checkWeekRollover()` | Monday rollover |
| `unlockedAch` | `checkAllAchievements()` | Debounced tap |

**Never add a second writer to any of these fields.** The v5.5 bugs (double-count perfect weeks, undercount cycle clears) both came from two functions writing the same field. This rule prevents that class of bug entirely.

---

## 9. DAILY RESET ARCHITECTURE (v5.6)

Daily tasks use `dk(gameId)` — a per-game day key that respects actual game reset times.

```javascript
// dk() logic: if current UTC hour < game's dailyResetUTC, use yesterday's date
// This means tasks stay checked until the game actually resets, not at midnight
dk('hsr') → 'D2026-05-14-hsr'  // resets at 10:00 UTC
dk('ww')  → 'D2026-05-13-ww'   // resets at 20:00 UTC (before 20:00 UTC = yesterday)
dk('zzz') → 'D2026-05-14-zzz'  // resets at 10:00 UTC
dk('czn') → uses wk('czn')      // no daily reset, weekly only
```

Weekly tasks use `wk(gameId)` — Monday-anchored for HSR/WW/ZZZ, Sunday 18:00 UTC anchored for CZN.

**Reset times live in `config.js` under `resetTimes` — update there if server times ever change.**

---

## 10. CYCLE CLEAR ARCHITECTURE

Cycle clears are NOT weekly tasks. They have their own reset schedules.

**Four cycle types:** `date` | `patch` | `weekly` | `permanent`

**Current cycle end dates (as of May 14, 2026):**
- HSR Memory of Chaos: May 25
- HSR Pure Fiction: June 22
- HSR Apocalyptic Shadow: June 8
- HSR Anomaly Arbitration: June 13
- WW Tower of Adversity: May 25
- WW Whimpering Wastes: June 8
- WW Endstate Matrix: June 7 (patch end)
- WW Thousand Gateways: weekly *(moved from weekly tasks to endgameModes in v5.6)*
- CZN Basin of Hyperspace: July 8 (patch end)
- CZN Full-Scale Offensive: July 8 (patch end)
- CZN Sortie Mode: weekly
- ZZZ Shiyu Defense / Critical Node: May 27 (bi-weekly)
- ZZZ Deadly Assault: May 22 (bi-weekly, resets Fridays)
- ZZZ Hollow Zero / Operation Matrix: weekly

**v5.5 render rule (unchanged):** Cycle clear rows render ABOVE weekly tasks in every game card.

---

## 11. PULL & PITY SYSTEM (verified May 2026)

| Game | Currency | Per Pull | Soft Pity | Hard Pity | 50/50 | Pity Carries |
|---|---|---|---|---|---|---|
| HSR | Stellar Jade | 160 | ~74 | 90 | Yes | Yes |
| WW | Astrite | 160 | ~62 | 80 | Yes | Yes |
| CZN | Crystals | 160 | 58 | 70 | Yes (Combatant) | Yes |
| ZZZ | Polychrome | 160 | ~75 | 90 | Yes | Yes |

---

## 12. CALENDAR TAB — v5.6 REDESIGN

The calendar was fully rebuilt in v5.6. Old 7-column cramped grid removed.

**New structure (top to bottom):**

1. **Featured Day** — session planning card. Shows:
   - Priority order: uncleared cycles sorted by urgency, then dailies with reset countdowns
   - Time budget: `dailyLoad` + 30min per due cycle mode
   - Can-wait list: all cycle modes with >14 days remaining (full list, not summary)

2. **Week Strip** — compact 7-day horizontal scroll. Day name, load bar, game dot cluster, focus label. Read-only.

3. **Workload Burn Chart** — unchanged from v5.5.

4. **Planning Notes** — unchanged.

**This tab is a session planning tool, not a duplicate of the tracker.** It answers "how should I structure my session today" not "what tasks exist."

---

## 13. DEPLOYMENT PROCESS — BRANCH-BASED (v5.6+)

**Critical:** GitHub Pages auto-deploys on every merge to `main`. To avoid unnecessary deploys, ALL changes must go through a branch first.

**IMPORTANT — FILE NAMING:** GitHub Pages runs on Linux which is case-sensitive. ALL filenames must be lowercase — `app.js` not `App.js`, `style.css` not `Style.css`. Uppercase filenames will cause 404s even though they look fine in the GitHub UI on Windows/Mac. Always commit with lowercase filenames.

**Live URL:** `https://emeraldsimu-arch.github.io/czn-ops-theory/`
**Repo:** `github.com/emeraldsimu-arch/czn-ops-theory` (public)
**Pages source:** GitHub Actions
**`.nojekyll` file required:** Yes — must be present at repo root or Jekyll will interfere

### Standard workflow for any update:

**Step 1 — Create a branch**
1. Go to `github.com/Emereldsimu-arch/nexus`
2. Click the branch dropdown (shows `main`)
3. Type branch name (e.g. `v5-7` or `patch-june`) → click "Create branch"

**Step 2 — Commit all files to the branch**
- Edit file → at bottom of edit screen, switch from `main` to your branch → commit
- Repeat for every file that changes
- Zero Netlify deploys happen during this phase

**Step 3 — Review then merge**
1. GitHub shows "Compare & pull request" — click it
2. Review the diff to confirm everything looks right
3. Merge to `main` → ONE deploy → verify at live URL

**Never commit directly to `main` during a multi-file update session.**

### Files that change in each update type:

| Update type | Files |
|---|---|
| Patch day (dates only) | `data/config.js` only |
| Task list change | `data/config.js` + `data/games.js` |
| Logic fix | `app.js` |
| Visual change | `style.css` |
| New achievements | `data/achievements.js` |
| New version | All files + version bump in `index.html` + `sw.js` cache name |

---

## 14. GITHUB ACTIONS — PATCH DETECTION (v5.7 planned)

A GitHub Action workflow is planned that will:
1. Run on a schedule (e.g. weekly)
2. Fetch current patch end dates from Game8 / Prydwen for all 4 games
3. Compare against dates in `data/config.js`
4. If any dates are stale or within 7 days of expiry, open a draft PR on a new branch with proposed `config.js` updates
5. User reviews the PR, merges when satisfied → one deploy

**This workflow file lives at `.github/workflows/patch-check.yml`**

Status: drafted, not yet committed to repo. See the workflow file provided in this session.

**The automation philosophy:** Propose, never auto-deploy. The user reviews every change before it touches production. When confidence is established over several patch cycles, the workflow can be upgraded to auto-merge. That upgrade requires explicit user instruction.

---

## 15. DATA VERIFICATION STANDARD

Always verify game data from at least 2 of these 3 sources before adding/changing anything:
- Game8 (game8.co)
- Prydwen (prydwen.gg) or Icy Veins
- GameWith or official wikis / Fandom

Never trust training data alone for cycle end dates, event deadlines, pull/pity numbers, new game modes, or weekly reset schedules.

---

## 16. NOTION SYNC BEHAVIOR

- Lifetime stats sync to NEXUS_RECORD on every meaningful task interaction (2.5s debounce)
- Achievement unlocks push to NEXUS_ACHIEVEMENTS with flavor text and unlock date
- Weekly sessions push to NEXUS_SESSIONS on Monday rollover via end-of-week modal
- Offline queue (outbox) holds up to 20 items, flushes on reconnect
- Sync status starts idle on load — only transitions to pending/ok/err when sync fires
- Sync confirmation: green dot pulse flash on success

---

## 17. CURRENT STATE — WHAT'S LIVE IN V5.6

**Working correctly:**
- All 4 game cards: CZN, WW, HSR, ZZZ
- Daily tasks reset at actual game reset times (not midnight)
- WW now shows 4 endgame cycle clears (ww_tg added)
- Currency pull count updates live as balance is entered
- Urgency banner sorted by days remaining ascending (most urgent first)
- Lifetime cycle clears increment in `togCy()` only — no delta undercount
- Perfect week increments in `checkWeekRollover()` only — no double-count
- `o_event` and `p_trailblaze` achievements now have reachable conditions
- `dailyCompletions` tracking feeds achievement checks correctly
- Calendar tab rebuilt — featured day session planner + week strip
- Sync status no longer stuck on "Connecting to archive"
- Service worker cache busting — no more stale HTML on deploy
- Version string `v5.6` in logo
- `zzzPassive` dead div removed

**Flagged for v5.7:**
- PIN timeout / inactivity re-lock (user declined for now)
- Currency pull projection v2 — balance → guarantee projection
- Per-game deep-dive pages
- Settings page (timezone, game visibility toggles)
- PWA push notifications
- GitHub Action patch detection (drafted, not committed)
- Calendar tweaking after real-world use — may need iteration
- Historical charts, pull history log (longer term)

---

## 18. HOW TO DO A PATCH UPDATE

When the user says "patch update" or "game data is outdated":

1. Web search: `[game name] current version patch [current month year] endgame checklist game8`
2. Web fetch Game8 and Icy Veins / Prydwen for the game
3. Create a branch in GitHub (e.g. `patch-[month]`)
4. Update ONLY `data/config.js` on that branch:
   - Change `lastVerified` date
   - Update `patches[]` entry
   - Update relevant `cycles{}` entries
   - Add/remove/update `events[]` entries
5. If tasks changed, update `data/games.js` on the same branch
6. Dual pass on the changes
7. User merges branch to `main` → one deploy
8. Verify at live URL

---

## 19. HOW TO DO A FEATURE UPDATE

1. User describes what they want
2. Ask clarifying questions only when truly ambiguous
3. **Developer pass** — architecture, data model, state ownership, edge cases
4. **User pass** — daily-use experience, friction points
5. Present both passes, discuss adjustments
6. Lock scope explicitly before writing code
7. Build all files for the batch
8. **Audit pass** — review written code for bugs, optimizations, consistency
9. Report audit findings — user decides what gets folded in
10. User creates branch → commits all files → merges → one deploy
11. Verify at live URL
12. Flag anything for next iteration

**This methodology is non-negotiable. Never skip the dual passes or audit pass.**

---

## 20. WHAT THE USER VALUES

- The NEXUS aesthetic — dark, tactical, neon accents. Never change without asking.
- The NEXUS language system — Dispatches, tiers, Operator. Use consistently.
- PHANTOM achievement names — chosen carefully, do not rename.
- Accuracy over assumptions — always verify game data before adding it.
- The dual-pass + audit methodology — this is how bugs get caught.
- Notion as permanent record — the data that matters most lives there.
- GitHub branches — never deploy mid-session, always batch into one merge.
- GitHub Pages — all filenames must be lowercase, one merge per session, branch workflow always.

**Netlify credit note:** The user is on the free plan. Each merge to `main` = one deploy. Keep deploys to one per session maximum. Never commit individual files directly to `main` during a multi-file update.

---

## 21. KNOWN MINOR ISSUES (non-breaking, flagged)

- Collapse preferences reset on first load after v5.6 upgrade (one-time, UI only)
- End-of-week modal may fire once on first load after v5.6 upgrade (PREVWK key format change)
- `getv()` daily path ignores the passed `s` state parameter (vestigial, no functional impact)
- Google Fonts loaded via `@import` in CSS — minor render-blocking, low priority

---

## 22. STARTING INSTRUCTIONS FOR NEXT CHAT

1. Ask user to share this handoff document
2. Fetch live app at `https://emeraldsimu-arch.github.io/czn-ops-theory/` to verify current state
3. Check version number in app header — should be v5.6
4. Ask what they want to work on
5. Create a GitHub branch before writing any code
6. Follow dual-pass + audit methodology for every change
7. Batch all files, one merge, one deploy per session

The user is a good collaborator and will push back if something feels wrong. Trust their instincts — they have caught real bugs and made good design calls throughout the project.

---

*Generated at end of session — May 15, 2026. v5.6 is live at `https://emeraldsimu-arch.github.io/czn-ops-theory/`. Migrated from Netlify to GitHub Pages. PWA installed to home screen. Branch-based workflow established. All filenames must be lowercase on commits.*

*— Claude Sonnet 4.6*
