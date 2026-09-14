# Rounds

A crash course in patient care and medicine, built as an installable web app for an 11-inch iPad Pro. Four tracks take a reader with no medical background through EMT-Basic and the NREMT, day one as an emergency department technician, and the anatomy, pharmacology, pathophysiology, labs, ECG reading and clinical reasoning that a PA applicant needs.

## What it does

- **Learn** — 40 modules of short lessons (4–9 minutes each), most deepened by a second pass of harder material. Every lesson ends in a gated check; passing it unlocks the lesson's flashcards.
- **Review** — spaced repetition (SM-2 style, four grades). A scratch area on each card takes Apple Pencil ink so you can write the answer before flipping.
- **Practice** — NREMT-style quizzes in practice or timed exam mode (domain-weighted 70-question mock), branching clinical scenarios with monitor-style vitals, and 19 hands-on drills: ECG rhythm strips synthesized fresh each round, 12-lead placement, read the monitor, generated med-math problems, an abdominal map, and sequence and matching drills.
- **Tools** — 13 bedside calculators (dose and volume, drip rate, oxygen cylinder duration, MAP and shock index, GCS, APGAR, burns and Parkland, pediatric estimates, QTc, anion gap, BMI, ECG rate) with the formula shown.
- **Today's rounds** — a daily plan of one lesson, one review, one drill, and one scenario or quiz, tracked per day.
- **Tutor** — an Ask button on every lesson, card, question, scenario and reference sheet opens a chat grounded in what is on screen. Answers stream from Claude through a small service on the homelab, using the owner's own subscription.
- **Reference** — 18 pocket cards: vitals by age, GCS/APGAR, drug lists, order of draw, lab normals, ESI, isolation precautions, rhythm cheat sheet and more.
- **Path** — the checklist from EMT course to PA matriculation.
- **Pencil notes** — an ink layer over any lesson (pen draws, fingers scroll, palm rejection, pressure width). Notes persist per lesson on the device.

Progress lives on the device (localStorage; ink in IndexedDB) and can be exported and imported from Settings. The app works offline once installed.

## Install on the iPad

Open the site in Safari, tap Share, then **Add to Home Screen**. It launches full-screen and keeps working without a connection. Updates are picked up on the next open.

## Repository layout

```
content/
  manifest.json          track order and module ids
  SCHEMA.md              the content contract (validated)
  BRIEF.md               writing brief for content authors
  modules/<id>.json      one file per module: lessons, cards, quiz, scenarios
  modules/<id>.ext.json  optional second pass merged into the module at build
  reference/<id>.json    pocket cards
src/                     the app (no framework, no build-time dependencies)
  app.js                 router and views; loads content/<id>.js on demand
  rhythm.js              ECG strip synthesizer for the rhythm drill
  drills.js, tools.js    practice engines and bedside calculators
  tutor.js               the tutor panel (streams from the tutor service)
  ink.js                 Apple Pencil ink layer
tutor/server.mjs         the tutor service (Claude Agent SDK, runs on the homelab)
tools/
  validate.mjs         schema validator  (node tools/validate.mjs --all)
  build.mjs            bundles content + app into dist/ (node tools/build.mjs [--strict])
  icons.mjs            generates the PNG/SVG icons with no dependencies
  serve.mjs            local static server for dist/ (node tools/serve.mjs 9230)
  deploy.mjs           builds and ships dist/ to the serving host over SSH
```

## Working on it

```
node tools/validate.mjs --all      # check every content file
node tools/build.mjs --strict      # build; fail on any invalid content
node tools/serve.mjs 9230          # serve dist/ locally
```

Content is plain JSON in a documented markdown subset. To add a module: write `content/modules/<id>.json` to the schema, list its id in `content/manifest.json` under the right track, validate, build.

## Deploy

The app is served from the homelab over the tailnet, so the iPad reaches it anywhere Tailscale is on:

```
node tools/deploy.mjs            # build, ship dist/ to the host, swap it live
```

On the host, `tools/serve.mjs` runs as a user service on port 9230 and `tailscale serve` fronts it with HTTPS at `https://nova.taild8324f.ts.net/`. The service worker needs that HTTPS origin; plain LAN access over HTTP works for reading but not for the home-screen install or offline mode.
