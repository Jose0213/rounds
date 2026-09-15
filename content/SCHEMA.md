# Rounds content schema (v1)

Every module is one JSON file at `content/modules/<id>.json`. Validate with:

```
node tools/validate.mjs content/modules/<id>.json
```

The validator is the contract. If it passes, the app can load the file.

## Module

```jsonc
{
  "schema": 1,
  "id": "emt-airway",              // kebab-case, matches filename, matches content/manifest.json
  "track": "emt",                  // foundations | emt | edtech | prepa
  "title": "Airway, Respiration & Ventilation",
  "short": "Airway",               // <= 16 chars, used in nav
  "summary": "One or two plain sentences on what this module gives you.",
  "lessons": [ Lesson, ... ],      // 6–10
  "cards": [ Card, ... ],          // 40–70
  "quiz": [ Question, ... ],       // 20–35
  "scenarios": [ Scenario, ... ]   // 1–3 (0 allowed only for pathway/terminology-type modules)
}
```

## Lesson

```jsonc
{
  "id": "emt-airway-l01",          // <module>-l<NN>
  "title": "How breathing actually works",
  "minutes": 6,                    // 4–9, honest reading + checks time
  "body": "markdown…",             // 350–700 words, see Markdown subset
  "keyPoints": ["…", "…", "…"],    // 3–5 one-liners, the things to walk away with
  "checks": [                      // 2–3 gated questions the reader must pass to finish the lesson
    { "q": "…", "choices": ["…", "…", "…", "…"], "answer": 0, "why": "…" }
  ]
}
```

## Card (flashcard, spaced repetition)

```jsonc
{
  "id": "emt-airway-c001",         // <module>-c<NNN>
  "front": "A question or prompt, not a bare term",
  "back": "Concise answer, <= 45 words",
  "lesson": "emt-airway-l01"       // the lesson it belongs to (must exist)
}
```

## Question (quiz, NREMT style)

```jsonc
{
  "id": "emt-airway-q001",         // <module>-q<NNN>
  "q": "Single best answer stem. Clinical vignette where it fits.",
  "choices": ["…", "…", "…", "…"], // exactly 4
  "answer": 2,                     // index 0–3
  "why": "Why the right one is right AND why the tempting wrong ones are wrong.",
  "lesson": "emt-airway-l03",
  "difficulty": 2                  // 1 recall, 2 application, 3 analysis
}
```

## Scenario (branching case)

```jsonc
{
  "id": "emt-airway-s01",          // <module>-s<NN>
  "title": "Dispatched: 62M, difficulty breathing",
  "setting": "field",              // field | ed | classroom
  "intro": "markdown — dispatch info / handoff / what you know walking in",
  "steps": [
    {
      "id": "s1",
      "prompt": "markdown — what you see, hear, are told right now",
      "vitals": { "hr": 118, "bp": "88/54", "rr": 26, "spo2": 91, "temp": 37.1, "gcs": 14 }, // optional, any subset
      "choices": [
        { "text": "…", "next": "s2", "feedback": "…", "score": 1 },   // 1 best, 0 acceptable, -1 harmful
        { "text": "…", "next": "s2", "feedback": "…", "score": 0 },
        { "text": "…", "next": "s2", "feedback": "…", "score": -1 }
      ]
    },
    { "id": "s2", "prompt": "…", "choices": [ … ] }
  ],
  "debrief": "markdown — the pattern to remember, what the case taught"
}
```

Rules: 4–7 steps; 3–4 choices per step; every `next` must be a step id or `"end"`; the last step's choices all go to `"end"`. Mostly linear is fine — the teaching lives in the feedback. At least one choice per step must score 1.

## Reference sheet (`content/reference/<id>.json`)

```jsonc
{
  "schema": 1,
  "id": "vitals-by-age",
  "title": "Normal vitals by age",
  "group": "assessment",           // assessment | airway | cardiac | trauma | meds | labs | ecg | ed | terms | exam
  "body": "markdown — tables welcome",
  "tags": ["vitals", "pediatric"]
}
```

## Markdown subset

The app renders only this. Anything else shows as literal text.

- `## Heading` and `### Subheading` (no `#` top-level)
- paragraphs separated by a blank line
- `**bold**`, `*italic*`, `` `code` `` (use code for exact values: `94%`, `0.3 mg IM`)
- `- ` bullet lists, `1. ` numbered lists (one level, no nesting)
- tables: header row, `|---|` separator row, body rows
- callouts as blockquotes whose first words are a bold label, one of:
  - `> **Key:** …` the single most important idea
  - `> **Trap:** …` a common mistake or exam distractor
  - `> **On the exam:** …` how NREMT / the test frames it
  - `> **On shift:** …` what it looks like in real practice as an EMT or ED tech
- no images, no HTML, no emoji, no links

## Voice and altitude

- Reader has zero medical background and gets bored fast. Plain words first, then the term in parentheses, then use the term.
- Explain the why (mechanism) in one or two sentences before the what (the rule).
- Every number is real: doses, ranges, times, ratios. Say "varies by protocol" when it truly does.
- Short paragraphs (2–4 sentences). A lesson that reads like a wall of text is wrong.
- Guidelines: AHA 2020/2025 CPR & ECC, current NREMT cognitive exam content, NJ state EMT cert where state specifics matter.
- Do not mention this app, software, or the reader's job history. No motivational filler.

## Extension file (`content/modules/<id>.ext.json`)

Deepens an existing module without touching its base file. The build merges it in; the validator checks it against the merged module.

```jsonc
{
  "schema": 1,
  "extends": "emt-airway",         // the base module id, matches filename <id>.ext.json
  "lessons": [ Lesson, ... ],      // 3–10 NEW lessons; ids continue the numbering (base has l01–l10 → start at l11)
  "cards": [ Card, ... ],          // 20–80; may reference base lessons or new ones
  "quiz": [ Question, ... ],       // 15–50; skew harder: mostly difficulty 2–3
  "scenarios": [ Scenario, ... ]   // 0–3; ids continue (base s01–s02 → s03)
}
```

Rules: read the base module first and do not repeat a lesson it already teaches (duplicate titles are rejected). New lessons cover gaps, edge cases, harder applications, exam traps, and "second-pass" depth. Merged totals may reach 20 lessons, 170 cards, 90 questions, 6 scenarios.

Validate with `node tools/validate.mjs content/modules/<id>.ext.json`.

## Question bank file (`content/modules/<id>.quiz.json`)

Adds assessment to an existing module without touching its base or extension file: extra lesson checks and extra quiz questions. Merged at build; no upper cap on questions.

```jsonc
{
  "schema": 1,
  "extends": "emt-airway",
  "checks": {                         // extra gated checks per lesson id; 2–3 per lesson, every lesson covered
    "emt-airway-l01": [ { "q": "…", "choices": ["…","…","…","…"], "answer": 1, "why": "…" } ]
  },
  "quiz": [ Question, ... ]           // 40–80 more questions; ids continue after base+ext (e.g. q061…); difficulty mostly 2–3
}
```

Validate with `node tools/validate.mjs content/modules/<id>.quiz.json`.

## Exam file (`content/exams/<id>.json`)

A standalone full-length practice test, not tied to lessons. The app draws a timed attempt from the pool by section weight.

```jsonc
{
  "schema": 1,
  "id": "pa-cat",
  "title": "PA-CAT",
  "blurb": "One or two sentences on what the real exam is and how this mirrors it.",
  "minutes": 270,                   // time limit for a full attempt
  "count": 240,                     // questions per attempt (drawn from the pool by section weight)
  "sections": [ { "id": "anat", "title": "Anatomy", "weight": 0.12 }, ... ],   // weights sum to ~1
  "questions": [
    { "id": "pa-cat-q0001", "section": "anat", "q": "…", "choices": ["…","…","…","…"], "answer": 2, "why": "…", "difficulty": 2 }
  ]
}
```

Rules: question ids `<exam-id>-q<NNNN>`; every section referenced exists; pool per section at least 1.5× what an attempt draws; rationales explain the wrong choices; correct index spread evenly. Validate with `node tools/validate.mjs content/exams/<id>.json`.


## Video sidecar: `content/modules/<id>.videos.json`

Optional. Embeds YouTube videos under a lesson ("Watch" section).

```json
{ "schema": 1, "extends": "<module id>", "videos": { "<lesson id>": [ { "id": "dQw4w9WgXcQ", "title": "...", "channel": "...", "start": 0 } ] } }
```

- `id` is the 11-character YouTube video id. 1-3 videos per lesson. `start` (seconds) is optional.
- Every entry must carry `verified: true`, which only `node tools/yt-check.mjs <file>` sets after confirming the video exists via YouTube oEmbed. The validator rejects unverified entries.
- Pick videos that teach the same content at the same level as the lesson, from reputable channels (AHA, NREMT, EMS educators, university physiology channels). No monetized clickbait, no Shorts, no playlists.
