// ═══════════════════════════════════════════════════════════
// NEXUS v5.5 — ACHIEVEMENTS
// SIGNAL → OPERATIVE → VANGUARD → PHANTOM
// Weekly Dispatches (reset with week key)
// Changes from v5.4:
//   - s_fragment (SDS) → s_static (ZZZ signal achievement)
//   - d_sds dispatch → d_zzz dispatch
//   - v_knight (SDS 100%) → v_proxy (ZZZ 100%)
//   - p_sin "The Sin That Remains" → "The Zero System Has Seen Everything" (CZN)
//   - p_resonance threshold raised to 8 perfect weeks (from v5.4)
//   - v_memory threshold raised to 6 HSR cycle clears (from v5.4)
// ═══════════════════════════════════════════════════════════

const DISPATCHES = [
  { id: 'd_first',   name: 'The First Draw',              condition: 'Check off your first task of the week' },
  { id: 'd_czn',     name: 'Aether Spent, Log Updated',   condition: 'Clear all CZN dailies in one session' },
  { id: 'd_ww',      name: 'Waveplates Accounted For',    condition: 'Clear all WW dailies in one session' },
  { id: 'd_hsr',     name: 'The Express Departs on Time', condition: 'Clear all HSR dailies in one session' },
  { id: 'd_zzz',     name: 'Errands Filed, City Active',  condition: 'Clear all ZZZ dailies in one session' },
  { id: 'd_tower',   name: 'Five Floors, Five Times',     condition: 'Complete all 5 Spiral Tower attempts' },
  { id: 'd_mats',    name: 'Supply Lines Secured',        condition: 'Complete all material tasks across all games' },
  { id: 'd_cycles',  name: 'Three Theaters Cleared',      condition: 'Mark 3+ endgame cycle modes cleared in one week' },
  { id: 'd_75',      name: 'Operational Threshold Met',   condition: 'Hit 75%+ overall weekly completion' },
  { id: 'd_perfect', name: 'Nothing Left Undone',         condition: 'Hit 100% on all tasks across all games' },
];

// NOTE ON HELPER FUNCTIONS:
// totalDone, allDaily, cyclesDone etc. are defined in app.js in the same
// global scope. Stubs below exist only for documentation / isolated testing.
const ACHIEVEMENTS = [

  // ─────────── SIGNAL ───────────
  {
    id: 's_first', tier: 'signal', game: 'CZN', icon: '🃏',
    name: 'A Card Drawn in the Dark',
    flavor: 'Before every run, the deck is unknown. So was this.',
    check: (ws, lt) => totalDone(ws) >= 1,
  },
  {
    id: 's_manifest', tier: 'signal', game: 'CZN', icon: '📋',
    name: 'Manifest Logged',
    flavor: "The SS Nightmare's systems register your activity for the first time.",
    check: (ws, lt) => allDaily('czn', ws),
  },
  {
    id: 's_savedata', tier: 'signal', game: 'CZN', icon: '💾',
    name: 'Save Data: Entry 001',
    flavor: 'Every great run begins with a single entry.',
    check: (ws, lt) => cyclesDone(ws) >= 1,
  },
  {
    id: 's_waveplate', tier: 'signal', game: 'WW', icon: '🌊',
    name: 'Waveplate, Spent',
    flavor: 'The energy flows, the world responds.',
    check: (ws, lt) => allDaily('ww', ws),
  },
  {
    id: 's_express', tier: 'signal', game: 'HSR', icon: '🚂',
    name: 'The Express Boards at Dawn',
    flavor: "The Astral Express doesn't wait — but it waited for you today.",
    check: (ws, lt) => allDaily('hsr', ws),
  },
  {
    // Replaces s_fragment (SDS) — ZZZ signal achievement
    id: 's_static', tier: 'signal', game: 'ZZZ', icon: '📺',
    name: 'Static Cleared, Signal Found',
    flavor: "New Eridu runs on errands and Battery Charge. You've started spending both.",
    check: (ws, lt) => allDaily('zzz', ws),
  },
  {
    id: 's_archive', tier: 'signal', game: 'ALL', icon: '📡',
    name: 'Signal Logged to the Archive',
    flavor: 'NEXUS recorded your words. The archive has begun.',
    check: (ws, lt) => !!(lt.hasNote),
  },
  {
    id: 's_deploy', tier: 'signal', game: 'ALL', icon: '🛰',
    name: 'Deployment Confirmed',
    flavor: 'Presence verified. Operator status: active.',
    check: (ws, lt) => dispatchesDone(ws, lt) >= 5,
  },

  // ─────────── OPERATIVE ───────────
  {
    id: 'o_perfect1', tier: 'operative', game: 'ALL', icon: '⭐',
    name: 'The Run That Counted',
    flavor: 'One week where nothing was left behind.',
    check: (ws, lt) => gPct(ws) >= 100,
  },
  {
    id: 'o_streak7', tier: 'operative', game: 'ALL', icon: '📅',
    name: 'Seven Days on the Grid',
    flavor: "The grid doesn't go dark when you're watching it.",
    check: (ws, lt) => (lt.currentStreak || 0) >= 7,
  },
  {
    id: 'o_theater', tier: 'operative', game: 'ALL', icon: '🎯',
    name: 'One Front Mastered',
    flavor: 'Every theater has a general. You found yours.',
    check: (ws, lt) => GAMES.some(g => gamePct(g, ws) >= 100),
  },
  {
    id: 'o_mats', tier: 'operative', game: 'WW', icon: '⚗️',
    name: 'The Supply Chain Holds',
    flavor: 'Reagents stocked. Echoes farmed. The chain never broke.',
    check: (ws, lt) => allMats(ws),
  },
  {
    id: 'o_dual', tier: 'operative', game: 'ALL', icon: '⚡',
    name: 'Two Signals, One Operator',
    flavor: 'Splitting focus without losing ground.',
    check: (ws, lt) => GAMES.filter(g => gamePct(g, ws) >= 75).length >= 2,
  },
  {
    id: 'o_event', tier: 'operative', game: 'ALL', icon: '🗓',
    name: 'The Window Did Not Close',
    flavor: 'Someone told you it was expiring. You listened.',
    check: (ws, lt) => (lt.criticalEventsCompleted || 0) >= 1,
  },
  {
    id: 'o_spiral', tier: 'operative', game: 'CZN', icon: '🗼',
    name: 'The Tower Remembers the Climb',
    flavor: "The tower doesn't track effort. You do.",
    check: (ws, lt) => spiralFull(ws),
  },
  {
    id: 'o_hsr4', tier: 'operative', game: 'HSR', icon: '💫',
    name: 'Four Paths, All Walked',
    flavor: 'MoC. Pure Fiction. Apocalyptic Shadow. Anomaly Arbitration. Done.',
    check: (ws, lt) => hsrEndgameDone(ws),
  },
  {
    id: 'o_ww2', tier: 'operative', game: 'WW', icon: '🌀',
    name: 'The Wastes Yield',
    flavor: "Two of WW's hardest modes in the same rotation.",
    check: (ws, lt) => wwEndgameDone(ws),
  },

  // ─────────── VANGUARD ───────────
  {
    id: 'v_streak30', tier: 'vanguard', game: 'CZN', icon: '🔥',
    name: 'Epiphany Carved in Iron',
    flavor: 'Epiphanies in CZN arrive through pressure and repetition. So does this.',
    check: (ws, lt) => (lt.longestStreak || 0) >= 30,
  },
  {
    id: 'v_codex', tier: 'vanguard', game: 'CZN', icon: '📖',
    name: 'The Codex Keeps Filling',
    flavor: 'The lore archive that never empties. Neither does your record.',
    check: (ws, lt) => (lt.totalPerfectWeeks || 0) >= 5,
  },
  {
    id: 'v_all4', tier: 'vanguard', game: 'ALL', icon: '🌐',
    name: 'All Theaters Operational',
    flavor: 'Four games. Four fronts. All active simultaneously.',
    check: (ws, lt) => GAMES.filter(g => gamePct(g, ws) >= 75).length >= 4,
  },
  {
    id: 'v_cycles25', tier: 'vanguard', game: 'ALL', icon: '🔄',
    name: 'Twenty-Five Cycles Run',
    flavor: "The modes reset. You don't.",
    check: (ws, lt) => (lt.totalCycleClears || 0) >= 25,
  },
  {
    id: 'v_tacet', tier: 'vanguard', game: 'WW', icon: '🎵',
    name: 'Tacet Discord, Silenced Weekly',
    flavor: "The discord doesn't stop generating. You kept pace with it.",
    check: (ws, lt) => getv(ws, 'ww', 'weekly', 1), // tacet boss ×3 cap — weekly[1] after duplicate removal
  },
  {
    id: 'v_memory', tier: 'vanguard', game: 'HSR', icon: '💭',
    name: 'The Memory Does Not Fade',
    flavor: 'Echoes of War. Echoes of Memory. Echoes of a player who kept clearing.',
    check: (ws, lt) => (lt.hsrLifetimeCycleClears || 0) >= 6,
  },
  {
    id: 'v_screams', tier: 'vanguard', game: 'CZN', icon: '🗼',
    name: 'The Screams Grew Quiet',
    flavor: 'The tower ran out of things to say after four consecutive full clears.',
    check: (ws, lt) => spiralFull(ws) && (lt.totalCycleClears || 0) >= 15,
  },
  {
    // Replaces v_knight (SDS 100%) — ZZZ vanguard achievement
    id: 'v_proxy', tier: 'vanguard', game: 'ZZZ', icon: '📡',
    name: 'The Proxy Doesn\'t Clock Out',
    flavor: "New Eridu runs on proxies who show up. Every errand filed, every Battery Charge spent, every Shiyu floor cleared. The city noticed.",
    check: (ws, lt) => gamePct(GAMES.find(g => g.id === 'zzz'), ws) >= 100,
  },
  {
    id: 'v_season', tier: 'vanguard', game: 'ALL', icon: '📌',
    name: 'Every Dispatch Answered',
    flavor: 'The window opened. You were already through it.',
    check: (ws, lt) => dispatchesDone(ws, lt) >= 10,
  },

  // ─────────── PHANTOM ───────────
  {
    id: 'p_nightmare', tier: 'phantom', game: 'CZN', icon: '🚀',
    name: 'The SS Nightmare Recognizes You',
    flavor: "The ship's systems stopped flagging you as a new operator somewhere around week four. By week ten, Bella had updated your file.",
    check: (ws, lt) => (lt.totalPerfectWeeks || 0) >= 10,
  },
  {
    id: 'p_bella', tier: 'phantom', game: 'CZN', icon: '🤖',
    name: 'Bella Has Stopped Asking',
    flavor: 'The tutorial prompts stopped appearing. The daily check-in music plays before the screen fully loads. You have been here longer than most.',
    check: (ws, lt) => (lt.longestStreak || 0) >= 60,
  },
  {
    id: 'p_express', tier: 'phantom', game: 'HSR', icon: '🌟',
    name: "The Express Doesn't Wait",
    flavor: 'The Astral Express runs on its own schedule. After the third full rotation, you realized you were already aboard before it left.',
    check: (ws, lt) => (lt.hsrLifetimeCycleClears || 0) >= 12,
  },
  {
    id: 'p_trailblaze', tier: 'phantom', game: 'HSR', icon: '✨',
    name: 'The Trailblaze Continues',
    flavor: "The Trailblaze isn't a title the Express gives you. It's what remains after everything else has been stripped away.",
    check: (ws, lt) => (lt.criticalEventsCompleted || 0) >= 4 && (lt.criticalEventsMissed || 0) === 0,
  },
  {
    id: 'p_fractures', tier: 'phantom', game: 'WW', icon: '💎',
    name: 'A Hundred Fractures, All Remembered',
    flavor: 'Memory Fragments are built from the residue of battles that already happened. A hundred cycles means a hundred things worth remembering.',
    check: (ws, lt) => (lt.wwLifetimeCycleClears || 0) >= 100,
  },
  {
    // Replaces p_sin "The Sin That Remains" — reworked to CZN theme
    // Condition unchanged: unlock all other achievements
    id: 'p_zero_system', tier: 'phantom', game: 'CZN', icon: '👑',
    name: 'The Zero System Has Seen Everything',
    flavor: "It doesn't announce when it's finished evaluating you. It just stops asking questions. Every achievement earned. Every front cleared. The Zero System made its assessment.",
    check: (ws, lt) => {
      const ul = lt.unlockedAch || {};
      return Object.keys(ul).length >= ACHIEVEMENTS.length - 1;
    },
  },
  {
    id: 'p_zero', tier: 'phantom', game: 'CZN', icon: '🌌',
    name: 'What the Zero System Keeps',
    flavor: 'The Zero System saves only what it deems worth saving. After a hundred clears across every mode, it has made its decision about you.',
    check: (ws, lt) => (lt.totalCycleClears || 0) >= 100,
  },
  {
    id: 'p_resonance', tier: 'phantom', game: 'WW', icon: '🌀',
    name: "The Resonance Doesn't Ask Permission",
    flavor: "Resonance in Wuthering Waves isn't requested. It doesn't negotiate. After eight perfect weeks across all four games, neither do you.",
    check: (ws, lt) => (lt.totalPerfectWeeks || 0) >= 8 && GAMES.every(g => gamePct(g, ws) >= 100),
  },
];

// ── Helper stubs ──
// Real implementations in app.js resolve via shared global scope at runtime.
function totalDone(ws) { return 0; }
function allDaily(gid, ws) { return false; }
function cyclesDone(ws) { return 0; }
function gPct(ws) { return 0; }
function gamePct(g, ws) { return 0; }
function allMats(ws) { return false; }
function spiralFull(ws) { return false; }
function hsrEndgameDone(ws) { return false; }
function wwEndgameDone(ws) { return false; }
function dispatchesDone(ws, lt) { return 0; }
function getv(ws, gid, type, idx) { return false; }

if (typeof module !== 'undefined') { module.exports = { DISPATCHES, ACHIEVEMENTS }; }
