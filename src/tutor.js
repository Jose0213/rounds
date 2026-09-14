/* Rounds tutor — a slide-over chat grounded in whatever you are looking at. Streams from the tutor service. */
(function () {
  const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  let panel = null, ctx = null, history = [], busy = false, abort = null;
  const threads = new Map();
  function endpoint() {
    const s = window.Store ? Store.load().settings : {};
    if (s.tutorUrl) return s.tutorUrl;
    if (location.protocol === 'https:' && !/^localhost|127\./.test(location.hostname)) return location.origin + '/api/tutor';
    return 'http://nova.taild8324f.ts.net:9237/tutor';
  }
  function ensure() {
    if (panel) return panel;
    panel = h(`<aside class="tutor" hidden aria-label="Tutor">
      <div class="tutor-head"><div><div class="eyebrow accent">Tutor</div><div class="tutor-ctx" id="tutor-ctx"></div></div><button class="btn sm subtle" id="tutor-close">Close</button></div>
      <div class="tutor-log" id="tutor-log"></div>
      <div class="tutor-sugg" id="tutor-sugg"></div>
      <form class="tutor-form" id="tutor-form"><textarea id="tutor-in" rows="1" placeholder="Ask about this…" enterkeyhint="send"></textarea><button class="btn primary" id="tutor-send" type="submit">Ask</button></form>
    </aside>`);
    document.body.appendChild(panel);
    panel.querySelector('#tutor-close').onclick = close;
    const form = panel.querySelector('#tutor-form'); const ta = panel.querySelector('#tutor-in');
    form.onsubmit = (e) => { e.preventDefault(); const q = ta.value.trim(); if (q) { ta.value = ''; ta.style.height = ''; ask(q); } };
    ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } });
    ta.addEventListener('input', () => { ta.style.height = 'auto'; ta.style.height = Math.min(140, ta.scrollHeight) + 'px'; });
    return panel;
  }
  function renderLog() {
    const log = panel.querySelector('#tutor-log');
    log.innerHTML = history.map((m) => `<div class="msg ${m.role}">${m.role === 'assistant' ? (window.MD ? MD.render(m.content || (m.pending ? '…' : '')) : esc(m.content)) : esc(m.content)}</div>`).join('') || '<div class="faint small" style="padding:8px 2px">Ask anything about what is on screen. Short, honest answers, with a check question at the end.</div>';
    log.scrollTop = log.scrollHeight;
  }
  function suggestions() {
    const s = panel.querySelector('#tutor-sugg');
    const base = ctx?.kind === 'card' ? ['Why is this the answer?', 'Give me a way to remember it', 'Ask me a harder version'] : ctx?.kind === 'scenario' ? ['What would a PA be thinking here?', 'What are the traps in this case?'] : ctx?.kind === 'question' ? ['Explain why the other choices are wrong', 'Give me a similar question'] : ['Explain this more simply', 'Quiz me on this', 'What is the exam trap here?', 'How does this show up on shift?'];
    s.innerHTML = base.map((t) => `<button class="chip">${esc(t)}</button>`).join('');
    s.querySelectorAll('button').forEach((b) => b.onclick = () => ask(b.textContent));
  }
  function open(context) {
    ensure();
    if (ctx && ctx.id !== context.id) threads.set(ctx.id, history);
    ctx = context; history = threads.get(context.id) || [];
    panel.querySelector('#tutor-ctx').textContent = context.label || context.title || '';
    panel.hidden = false; document.body.classList.add('tutor-open');
    renderLog(); suggestions();
    setTimeout(() => panel.querySelector('#tutor-in').focus(), 50);
  }
  function close() { if (!panel) return; panel.hidden = true; document.body.classList.remove('tutor-open'); if (abort) abort.abort(); }
  function setContext(context) { if (!panel || panel.hidden) { ctx = context; return; } open(context); }
  async function ask(q) {
    if (busy || !ctx) return;
    busy = true; panel.querySelector('#tutor-send').disabled = true;
    history.push({ role: 'user', content: q }); const a = { role: 'assistant', content: '', pending: true }; history.push(a); renderLog();
    abort = new AbortController();
    try {
      const res = await fetch(endpoint(), { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: abort.signal, body: JSON.stringify({ context: { kind: ctx.kind, title: ctx.title, text: (ctx.text || '').slice(0, 12000) }, messages: history.filter((m) => !m.pending).slice(-12).map((m) => ({ role: m.role, content: m.content })) }) });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const reader = res.body.getReader(); const dec = new TextDecoder(); let buf = '';
      while (true) {
        const { value, done } = await reader.read(); if (done) break;
        buf += dec.decode(value, { stream: true });
        let idx;
        while ((idx = buf.indexOf('\n\n')) >= 0) {
          const chunk = buf.slice(0, idx); buf = buf.slice(idx + 2);
          const line = chunk.split('\n').find((l) => l.startsWith('data:')); if (!line) continue;
          try { const ev = JSON.parse(line.slice(5)); if (ev.delta) { a.content += ev.delta; renderLog(); } if (ev.text && !a.content) { a.content = ev.text; renderLog(); } if (ev.error) throw new Error(ev.error); } catch (e) { if (e.message && !/JSON/.test(e.message)) throw e; }
        }
      }
      if (!a.content) a.content = 'No answer came back. Try again.';
    } catch (e) {
      a.content = e.name === 'AbortError' ? '' : (/Failed to fetch|NetworkError|HTTP/.test(String(e.message)) ? 'The tutor is not reachable right now. It needs Tailscale on and the tutor service running.' : 'Something went wrong: ' + e.message);
    } finally { a.pending = false; busy = false; abort = null; if (panel) { panel.querySelector('#tutor-send').disabled = false; renderLog(); } threads.set(ctx.id, history); }
  }
  window.Tutor = { open, close, setContext, endpoint, isOpen: () => !!panel && !panel.hidden };
})();
