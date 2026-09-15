# Accuracy audit brief

You are fact-checking AI-written study content for an EMT → ED tech → PA student. Every claim in your batch must be checked against real references. The student cannot spot errors himself yet, so an unflagged error becomes something he learns wrong and possibly does to a patient.

## Files

- Modules: `content/modules/<id>.json`; deepening lessons/cards/questions in `<id>.ext.json`; extra checks + questions in `<id>.quiz.json`. All three belong to the same module. Schema: `content/SCHEMA.md`.
- Exams: `content/exams/<id>.json` (+ `content/exams/parts/*.json` merged at build).
- Files are large (100–170 KB, long lines). Read them in slices (`Read` with offset/limit, or `node -e` to print one lesson/card/question at a time). Do not skip anything: every lesson body, keyPoint, check, card front/back, quiz question + choices + answer + rationale, and scenario step.

## What is an error (fix it)

- Wrong medical/scientific fact, number, dose, route, normal range, threshold, mechanism, anatomy, drug class, lab value, unit, formula, or definition.
- Outdated guidance. Authorities in order: AHA 2020 ECC guidelines + 2025 focused updates (CPR/ACLS/PALS/BLS numbers), National EMS Education Standards 2021 + NREMT, AAOS *Emergency Care and Transportation of the Sick and Injured* 12e / Brady *Emergency Care* 14e, NAEMT PHTLS 10e, ESI Handbook v5, NHA CPT/CET test plans, CLSI phlebotomy order of draw, CDC/OSHA, ACOG, AAP, USPSTF, current FDA labeling, standard undergrad textbooks (Campbell Biology, Marieb A&P, Tortora Micro, Lehninger, OpenStax) for the science modules.
- EMT scope-of-practice errors (EMT-Basic, New Jersey / NREMT scope): e.g. an EMT starting an IV, giving a drug not in EMT scope, interpreting 12-leads for treatment.
- Wrong answer key, or a rationale that contradicts the keyed answer, or two defensible correct choices, or a "correct" choice that is actually wrong.
- Internal contradictions between a lesson and its own cards/questions.
- Made-up specifics: fake statistics, invented eponyms, precise numbers that no source supports. Replace with the sourced value or soften to what is defensible.

## What is NOT in scope

- Style, tone, length, structure, ids, counts, ordering. Do not rewrite lessons. Make the minimal edit that makes the statement true.
- Simplifications that are standard for the level (an EMT text saying "the heart has four chambers" is fine).

## How to work

1. Read the whole batch, item by item. Keep a running list of every claim you are not certain of.
2. Verify uncertain claims with WebSearch/WebFetch against the authorities above. Do not rely on memory for numbers, doses, guideline changes, or scope questions. Cite the source you used.
3. Fix in place with exact-string edits. Keep JSON valid, keep ids, keep choice count (4), keep each check/question with exactly one correct answer. If you change an answer index, re-check the file's answer-index spread stays under 40% on any single index (the validator enforces it).
4. Run `node tools/validate.mjs <file>` on every file you touched. It must print `ok` with no `x`.
5. Write `content/audit/<batch>.md` with: batch files, item counts reviewed, then a table of every correction: `file | id | was | now | source`. Then a short "unverifiable / judgment calls" list for anything you left alone but are not sure of. Then a one-line verdict on the batch's overall quality.
6. Report the number of items reviewed, corrections made, and the path to the log.

Do not ask questions. Do not stop early because the batch is long. Do not mark something correct because it sounds plausible.
