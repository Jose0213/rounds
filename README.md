# Rounds

A crash course in patient care and medicine, built as an installable web app for an 11-inch iPad Pro. Four tracks take a reader with no medical background through EMT-Basic and the NREMT, day one as an emergency department technician, and the anatomy, pharmacology, pathophysiology, labs, ECG reading and clinical reasoning that a PA applicant needs.

## What it does

- **Learn** — 31 modules of short lessons (5–9 minutes each). Every lesson ends in a gated check; passing it unlocks the lesson's flashcards.
- **Review** — spaced repetition (SM-2 style, four grades). A scratch area on each card takes Apple Pencil ink so you can write the answer before flipping.
- **Practice** — NREMT-style quizzes in practice or timed exam mode (domain-weighted 70-question mock), branching clinical scenarios with monitor-style vitals, and hands-on drills (12-lead placement, read the monitor).
- **Reference** — 18 pocket cards: vitals by age, GCS/APGAR, drug lists, order of draw, lab normals, ESI, isolation precautions, rhythm cheat sheet and more.
- **Path** — the checklist from EMT course to PA matriculation.
- **Pencil notes** — an ink layer over any lesson (pen draws, fingers scroll, palm rejection, pressure width). Notes persist per lesson on the device.

Progress lives on the device (localStorage; ink in IndexedDB) and can be exported and imported from Settings. The app works offline once installed.

## Install on the iPad

Open the site in Safari, tap Share, then **Add to Home Screen**. It launches full-screen and keeps working without a connection. Updates are picked up on the next open.

## Repository layout

```
content/
  manifest.json        track order and module ids
  SCHEMA.md            the content contract (validated)
  BRIEF.md             writing brief for content authors
  modules/<id>.json    one file per module: lessons, cards, quiz, scenarios
  reference/<id>.json  pocket cards
src/                   the app (no framework, no build-time dependencies)
tools/
  validate.mjs         schema validator  (node tools/validate.mjs --all)
  build.mjs            bundles content + app into dist/ (node tools/build.mjs [--strict])
  icons.mjs            generates the PNG/SVG icons with no dependencies
  serve.mjs            local static server for dist/ (node tools/serve.mjs 9230)
.github/workflows/     builds and deploys dist/ to GitHub Pages on every push to main
```

## Working on it

```
node tools/validate.mjs --all      # check every content file
node tools/build.mjs --strict      # build; fail on any invalid content
node tools/serve.mjs 9230          # serve dist/ locally
```

Content is plain JSON in a documented markdown subset. To add a module: write `content/modules/<id>.json` to the schema, list its id in `content/manifest.json` under the right track, validate, build.

## Deploy

Push to `main`. The workflow builds `dist/` and publishes it to GitHub Pages. Nothing else to configure.
