/* Rounds spaced repetition — SM-2 shaped, four grades (0 again, 1 hard, 2 good, 3 easy). Intervals in days. */
(function () {
  const DAY = 86400000;
  const MIN10 = 600000;
  function fresh() { return { ef: 2.5, ivl: 0, reps: 0, due: 0, lapses: 0, last: 0, state: 'new' }; }
  // Returns the new record (does not mutate).
  function grade(rec, g, now = Date.now()) {
    const r = Object.assign(fresh(), rec || {});
    r.last = now;
    if (g === 0) {
      r.lapses += r.state === 'review' ? 1 : 0;
      r.ef = Math.max(1.3, r.ef - 0.2);
      r.ivl = 0; r.reps = 0; r.state = 'learning'; r.due = now + MIN10;
      return r;
    }
    if (r.state === 'new' || r.state === 'learning') {
      if (g === 1) { r.ivl = 1; r.ef = Math.max(1.3, r.ef - 0.15); }
      else if (g === 2) { r.ivl = 1; }
      else { r.ivl = 4; r.ef = Math.min(3.0, r.ef + 0.1); }
      r.reps = 1; r.state = 'review'; r.due = now + r.ivl * DAY;
      return r;
    }
    // review state
    if (g === 1) { r.ivl = Math.max(1, Math.round(r.ivl * 1.2)); r.ef = Math.max(1.3, r.ef - 0.15); }
    else if (g === 2) { r.ivl = Math.max(r.ivl + 1, Math.round(r.ivl * r.ef)); }
    else { r.ivl = Math.max(r.ivl + 2, Math.round(r.ivl * r.ef * 1.3)); r.ef = Math.min(3.0, r.ef + 0.15); }
    r.ivl = Math.min(r.ivl, 365);
    r.reps += 1; r.due = now + r.ivl * DAY;
    return r;
  }
  function preview(rec, now = Date.now()) {
    return [0, 1, 2, 3].map((g) => {
      const r = grade(rec, g, now);
      const ms = r.due - now;
      if (ms < 3600000) return Math.round(ms / 60000) + 'm';
      if (ms < DAY * 1.5) return '1d';
      if (ms < DAY * 30) return Math.round(ms / DAY) + 'd';
      return (ms / DAY / 30).toFixed(1).replace(/\.0$/, '') + 'mo';
    });
  }
  function isDue(rec, now = Date.now()) { return !!rec && rec.state !== 'new' && rec.due <= now; }
  window.SRS = { fresh, grade, preview, isDue, DAY };
})();
