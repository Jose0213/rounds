/* Rounds markdown subset renderer — see content/SCHEMA.md. Escapes HTML first. */
(function () {
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  function inline(s) {
    s = esc(s);
    s = s.replace(/`([^`]+)`/g, (_, c) => '<code>' + c + '</code>');
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(^|[^*\w])\*([^*\n]+)\*(?!\w)/g, '$1<em>$2</em>');
    return s;
  }
  const CALLOUTS = { 'Key:': 'key', 'Trap:': 'trap', 'On the exam:': 'exam', 'On shift:': 'shift' };
  function render(md) {
    const lines = String(md || '').replace(/\r\n?/g, '\n').split('\n');
    const out = [];
    let i = 0;
    const isTableRow = (l) => /^\s*\|.*\|\s*$/.test(l);
    const isSep = (l) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(l);
    while (i < lines.length) {
      const line = lines[i];
      if (!line.trim()) { i++; continue; }
      let m;
      if ((m = line.match(/^###\s+(.*)$/))) { out.push('<h3>' + inline(m[1]) + '</h3>'); i++; continue; }
      if ((m = line.match(/^##\s+(.*)$/))) { out.push('<h2>' + inline(m[1]) + '</h2>'); i++; continue; }
      if (/^\s*>/.test(line)) {
        const buf = [];
        while (i < lines.length && /^\s*>/.test(lines[i])) { buf.push(lines[i].replace(/^\s*>\s?/, '')); i++; }
        let text = buf.join(' ').trim();
        let cls = 'key', label = 'Note';
        const cm = text.match(/^\*\*([^*]+)\*\*\s*/);
        if (cm) { label = cm[1].trim(); text = text.slice(cm[0].length); cls = CALLOUTS[label] || 'key'; }
        out.push('<div class="callout ' + cls + '"><span class="label">' + esc(label.replace(/:$/, '')) + '</span>' + inline(text) + '</div>');
        continue;
      }
      if (/^\s*[-*]\s+/.test(line)) {
        const items = [];
        while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { items.push('<li>' + inline(lines[i].replace(/^\s*[-*]\s+/, '')) + '</li>'); i++; }
        out.push('<ul>' + items.join('') + '</ul>'); continue;
      }
      if (/^\s*\d+[.)]\s+/.test(line)) {
        const items = [];
        while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) { items.push('<li>' + inline(lines[i].replace(/^\s*\d+[.)]\s+/, '')) + '</li>'); i++; }
        out.push('<ol>' + items.join('') + '</ol>'); continue;
      }
      if (isTableRow(line) && i + 1 < lines.length && isSep(lines[i + 1])) {
        const cells = (l) => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => inline(c.trim()));
        const head = cells(line); i += 2;
        const rows = [];
        while (i < lines.length && isTableRow(lines[i])) { rows.push(cells(lines[i])); i++; }
        let h = '<div class="table-wrap"><table><thead><tr>' + head.map((c) => '<th>' + c + '</th>').join('') + '</tr></thead><tbody>';
        for (const r of rows) h += '<tr>' + head.map((_, k) => '<td>' + (r[k] || '') + '</td>').join('') + '</tr>';
        out.push(h + '</tbody></table></div>'); continue;
      }
      const buf = [];
      while (i < lines.length && lines[i].trim() && !/^(##|###|\s*>|\s*[-*]\s|\s*\d+[.)]\s)/.test(lines[i]) && !(isTableRow(lines[i]) && isSep(lines[i + 1] || ''))) { buf.push(lines[i].trim()); i++; }
      out.push('<p>' + inline(buf.join(' ')) + '</p>');
    }
    return out.join('\n');
  }
  window.MD = { render, inline, esc };
})();
