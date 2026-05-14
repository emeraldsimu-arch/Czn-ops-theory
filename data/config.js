// ═══════════════════════════════════════════════════════════
// NEXUS v5.6 — CONFIG
// ── THIS IS THE ONLY FILE THAT NEEDS UPDATING ON PATCH DAY ──
// Last verified: 2026-05-14
// Next review: 2026-06-01 (earliest patch end — HSR 4.2)
// Changes from v5.5:
//   - resetTimes block added — per-game daily/weekly UTC reset hours
//   - All four games on America server (UTC-5): daily reset 10:00 UTC
//   - WW uses UTC+8 server: daily reset 20:00 UTC
//   - CZN: no daily reset (weekly only), Sunday 18:00 UTC
// ═══════════════════════════════════════════════════════════

const CONFIG = {
  version: '5.6',
  lastVerified: '2026-05-14',

  // ── Notion backend IDs ──
  notion: {
    recordPageId:  '35d32a84-9d1c-8112-9240-e598022bf1c8',
    recordDsId:    'eec1b2bd-1e5b-481d-874a-51d8bc6f4368',
    achDsId:       '96027bdd-f9d5-4f27-8edc-78e147d49177',
    sessionDsId:   '08655493-ca9f-456d-8165-ef138d50b152',
  },

  // ── Per-game reset times (UTC) ──
  // America server (UTC-5): 4AM local = 10:00 UTC
  // WW uses UTC+8 server:   4AM local = 20:00 UTC (previous calendar day)
  // CZN: no daily reset; weekly resets Sunday 18:00 UTC
  // weeklyDay: 0=Sunday, 1=Monday
  resetTimes: {
    hsr: { dailyUTC: 10, weeklyDay: 1, weeklyUTC: 10 },
    ww:  { dailyUTC: 20, weeklyDay: 1, weeklyUTC: 20 },
    zzz: { dailyUTC: 10, weeklyDay: 1, weeklyUTC: 10 },
    czn: { dailyUTC: null, weeklyDay: 0, weeklyUTC: 18 },
  },

  // ── Patch windows ──
  patches: [
    { game: 'czn', version: 'Season 3', ends: '2026-07-08', resetDay: 0 },
    { game: 'ww',  version: '3.3',      ends: '2026-06-07', resetDay: 1 },
    { game: 'hsr', version: '4.2',      ends: '2026-06-01', resetDay: 1 },
    { game: 'zzz', version: '2.8',      ends: '2026-06-10', resetDay: 1 },
  ],

  // ── Endgame cycle end dates ──
  // Types: 'date' | 'patch' | 'weekly' | 'permanent'
  cycles: {
    // HSR
    hsr_moc:    { ends: '2026-05-25', type: 'date',   label: 'Memory of Chaos' },
    hsr_pf:     { ends: '2026-06-22', type: 'date',   label: 'Pure Fiction' },
    hsr_as:     { ends: '2026-06-08', type: 'date',   label: 'Apocalyptic Shadow' },
    hsr_aa:     { ends: '2026-06-13', type: 'date',   label: 'Anomaly Arbitration' },
    // WW
    ww_toa:     { ends: '2026-05-25', type: 'date',   label: 'Tower of Adversity (all zones incl. Hazard Zone)' },
    ww_ww:      { ends: '2026-06-08', type: 'date',   label: 'Whimpering Wastes' },
    ww_em:      { ends: '2026-06-07', type: 'patch',  label: 'Endstate Matrix (v3.3 phase)' },
    ww_tg:      { ends: 'weekly',     type: 'weekly', label: 'Fantasies of Thousand Gateways' },
    // CZN
    czn_boh:    { ends: '2026-07-08', type: 'patch',  label: 'Basin of Hyperspace' },
    czn_fso:    { ends: '2026-07-08', type: 'patch',  label: 'Full-Scale Offensive' },
    czn_sortie: { ends: 'weekly',     type: 'weekly', label: 'Sortie Mode run' },
    // ZZZ
    zzz_shiyu:  { ends: '2026-05-27', type: 'date',   label: 'Shiyu Defense / Critical Node' },
    zzz_deadly: { ends: '2026-05-22', type: 'date',   label: 'Deadly Assault' },
    zzz_hollow: { ends: 'weekly',     type: 'weekly', label: 'Hollow Zero / Operation Matrix' },
  },

  // ── Current events ──
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
      id: 'ev_zzz_28',
      game: 'zzz', tier: 'standard',
      name: 'v2.8 New Eridan Sunset Events',
      ends: '2026-06-10',
      desc: 'Operation: Save Bootopia + login chain — free Bangboo + Encrypted Master Tapes',
      currency: { type: 'polychrome', amount: 0, note: 'Free Booltergeist Bangboo + event Polychrome' }
    },
  ],

  // ── Pull & pity system — verified 2026-05-13 ──
  pulls: {
    hsr: {
      currency:      'Stellar Jade',
      currencyShort: 'SJ',
      perPull:       160,
      softPity:      74,
      hardPity:      90,
      worstCase:     180,
      has50_50:      true,
      pityCarries:   true,
      note: 'Soft pity ~74. Hard pity 90. Lose 50/50 = guaranteed next. Pity carries same-type banners.',
    },
    ww: {
      currency:      'Astrite',
      currencyShort: 'AST',
      perPull:       160,
      softPity:      62,
      hardPity:      80,
      worstCase:     160,
      has50_50:      true,
      pityCarries:   true,
      note: 'Soft pity ~62–65 (community verified). Hard pity 80. Lose 50/50 = guaranteed next.',
    },
    czn: {
      currency:      'Crystals',
      currencyShort: 'CR',
      perPull:       160,
      softPity:      58,
      hardPity:      70,
      worstCase:     140,
      has50_50:      true,
      pityCarries:   true,
      note: 'Combatant: 50/50, soft pity 58, hard 70. Partner banner: no 50/50, always featured at 70.',
    },
    zzz: {
      currency:      'Polychrome',
      currencyShort: 'PC',
      perPull:       160,
      softPity:      75,
      hardPity:      90,
      worstCase:     180,
      has50_50:      true,
      pityCarries:   true,
      note: 'Soft pity ~75. Hard pity 90. Lose 50/50 = guaranteed next. Master Tapes for limited banners; Encrypted Tapes for standard only.',
    },
  },

  // ── Currency yields per week (approximate, F2P, current patch) ──
  weeklyYields: {
    hsr: {
      daily:   420,
      endgame: 800,
      weekly:  225,
      events:  0,
      note: '~645 SJ/week from daily+weekly tasks. Endgame modes yield 800 SJ per 28-day cycle.'
    },
    ww: {
      daily:   420,
      endgame: 800,
      weekly:  160,
      events:  0,
      note: '~580 Astrite/week. Anniversary adds up to 8,000 Astrite this patch.'
    },
    czn: {
      daily:   420,
      endgame: 0,
      weekly:  200,
      events:  0,
      note: '~620 Crystals/week from dailies + Guild Office.'
    },
    zzz: {
      daily:   420,
      endgame: 335,
      weekly:  105,
      events:  0,
      note: '~775 PC/week F2P: 420 dailies + 105 Ridu Weekly + 360 Shiyu (bi-wkly) + 150 Deadly Assault (bi-wkly) + 160 Hollow Zero.'
    },
  },
};

if (typeof module !== 'undefined') module.exports = CONFIG;
