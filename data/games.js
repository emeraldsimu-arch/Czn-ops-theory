// ═══════════════════════════════════════════════════════════
// NEXUS v5.3 — GAME DATA
// Task lists, endgame modes, calendar plan
// Last verified: 2026-05-12 (Game8, Prydwen, GameWith, wikis)
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
    dailyLoad: 0.3,    // estimated hours for daily tasks
    weeklyLoad: 1.5,   // estimated hours for weekly tasks
    resetDay: 0,       // 0=Sunday (CZN resets Sunday 18:00 UTC — different from all others)
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

    // Cycle clears — keyed to CONFIG.cycles, NOT the weekly reset
    endgameModes: [
      { id: 'czn_boh',    name: 'Basin of Hyperspace',   cycleKey: 'czn_boh' },
      { id: 'czn_fso',    name: 'Full-Scale Offensive',  cycleKey: 'czn_fso' },
      { id: 'czn_sortie', name: 'Sortie Mode run',       cycleKey: 'czn_sortie' },
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
    resetDay: 1,       // Monday
    resetNote: 'Resets Monday 04:00 server time',

    daily: [
      { t: 'Spend Waveplates on Echo / material farming', tag: 'res', jade: 60 },
      { t: 'Complete daily Guidebook activities (100 Activity Points)', tag: 'res', jade: 0 },
      { t: 'Claim daily login reward', tag: 'res', jade: 0 },
      { t: 'Anniversary event missions', tag: 'event', jade: 0 },
    ],

    weekly: [
      { t: 'Tower of Adversity — full clear (Resonant + Echoing + Hazard Zone)', tag: 'endgame', jade: 800 },
      { t: 'Whimpering Wastes — all Respawning Waters stages', tag: 'endgame', jade: 800 },
      { t: 'Endstate Matrix — Doomsday Cycle phase clear', tag: 'endgame', jade: 150 },
      { t: 'Fantasies of Thousand Gateways — weekly run', tag: 'weekly', jade: 160 },
      { t: 'Weekly tacet discord boss materials ×3 cap', tag: 'mat', jade: 0 },
      { t: 'Cyberpunk Edgerunners collab event', tag: 'event', jade: 0, deadline: 'Jun 7' },
    ],

    endgameModes: [
      { id: 'ww_toa', name: 'Tower of Adversity (all zones)', cycleKey: 'ww_toa' },
      { id: 'ww_ww',  name: 'Whimpering Wastes',             cycleKey: 'ww_ww' },
      { id: 'ww_em',  name: 'Endstate Matrix (v3.3 phase)',  cycleKey: 'ww_em' },
      { id: 'ww_tg',  name: 'Thousand Gateways',             cycleKey: 'ww_tg' },
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
    resetNote: 'Resets Monday 04:00 server time',

    daily: [
      { t: 'Spend Trailblaze Power (stamina)', tag: 'res', jade: 60 },
      { t: 'Complete Daily Training missions (×4)', tag: 'res', jade: 0 },
      { t: 'Collect Assignments', tag: 'res', jade: 0 },
      { t: 'Anniversary event missions', tag: 'event', jade: 0 },
    ],

    weekly: [
      { t: 'Memory of Chaos — full clear (800 SJ, 28-day cycle)', tag: 'endgame', jade: 800 },
      { t: 'Pure Fiction — full clear (800 SJ, 28-day cycle)', tag: 'endgame', jade: 800 },
      { t: 'Apocalyptic Shadow — full clear (800 SJ, 6-week cycle)', tag: 'endgame', jade: 800 },
      { t: 'Anomaly Arbitration — 3-team run (Lone Stardust, 6-week cycle)', tag: 'endgame', jade: 0 },
      { t: 'Echo of War — weekly boss ×3 (material cap)', tag: 'mat', jade: 0 },
      { t: 'Simulated Universe / Currency Wars — Accumulated Points cap', tag: 'weekly', jade: 225 },
      { t: 'Nameless Honor — weekly missions', tag: 'weekly', jade: 0 },
      { t: 'Claim free Huohuo or Robin (ends Jun 1)', tag: 'prog', jade: 0, deadline: 'Jun 1' },
    ],

    endgameModes: [
      { id: 'hsr_moc', name: 'Memory of Chaos',       cycleKey: 'hsr_moc' },
      { id: 'hsr_pf',  name: 'Pure Fiction',           cycleKey: 'hsr_pf' },
      { id: 'hsr_as',  name: 'Apocalyptic Shadow',     cycleKey: 'hsr_as' },
      { id: 'hsr_aa',  name: 'Anomaly Arbitration',    cycleKey: 'hsr_aa' },
    ],
  },

  {
    id: 'sds',
    name: 'SEVEN DEADLY SINS: ORIGIN',
    short: '7DSO',
    priority: 4,
    patch: 'VER 1.2 — ESCANOR UPDATE',
    deadline: 'Aug 26, 2026',
    deadlineSoon: false,
    accent: '--sds',
    dim: '--sds-dim',
    dailyLoad: 0.3,
    weeklyLoad: 1.0,
    resetDay: 1,
    resetNote: 'Resets Monday 07:00 UTC',

    daily: [
      { t: 'Spend 30 Cube Keys — Boss Challenge Abyss modes (10 keys each)', tag: 'res', jade: 0 },
      { t: 'Claim free 20 Cube Key bundle from shop', tag: 'res', jade: 0 },
      { t: 'Complete 4 daily missions (earns Star Fragments + Kingdom Seal)', tag: 'res', jade: 0 },
      { t: 'Claim daily login reward', tag: 'res', jade: 0 },
      { t: 'Daily field gathering (ores, Dandelion Roots before daily cap)', tag: 'mat', jade: 0 },
    ],

    weekly: [
      { t: 'Timespace Junction — Sector 1 clear', tag: 'endgame', jade: 0, cycleKey: 'sds_s1' },
      { t: 'Timespace Junction — Sector 2 clear', tag: 'endgame', jade: 0, cycleKey: 'sds_s2' },
      { t: 'Timespace Junction — Sector 3+4 (unlocks May 20)', tag: 'endgame', jade: 0, cycleKey: 'sds_s3', unlocks: '2026-05-20' },
      { t: 'Timespace Junction — Sector 5+6 (unlocks June 10)', tag: 'endgame', jade: 0, cycleKey: 'sds_s5', unlocks: '2026-06-10' },
      { t: 'Abyss Mode — Galland of Truth (Cursed Pulse set, new v1.2)', tag: 'endgame', jade: 0 },
      { t: 'Abyss Mode — Ferzen Mines Dungeon (new armor sets, new v1.2)', tag: 'endgame', jade: 0 },
      { t: 'Starlight Watch — collect Star Fragments (resets Sunday)', tag: 'weekly', jade: 500 },
      { t: 'Weekly shop — Star Fragment priority purchases', tag: 'mat', jade: 0 },
      { t: 'Check event deadlines', tag: 'event', jade: 0 },
    ],

    // 7DSO cycle clears use rolling unlock dates from CONFIG.cycles
    endgameModes: [
      { id: 'sds_s1', name: 'Timespace Junction S1',   cycleKey: 'sds_s1',  unlocks: '2026-04-29' },
      { id: 'sds_s2', name: 'Timespace Junction S2',   cycleKey: 'sds_s2',  unlocks: '2026-05-06' },
      { id: 'sds_s3', name: 'Timespace Junction S3+4', cycleKey: 'sds_s3',  unlocks: '2026-05-20' },
      { id: 'sds_s5', name: 'Timespace Junction S5+6', cycleKey: 'sds_s5',  unlocks: '2026-06-10' },
    ],
  },
];

// ── ZZZ passive tracker ──
const ZZZ = {
  tasks: [
    { t: 'Daily login & missions', id: 'z0' },
    { t: 'Shiyu Defense',          id: 'z1' },
    { t: 'Hollow Zero / Op. Matrix', id: 'z2' },
    { t: 'Notorious Hunts',        id: 'z3' },
  ]
};

// ── Weekly calendar plan ──
// Used by the Weekly Planner tab
// Load values are adjusted at render time based on live tracker completion state
const WEEK_PLAN = [
  {
    day: 'MON', load: 'medium', focus: 'CZN + HSR Dailies',
    tasks: [
      { l: 'CZN Dailies + Spiral Tower ×2', c: '#e84faa' },
      { l: 'HSR Dailies + Trailblaze Power', c: '#9d7ff5' },
      { l: 'WW Dailies + Echo farm',         c: '#2de8a0' },
    ]
  },
  {
    day: 'TUE', load: 'light', focus: '7DSO + Materials',
    tasks: [
      { l: '7DSO Dailies + Cube Keys spend', c: '#f5a623' },
      { l: 'CZN Spiral Tower ×1',            c: '#e84faa' },
      { l: 'WW Waveplate spend',             c: '#2de8a0' },
    ]
  },
  {
    day: 'WED', load: 'heavy', focus: 'WW Endgame Block',
    tasks: [
      { l: 'WW Tower of Adversity (all zones)', c: '#2de8a0' },
      { l: 'WW Whimpering Wastes',              c: '#2de8a0' },
      { l: 'HSR Daily + Sim Universe',          c: '#9d7ff5' },
      { l: 'CZN Spiral Tower ×1',              c: '#e84faa' },
    ]
  },
  {
    day: 'THU', load: 'medium', focus: 'HSR Endgame Block',
    tasks: [
      { l: 'HSR Memory of Chaos',          c: '#9d7ff5' },
      { l: 'HSR Pure Fiction',             c: '#9d7ff5' },
      { l: '7DSO Timespace Junction S1+2', c: '#f5a623' },
      { l: 'CZN Basin of Hyperspace',      c: '#e84faa' },
    ]
  },
  {
    day: 'FRI', load: 'heavy', focus: 'HSR + 7DSO Endgame',
    tasks: [
      { l: 'HSR Apocalyptic Shadow',       c: '#9d7ff5' },
      { l: 'HSR Anomaly Arbitration',      c: '#9d7ff5' },
      { l: '7DSO Abyss Modes (Galland + Ferzen)', c: '#f5a623' },
      { l: 'WW Endstate Matrix',           c: '#2de8a0' },
    ]
  },
  {
    day: 'SAT', load: 'medium', focus: 'CZN Deep Session',
    tasks: [
      { l: 'CZN Sortie Mode run',          c: '#e84faa' },
      { l: 'CZN Full-Scale Offensive',     c: '#e84faa' },
      { l: 'WW Thousand Gateways',         c: '#2de8a0' },
      { l: 'Mop-up any missed dailies',    c: '#4a5468' },
    ]
  },
  {
    day: 'SUN', load: 'light', focus: 'Catch-up + CZN Weekly Reset',
    tasks: [
      { l: 'CZN weekly reset — Guild Office + Nono Shop', c: '#e84faa' },
      { l: '7DSO Starlight Watch + shop',  c: '#f5a623' },
      { l: 'Any missed endgame modes',     c: '#4a5468' },
      { l: 'Plan next week pulls',         c: '#4a5468' },
    ]
  },
];

if (typeof module !== 'undefined') { module.exports = { GAMES, ZZZ, WEEK_PLAN }; }
