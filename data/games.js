// ═══════════════════════════════════════════════════════════
// NEXUS v5.6 — GAME DATA
// Task lists, endgame modes, calendar plan
// Last verified: 2026-05-14 (Game8, Icy Veins, Fandom wiki, BitTopup)
// Changes from v5.5:
//   - ww_tg (Fantasies of Thousand Gateways) moved from WW weekly[]
//     to WW endgameModes[] — it is a cycle clear, not a weekly task
//   - WW weekly[] reduced from 3 to 2 items accordingly
// ═══════════════════════════════════════════════════════════

const GAMES = [
  {
    id: 'czn',
    name: 'CHAOS ZERO NIGHTMARE',
    short: 'CZN',
    priority: 1,
    patch: 'SEASON 3 — A SONG RIPPLING THROUGH THE STARS',
    deadline: 'Jul 8, 2026',
    deadlineSoon: false,
    accent: '--czn',
    dim: '--czn-dim',
    dailyLoad: 0.3,
    weeklyLoad: 1.5,
    resetDay: 0,
    resetNote: 'Resets Sunday 18:00 UTC',

    daily: [
      { t: 'Achievement Schedule — earn 100 points (60 Crystals)', tag: 'res', jade: 60 },
      { t: 'Arkhianon Supply — daily missions (battle pass EXP)', tag: 'res', jade: 0 },
      { t: 'Policy Office — implement policies before cap (refreshes 4×/day)', tag: 'res', jade: 0 },
      { t: 'Garden Cafe — claim daily Aether recovery (80 instant or 60 item)', tag: 'res', jade: 0 },
      { t: 'Spend Aether on Simulation runs (×2 multiplier available)', tag: 'res', jade: 0 },
    ],

    weekly: [
      { t: 'Spiral Tower of Screams — attempt 1/5', tag: 'endgame', jade: 0 },
      { t: 'Spiral Tower of Screams — attempt 2/5', tag: 'endgame', jade: 0 },
      { t: 'Spiral Tower of Screams — attempt 3/5', tag: 'endgame', jade: 0 },
      { t: 'Spiral Tower of Screams — attempt 4/5', tag: 'endgame', jade: 0 },
      { t: 'Spiral Tower of Screams — attempt 5/5', tag: 'endgame', jade: 0 },
      { t: 'Simulation Challenge — weekly boss ×3 (Potential Materials)', tag: 'endgame', jade: 0 },
      { t: 'Guild Office — weekly bounty missions (Crystals of Discord)', tag: 'weekly', jade: 200 },
      { t: "Nono's Shop — weekly priority purchases (Multidimensional Alignment Material)", tag: 'mat', jade: 0 },
      { t: 'Check character / deck upgrade progress', tag: 'prog', jade: 0 },
      { t: 'Review event deadlines & limited content', tag: 'event', jade: 0 },
    ],

    endgameModes: [
      { id: 'czn_boh',    name: 'Basin of Hyperspace',  cycleKey: 'czn_boh' },
      { id: 'czn_fso',    name: 'Full-Scale Offensive', cycleKey: 'czn_fso' },
      { id: 'czn_sortie', name: 'Sortie Mode run',      cycleKey: 'czn_sortie' },
    ],
  },

  {
    id: 'ww',
    name: 'WUTHERING WAVES',
    short: 'WW',
    priority: 2,
    patch: 'VER 3.3 — 2ND ANNIVERSARY',
    deadline: 'Jun 7, 2026',
    deadlineSoon: true,
    accent: '--ww',
    dim: '--ww-dim',
    dailyLoad: 0.4,
    weeklyLoad: 2.0,
    resetDay: 1,
    resetNote: 'Resets Monday 04:00 UTC+8 (20:00 UTC Sunday)',

    daily: [
      { t: 'Spend Waveplates on Echo / material farming', tag: 'res', jade: 60 },
      { t: 'Complete daily Guidebook activities (100 Activity Points)', tag: 'res', jade: 0 },
      { t: 'Claim daily login reward', tag: 'res', jade: 0 },
      { t: 'Anniversary event missions', tag: 'event', jade: 0 },
    ],

    weekly: [
      // ww_tg moved to endgameModes — it is a cycle clear with a weekly reset,
      // not a weekly task. Keeping it here caused it to be counted twice
      // (once in weekly tasks, once in urgency/cycle tracking).
      { t: 'Weekly tacet discord boss materials ×3 cap', tag: 'mat', jade: 0 },
      { t: 'Cyberpunk Edgerunners collab event', tag: 'event', jade: 0, deadline: 'Jun 7' },
    ],

    // ww_tg added here — weekly type in config means it resets with the WW
    // weekly key (Monday 20:00 UTC), consistent with all other weekly cycles
    endgameModes: [
      { id: 'ww_toa', name: 'Tower of Adversity (all zones incl. Hazard Zone)', cycleKey: 'ww_toa' },
      { id: 'ww_ww',  name: 'Whimpering Wastes',                                cycleKey: 'ww_ww'  },
      { id: 'ww_em',  name: 'Endstate Matrix (v3.3 phase)',                     cycleKey: 'ww_em'  },
      { id: 'ww_tg',  name: 'Fantasies of Thousand Gateways',                   cycleKey: 'ww_tg'  },
    ],
  },

  {
    id: 'hsr',
    name: 'HONKAI: STAR RAIL',
    short: 'HSR',
    priority: 3,
    patch: 'VER 4.2 — 3RD ANNIVERSARY',
    deadline: 'Jun 1, 2026',
    deadlineSoon: true,
    accent: '--hsr',
    dim: '--hsr-dim',
    dailyLoad: 0.4,
    weeklyLoad: 2.5,
    resetDay: 1,
    resetNote: 'Resets Monday 04:00 UTC-5 (10:00 UTC)',

    daily: [
      { t: 'Spend Trailblaze Power (stamina)', tag: 'res', jade: 60 },
      { t: 'Complete Daily Training missions (×4)', tag: 'res', jade: 0 },
      { t: 'Collect Assignments', tag: 'res', jade: 0 },
      { t: 'Anniversary event missions', tag: 'event', jade: 0 },
    ],

    weekly: [
      { t: 'Echo of War — weekly boss ×3 (material cap)', tag: 'mat', jade: 0 },
      { t: 'Simulated Universe / Currency Wars — Accumulated Points cap', tag: 'weekly', jade: 225 },
      { t: 'Nameless Honor — weekly missions', tag: 'weekly', jade: 0 },
      { t: 'Claim free Huohuo or Robin (ends Jun 1)', tag: 'prog', jade: 0, deadline: 'Jun 1' },
    ],

    endgameModes: [
      { id: 'hsr_moc', name: 'Memory of Chaos',    cycleKey: 'hsr_moc' },
      { id: 'hsr_pf',  name: 'Pure Fiction',        cycleKey: 'hsr_pf'  },
      { id: 'hsr_as',  name: 'Apocalyptic Shadow',  cycleKey: 'hsr_as'  },
      { id: 'hsr_aa',  name: 'Anomaly Arbitration', cycleKey: 'hsr_aa'  },
    ],
  },

  {
    id: 'zzz',
    name: 'ZENLESS ZONE ZERO',
    short: 'ZZZ',
    priority: 4,
    patch: 'VER 2.8 — NEW ERIDAN SUNSET',
    deadline: 'Jun 10, 2026',
    deadlineSoon: false,
    accent: '--zzz',
    dim: '--zzz-dim',
    dailyLoad: 0.2,
    weeklyLoad: 1.5,
    resetDay: 1,
    resetNote: 'Resets Monday 04:00 UTC-5 (10:00 UTC)',

    daily: [
      { t: 'Daily Errands ×4 — Login, Coffee, Scratch Cards, Video Store (60 Polychrome)', tag: 'res', jade: 60 },
      { t: 'Spend Battery Charge in Combat Simulation / Routine Cleanup', tag: 'res', jade: 0 },
      { t: 'HoYoLAB daily check-in (30 Polychrome)', tag: 'res', jade: 0 },
      { t: 'Trust invites — 3 Agents daily (Trust Level progress)', tag: 'prog', jade: 0 },
    ],

    weekly: [
      { t: 'Notorious Hunts — 3 free attempts (resets Monday)', tag: 'mat', jade: 0 },
      { t: 'Ridu Weekly — complete all tasks (105 Polychrome)', tag: 'weekly', jade: 105 },
      { t: 'New Eridu City Fund — weekly mission progress', tag: 'weekly', jade: 0 },
      { t: 'v2.8 event missions — Operation: Save Bootopia', tag: 'event', jade: 0, deadline: 'Jun 10' },
    ],

    endgameModes: [
      { id: 'zzz_shiyu',  name: 'Shiyu Defense / Critical Node', cycleKey: 'zzz_shiyu'  },
      { id: 'zzz_deadly', name: 'Deadly Assault',                cycleKey: 'zzz_deadly' },
      { id: 'zzz_hollow', name: 'Hollow Zero / Operation Matrix',cycleKey: 'zzz_hollow' },
    ],
  },
];

// ── Weekly calendar plan ──
const WEEK_PLAN = [
  {
    day: 'MON', load: 'medium', focus: 'CZN + HSR Dailies',
    tasks: [
      { l: 'CZN Dailies + Spiral Tower ×2', c: '#e84faa' },
      { l: 'HSR Dailies + Trailblaze Power', c: '#9d7ff5' },
      { l: 'WW Dailies + Echo farm',         c: '#2de8a0' },
      { l: 'ZZZ Errands + Battery Charge',   c: '#4ab8f0' },
    ]
  },
  {
    day: 'TUE', load: 'light', focus: 'ZZZ + Materials',
    tasks: [
      { l: 'ZZZ Notorious Hunts + Ridu Weekly', c: '#4ab8f0' },
      { l: 'CZN Spiral Tower ×1',               c: '#e84faa' },
      { l: 'WW Waveplate spend',                c: '#2de8a0' },
    ]
  },
  {
    day: 'WED', load: 'heavy', focus: 'WW Endgame Block',
    tasks: [
      { l: 'WW Tower of Adversity (all zones incl. Hazard Zone)', c: '#2de8a0' },
      { l: 'WW Whimpering Wastes',              c: '#2de8a0' },
      { l: 'HSR Daily + Sim Universe',          c: '#9d7ff5' },
      { l: 'CZN Spiral Tower ×1',               c: '#e84faa' },
    ]
  },
  {
    day: 'THU', load: 'medium', focus: 'HSR Endgame Block',
    tasks: [
      { l: 'HSR Memory of Chaos',     c: '#9d7ff5' },
      { l: 'HSR Pure Fiction',        c: '#9d7ff5' },
      { l: 'ZZZ Hollow Zero run',     c: '#4ab8f0' },
      { l: 'CZN Basin of Hyperspace', c: '#e84faa' },
    ]
  },
  {
    day: 'FRI', load: 'heavy', focus: 'HSR + ZZZ Endgame',
    tasks: [
      { l: 'HSR Apocalyptic Shadow',             c: '#9d7ff5' },
      { l: 'HSR Anomaly Arbitration',            c: '#9d7ff5' },
      { l: 'ZZZ Shiyu Defense / Deadly Assault', c: '#4ab8f0' },
      { l: 'WW Endstate Matrix',                 c: '#2de8a0' },
    ]
  },
  {
    day: 'SAT', load: 'medium', focus: 'CZN Deep Session',
    tasks: [
      { l: 'CZN Sortie Mode run',      c: '#e84faa' },
      { l: 'CZN Full-Scale Offensive', c: '#e84faa' },
      { l: 'WW Thousand Gateways',     c: '#2de8a0' },
      { l: 'Mop-up any missed dailies',c: '#4a5468' },
    ]
  },
  {
    day: 'SUN', load: 'light', focus: 'Catch-up + CZN Weekly Reset',
    tasks: [
      { l: 'CZN weekly reset — Guild Office + Nono Shop', c: '#e84faa' },
      { l: 'ZZZ Trust invites + event check',             c: '#4ab8f0' },
      { l: 'Any missed endgame modes',                    c: '#4a5468' },
      { l: 'Plan next week pulls',                        c: '#4a5468' },
    ]
  },
];

if (typeof module !== 'undefined') { module.exports = { GAMES, WEEK_PLAN }; }
