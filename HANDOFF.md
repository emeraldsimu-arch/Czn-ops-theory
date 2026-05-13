# NEXUS — Complete Project Handoff Document
**For:** Fresh Claude instance taking over development
**Prepared by:** Claude Sonnet 4.6
**Date:** May 13, 2026
**Current version:** v5.5 (live)
**Next version:** v5.6

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
- **Game accents:** CZN=#e84faa, WW=#2de8a0, HSR=#9d7ff5, ZZZ=#4ab8f0
- **Font stack:** Orbitron (headers/labels), Syne (body), JetBrains Mono (data/numbers)
- **Grid background:** Subtle dot grid with radial gradients
- **Per-game card accents:** CZN diagonal slash, WW wave repeat, HSR double bar, ZZZ horizontal scan lines
- **Achievement tier colors:** SIGNAL=blue, OPERATIVE=green, VANGUARD=purple, PHANTOM=gold

---

## 5. GAMES TRACKED

Priority order (user-defined, do not change):

| Priority | Game | Short | Accent | Reset Day |
|---|---|---|---|---|
| P1 | Chaos Zero Nightmare | CZN | #e84faa | Sunday 18:00 UTC |
| P2 | Wuthering Waves | WW | #2de8a0 | Monday |
| P3 | Honkai: Star Rail | HSR | #9d7ff5 | Monday |
| P4 | Zenless Zone Zero | ZZZ | #4ab8f0 | Monday |

**7DSO (Seven Deadly Sins: Origin) was removed in v5.5.** The user is no longer actively playing it. Do not re-add it without being asked.

**ZZZ was promoted from a passive strip to a full P4 game card in v5.5.** It now has daily tasks, weekly tasks, and endgame cycle clears. There is no longer a passive strip at the bottom of the tracker.

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
- The Trailblaze Continues (HSR, no critical events missed ×4)
- A Hundred Fractures, All Remembered (WW, 100 WW cycle clears)
- The Zero System Has Seen Everything (CZN, all other achievements unlocked)
- What the Zero System Keeps (CZN, 100 total cycle clears)
- The Resonance Doesn't Ask Permission (WW, 8 perfect weeks + all games 100% that week)

**Achievement thresholds confirmed in v5.5 audit:**
- `v_memory` (VANGUARD): HSR lifetime cycle clears >= 6
- `p_express` (PHANTOM): HSR lifetime cycle clears >= 12
- `p_resonance` (PHANTOM): totalPerfectWeeks >= 8 AND all games 100% current week
- These were deliberately set so VANGUARD fires at 6 and PHANTOM at 12, never simultaneously

**Achievement debounce rules (v5.4, unchanged):**
- SIGNAL tier: 5-second debounce
- OPERATIVE and above: 60-second debounce
- Minimum 2 tasks completed before any permanent achievement fires

---

## 8. CYCLE CLEAR ARCHITECTURE

This is the most important architectural decision. **Cycle clears are NOT weekly tasks.**

Endgame modes have their own reset schedules. The app stores cleared state with the actual cycle end date, not the Monday week key. When today crosses a cycle end date, the cleared state resets automatically.

**Four cycle types:**
1. `date` — fixed calendar date
2. `patch` — resets when the game version ends
3. `weekly` — resets with the Monday week key
4. `permanent` — no reset

**Current cycle end dates (as of May 13, 2026):**
- HSR Memory of Chaos: May 25
- HSR Pure Fiction: June 22 (reset May 11, 6-week cadence)
- HSR Apocalyptic Shadow: June 8
- HSR Anomaly Arbitration: June 13
- WW Tower of Adversity: May 25
- WW Whimpering Wastes: June 8 (reset May 11)
- WW Endstate Matrix: June 7 (patch end)
- WW Thousand Gateways: weekly
- CZN Basin of Hyperspace: July 8 (patch end)
- CZN Full-Scale Offensive: July 8 (patch end)
- CZN Sortie Mode: weekly
- ZZZ Shiyu Defense / Critical Node: May 27 (bi-weekly)
- ZZZ Deadly Assault: May 22 (bi-weekly, resets Fridays)
- ZZZ Hollow Zero / Operation Matrix: weekly

**These dates must be updated in `data/config.js` when cycles roll over.**

**v5.5 render change:** Cycle clear rows now render ABOVE weekly tasks in every game card. This surfaces time-sensitive content first.

---

## 9. PULL & PITY SYSTEM (verified May 13, 2026)

| Game | Currency | Per Pull | Soft Pity | Hard Pity | 50/50 | Pity Carries |
|---|---|---|---|---|---|---|
| HSR | Stellar Jade | 160 | Pull 74 | Pull 90 | Yes | Yes |
| WW | Astrite | 160 | ~Pull 62 | Pull 80 | Yes | Yes |
| CZN | Crystals | 160 | Pull 58 | Pull 70 | Yes (Combatant) | Yes |
| ZZZ | Polychrome | 160 | ~Pull 75 | Pull 90 | Yes | Yes |

**ZZZ note:** 160 Polychrome = 1 Master Tape (limited banners). Encrypted Master Tapes are for standard banner only. Soft pity ~75 is community-verified.

---

## 10. DATA VERIFICATION STANDARD

**Always verify game data from at least 2 of these 3 sources before adding/changing anything:**
- Game8 (game8.co)
- Prydwen (prydwen.gg) or Icy Veins
- GameWith or official wikis / Fandom

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
- After sync failure, items queue locally and flush on next successful connection
- Sync confirmation: green dot pulse flash on success

---

## 12. CURRENT STATE — WHAT'S LIVE IN V5.5

**Working correctly:**
- All 4 game cards: CZN, WW, HSR, ZZZ (full P4 card with verified v2.8 data)
- Endgame cycle clear system with date-based state
- Cycle clear rows render ABOVE weekly tasks (v5.5)
- Collapsed + complete cards show stronger green border glow (v5.5)
- Debug cycle reset: long-press footer sources text for 600ms (v5.5)
- Today's Priority panel (always shows calendar focus as P3 fallback)
- Urgency banner (suppresses >14 day modes on first load)
- Freshness banner (fires only within strict 7-day window)
- Weekly dispatch bar with pip indicators
- Achievement system with tiered debounce (60s for OPERATIVE+)
- PHANTOM unlock flash animation + persistent toast
- End-of-week modal with Notion session archiving
- Currency tracker with pull/pity calculator (4 games incl. ZZZ)
- Weekly planner with live load bars
- NEXUS Record in achievements tab
- Notion sync with visual confirmation
- Service worker for offline support
- PWA manifest for home screen install
- Per-game card collapse/expand (CZN open by default)
- Per-game structural CSS accents (incl. ZZZ scan lines)
- PIN gate authentication
- Netlify cache headers optimized (JS/CSS: 1hr cache + stale-while-revalidate)

**v5.4 audit fixes confirmed live:**
- `hsrEndgameDone()` now checks `getCy()` for 4 HSR cycle keys (was checking stale weekly[] indices)
- `wwEndgameDone()` now checks `getCy()` for ww_toa and ww_ww (same fix)
- `updateLT()` perfect week increment fixed (was a no-op)
- `window._nexusHelpers` dead code removed
- `v_memory` threshold: >= 6 HSR cycle clears
- `p_resonance` threshold: >= 8 perfect weeks

---

## 13. ZZZ TASK DATA (verified May 13, 2026 — Game8, Icy Veins, BitTopup)

**Version:** 2.8 — New Eridan Sunset (May 6 – June 10, 2026). v3.0 launches June 17.

**Daily tasks:**
- Daily Errands ×4: Login, Coffee, Scratch Cards, Video Store (60 Polychrome)
- Spend Battery Charge in Combat Simulation / Routine Cleanup
- HoYoLAB daily check-in (30 Polychrome)
- Trust invites — 3 Agents daily (Trust Level progress)

**Weekly tasks:**
- Notorious Hunts — 3 free attempts (resets Monday)
- Ridu Weekly — complete all tasks (105 Polychrome)
- New Eridu City Fund — weekly mission progress
- v2.8 event missions — Operation: Save Bootopia (ends Jun 10)

**Endgame cycle clears:**
- Shiyu Defense / Critical Node — bi-weekly (~2 weeks), up to 720 Polychrome
- Deadly Assault — bi-weekly (resets Fridays), 150 Polychrome
- Hollow Zero / Operation Matrix — weekly, 160 Polychrome

**Weekly Polychrome yield (F2P):** ~775 PC/week — 420 dailies + 105 Ridu + 360 Shiyu (bi-wkly avg) + 150 Deadly Assault (bi-wkly avg) + 160 Hollow Zero

---

## 14. FLAGGED ITEMS FOR V5.6+

These were discussed and are next in line:

**GitHub-enabled features (Step 5 — not yet started):**
This is the next major conversation. The user wants to explore what's possible now that the project has a solid GitHub foundation. Topics to cover:
- Automated or assisted patch detection
- Branch-based testing before deploying to production
- Version history and rollback
- Any workflow improvements using GitHub Actions or similar

**Currency pull projection v2:**
- Balance input → pull count → pity projection → "you need X more jade to guarantee Y"
- Currently shows balance and pulls but no forward projection

**Per-game deep-dive pages:**
- Separate HTML files linked from game cards
- More detailed task breakdowns, character/build notes

**Settings page:**
- Timezone preference
- Anchor day preference
- Game visibility toggles
- Color theme variants

**PWA push notifications:**
- "WW Tower resets tomorrow, not cleared"

**Longer term:**
- Historical charts (weekly completion over time, streak history)
- Pull history log
- Collaborative read-only share mode
- Multi-account support
- Export to PDF weekly summary

---

## 15. HOW TO DO A PATCH UPDATE

When the user says "patch update" or "game data is outdated":

1. Web search: `[game name] current version patch [current month year] endgame checklist game8`
2. Web fetch Game8 and Icy Veins / Prydwen for the game
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
3. Do a **developer pass** — architecture, data model, edge cases
4. Do a **user pass** — daily-use experience, friction points
5. Present both passes to user, discuss adjustments
6. Lock the scope explicitly before writing code
7. Build the files
8. User updates GitHub — Netlify deploys
9. Verify at live URL
10. Flag anything for next iteration

**This methodology is non-negotiable. Never skip the dual passes.**

---

## 17. DEPLOYMENT PROCESS

**To update any file:**
1. Go to `github.com/Emereldsimu-arch/nexus`
2. Click the file → pencil icon → select all → paste new content → commit
3. Netlify auto-deploys in ~30 seconds
4. Verify at `https://chaosnexuslora1202.netlify.app`

**Note on Netlify credits:** The site uses static hosting with no build command. Credits are consumed by bandwidth. Cache headers are set to 1hr for JS/CSS with stale-while-revalidate to minimize bandwidth usage. Monitor credit usage if doing many rapid deploys in a session.

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
- The dual-pass methodology — this is how we catch most bugs and improvements.
- Notion as permanent record — the data that matters most lives there, not in the app.
- GitHub as the foundation — private repo, version history, clean file separation.

Things the user has flagged as pain points (all resolved):
- Losing progress due to localStorage instability (solved with Notion backend)
- App not working when reopened (solved with PWA + stable Netlify URL)
- Inaccurate game data (solved with multi-source verification protocol)
- Achievements firing on accidental taps (solved in v5.4 with debounce)
- Duplicate endgame modes tracked twice (solved in v5.5 audit)
- Cycle clears buried below weekly tasks (solved in v5.5 — now above)

---

## 19. STARTING INSTRUCTIONS FOR NEXT CHAT

When the user opens a new chat and references this project:

1. Ask them to share this handoff document
2. Fetch the live app at `https://chaosnexuslora1202.netlify.app` to verify current state
3. Check the version number shown in the app header — should be v5.5
4. Ask what they want to work on
5. Follow the dual-pass methodology for any change
6. Reference this document for any decision that needs context

The user understands how this works and is a good collaborator. They will push back if something feels wrong. Trust their instincts — they have caught real bugs and made good design calls throughout the project.

The next session is planned to focus on **Step 5: GitHub-enabled features** — exploring what's now possible with the GitHub foundation and planning v5.6+ improvements.

---

*Generated at end of session — May 13, 2026. v5.5 is live and verified. The project is in excellent shape.*

*— Claude Sonnet 4.6*
