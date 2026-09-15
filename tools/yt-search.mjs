// Searches YouTube without an API key by reading the ytInitialData blob on the results page.
// Usage: node tools/yt-search.mjs "query words" [limit]   → lines: <id>\t<duration>\t<channel>\t<title>
const q = process.argv[2]; const limit = +(process.argv[3] || 12);
if (!q) { console.error('usage: node tools/yt-search.mjs "query" [limit]'); process.exit(2); }
const url = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q) + '&sp=EgIQAQ%253D%253D'; // videos only
const html = await (await fetch(url, { headers: { 'Accept-Language': 'en-US,en;q=0.9', 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15', Cookie: 'CONSENT=YES+1; SOCS=CAI' } })).text();
const m = html.match(/var ytInitialData = (\{.*?\});<\/script>/s);
if (!m) { console.error('no ytInitialData; YouTube may have served a consent page'); process.exit(1); }
const data = JSON.parse(m[1]);
const out = [];
(function walk(n) {
  if (!n || typeof n !== 'object') return;
  if (n.videoRenderer) { const v = n.videoRenderer; const dur = v.lengthText?.simpleText || 'live'; const isShort = v.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url?.startsWith('/shorts/'); if (!isShort) out.push({ id: v.videoId, dur, channel: v.ownerText?.runs?.[0]?.text || v.longBylineText?.runs?.[0]?.text || '', title: (v.title?.runs || []).map((r) => r.text).join(''), views: v.viewCountText?.simpleText || '' }); return; }
  if (Array.isArray(n)) n.forEach(walk); else for (const k in n) walk(n[k]);
})(data);
for (const v of out.slice(0, limit)) console.log([v.id, v.dur, v.channel, v.title, v.views].join('\t'));
