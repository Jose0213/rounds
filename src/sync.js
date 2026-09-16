/* Rounds — progress sync across devices through the homelab (one learner, tailnet only). Pull on open, merge, push after every save. Ink and station videos stay on the device. */
(function () {
  const DEVICE = (() => { try { let d = localStorage.getItem('rounds.device'); if (!d) { d = (navigator.platform || 'dev').replace(/\W+/g, '') + '-' + Math.random().toString(36).slice(2, 6); localStorage.setItem('rounds.device', d); } return d; } catch (e) { return 'dev'; } })();
  function endpoint() {
    const s = window.Store ? Store.load().settings : {};
    if (s.syncUrl) return s.syncUrl;
    if (s.tutorUrl) return s.tutorUrl.replace(/\/(api\/)?tutor\/?$/, (m, api) => '/' + (api || '') + 'sync');
    if (location.protocol === 'https:' && !/^localhost|127\./.test(location.hostname)) return location.origin + '/api/sync';
    return 'http://nova.taild8324f.ts.net:9237/sync';
  }
  // Local previews never sync unless a sync address is set explicitly, so test progress cannot leak into the real store.
  const LOCAL = /^(localhost|127\.)/.test(location.hostname) && !(window.Store && Store.load().settings.syncUrl);
  let lastRev = 0, pushTimer = null, pushing = false, dirty = false, status = 'idle';
  const listeners = new Set();
  const setStatus = (s) => { status = s; listeners.forEach((f) => { try { f(s); } catch (e) { /* ignore */ } }); };
  const payload = () => JSON.stringify({ device: DEVICE, state: JSON.parse(Store.exportJSON()) });
  async function pull() {
    if (Store.load().settings.sync === false || LOCAL) return false;
    try {
      const r = await fetch(endpoint(), { cache: 'no-store' }); if (!r.ok) throw new Error('HTTP ' + r.status);
      const doc = await r.json(); lastRev = doc.rev || 0;
      const changed = doc.state ? Store.merge(doc.state) : false;
      setStatus('ok'); schedulePush(300);
      return changed;
    } catch (e) { setStatus('offline'); return false; }
  }
  async function push() {
    if (pushing || Store.load().settings.sync === false || LOCAL) return; pushing = true;
    try {
      const r = await fetch(endpoint(), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: payload() });
      if (!r.ok) throw new Error('HTTP ' + r.status); const j = await r.json(); lastRev = j.rev || lastRev; dirty = false; setStatus('ok');
    } catch (e) { setStatus('offline'); dirty = true; }
    finally { pushing = false; }
  }
  function schedulePush(ms = 2500) { dirty = true; clearTimeout(pushTimer); pushTimer = setTimeout(push, ms); }
  const origSave = Store.save; Store.save = function (now) { const r = origSave.apply(this, arguments); schedulePush(now ? 800 : 2500); return r; };
  window.addEventListener('visibilitychange', () => { if (document.hidden) { if (dirty) push(); } else pull().then((changed) => { if (changed && window.Rounds && Rounds.rerender) Rounds.rerender(); }); });
  window.addEventListener('pagehide', () => { if (dirty && navigator.sendBeacon) { try { navigator.sendBeacon(endpoint() + '?beacon=1', new Blob([payload()], { type: 'application/json' })); } catch (e) { /* ignore */ } } });
  window.Sync = { pull, push, endpoint, device: DEVICE, status: () => status, onStatus: (f) => listeners.add(f), lastRev: () => lastRev };
})();
