// NEXUS v5.7 — APP.JS
// All application logic, state management, Notion sync
// GitHub: Emereldsimu-arch/nexus
// Changes from v5.6:
//   - checkCycleFreshness() added — scans CONFIG.cycles for date-type entries
//     expiring within 7 days and flags lastVerified staleness (>14 days)
//   - checkFreshness() updated — now calls checkCycleFreshness() and merges
//     cycle expiry warnings into the existing freshness banner system
//   - Version bump to 5.7
// ═══════════════════════════════════════════════════════════

// ── STORAGE KEYS ──
const SK      = 'nexus_v53';
const LTK     = 'nexus_v53_lt';
const NK      = 'nexus_v53_n';
const CNK     = 'nexus_v53_cn';
const QNK     = 'nexus_v53_qn';
const STRK    = 'nexus_v53_str';
const OUTBOXK = 'nexus_v53_ob';
const PREVWK  = 'nexus_v53_pw';
const CURK    = 'nexus_v53_cur';
const PITYK   = 'nexus_v53_pity';
const FDK     = 'nexus_v53_fd';  // freshness dismiss key

// ── WEEK KEY ──
// Accepts optional gameId to handle CZN's Sunday 18:00 UTC reset.
// For all other games, anchors to Monday 00:00 UTC.
// For CZN, anchors to Sunday 18:00 UTC — if current UTC time is past
// Sunday 18:00 this week, we're in CZN's current week; otherwise previous.
function wk(gameId) {
  const now = new Date();

  if (gameId === 'czn') {
    // CZN resets Sunday 18:00 UTC
    // Find the most recent Sunday 18:00 UTC on or before now
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 18, 0, 0));
    const dayOfWeek = d.getUTCDay(); // 0=Sun
    // Roll back to Sunday
    const daysToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    // Actually: go back to the most recent Sunday
    const daysSinceSunday = dayOfWeek === 0 ? 0 : dayOfWeek;
    d.setUTCDate(d.getUTCDate() - daysSinceSunday);
    // If we haven't reached 18:00 UTC yet on this Sunday, use previous Sunday
    const nowUtcSunday18 = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 18, 0, 0));
    nowUtcSunday18.setUTCDate(nowUtcSunday18.getUTCDate() - daysSinceSunday);
    if (now < nowUtcSunday18) {
      d.setUTCDate(d.getUTCDate() - 7);
    }
    return 'WCZN' + d.toISOString().slice(0, 10);
  }

  // Default: Monday-anchored week key (HSR, WW, ZZZ, general)
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const day = d.getUTCDay();
  d.setUTCDate(d.getUTCDate() + (day === 0 ? -6 : 1) - day);
  return 'W' + d.toISOString().slice(0, 10);
}

// ── DAILY KEY ──
// Returns a per-game day key that respects the game's actual daily reset time.
// If current UTC time is before the game's dailyResetUTC hour, we are still
// in the previous calendar day for that game's purposes.
// CZN has no daily reset (dailyUTC: null) — uses wk('czn') instead.
// Format: 'D2026-05-14-hsr'
function dk(gameId) {
  const rt = CONFIG.resetTimes[gameId];

  // CZN has no daily reset — daily tasks use the weekly key
  if (!rt || rt.dailyUTC === null) return wk('czn');

  const now = new Date();
  const utcHour = now.getUTCHours();
  const utcDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  // If before reset hour, we're still on the previous game-day
  if (utcHour < rt.dailyUTC) {
    utcDate.setUTCDate(utcDate.getUTCDate() - 1);
  }

  return 'D' + utcDate.toISOString().slice(0, 10) + '-' + gameId;
}

// ── STATE HELPERS ──
const ld  = () => { try { return JSON.parse(localStorage.getItem(SK) || '{}'); } catch { return {}; } };
const sv  = a  => { try { localStorage.setItem(SK, JSON.stringify(a)); } catch {} };

// ws() — weekly state for a game (weeklies + cycle clears + collapse prefs)
// Uses wk(gameId) so CZN gets Sunday-anchored key
const ws  = (gameId) => {
  const a = ld();
  const w = wk(gameId);
  if (!a[w]) a[w] = {};
  return a[w];
};

// wsFull() — returns the full weekly state object for the current general week
// Used by helpers that need to read across all games (gPct, totalDone, etc.)
const wsFull = () => {
  const a = ld(); const w = wk();
  if (!a[w]) a[w] = {};
  return a[w];
};

// ds() — daily state for a game, keyed by dk(gameId)
const ds = (gameId) => {
  const a = ld();
  const d = dk(gameId);
  if (!a[d]) a[d] = {};
  return a[d];
};

const getLT  = () => { try { return JSON.parse(localStorage.getItem(LTK) || '{}'); } catch { return {}; } };
const saveLT = o => { try { localStorage.setItem(LTK, JSON.stringify(o)); } catch {} };
const getCur  = () => { try { return JSON.parse(localStorage.getItem(CURK) || '{}'); } catch { return {}; } };
const saveCur = o => { try { localStorage.setItem(CURK, JSON.stringify(o)); } catch {} };
const getPity  = () => { try { return JSON.parse(localStorage.getItem(PITYK) || '{}'); } catch { return {}; } };
const savePity = o => { try { localStorage.setItem(PITYK, JSON.stringify(o)); } catch {} };

// setv() — write a task state value
// type 'daily' uses dk(gid), type 'weekly' uses wk(gid)
function setv(gid, type, idx, val) {
  const a = ld();
  const key = type === 'daily' ? dk(gid) : wk(gid);
  if (!a[key]) a[key] = {};
  if (!a[key][gid]) a[key][gid] = {};
  if (!a[key][gid][type]) a[key][gid][type] = {};
  a[key][gid][type][idx] = val;
  sv(a);
}

// getv() — read a task state value
// type 'daily' reads from dk(gid), type 'weekly' reads from wk(gid)
function getv(s, gid, type, idx) {
  if (type === 'daily') {
    // s is not used for daily — always read live from dk() storage
    const a = ld();
    const key = dk(gid);
    return !!(a[key]?.[gid]?.['daily']?.[idx]);
  }
  return !!(s[gid]?.[type]?.[idx]);
}

function setCy(k, val) {
  const a = ld(); const cyKey = 'CY_' + k;
  if (!a[cyKey]) a[cyKey] = {};
  a[cyKey].cleared = val;
  a[cyKey].date = new Date().toISOString().slice(0, 10);
  sv(a);
}
function getCy(k) {
  const a = ld(); const cyKey = 'CY_' + k;
  if (!a[cyKey]?.cleared) return false;
  const cycleConf = CONFIG.cycles[k];
  if (!cycleConf) return false;
  if (cycleConf.type === 'weekly') return !!(a[cyKey]?.weekKey === wk());
  const clearDate = new Date(a[cyKey].date);
  const endsDate  = new Date(cycleConf.ends === 'weekly' ? '2099-01-01' : cycleConf.ends);
  const today     = new Date();
  return clearDate <= endsDate && today <= endsDate;
}
function setCyWeekly(k, val) {
  const a = ld(); const cyKey = 'CY_' + k;
  a[cyKey] = { cleared: val, weekKey: wk(), date: new Date().toISOString().slice(0, 10) };
  sv(a);
}

// ── STREAK ──
function updateStreak() {
  const today = new Date().toDateString();
  try {
    let s = JSON.parse(localStorage.getItem(STRK) || '{"last":"","count":0}');
    const y = new Date(); y.setDate(y.getDate() - 1);
    if (s.last === today) return s.count;
    s.count = s.last === y.toDateString() ? s.count + 1 : 1;
    s.last = today;
    localStorage.setItem(STRK, JSON.stringify(s));
    return s.count;
  } catch { return 1; }
}
function getStreak() { try { return JSON.parse(localStorage.getItem(STRK) || '{"count":0}').count; } catch { return 0; } }

// ── COMPUTED HELPERS ──
// These read across all games and task types.
// Daily tasks read from dk() storage directly via getv().
// Weekly tasks read from the passed state object (wsFull()).

function totalDone(s) {
  let d = 0;
  GAMES.forEach(g => {
    g.daily.forEach((_,i)  => { if (getv(s, g.id, 'daily',  i)) d++; });
    g.weekly.forEach((_,i) => { if (getv(s, g.id, 'weekly', i)) d++; });
  });
  return d;
}
function allDaily(gid, s) {
  return GAMES.find(g => g.id === gid).daily.every((_,i) => getv(s, gid, 'daily', i));
}
function spiralFull(s) { return [0,1,2,3,4].every(i => getv(s, 'czn', 'weekly', i)); }

// hsrEndgameDone — all 4 HSR endgame cycle clears
function hsrEndgameDone() {
  return getCy('hsr_moc') && getCy('hsr_pf') && getCy('hsr_as') && getCy('hsr_aa');
}

// wwEndgameDone — all 4 WW endgame cycle clears (ww_tg added in v5.6)
function wwEndgameDone() {
  return getCy('ww_toa') && getCy('ww_ww') && getCy('ww_em') && getCy('ww_tg');
}

// zzzEndgameDone — all 3 ZZZ endgame cycle clears
function zzzEndgameDone() {
  return getCy('zzz_shiyu') && getCy('zzz_deadly') && getCy('zzz_hollow');
}

function allMats(s) {
  let t = 0, d = 0;
  GAMES.forEach(g => {
    [...g.daily, ...g.weekly].forEach((tk, i) => {
      if (tk.tag === 'mat') {
        t++;
        const type = i < g.daily.length ? 'daily' : 'weekly';
        const idx  = i < g.daily.length ? i : i - g.daily.length;
        if (getv(s, g.id, type, idx)) d++;
      }
    });
  });
  return t > 0 && d >= t;
}
function gPct(s) {
  let t = 0, d = 0;
  GAMES.forEach(g => {
    g.daily.forEach((_,i)  => { t++; if (getv(s,g.id,'daily',i))  d++; });
    g.weekly.forEach((_,i) => { t++; if (getv(s,g.id,'weekly',i)) d++; });
  });
  return t > 0 ? Math.round(d / t * 100) : 0;
}
function gamePct(g, s) {
  let t = g.daily.length + g.weekly.length, d = 0;
  g.daily.forEach((_,i)  => { if (getv(s,g.id,'daily',i))  d++; });
  g.weekly.forEach((_,i) => { if (getv(s,g.id,'weekly',i)) d++; });
  return t > 0 ? Math.round(d / t * 100) : 0;
}
function cyclesDone() {
  let d = 0;
  GAMES.forEach(g => g.endgameModes.forEach(m => { if (getCy(m.cycleKey)) d++; }));
  return d;
}
function dispatchesDone(s, lt) {
  return DISPATCHES.filter(d => checkDispatch(d, s, lt)).length;
}
function checkDispatch(d, s, lt) {
  switch (d.id) {
    case 'd_first':   return totalDone(s) >= 1;
    case 'd_czn':     return allDaily('czn', s);
    case 'd_ww':      return allDaily('ww', s);
    case 'd_hsr':     return allDaily('hsr', s);
    case 'd_zzz':     return allDaily('zzz', s);
    case 'd_tower':   return spiralFull(s);
    case 'd_mats':    return allMats(s);
    case 'd_cycles':  return cyclesDone() >= 3;
    case 'd_75':      return gPct(s) >= 75;
    case 'd_perfect': return gPct(s) >= 100;
    default: return false;
  }
}

// ── CYCLE DATE HELPERS ──
function daysUntilCycleEnds(cycleKey) {
  const c = CONFIG.cycles[cycleKey];
  if (!c || c.ends === 'weekly') return null;
  const today = new Date(); today.setHours(0,0,0,0);
  const end   = new Date(c.ends); end.setHours(0,0,0,0);
  return Math.ceil((end - today) / (1000*60*60*24));
}
function isCycleUnlocked(cycleKey) {
  const c = CONFIG.cycles[cycleKey];
  if (!c?.unlocks) return true;
  return new Date() >= new Date(c.unlocks);
}
function cycleResetLabel(cycleKey) {
  const d = daysUntilCycleEnds(cycleKey);
  if (d === null) return 'Weekly';
  if (d < 0)     return 'Reset';
  if (d === 0)   return 'Resets TODAY';
  return d + 'd left';
}

// ── CYCLE FRESHNESS CHECK ──
// Scans CONFIG.cycles for date-type entries expiring within 7 days.
// Also checks if lastVerified is more than 14 days old.
// Returns: { stale: bool, warnings: string[], soonest: {label, days} | null }
// Owner: checkFreshness() only. Pure read — no side effects.
function checkCycleFreshness() {
  const today = new Date(); today.setHours(0,0,0,0);
  const warnings = [];
  let soonest = null;

  // Check lastVerified staleness
  if (CONFIG.lastVerified) {
    const verified = new Date(CONFIG.lastVerified); verified.setHours(0,0,0,0);
    const daysSince = Math.floor((today - verified) / (1000*60*60*24));
    if (daysSince > 14) {
      warnings.push(`Data last verified ${daysSince}d ago — review recommended`);
    }
  }

  // Scan all date-type cycles for upcoming expirations
  Object.entries(CONFIG.cycles).forEach(([key, cycle]) => {
    if (cycle.type !== 'date') return;
    const end = new Date(cycle.ends); end.setHours(0,0,0,0);
    const days = Math.ceil((end - today) / (1000*60*60*24));

    // Already expired — flag as stale
    if (days < 0) {
      // Find which game this cycle belongs to for a better label
      const game = GAMES.find(g => g.endgameModes.some(m => m.cycleKey === key));
      const gameLabel = game ? game.short : key.split('_')[0].toUpperCase();
      warnings.push(`${gameLabel} ${cycle.label} date expired — update config`);
    } else if (days <= 7) {
      const game = GAMES.find(g => g.endgameModes.some(m => m.cycleKey === key));
      const gameLabel = game ? game.short : key.split('_')[0].toUpperCase();
      const msg = days === 0
        ? `${gameLabel} ${cycle.label} resets TODAY`
        : `${gameLabel} ${cycle.label} resets in ${days}d`;
      warnings.push(msg);
      if (!soonest || days < soonest.days) {
        soonest = { label: msg, days };
      }
    }
  });

  const hasExpired = warnings.some(w => w.includes('expired'));
  return { stale: hasExpired, warnings, soonest };
}

// ── FRESHNESS DISMISS ──
// dismissFreshBanner() — called when operator taps ✕ on amber banner.
// Calculates dismissedUntil = soonest expiring cycle date minus 1 day.
// Banner re-appears automatically on that date (day-before re-alert).
// Red (stale) banners are never dismissable — this only applies to amber.
function dismissFreshBanner() {
  const today = new Date(); today.setHours(0,0,0,0);

  // Find soonest expiring date-type cycle within warning window
  let soonestDate = null;
  Object.values(CONFIG.cycles).forEach(cycle => {
    if (cycle.type !== 'date') return;
    const end = new Date(cycle.ends); end.setHours(0,0,0,0);
    const days = Math.ceil((end - today) / (1000*60*60*24));
    if (days >= 0 && days <= 7) {
      if (!soonestDate || end < soonestDate) soonestDate = end;
    }
  });
  // Also check patch windows
  CONFIG.patches.forEach(p => {
    const end = new Date(p.ends); end.setHours(0,0,0,0);
    const diff = Math.floor((end - today) / (1000*60*60*24));
    if (diff >= 0 && diff <= 7) {
      if (!soonestDate || end < soonestDate) soonestDate = end;
    }
  });

  // dismissedUntil = day before soonest expiry (re-alert fires that day)
  // If nothing found, dismiss for 1 day as fallback
  let dismissedUntil;
  if (soonestDate) {
    const reAlert = new Date(soonestDate);
    reAlert.setUTCDate(reAlert.getUTCDate() - 1);
    dismissedUntil = reAlert.toISOString().slice(0, 10);
  } else {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    dismissedUntil = tomorrow.toISOString().slice(0, 10);
  }

  try { localStorage.setItem(FDK, JSON.stringify({ dismissedUntil })); } catch {}
  document.getElementById('freshBanner').className = 'fresh-banner';
  const fDot = document.getElementById('fstatDot');
  const fMsg = document.getElementById('fstatMsg');
  if (fDot) fDot.style.background = 'var(--ok)';
  if (fMsg) fMsg.textContent = 'Data current · ' + CONFIG.lastVerified;
}

// ── FRESHNESS CHECK ──
// v5.7: incorporates cycle-level freshness via checkCycleFreshness().
// v5.7: amber banners are dismissable — dismissed state stored in FDK.
//       Re-alert fires automatically the day before the soonest expiry.
//       Red (stale/expired) banners always show — never suppressable.
// Priority: patch expired (red) > cycle expired (red) >
//           patch ending soon (amber, dismissable) >
//           cycle ending soon (amber, dismissable) > all clear (green)
function checkFreshness() {
  const today = new Date(); today.setHours(0,0,0,0);
  let stale = false, warn = false, msg = '';
  let soonestDiff = Infinity; let soonestPatch = null;

  // Check patch windows
  CONFIG.patches.forEach(p => {
    const end  = new Date(p.ends); end.setHours(0,0,0,0);
    const diff = Math.floor((end - today) / (1000*60*60*24));
    if (diff < 0) { stale = true; msg = `${p.game.toUpperCase()} v${p.version} data may be outdated`; }
    else if (diff <= 7 && diff < soonestDiff) { soonestDiff = diff; soonestPatch = p; }
  });

  // Check cycle-level freshness
  const cf = checkCycleFreshness();
  if (!stale && cf.stale) {
    stale = true;
    msg = cf.warnings.find(w => w.includes('expired')) || 'Cycle data may be outdated';
  }

  if (!stale && soonestPatch) { warn = true; msg = `${soonestPatch.game.toUpperCase()} patch ends in ${soonestDiff}d`; }
  if (!stale && !warn && cf.soonest) { warn = true; msg = cf.soonest.label; }
  if (!stale && warn && cf.warnings.length > 1) msg += ` (+${cf.warnings.length - 1} more)`;

  const banner = document.getElementById('freshBanner');
  const fDot   = document.getElementById('fstatDot');
  const fMsg   = document.getElementById('fstatMsg');
  const dismissBtn = document.getElementById('freshDismiss');

  if (stale) {
    // Red — always show, never dismissable
    banner.className = 'fresh-banner show stale';
    document.getElementById('freshMsg').textContent = msg + ' — request a data update.';
    if (dismissBtn) dismissBtn.style.display = 'none';
    if (fDot) fDot.style.background = 'var(--danger)';
    if (fMsg) fMsg.textContent = 'Data stale';
  } else if (warn) {
    // Amber — check dismiss state before showing
    let dismissed = false;
    try {
      const fd = JSON.parse(localStorage.getItem(FDK) || '{}');
      if (fd.dismissedUntil) {
        const until = new Date(fd.dismissedUntil); until.setHours(0,0,0,0);
        dismissed = today < until;
      }
    } catch {}

    if (dismissed) {
      // Still within dismiss window — stay hidden
      banner.className = 'fresh-banner';
      if (fDot) fDot.style.background = 'var(--ok)';
      if (fMsg) fMsg.textContent = 'Data current · ' + CONFIG.lastVerified;
    } else {
      // Dismiss window expired or never set — show banner
      // Day-before re-alert: no dismiss button (must act now)
      const isDayBefore = cf.soonest?.days === 1 || soonestDiff === 1;
      banner.className = 'fresh-banner show';
      document.getElementById('freshMsg').textContent = msg + (isDayBefore ? ' — update needed before next reset.' : ' — verify dates before next session.');
      if (dismissBtn) dismissBtn.style.display = isDayBefore ? 'none' : 'flex';
      if (fDot) fDot.style.background = 'var(--warn)';
      if (fMsg) fMsg.textContent = isDayBefore ? 'Update needed' : 'Check recommended';
    }
  } else {
    // All clear
    banner.className = 'fresh-banner';
    if (dismissBtn) dismissBtn.style.display = 'none';
    if (fDot) fDot.style.background = 'var(--ok)';
    if (fMsg) fMsg.textContent = 'Data current · ' + CONFIG.lastVerified;
  }
}

// ── TODAY PANEL ──
function buildTodayPanel() {
  const s     = wsFull();
  const today = new Date();
  const dow   = today.getDay();
  const di    = dow === 0 ? 6 : dow - 1;
  const items = [];
  CONFIG.events.filter(e => e.tier === 'critical').forEach(e => {
    const diff = Math.floor((new Date(e.ends) - today) / (1000*60*60*24));
    if (diff >= 0 && diff <= 3) {
      const g = GAMES.find(x => x.id === e.game);
      items.push({ p:1, game: g?.short || e.game.toUpperCase(), text: e.name, meta: `⚠ ${diff}d left`, color: `var(--${e.game})` });
    }
  });
  GAMES.forEach(g => {
    g.endgameModes.forEach(m => {
      if (!getCy(m.cycleKey) && isCycleUnlocked(m.cycleKey)) {
        const d = daysUntilCycleEnds(m.cycleKey);
        if (d !== null && d <= 1) {
          items.push({ p:2, game: g.short, text: m.name, meta: d <= 0 ? 'Resets TODAY' : 'Resets TOMORROW', color: `var(--${g.id})` });
        }
      }
    });
  });
  const plan = WEEK_PLAN[di];
  if (plan) items.push({ p:3, game: 'NEXUS', text: plan.focus, meta: plan.load + ' session', color: 'var(--text-dim)' });
  const shown = items.slice(0, 3);
  const d = today.toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric' });
  let html = `<div class="today-panel"><div class="today-hdr"><div class="today-title">Today's Priority</div><div class="today-date">${d.toUpperCase()}</div></div><div class="today-items">`;
  if (!shown.length) {
    html += `<div class="today-empty">Open the planner tab to set today's focus.</div>`;
  } else {
    const labels = ['01 FIRST','02 THEN','03 IF TIME'];
    shown.forEach((item, i) => {
      html += `<div class="today-item p${item.p}">
        <span class="today-rank">${labels[i]}</span>
        <span class="today-game-tag" style="background:${item.color}22;color:${item.color}">${item.game}</span>
        <span class="today-text">${item.text}</span>
        <span class="today-meta">${item.meta}</span>
      </div>`;
    });
  }
  html += '</div></div>';
  document.getElementById('todayPanel').innerHTML = html;
}

// ── DISPATCH BAR ──
function updateDispatchBar() {
  const s = wsFull(); const lt = getLT();
  const done  = DISPATCHES.filter(d => checkDispatch(d, s, lt)).length;
  const total = DISPATCHES.length;
  const pct   = Math.round(done / total * 100);
  document.getElementById('dFill').style.width = pct + '%';
  document.getElementById('dCount').textContent = done + ' / ' + total;
  const pips = document.getElementById('dPips');
  pips.innerHTML = DISPATCHES.map((_,i) => `<div class="pip${i<done?' earned':''}"></div>`).join('');
  const tab = document.getElementById('achTab');
  if (done > 0 && done < total) tab.innerHTML = `Achievements <span class="dispatch-badge">${done}</span>`;
  else if (done >= total)        tab.innerHTML = `Achievements <span class="dispatch-badge" style="background:var(--ok)">✓</span>`;
  else                           tab.textContent = 'Achievements';
}

// ── URGENCY BANNER ──
// v5.6: items sorted by days remaining ascending — most urgent first.
// Weekly cycles (null days) always sort to the bottom.
function buildUrgency() {
  const today = new Date(); today.setHours(0,0,0,0);
  const lt    = getLT();
  const isFirstLoad = (lt.totalTasksCompleted || 0) === 0;
  const urgencyThreshold = isFirstLoad ? 14 : 999;

  // Collect all uncleared, unlocked cycle modes across all games
  const allItems = [];
  GAMES.forEach(g => {
    g.endgameModes.forEach(m => {
      if (!getCy(m.cycleKey) && isCycleUnlocked(m.cycleKey)) {
        const d = daysUntilCycleEnds(m.cycleKey);
        if (isFirstLoad && d !== null && d > urgencyThreshold) return;
        allItems.push({ game: g, mode: m, days: d });
      }
    });
  });

  // Sort: known day counts ascending, nulls (weekly) at the end
  allItems.sort((a, b) => {
    if (a.days === null && b.days === null) return 0;
    if (a.days === null) return 1;
    if (b.days === null) return -1;
    return a.days - b.days;
  });

  const top = allItems.slice(0, 5);
  let html = '';
  top.forEach(({ game: g, mode: m, days: d }) => {
    const cls = d !== null && d <= 2 ? '' : 'warn';
    const txt = d === null ? 'Weekly' : d <= 0 ? 'TODAY!' : d + 'd left';
    html += `<div class="urg-card ${cls}">
      <div class="udot"></div>
      <div class="ubody"><div class="ugame">${g.short}</div><div class="umode">${m.name}</div></div>
      <div class="udays">${txt}</div>
    </div>`;
  });

  if (!top.length) {
    html = `<div class="urg-card clear"><div class="udot"></div><div class="ubody"><div class="ugame">Status</div><div class="umode">All cycle modes cleared</div></div><div class="udays" style="color:var(--ok)">✓ CLEAR</div></div>`;
  }
  document.getElementById('urgRow').innerHTML = html;
}

// ── GAME CARDS ──
// v5.5: Cycle clear rows render ABOVE weekly tasks for reduced friction
function buildCard(g, s) {
  const a   = `var(${g.accent})`, d = `var(${g.dim})`;
  const all = ld(); const w = wk(g.id);
  const hasColPref = all[w]?._col?.[g.id] !== undefined;
  const collapsed  = hasColPref ? !!all[w]._col[g.id] : g.priority !== 1;
  let dd = 0, wd = 0;
  g.daily.forEach((_,i)  => { if (getv(s,g.id,'daily',i))  dd++; });
  g.weekly.forEach((_,i) => { if (getv(s,g.id,'weekly',i)) wd++; });
  const total = g.daily.length + g.weekly.length;
  const done  = dd + wd;
  const pct   = Math.round(done / total * 100);
  const isComplete = pct >= 100;

  const dlHTML    = g.deadline ? `<div class="g-dl ${g.deadlineSoon?'soon':'ok'}">${g.deadlineSoon?'⚠ ':''}Ends ${g.deadline}</div>` : '';
  const resetHTML = g.resetNote ? `<div class="g-reset-note">${g.resetNote}</div>` : '';
  const doneBadge = isComplete  ? `<span class="g-done-badge">✓ COMPLETE</span>` : '';
  const patch     = CONFIG.patches.find(p => p.game === g.id);
  const staleHTML = patch && new Date(patch.ends) < new Date()
    ? `<div class="card-fresh-warn show">⚠ Patch data may be outdated</div>`
    : `<div class="card-fresh-warn"></div>`;

  const dailyHTML = g.daily.map((t, i) => {
    const ok = getv(s, g.id, 'daily', i);
    return `<div class="trow${ok?' done':''}" onclick="togT('${g.id}','daily',${i},this,event)">
      <div class="tcheck"></div><span class="ttext">${t.t}</span>
      ${t.deadline ? `<span class="tdl">↯ ${t.deadline}</span>` : ''}
      <span class="ttag tag-${t.tag}">${t.tag}</span></div>`;
  }).join('');

  const weeklyHTML = g.weekly.map((t, i) => {
    const ok = getv(s, g.id, 'weekly', i);
    const isLocked = t.unlocks && new Date() < new Date(t.unlocks);
    return `<div class="trow${ok?' done':''}${isLocked?' locked':''}" onclick="${isLocked?'':` togT('${g.id}','weekly',${i},this,event)`}">
      <div class="tcheck"></div><span class="ttext">${t.t}</span>
      ${t.deadline ? `<span class="tdl">↯ ${t.deadline}</span>` : ''}
      ${isLocked ? `<span class="tdl">Unlocks ${t.unlocks}</span>` : ''}
      <span class="ttag tag-${t.tag}">${t.tag}</span></div>`;
  }).join('');

  const cdone = g.endgameModes.filter(m => getCy(m.cycleKey)).length;
  const cycleHTML = g.endgameModes.map(m => {
    const cl       = getCy(m.cycleKey);
    const unlocked = isCycleUnlocked(m.cycleKey);
    const lbl      = cycleResetLabel(m.cycleKey);
    const daysLeft = daysUntilCycleEnds(m.cycleKey);
    const urgent   = !cl && daysLeft !== null && daysLeft <= 2;
    return `<div class="cycle-row${cl?' cleared':''}${!unlocked?' locked':''}" onclick="${unlocked?`togCy('${m.cycleKey}',this)`:''}">
      <div class="ccheck"></div>
      <span class="ctext">${m.name}</span>
      <span class="cbadge" style="${urgent?'color:var(--danger)':''}">${lbl}</span>
      ${!unlocked ? `<span class="cunlock">Unlocks ${CONFIG.cycles[m.cycleKey]?.unlocks}</span>` : ''}
    </div>`;
  }).join('');

  return `<div class="game-card${collapsed?' collapsed':''}${isComplete?' done-card':''}" data-game="${g.id}" id="card-${g.id}" style="--accent:${a};--accent-dim:${d}">
    <div class="game-top" onclick="togCol('${g.id}')">
      <div class="gtop-row">
        <div>
          <div class="g-pri">P${g.priority} Priority</div>
          <div class="g-name">${g.name}</div>
          <div class="g-patch">${g.patch}</div>
          ${dlHTML}${resetHTML}
        </div>
        <div class="g-right">
          <div>
            <div class="g-pct-num">${pct}%</div>
            <div class="g-pct-sub">${done}/${total}</div>
            ${doneBadge}
          </div>
          <div class="carr">▾</div>
        </div>
      </div>
      <div class="pbar"><div class="pfill" style="width:${pct}%;background:${a}"></div></div>
    </div>
    ${staleHTML}
    <div class="task-body">
      <div class="tsec">Daily <span class="tcnt">${dd}/${g.daily.length}</span></div>
      <div class="tlist">${dailyHTML}</div>
      <div class="sdiv"></div>
      <div class="tsec">Endgame Cycle Clears <span class="tcnt" id="cyc-${g.id}">${cdone}/${g.endgameModes.length}</span></div>
      ${cycleHTML}
      <div class="sdiv"></div>
      <div class="tsec">Weekly / Resources <span class="tcnt">${wd}/${g.weekly.length}</span></div>
      <div class="tlist">${weeklyHTML}</div>
    </div>
  </div>`;
}

// ── INTERACTIONS ──
function togT(gid, type, idx, el, ev) {
  if (el.classList.contains('locked')) return;
  const r = document.createElement('div'); r.className = 'ripple-el';
  const rect = el.getBoundingClientRect();
  r.style.left = (ev.clientX - rect.left - 10) + 'px';
  r.style.top  = (ev.clientY - rect.top  - 10) + 'px';
  el.appendChild(r); setTimeout(() => r.remove(), 400);

  const s   = wsFull();
  const cur = getv(s, gid, type, idx);
  setv(gid, type, idx, !cur);
  el.classList.toggle('done');

  const g    = GAMES.find(x => x.id === gid);
  const s2   = wsFull();
  const pct  = gamePct(g, s2);
  const done = g.daily.filter((_,i) => getv(s2,g.id,'daily',i)).length +
               g.weekly.filter((_,i) => getv(s2,g.id,'weekly',i)).length;
  const card = document.getElementById('card-' + gid);
  if (card) {
    const pn = card.querySelector('.g-pct-num'); if (pn) pn.textContent = pct + '%';
    const ps = card.querySelector('.g-pct-sub'); if (ps) ps.textContent = done + '/' + (g.daily.length + g.weekly.length);
    const pf = card.querySelector('.pfill');     if (pf) pf.style.width = pct + '%';
    if (pct >= 100) card.classList.add('done-card');
    else            card.classList.remove('done-card');
  }
  updateGlobals(); buildUrgency(); buildTodayPanel(); checkAllAchievements(); updateLT();
  updateCurrencyEarned(gid);
}

// togCy() — sole owner of lifetime cycle clear increments
// Increments only when transitioning not-cleared → cleared.
// Undo (cleared → not-cleared) does not decrement lifetime stats.
function togCy(k, el) {
  const cyConf   = CONFIG.cycles[k];
  const isWeekly = cyConf?.type === 'weekly';
  const wasCleared = getCy(k);
  const nowCleared = !wasCleared;

  if (isWeekly) setCyWeekly(k, nowCleared);
  else          setCy(k, nowCleared);

  el.classList.toggle('cleared');

  // Increment lifetime cycle clears only on new clear, never on undo
  if (nowCleared) {
    const lt = getLT();
    const g  = GAMES.find(g => g.endgameModes.some(m => m.cycleKey === k));
    if (g) {
      const gameKey = g.id + 'LifetimeCycleClears';
      lt[gameKey] = (lt[gameKey] || 0) + 1;
    }
    lt.totalCycleClears = (lt.totalCycleClears || 0) + 1;
    saveLT(lt);
  }

  buildUrgency(); buildTodayPanel(); updateGlobals(); checkAllAchievements(); updateLT();
  const g = GAMES.find(g => g.endgameModes.some(m => m.cycleKey === k));
  if (g) {
    const cnt  = g.endgameModes.filter(m => getCy(m.cycleKey)).length;
    const cnt2 = document.getElementById('cyc-' + g.id);
    if (cnt2) cnt2.textContent = cnt + '/' + g.endgameModes.length;
  }
}

function togCol(gid) {
  const a = ld(); const w = wk(gid);
  if (!a[w]) a[w] = {}; if (!a[w]._col) a[w]._col = {};
  a[w]._col[gid] = !a[w]._col[gid]; sv(a);
  document.getElementById('card-' + gid)?.classList.toggle('collapsed');
}

function updateGlobals() {
  const s = wsFull(); const p = gPct(s);
  document.getElementById('gbarFill').style.width = p + '%';
  document.getElementById('gbarPct').textContent  = p + '%';
  updateDispatchBar();
}

function confirmReset() {
  if (confirm("Reset all this week's checks? Lifetime stats, achievements, and cycle clears carry over.")) {
    const a = ld(); delete a[wk()]; sv(a); render();
  }
}

// ── DEBUG: CYCLE RESET ──
function confirmCycleReset() {
  if (confirm('DEBUG: Reset all cycle clear states? Weekly tasks and lifetime stats are unaffected.')) {
    const a = ld();
    Object.keys(a).forEach(k => { if (k.startsWith('CY_')) delete a[k]; });
    sv(a);
    render();
    setSyncStatus('ok', 'Cycle states reset');
  }
}

function initDebugLongPress() {
  const el = document.getElementById('footerVer');
  if (!el) return;
  let timer = null;
  el.addEventListener('touchstart', () => { timer = setTimeout(confirmCycleReset, 600); }, { passive: true });
  el.addEventListener('touchend',   () => clearTimeout(timer));
  el.addEventListener('touchmove',  () => clearTimeout(timer));
  el.addEventListener('mousedown',  () => { timer = setTimeout(confirmCycleReset, 600); });
  el.addEventListener('mouseup',    () => clearTimeout(timer));
  el.addEventListener('mouseleave', () => clearTimeout(timer));
}

// ── CURRENCY DASHBOARD ──
function buildCurrencySection() {
  const cur  = getCur();
  const pity = getPity();
  const s    = wsFull();
  let html = `<div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--text-dim);margin-bottom:14px;padding:10px 14px;background:var(--panel);border:1px solid var(--border);border-radius:6px;line-height:1.6">
    Enter your current in-game balance for each tracker. Tap the number to edit.<br>
    <span style="color:var(--text-mid)">Balance → pulls calculated automatically · Pity tracks pulls since last 5-star</span>
  </div>`;
  html += '<div class="currency-grid">';
  GAMES.forEach(g => {
    const pull    = CONFIG.pulls[g.id];
    if (!pull) return;
    const balance = cur[g.id] || 0;
    const pulls   = Math.floor(balance / pull.perPull);
    const pityVal = pity[g.id] || 0;
    const barPct  = Math.min(100, Math.round(balance / (pull.hardPity * pull.perPull) * 100));
    const weekly  = CONFIG.weeklyYields[g.id];
    const earnedSoFar = calcEarned(g.id, s);
    html += `<div class="currency-card" style="--accent:var(${g.accent})">
      <div class="cc-header">
        <span class="cc-game">${g.short}</span>
        <span class="cc-currency">${pull.currency}</span>
      </div>
      <div class="cc-total-row">
        <input class="cc-input" type="number" min="0" value="${balance}"
          onchange="updateCurrency('${g.id}',this.value)"
          oninput="updateCurrency('${g.id}',this.value)"
          placeholder="0" title="Enter your current ${pull.currency} balance"/>
        <span class="cc-of">/ ${pull.hardPity * pull.perPull}</span>
        <span style="flex:1"></span>
        <span class="cc-pulls" id="cpulls-${g.id}">${pulls} pulls</span>
      </div>
      <div class="cc-bar"><div class="cc-bar-fill" id="cbar-${g.id}" style="width:${barPct}%"></div></div>
      <div class="cc-pity-row">
        <span class="cc-pity-label">Current pity</span>
        <input class="cc-pity-input" type="number" min="0" max="${pull.hardPity}" value="${pityVal}"
          onchange="updatePity('${g.id}',this.value)"
          title="Pulls since last 5-star"/>
        <span class="cc-pity-label">/ ${pull.hardPity} hard</span>
        <span style="flex:1"></span>
        <span class="cc-pity-label">${pull.softPity?'Soft @'+pull.softPity:'No soft pity'}</span>
      </div>
      <div class="cc-earned">
        <span class="cc-earned-label">Earned from tasks this week</span>
        <span class="cc-earned-val">+${earnedSoFar} ${pull.currencyShort}</span>
      </div>
      <div class="cc-earned" style="margin-top:4px">
        <span class="cc-earned-label">Available this patch (~weekly)</span>
        <span class="cc-earned-val">~${weekly.daily + weekly.weekly} ${pull.currencyShort}/wk</span>
      </div>
      <div class="cc-note">${pull.note}</div>
    </div>`;
  });
  html += '</div>';
  document.getElementById('currencySection').innerHTML = html;
}

function calcEarned(gid, s) {
  const g = GAMES.find(x => x.id === gid); let total = 0;
  g.daily.forEach((t,i)  => { if (getv(s,g.id,'daily',i)  && t.jade) total += t.jade; });
  g.weekly.forEach((t,i) => { if (getv(s,g.id,'weekly',i) && t.jade) total += t.jade; });
  return total;
}

// updateCurrency() — v5.6: now updates pull count display live
// Single source of truth for balance → pulls calculation
function updateCurrency(gid, val) {
  const cur = getCur();
  cur[gid] = Math.max(0, parseInt(val) || 0);
  saveCur(cur);
  const pull = CONFIG.pulls[gid]; if (!pull) return;

  // Update progress bar
  const barPct = Math.min(100, Math.round(cur[gid] / (pull.hardPity * pull.perPull) * 100));
  const barEl  = document.getElementById('cbar-' + gid);
  if (barEl) barEl.style.width = barPct + '%';

  // Update pull count display — this was missing in v5.5
  const pulls    = Math.floor(cur[gid] / pull.perPull);
  const pullsEl  = document.getElementById('cpulls-' + gid);
  if (pullsEl) pullsEl.textContent = pulls + ' pulls';
}

function updatePity(gid, val) {
  const p = getPity(); p[gid] = Math.max(0, parseInt(val) || 0); savePity(p);
}
function updateCurrencyEarned(gid) {
  const s = wsFull(); const g = GAMES.find(x => x.id === gid);
  const pull = CONFIG.pulls[gid]; if (!pull) return;
  const earned = calcEarned(gid, s);
  document.querySelectorAll('.currency-card').forEach(card => {
    const gameEl = card.querySelector('.cc-game');
    if (gameEl && gameEl.textContent === g.short) {
      const earnedEl = card.querySelectorAll('.cc-earned-val')[0];
      if (earnedEl) earnedEl.textContent = '+' + earned + ' ' + pull.currencyShort;
    }
  });
}

// ── LIFETIME STATS ──
// v5.6: updateLT() no longer writes cycle clear counts or perfect week counts.
// Those are now owned exclusively by togCy() and checkWeekRollover() respectively.
// updateLT() is responsible for: streak, task totals, dailyCompletions, hasNote, Notion sync.
function updateLT() {
  const s  = wsFull();
  const lt = getLT();
  if (!lt.deployDate) lt.deployDate = new Date().toISOString().slice(0, 10);

  // Task totals — Math.max is correct: never decrements on uncheck
  lt.totalTasksCompleted = Math.max(lt.totalTasksCompleted || 0, totalDone(s));

  // Streak
  lt.currentStreak = getStreak();
  lt.longestStreak = Math.max(lt.longestStreak || 0, getStreak());

  // Daily completions per game — used by o_event and p_trailblaze achievements
  // Stores a flat count of distinct days each game's dailies were fully completed
  // this week. Resets when the week key changes (new Monday).
  // Structure: lt.dailyCompletions = { _week: 'W2026-05-11', czn: 0, hsr: 2, ww: 1, zzz: 3 }
  // Owner: updateLT() only. Single flat integer per game — safe to read directly
  // in achievement check functions.
  const weekKey = wk();
  if (!lt.dailyCompletions || lt.dailyCompletions._week !== weekKey) {
    // New week — reset all counts
    lt.dailyCompletions = { _week: weekKey };
  }
  // Seen-today tracking lives in a parallel key to prevent double-counting
  // within the same session. Uses dk() as the unique day identifier per game.
  if (!lt._dcSeen) lt._dcSeen = {};
  GAMES.forEach(g => {
    const dayKey = dk(g.id);
    if (allDaily(g.id, s) && lt._dcSeen[g.id] !== dayKey) {
      lt._dcSeen[g.id] = dayKey;
      lt.dailyCompletions[g.id] = (lt.dailyCompletions[g.id] || 0) + 1;
    }
  });

  lt.hasNote = !!(localStorage.getItem(NK)?.length > 3 || localStorage.getItem(QNK)?.length > 3);
  saveLT(lt);
  syncLTToNotion(lt);
}

// Helper for achievements — returns count of distinct days a game's dailies were completed this week
// Reads from flat lt.dailyCompletions[gid] integer — safe to call from achievement checks
function getDailyCompletionCount(gid) {
  const lt = getLT();
  const weekKey = wk();
  if (!lt.dailyCompletions || lt.dailyCompletions._week !== weekKey) return 0;
  return lt.dailyCompletions[gid] || 0;
}

// ── NOTION SYNC ──
let syncTimer = null;
function syncLTToNotion(lt) {
  clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    setSyncStatus('pending', 'Syncing with NEXUS archive…');
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 500,
          mcp_servers: [{ type: 'url', url: 'https://mcp.notion.com/mcp', name: 'notion' }],
          messages: [{ role: 'user', content:
            `Update the NEXUS operator record page ID ${CONFIG.notion.recordPageId} with these values:
Total Tasks Completed: ${lt.totalTasksCompleted||0}
Total Cycle Clears: ${lt.totalCycleClears||0}
CZN Lifetime Cycle Clears: ${lt.cznLifetimeCycleClears||0}
WW Lifetime Cycle Clears: ${lt.wwLifetimeCycleClears||0}
HSR Lifetime Cycle Clears: ${lt.hsrLifetimeCycleClears||0}
ZZZ Lifetime Cycle Clears: ${lt.zzzLifetimeCycleClears||0}
Current Login Streak: ${lt.currentStreak||0}
Longest Login Streak: ${lt.longestStreak||0}
Total Perfect Weeks: ${lt.totalPerfectWeeks||0}
Total Dispatches Earned: ${lt.totalDispatchesEarned||0}
Weeks Tracked: ${lt.weeksTracked||0}
Highest Tier Reached: ${lt.highestTier||'SIGNAL'}
SIGNAL Achievements: ${Object.values(lt.unlockedAch||{}).filter(t=>t==='signal').length}
OPERATIVE Achievements: ${Object.values(lt.unlockedAch||{}).filter(t=>t==='operative').length}
VANGUARD Achievements: ${Object.values(lt.unlockedAch||{}).filter(t=>t==='vanguard').length}
PHANTOM Achievements: ${Object.values(lt.unlockedAch||{}).filter(t=>t==='phantom').length}
Update those properties now.` }]
        })
      });
      if (res.ok) { setSyncStatus('ok', 'Synced ' + new Date().toLocaleTimeString()); flushOutbox(); }
      else throw new Error('API ' + res.status);
    } catch (e) {
      setSyncStatus('err', 'Sync failed — saved locally');
      queueOutbox({ type: 'lt', data: lt, ts: Date.now() });
    }
  }, 2500);
}

async function pushAchToNotion(ach) {
  try {
    await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514', max_tokens: 400,
        mcp_servers: [{ type: 'url', url: 'https://mcp.notion.com/mcp', name: 'notion' }],
        messages: [{ role: 'user', content:
          `Create a new page in the NEXUS_ACHIEVEMENTS database (data source ID: ${CONFIG.notion.achDsId}):
Achievement: ${ach.name}
Achievement ID: ${ach.id}
Tier: ${ach.tier.toUpperCase()}
Game: ${ach.game}
Unlock Date: ${new Date().toISOString().slice(0,10)}
Week Earned: ${wk()}
Flavor Text: ${ach.flavor}
Create now.` }]
      })
    });
  } catch { queueOutbox({ type: 'ach', data: ach, ts: Date.now() }); }
}

async function pushSessionToNotion(weekKey, stats) {
  try {
    await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514', max_tokens: 400,
        mcp_servers: [{ type: 'url', url: 'https://mcp.notion.com/mcp', name: 'notion' }],
        messages: [{ role: 'user', content:
          `Create a new page in the NEXUS_SESSIONS database (data source ID: ${CONFIG.notion.sessionDsId}):
Week: ${weekKey}
Week Start Date: ${weekKey.replace('W','')}
Overall Completion: ${(stats.pct||0)/100}
Dispatches Earned: ${stats.dispatches||0}
Perfect Week: ${(stats.pct||0) >= 100}
Cycle Clears This Week: ${stats.cycles||0}
Highlights: ${stats.highlight||''}
Create now.` }]
      })
    });
  } catch { queueOutbox({ type: 'session', data: { weekKey, stats }, ts: Date.now() }); }
}

function queueOutbox(item) {
  const ob = JSON.parse(localStorage.getItem(OUTBOXK)||'[]');
  if (ob.length >= 20) { setSyncStatus('err', ob.length + ' items pending — check connection'); return; }
  ob.push(item); localStorage.setItem(OUTBOXK, JSON.stringify(ob));
  setSyncStatus('err', ob.length + ' item' + (ob.length>1?'s':'') + ' pending sync');
}

async function flushOutbox() {
  const ob = JSON.parse(localStorage.getItem(OUTBOXK)||'[]');
  if (!ob.length) return;
  const remaining = [];
  for (const item of ob) {
    try {
      if (item.type === 'ach')     await pushAchToNotion(item.data);
      if (item.type === 'session') await pushSessionToNotion(item.data.weekKey, item.data.stats);
      if (item.type === 'lt')      await syncLTToNotion(item.data);
    } catch { remaining.push(item); }
  }
  localStorage.setItem(OUTBOXK, JSON.stringify(remaining));
  if (!remaining.length) setSyncStatus('ok', 'All items synced');
}

// v5.6: Sync status starts idle — no stuck "Connecting to archive" message.
// Status only transitions to pending/ok/err when a sync actually fires.
function setSyncStatus(state, msg) {
  const dot = document.getElementById('syncDot');
  const m   = document.getElementById('syncMsg');
  if (!dot || !m) return;
  dot.className = 'sync-dot' + (state==='pending'?' pending':state==='err'?' err':'');
  m.textContent = msg;
  if (state === 'ok') {
    dot.style.transform = 'scale(1.6)';
    setTimeout(() => { dot.style.transform = 'scale(1)'; }, 600);
  }
}

function initSyncStatus() {
  const lt = getLT();
  const hasActivity = (lt.totalTasksCompleted || 0) > 0;
  setSyncStatus(
    hasActivity ? 'idle' : 'idle',
    hasActivity ? 'Complete a task to sync' : 'Complete a task to begin syncing'
  );
}

// ── ACHIEVEMENT CHECKING ──
let achTimer = null;
const ACH_DEBOUNCE_SIGNAL    = 5000;
const ACH_DEBOUNCE_OPERATIVE = 60000;
const ACH_MIN_TASKS = 2;

function checkAllAchievements() {
  clearTimeout(achTimer);
  const s  = wsFull(); const lt = getLT();
  const couldFireOperative = ACHIEVEMENTS.some(a => a.tier !== 'signal' && !lt.unlockedAch?.[a.id]);
  const debounce = couldFireOperative ? ACH_DEBOUNCE_OPERATIVE : ACH_DEBOUNCE_SIGNAL;
  achTimer = setTimeout(() => {
    const s2 = wsFull(); const lt2 = getLT();
    if (!lt2.unlockedAch) lt2.unlockedAch = {};
    const currentTasks = totalDone(s2);
    let changed = false;
    ACHIEVEMENTS.forEach(a => {
      if (!lt2.unlockedAch[a.id]) {
        if (a.tier !== 'signal' && currentTasks < ACH_MIN_TASKS) return;
        try {
          if (a.check(s2, lt2)) {
            lt2.unlockedAch[a.id] = a.tier; changed = true;
            showAchToast(a); pushAchToNotion(a);
            if (a.tier === 'phantom') triggerPhantomFlash();
          }
        } catch {}
      }
    });
    if (!lt2.unlockedDispatches) lt2.unlockedDispatches = {};
    DISPATCHES.forEach(d => {
      if (!lt2.unlockedDispatches[d.id] && checkDispatch(d, s2, lt2)) {
        lt2.unlockedDispatches[d.id] = true; changed = true;
        showDispatchToast(d);
        lt2.totalDispatchesEarned = (lt2.totalDispatchesEarned||0) + 1;
      }
    });
    if (changed) {
      const tiers = ['signal','operative','vanguard','phantom'];
      lt2.highestTier = tiers.reduce((h,t) => Object.values(lt2.unlockedAch).includes(t) ? t : h, 'signal');
      saveLT(lt2); renderAchievements();
    }
    updateDispatchBar();
  }, debounce);
}

// ── TOASTS ──
function showAchToast(ach) {
  const wrap = document.getElementById('toastWrap');
  const el   = document.createElement('div');
  el.className = `toast ${ach.tier}`;
  const isPh = ach.tier === 'phantom';
  el.innerHTML = `<div class="t-icon">${ach.icon}</div>
    <div><div class="t-tier">✦ ${ach.tier.toUpperCase()} UNLOCKED</div>
    <div class="t-name">${ach.name}</div>
    <div class="t-flavor">${ach.flavor.slice(0,90)}${ach.flavor.length>90?'…':''}</div></div>
    ${isPh ? `<div class="t-dismiss" onclick="this.closest('.toast').remove()">✕</div>` : ''}`;
  wrap.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  if (!isPh) setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 500); }, 4500);
}

function showDispatchToast(d) {
  const wrap = document.getElementById('toastWrap');
  const el   = document.createElement('div');
  el.className = 'toast dispatch';
  el.innerHTML = `<div class="t-icon">📋</div><div><div class="t-tier">✦ DISPATCH EARNED</div><div class="t-name">${d.name}</div><div class="t-flavor">${d.condition}</div></div>`;
  wrap.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 500); }, 3000);
}

function triggerPhantomFlash() {
  const el = document.getElementById('phantomFlash');
  el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 1200);
}

// ── END OF WEEK MODAL ──
// v5.6: checkWeekRollover() is sole owner of totalPerfectWeeks increment.
function checkWeekRollover() {
  const prev    = localStorage.getItem(PREVWK);
  const current = wk();
  if (prev && prev !== current) {
    const a = ld(); const pd = a[prev] || {};
    let t = 0, d = 0;
    GAMES.forEach(g => {
      g.daily.forEach((_,i)  => { t++; if (getv(pd,g.id,'daily',i))  d++; });
      g.weekly.forEach((_,i) => { t++; if (getv(pd,g.id,'weekly',i)) d++; });
    });
    const prevPct  = t > 0 ? Math.round(d/t*100) : 0;
    const prevCyc  = cyclesDone();
    const lt = getLT();
    const prevDisp = DISPATCHES.filter(ds => checkDispatch(ds, pd, lt)).length;

    // Sole owner of totalPerfectWeeks — only increments on actual week close
    if (prevPct >= 100) {
      lt.totalPerfectWeeks = (lt.totalPerfectWeeks || 0) + 1;
    }
    lt.weeksTracked = (lt.weeksTracked || 0) + 1;
    saveLT(lt);

    document.getElementById('modalSub').textContent = `${prev} is complete. Add a highlight before it archives.`;
    document.getElementById('modalStats').innerHTML = `
      <div class="ms"><div class="ms-val">${prevPct}%</div><div class="ms-lbl">Completion</div></div>
      <div class="ms"><div class="ms-val">${prevDisp}</div><div class="ms-lbl">Dispatches</div></div>
      <div class="ms"><div class="ms-val">${prevCyc}</div><div class="ms-lbl">Cycle Clears</div></div>`;
    document.getElementById('weekModal').classList.add('show');
    pushSessionToNotion(prev, { pct: prevPct, dispatches: prevDisp, cycles: prevCyc });
  }
  localStorage.setItem(PREVWK, current);
}

function closeModal(save) {
  const highlight = document.getElementById('modalHighlight').value;
  if (save && highlight) {
    const lt = getLT();
    if (!lt.highlights) lt.highlights = [];
    lt.highlights.push({ week: localStorage.getItem(PREVWK), text: highlight, date: new Date().toISOString() });
    saveLT(lt);
    pushSessionToNotion(localStorage.getItem(PREVWK), { highlight });
  }
  document.getElementById('weekModal').classList.remove('show');
  document.getElementById('modalHighlight').value = '';
}

// ── ACHIEVEMENTS VIEW ──
function renderAchievements() {
  const lt  = getLT(); const s = wsFull();
  const ul  = lt.unlockedAch || {};
  const tier = lt.highestTier || 'signal';
  const tierEl = document.getElementById('recordTier');
  if (tierEl) { tierEl.textContent = tier.toUpperCase(); tierEl.className = 'record-tier tier-' + tier; }
  const rg = document.getElementById('recordGrid');
  if (rg) rg.innerHTML = [
    { v: lt.totalTasksCompleted||0,     l: 'Tasks Completed' },
    { v: lt.totalCycleClears||0,        l: 'Cycle Clears' },
    { v: lt.longestStreak||0,           l: 'Best Streak' },
    { v: lt.currentStreak||getStreak(), l: 'Current Streak' },
    { v: lt.totalPerfectWeeks||0,       l: 'Perfect Weeks' },
    { v: lt.weeksTracked||0,            l: 'Weeks Tracked' },
    { v: lt.totalDispatchesEarned||0,   l: 'Dispatches Earned' },
    { v: lt.deployDate||'—',            l: 'Deployed' },
  ].map(s => `<div class="record-stat"><div class="rs-val">${s.v}</div><div class="rs-lbl">${s.l}</div></div>`).join('');

  // v5.6: sync status initialised to idle on achievements tab open — no stuck messages
  const syncMsgEl = document.getElementById('syncMsg');
  if (syncMsgEl && (syncMsgEl.textContent === 'Connecting to archive…' || syncMsgEl.textContent === '')) {
    initSyncStatus();
  }

  const dg = document.getElementById('dispatchGrid');
  if (dg) dg.innerHTML = DISPATCHES.map(d => {
    const earned = checkDispatch(d, s, lt);
    return `<div class="dw-card${earned?' earned':''}">
      <div class="dw-check"></div>
      <div><div class="dw-name">${d.name}</div><div class="dw-cond">${d.condition}</div></div>
    </div>`;
  }).join('');

  const TC = { signal:'var(--signal)', operative:'var(--operative)', vanguard:'var(--vanguard)', phantom:'var(--phantom)' };
  let html = '';
  ['signal','operative','vanguard','phantom'].forEach(t => {
    const achs   = ACHIEVEMENTS.filter(a => a.tier === t);
    const ucount = achs.filter(a => ul[a.id]).length;
    html += `<div class="tier-section">
      <div class="tier-hdr">
        <div class="tier-name" style="color:${TC[t]}">${t.toUpperCase()}</div>
        <div class="tier-line" style="background:linear-gradient(90deg,${TC[t]}44,transparent)"></div>
        <div class="tier-count">${ucount}/${achs.length}</div>
      </div>
      <div class="ach-grid">`;
    achs.forEach(a => {
      const isU = !!ul[a.id];
      html += `<div class="ach-card${isU?' unlocked '+a.tier:''}">
        <div class="ach-icon">${a.icon}</div>
        <div class="ach-body">
          <div class="ach-name">${a.name}</div>
          <div class="ach-flavor">${a.flavor}</div>
          <div class="ach-meta">
            <span class="ach-tier-badge" style="background:${TC[a.tier]}22;color:${TC[a.tier]}">${a.tier.toUpperCase()}</span>
            <span class="ach-game-badge">${a.game}</span>
          </div>
        </div>
      </div>`;
    });
    html += '</div></div>';
  });
  const pa = document.getElementById('permAch'); if (pa) pa.innerHTML = html;
}

// ── CALENDAR ──

// resetCountdownLabel — returns "Xh Ym" until a game's next daily reset
// Used by buildFeaturedDay() to show time pressure per game
function resetCountdownLabel(gameId) {
  const rt = CONFIG.resetTimes[gameId];
  if (!rt || rt.dailyUTC === null) {
    // CZN — count down to next Sunday 18:00 UTC
    const now = new Date();
    const next = new Date(now);
    const day = now.getUTCDay(); // 0=Sun
    const daysUntilSun = day === 0 ? 7 : 7 - day; // always next Sunday, not today
    next.setUTCDate(now.getUTCDate() + daysUntilSun);
    next.setUTCHours(18, 0, 0, 0);
    // If today is Sunday and before 18:00 UTC, reset is today
    if (day === 0 && now.getUTCHours() < 18) {
      next.setUTCDate(now.getUTCDate());
      next.setUTCHours(18, 0, 0, 0);
    }
    const diff = next - now;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }
  const now = new Date();
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), rt.dailyUTC, 0, 0));
  if (now >= next) next.setUTCDate(next.getUTCDate() + 1);
  const diff = next - now;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// buildFeaturedDay() — session planning card for today
// Shows: priority order (urgent cycles first, then dailies with reset countdowns),
// estimated session time (dailies + due cycles), and full can-wait list.
// This is the primary calendar view — replaces the old 7-column grid as headline content.
function buildFeaturedDay() {
  const s   = wsFull();
  const now = new Date();
  const CYCLE_MINS = 30; // flat estimate per uncleared cycle mode due today

  // ── Build priority items ──
  // Each item: { game, label, color, urgency, mins, isReset }
  const urgent   = []; // due within 2 days
  const normal   = []; // dailies with reset pressure
  const canWait  = []; // cycles > 14 days out, not cleared

  GAMES.forEach(g => {
    const accent = `var(${g.accent})`;

    // Uncleared cycle modes — sort into urgent vs canWait
    g.endgameModes.forEach(m => {
      if (getCy(m.cycleKey)) return; // already cleared
      if (!isCycleUnlocked(m.cycleKey)) return;
      const d = daysUntilCycleEnds(m.cycleKey);
      if (d !== null && d <= 2) {
        urgent.push({
          game: g.short, label: m.name, color: accent,
          meta: d <= 0 ? 'Resets TODAY' : d === 1 ? 'Resets TOMORROW' : d + 'd left',
          mins: CYCLE_MINS, urgent: true
        });
      } else if (d === null || d <= 14) {
        // Weekly or due within 2 weeks — include in normal session
        normal.push({
          game: g.short, label: m.name, color: accent,
          meta: d === null ? 'Weekly reset' : d + 'd left',
          mins: CYCLE_MINS, urgent: false
        });
      } else {
        // > 14 days — can wait
        canWait.push({
          game: g.short, label: m.name, color: accent,
          meta: d + 'd left'
        });
      }
    });

    // Dailies — always include if any unchecked remain
    const undoneDailies = g.daily.filter((_,i) => !getv(s, g.id, 'daily', i));
    if (undoneDailies.length > 0) {
      const countdown = resetCountdownLabel(g.id);
      normal.push({
        game: g.short,
        label: `${undoneDailies.length} ${undoneDailies.length === 1 ? 'daily' : 'dailies'} remaining`,
        color: accent,
        meta: `resets in ${countdown}`,
        mins: Math.round(g.dailyLoad * 60 * (undoneDailies.length / g.daily.length)),
        urgent: false,
        isDailies: true,
        tasks: undoneDailies.map(t => t.t)
      });
    }
  });

  // Sort urgent by days remaining, normal puts dailies after cycles
  urgent.sort((a, b) => {
    const da = a.meta.includes('TODAY') ? 0 : a.meta.includes('TOMORROW') ? 1 : 2;
    const db = b.meta.includes('TODAY') ? 0 : b.meta.includes('TOMORROW') ? 1 : 2;
    return da - db;
  });

  // ── Time budget ──
  const allItems = [...urgent, ...normal];
  const totalMins = allItems.reduce((sum, i) => sum + (i.mins || 0), 0);
  const budgetLabel = totalMins === 0
    ? 'All clear'
    : totalMins < 60
      ? `~${totalMins}m`
      : `~${Math.floor(totalMins / 60)}h ${totalMins % 60 > 0 ? (totalMins % 60) + 'm' : ''}`.trim();

  const loadClass = totalMins > 90 ? 'heavy' : totalMins > 45 ? 'medium' : 'light';
  const loadColor = totalMins > 90 ? 'var(--danger)' : totalMins > 45 ? 'var(--warn)' : 'var(--ok)';

  const dateStr = now.toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric' }).toUpperCase();

  // ── Render priority list ──
  function renderItem(item, rank) {
    const rankLabels = ['01 FIRST','02 THEN','03 NEXT','04 AFTER','05 THEN','06 THEN','07 THEN','08 THEN'];
    const rankLabel = rankLabels[rank] || `${String(rank+1).padStart(2,'0')} THEN`;
    const taskList = item.tasks && item.tasks.length
      ? `<div class="fd-task-list">${item.tasks.map(t =>
          `<div class="fd-task-item">· ${t}</div>`
        ).join('')}</div>`
      : '';
    return `<div class="fd-item${item.urgent ? ' fd-urgent' : ''}">
      <div class="fd-item-top">
        <span class="fd-rank">${rankLabel}</span>
        <span class="fd-game-tag" style="background:${item.color}22;color:${item.color}">${item.game}</span>
        <span class="fd-label">${item.label}</span>
        <span class="fd-meta${item.urgent ? ' fd-meta-urgent' : ''}">${item.meta}</span>
      </div>
      ${taskList}
    </div>`;
  }

  const priorityHTML = allItems.length
    ? allItems.map((item, i) => renderItem(item, i)).join('')
    : `<div class="fd-clear">✓ ALL TASKS COMPLETE — NOTHING LEFT FOR TODAY</div>`;

  // ── Render can-wait list ──
  const canWaitHTML = canWait.length
    ? canWait.map(item => `
        <div class="fd-wait-item">
          <span class="fd-wait-game" style="color:${item.color}">${item.game}</span>
          <span class="fd-wait-label">${item.label}</span>
          <span class="fd-wait-meta">${item.meta}</span>
        </div>`).join('')
    : `<div class="fd-wait-empty">No deferred content — all modes are time-sensitive this week.</div>`;

  return `
    <div class="featured-day">
      <div class="fd-header">
        <div class="fd-date-block">
          <div class="fd-day-label">TODAY</div>
          <div class="fd-date">${dateStr}</div>
        </div>
        <div class="fd-budget">
          <div class="fd-budget-val" style="color:${loadColor}">${budgetLabel}</div>
          <div class="fd-budget-lbl ${loadClass}">${loadClass} session</div>
        </div>
      </div>
      <div class="fd-divider"></div>
      <div class="fd-section-label">SESSION PRIORITY</div>
      <div class="fd-priority-list">${priorityHTML}</div>
      <div class="fd-divider" style="margin-top:16px"></div>
      <div class="fd-section-label">CAN WAIT <span class="fd-wait-count">${canWait.length} mode${canWait.length !== 1 ? 's' : ''}</span></div>
      <div class="fd-wait-list">${canWaitHTML}</div>
    </div>`;
}

// buildCalendar() — main calendar tab builder
// Renders: featured day session planner, week strip, workload burn chart
function buildCalendar() {
  const s   = wsFull();
  const now = new Date();
  const dow = now.getDay();
  const ti  = dow === 0 ? 6 : dow - 1; // index into WEEK_PLAN (0=Mon)

  // Week range label
  const mon = new Date(now); mon.setDate(now.getDate() - ti);
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
  const f   = d => d.toLocaleDateString('en-US', { month:'short', day:'numeric' });
  document.getElementById('calTitle').textContent = `WEEK OF ${f(mon).toUpperCase()} — ${f(sun).toUpperCase()}`;

  // Featured day — session planner
  document.getElementById('featuredDay').innerHTML = buildFeaturedDay();

  // Week strip — compact 7-day horizontal scroll
  // Each day: name, load bar, game dot cluster from WEEK_PLAN
  const LC = { light:'#4ade80', medium:'#ffb347', heavy:'#ff5252' };
  const LP = { light:30, medium:60, heavy:90 };
  const compRatio = totalDone(s) / Math.max(1, GAMES.reduce((a,g) => a + g.daily.length + g.weekly.length, 0));
  const GAME_COLORS = ['#e84faa','#2de8a0','#9d7ff5','#4ab8f0'];

  document.getElementById('weekStrip').innerHTML = WEEK_PLAN.map((d, i) => {
    const isT  = i === ti;
    const isPast = i < ti;
    let lp = LP[d.load];
    if (isPast) lp = Math.max(5, lp - Math.round(compRatio * lp));
    const lc = lp > 65 ? LC.heavy : lp > 35 ? LC.medium : LC.light;
    const dots = d.tasks.map((t, ti2) => {
      // Find which game this task belongs to by color match
      const gIdx = GAME_COLORS.indexOf(t.c);
      return `<div class="ws-dot" style="background:${t.c};opacity:${isPast?0.3:1}"></div>`;
    }).join('');
    return `<div class="ws-day${isT ? ' ws-today' : ''}${isPast ? ' ws-past' : ''}">
      <div class="ws-name">${d.day}</div>
      <div class="ws-bar-wrap">
        <div class="ws-bar"><div class="ws-fill" style="width:${lp}%;background:${lc}"></div></div>
      </div>
      <div class="ws-dots">${dots}</div>
      <div class="ws-focus">${d.focus}</div>
    </div>`;
  }).join('');

  // Workload burn chart — unchanged
  document.getElementById('burnGames').innerHTML = GAMES.map(g => {
    const p = Math.round(g.weeklyLoad / 3 * 100);
    return `<div class="burn-row">
      <div class="burn-name" style="color:var(${g.accent})">${g.short}</div>
      <div class="burn-bw">
        <div class="burn-bar"><div class="burn-fill" style="width:${p}%;background:var(${g.accent})"></div></div>
        <div class="burn-sub">~${g.weeklyLoad}h/wk · ~${Math.round(g.dailyLoad*60)}min/day</div>
      </div>
      <div class="burn-pct">${p}%</div>
    </div>`;
  }).join('');
}

// ── VIEW SWITCHING ──
function switchView(id, el) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('view-' + id)?.classList.add('active');
  if (el) el.classList.add('active');
  if (id === 'calendar')     buildCalendar();
  if (id === 'achievements') renderAchievements();
  if (id === 'currency')     buildCurrencySection();
}

// ── NOTE SAVES ──
const saveNotes     = () => { try { localStorage.setItem(NK,  document.getElementById('notesMain').value); updateLT(); } catch {} };
const saveCalNotes  = () => { try { localStorage.setItem(CNK, document.getElementById('calNotes').value); } catch {} };
const saveQuickNote = () => { try { localStorage.setItem(QNK, document.getElementById('quickNote').value); updateLT(); } catch {} };

// ── MAIN RENDER ──
function render() {
  const s = wsFull();
  const n = new Date(); const dow = n.getDay();
  const d = new Date(n); d.setDate(n.getDate() - (dow===0?6:dow-1));
  const e = new Date(d); e.setDate(d.getDate() + 6);
  const f = x => x.toLocaleDateString('en-US', { month:'short', day:'numeric' });
  document.getElementById('weekLbl').textContent = `${f(d).toUpperCase()} — ${f(e).toUpperCase()}`;
  document.getElementById('footerDate').textContent = new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' }).toUpperCase();
  document.getElementById('gameGrid').innerHTML = GAMES.map(g => buildCard(g, s)).join('');
  const zzzPassive = document.getElementById('zzzPassive');
  if (zzzPassive) zzzPassive.innerHTML = '';
  try { document.getElementById('notesMain').value = localStorage.getItem(NK)  || ''; } catch {}
  try { document.getElementById('calNotes').value  = localStorage.getItem(CNK) || ''; } catch {}
  try { document.getElementById('quickNote').value = localStorage.getItem(QNK) || ''; } catch {}
  buildTodayPanel(); buildUrgency(); updateGlobals();
  renderAchievements(); checkFreshness();
}

// ── INIT ──
updateStreak();
checkWeekRollover();
render();
updateLT();
initSyncStatus();
setTimeout(flushOutbox, 3000);
setTimeout(initDebugLongPress, 500);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
  navigator.serviceWorker.register('/czn-ops-theory/sw.js')
      .then(reg => console.log('NEXUS SW registered:', reg.scope))
      .catch(err => console.log('SW registration failed:', err));
  });
}
