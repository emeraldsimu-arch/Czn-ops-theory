// ═══════════════════════════════════════════════════════════
// NEXUS v5.3 — CONFIG
// ── THIS IS THE ONLY FILE THAT NEEDS UPDATING ON PATCH DAY ──
// Last verified: 2026-05-12
// Next review: 2026-06-01 (earliest patch end — HSR 4.2)
// ═══════════════════════════════════════════════════════════

const CONFIG = {
  version: '5.3',
  lastVerified: '2026-05-12',

  // ── Notion backend IDs ──
  // Update these if databases are recreated
  notion: {
    recordPageId:  '35d32a84-9d1c-8112-9240-e598022bf1c8',
    recordDsId:    'eec1b2bd-1e5b-481d-874a-51d8bc6f4368',
    achDsId:       '96027bdd-f9d5-4f27-8edc-78e147d49177',
    sessionDsId:   '08655493-ca9f-456d-8165-ef138d50b152',
  },

  // ── Patch windows ──
  // When today crosses an 'ends' date the freshness indicator turns amber/red
  // Update ONLY these lines on patch day — nothing else needs to change
  patches: [
    { game: 'czn', version: 'Season 3',  ends: '2026-07-08', resetDay: 0 }, // 0 = Sunday
    { game: 'ww',  version: '3.3',       ends: '2026-06-07', resetDay: 1 }, // 1 = Monday
    { game: 'hsr', version: '4.2',       ends: '2026-06-01', resetDay: 1 },
    { game: 'sds', version: '1.2',       ends: '2026-08-26', resetDay: 1 },
  ],

  // ── Endgame cycle end dates ──
  // Update when a cycle rolls over in-game
  // Types: 'date' = fixed calendar date | 'patch' = uses patch end date | 'weekly' | 'permanent'
  cycles: {
    // HSR
    hsr_moc:  { ends: '2026-05-25', type: 'date',    label: 'Memory of Chaos' },
    hsr_pf:   { ends: '2026-05-11', type: 'date',    label: 'Pure Fiction' },     // resets TODAY
    hsr_as:   { ends: '2026-06-08', type: 'date',    label: 'Apocalyptic Shadow' },
    hsr_aa:   { ends: '2026-06-13', type: 'date',    label: 'Anomaly Arbitration' },
    // WW
    ww_ww:    { ends: '2026-05-11', type: 'date',    label: 'Whimpering Wastes' }, // resets TODAY
    ww_toa:   { ends: '2026-05-25', type: 'date',    label: 'Tower of Adversity (all zones)' },
    ww_em:    { ends: '2026-06-07', type: 'patch',   label: 'Endstate Matrix (v3.3 phase)' },
    ww_tg:    { ends: 'weekly',     type: 'weekly',  label: 'Fantasies of Thousand Gateways' },
    // CZN — seasonal, tied to patch end
    czn_boh:  { ends: '2026-07-08', type: 'patch',   label: 'Basin of Hyperspace' },
    czn_fso:  { ends: '2026-07-08', type: 'patch',   label: 'Full-Scale Offensive' },
    czn_sortie:{ ends: 'weekly',    type: 'weekly',  label: 'Sortie Mode run' },
    // 7DSO — rolling sector unlock
    sds_s1:   { ends: '2026-08-26', type: 'date',    label: 'Timespace Junction S1', unlocks: '2026-04-29' },
    sds_s2:   { ends: '2026-08-26', type: 'date',    label: 'Timespace Junction S2', unlocks: '2026-05-06' },
    sds_s3:   { ends: '2026-08-26', type: 'date',    label: 'Timespace Junction S3+S4', unlocks: '2026-05-20' },
    sds_s5:   { ends: '2026-08-26', type: 'date',    label: 'Timespace Junction S5+S6', unlocks: '2026-06-10' },
  },

  // ── Current events ──
  // tier: 'critical' | 'standard' | 'optional'
  // urgencyScore = tierWeight + daysRemainingWeight (drives Today panel ranking)
  events: [
    {
      id: 'ev_hsr_free',
      game: 'hsr', tier: 'critical',
      name: 'Free Huohuo or Robin selector',
      ends: '2026-06-01',
      desc: 'Free 5-star selector — claim before v4.2 ends',
      currency: { type: 'prog', note: 'One-time free 5-star' }
    },
    {
      id: 'ev_ww_edge',
      game: 'ww', tier: 'critical',
      name: 'Cyberpunk Edgerunners Collab',
      ends: '2026-06-07',
      desc: 'Non-rerun collab — exclusive rewards, will not return',
      currency: { type: 'astrite', amount: 0, note: 'Exclusive cosmetics + Astrite from missions' }
    },
    {
      id: 'ev_ww_anni',
      game: 'ww', tier: 'standard',
      name: '2nd Anniversary Missions',
      ends: '2026-06-07',
      desc: 'Bountiful Waves + login chain — up to 50 confirmed direct pulls',
      currency: { type: 'astrite', amount: 8000, note: '~50 direct pulls from anniversary' }
    },
    {
      id: 'ev_hsr_anni',
      game: 'hsr', tier: 'standard',
      name: '3rd Anniversary Missions',
      ends: '2026-06-01',
      desc: 'Cosmic Data Roaming + login chain',
      currency: { type: 'jade', amount: 3200, note: '~20 pulls from anniversary events' }
    },
    {
      id: 'ev_czn_s3',
      game: 'czn', tier: 'standard',
      name: 'Season 3 SS Edenity Patrol',
      ends: '2026-07-08',
      desc: 'Seasonal event missions',
      currency: { type: 'crystals', amount: 0, note: 'Crystals + Rescue Anchors from missions' }
    },
    {
      id: 'ev_sds_tj',
      game: 'sds', tier: 'critical',
      name: 'Timespace Junction Season 1',
      ends: '2026-08-26',
      desc: 'S3+S4 unlock May 20 — S5+S6 unlock June 10',
      currency: { type: 'fragments', amount: 0, note: 'Star Fragments from sector clears' }
    },
  ],

  // ── Pull & pity system — verified 2026-05-12 ──
  // Sources: Prydwen, Game8, GameWith, official wikis
  pulls: {
    hsr: {
      currency:     'Stellar Jade',
      currencyShort: 'SJ',
      perPull:      160,
      softPity:     74,
      hardPity:     90,
      worstCase:    180,  // lose 50/50 + hit hard pity
      has50_50:     true,
      pityCarries:  true,
      note:         'Soft pity ~74. Hard pity 90. Lose 50/50 = guaranteed next. Pity carries same-type banners.',
    },
    ww: {
      currency:     'Astrite',
      currencyShort: 'AST',
      perPull:      160,
      softPity:     62,   // community-verified; not officially confirmed
      hardPity:     80,
      worstCase:    160,
      has50_50:     true,
      pityCarries:  true,
      note:         'Soft pity ~62–65 (community verified). Hard pity 80. Lose 50/50 = guaranteed next.',
    },
    czn: {
      currency:     'Crystals',
      currencyShort: 'CR',
      perPull:      160,  // 1 Rescue Anchor = 160 Crystals
      softPity:     58,
      hardPity:     70,
      worstCase:    140,
      has50_50:     true,   // Combatant banner only
      pityCarries:  true,
      note:         'Combatant: 50/50, soft pity 58, hard 70. Partner banner: no 50/50, always featured at 70.',
    },
    sds: {
      currency:     'Star Fragments',
      currencyShort: 'SF',
      perPull:      300,  // 300 Star Fragments = 1 Hero Pick-Up Draw Ticket
      softPity:     null, // No confirmed soft pity
      hardPity:     80,   // guarantees an SSR — not necessarily featured
      featuredAt:   120,  // activates doubled rate for featured (not a hard guarantee)
      worstCase:    160,
      has50_50:     false, // different system — see note
      pityCarries:  false, // pity does NOT carry between banners
      note:         'No soft pity. Pull 80 = SSR (may not be featured). Pull 120 = doubled featured rate. NO pity carryover between banners.',
    },
  },

  // ── Currency yields per week (approximate, F2P, current patch) ──
  // Used by the currency dashboard to show "available this week"
  // Update on patch change if reward structure changes significantly
  weeklyYields: {
    hsr: {
      daily:    420,  // 60 SJ/day × 7
      endgame:  800,  // MoC full clear (per 28-day cycle, shown as weekly portion ~200)
      weekly:   225,  // Simulated Universe/Currency Wars weekly cap
      events:   0,    // variable — not hardcoded
      note:     '~645 SJ/week from daily+weekly tasks. Endgame modes yield 800 SJ per 28-day cycle.'
    },
    ww: {
      daily:    420,  // 60 Astrite/day × 7
      endgame:  800,  // Tower of Adversity full clear per cycle
      weekly:   160,  // Thousand Gateways per week
      events:   0,
      note:     '~580 Astrite/week from reliable sources. Anniversary adds up to 8,000 Astrite this patch.'
    },
    czn: {
      daily:    420,  // 60 Crystals/day × 7 (Achievement Schedule)
      endgame:  0,    // Spiral Tower yields Black Mass, not Crystals
      weekly:   200,  // Guild Office + Nono's shop
      events:   0,
      note:     '~620 Crystals/week from dailies + Guild Office.'
    },
    sds: {
      daily:    0,    // Daily missions yield Star Fragments indirectly
      endgame:  500,  // Starlight Watch weekly (max Book of Stars level)
      weekly:   300,  // Weekly shop purchases
      events:   0,
      note:     '~500 SF/week from Starlight Watch. Timespace Junction sector clears add variable SF.'
    },
  },
};

// Make available globally
if (typeof module !== 'undefined') module.exports = CONFIG;
