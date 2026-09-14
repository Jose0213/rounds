# Writing brief for Rounds content

Rounds is a crash-course study app for one reader: an adult with **zero medical background** who is about to take an EMT-Basic course, pass the NREMT, work as an **Emergency Department technician in New Jersey**, and later apply to **PA school**. He gets bored fast. Content must be short, concrete, mechanism-first, exam-aware, and full of real numbers.

## Process

1. Read `content/SCHEMA.md` — it is the contract (structure, counts, markdown subset, voice).
2. Write each module as one JSON file at `content/modules/<id>.json` using the Write tool (never shell heredocs).
3. After writing each file, run `node tools/validate.mjs content/modules/<id>.json` and fix every `x` line until it prints `ok`. Fix `!` warnings when cheap.
4. Valid JSON only: escape quotes, use `\n` for line breaks inside markdown strings, no trailing commas, no comments.

## Quality bar

- **Accurate** to current guidelines: AHA 2020/2025 ECC, the current NREMT cognitive exam, current EMT-B scope. Where practice varies by state or protocol, say "varies by protocol" rather than inventing a rule. New Jersey specifics (NJ OEMS certification, NJ-authorized EMT interventions) where state matters.
- **Lessons**: 350–700 words. Mechanism before rule. Paragraphs of 2–4 sentences. At least one callout per lesson (`> **Key:**`, `> **Trap:**`, `> **On the exam:**`, `> **On shift:**`). 3–5 keyPoints. 2–3 checks that test the lesson's own content. Number every dose, range, time and ratio.
- **Cards**: front is a question or prompt, never a bare term. Back <= 45 words. Every lesson gets cards. Every important number gets its own card.
- **Quiz**: NREMT style. Single best answer, 4 plausible choices, clinical vignettes where they fit. The rationale explains why the right answer is right and why the tempting distractors are wrong. Spread the correct index evenly across 0–3. Difficulty mix roughly 30% recall (1), 50% application (2), 20% analysis (3).
- **Scenarios**: realistic. 4–7 steps, 3–4 choices each, every choice has feedback that teaches, vitals blocks when they matter, a debrief that names the pattern to remember. Setting `field` for EMS, `ed` for the department, `classroom` for reasoning walkthroughs.
- **Voice**: plain words first, then the term in parentheses, then use the term. Explain why before what. No emoji, no HTML, no links, no motivational filler, no mention of apps or software or the reader's job history.
