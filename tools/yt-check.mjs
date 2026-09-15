// Verifies every YouTube id in one or more <id>.videos.json files via the public oEmbed endpoint and stamps verified:true.
// Usage: node tools/yt-check.mjs content/modules/<id>.videos.json [...]   (exit 1 if any video is missing/private)
import fs from 'node:fs';
const files = process.argv.slice(2); if (!files.length) { console.error('usage: node tools/yt-check.mjs <file.videos.json> ...'); process.exit(2); }
let bad = 0;
for (const f of files) {
  const x = JSON.parse(fs.readFileSync(f, 'utf8')); let n = 0, ok = 0;
  for (const [lid, arr] of Object.entries(x.videos || {})) {
    for (const v of arr) {
      n++;
      try {
        const r = await fetch('https://www.youtube.com/oembed?format=json&url=' + encodeURIComponent('https://www.youtube.com/watch?v=' + v.id));
        if (r.ok) { const j = await r.json(); v.verified = true; v.ytTitle = j.title; v.channel = v.channel || j.author_name; if (!v.title) v.title = j.title; ok++; }
        else { v.verified = false; bad++; console.log(`  x ${f} ${lid} ${v.id}: HTTP ${r.status} (missing, private, or embedding disabled)`); }
      } catch (e) { v.verified = false; bad++; console.log(`  x ${f} ${lid} ${v.id}: ${e.message}`); }
    }
  }
  fs.writeFileSync(f, JSON.stringify(x, null, 2) + '\n');
  console.log(`${ok === n ? 'ok  ' : 'warn'} ${f}: ${ok}/${n} videos verified`);
}
process.exit(bad ? 1 : 0);
