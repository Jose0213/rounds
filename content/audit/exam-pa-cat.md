# Audit — exam-pa-cat

**Files reviewed**

- `content/exams/pa-cat.json` (metadata: title, blurb, minutes, count, 9 sections + weights)
- `content/exams/parts/pa-cat.part1.json` (130 questions)
- `content/exams/parts/pa-cat.part2.json` (115 questions)
- `content/exams/parts/pa-cat.part3.json` (115 questions)

**Items reviewed:** 360 questions (stem + 4 choices + key + rationale each) plus 1 exam metadata block.
Section pool: anat 45, phys 45, bio 40, micro 40, gen 35, biochem 40, chem 40, orgo 35, stats 40.
Every arithmetic item was recomputed by hand (cardiac output, MAP, ejection fraction, alveolar ventilation,
Poiseuille, Hardy-Weinberg ×2, recombination distance, moles/molar mass, dilution, STP volume, pH/pOH,
limiting reagent, empirical formula, mass percent, Dalton, Graham, Hess, q=mcΔT, half-life, degrees of
unsaturation, median, z-score, SEM, IQR fences, probability rules, RR, NNT, sensitivity). All computed
values matched the keyed answers.

## Corrections

| file | id | was | now | source |
|---|---|---|---|---|
| exams/pa-cat.json | pa-cat (blurb) | "240 questions across nine prerequisite subjects in 4.5 hours... Each attempt here draws 240 items **by the real subject weights**" | Blurb now names the nine official subjects (incl. behavioral sciences, and chemistry as the single "general and organic chemistry" subject), states the 4.5-hour appointment includes pre-exam questions, a break and a post-exam survey, and states that Exam Master publishes no per-subject counts so the section weights are this bank's approximation and behavioral sciences is not yet covered. | pa-cat.com "About the PA-CAT" and "Candidate Support" pages; Exam Master, *Mastering the PA-CAT* (2024-08-15) |
| parts/pa-cat.part1.json | pa-cat-q0011 | Stem: "A cervical spinal cord injury that abolishes spontaneous diaphragmatic breathing **must involve which segments?**" — a C1–C2 cord lesion also abolishes diaphragmatic breathing, so distractor 0 was defensible. Rationale also said C1–C2 injury paralyzes the diaphragm "but the nerve itself originates lower," which conceded the ambiguity. | Stem: "The phrenic nerve, whose loss abolishes spontaneous diaphragmatic breathing, arises from which spinal segments?"; rationale rewritten to explain that a C1–C2 lesion paralyzes the diaphragm by cutting descending drive above the roots. Key unchanged (C3–C5). | Moore, *Clinically Oriented Anatomy*; Marieb A&P (phrenic nerve C3–C5) |
| parts/pa-cat.part1.json | pa-cat-q0045 | Rationale: "Injecting **2 to 3 cm** below the acromion..." — contradicted the keyed choice ("2 to 3 finger widths") and understated the correct depth from the acromion. | "Injecting about **2 inches (5 cm)**, roughly 2 to 3 finger widths, below the acromion..." | CDC 2021 vaccine administration guidance / Immunize.org "How to Administer IM and SC Vaccine Injections" (central, thickest deltoid ~2 in / 5 cm below mid-acromion) |

Exam metadata otherwise verified as correct and left alone: `count` 240 and `minutes` 270 (4.5 h) both match
Exam Master's published description, as does the nine-subject structure and Pearson VUE delivery.
(The 2024 *Mastering the PA-CAT* PDF says "4 hours"; the current pa-cat.com pages say 4.5 hours, so the
file's 270 minutes follows the newer source.)

## Unverifiable / judgment calls (left alone)

- **Section weights.** Exam Master does not publish per-subject question counts or percentages for the
  PA-CAT. The nine weights in `pa-cat.json` are invented; they are internally consistent with the pool
  sizes and sum to 1.00, so they were kept but the blurb no longer claims they are "the real subject
  weights."
- **Behavioral sciences is missing from the bank.** It is one of the nine official PA-CAT subjects and
  there are zero items for it. A section cannot be declared without questions (the draw would fail), so
  this is flagged in the blurb rather than fixed. Adding ~35 behavioral-science items is the real fix.
- **Chemistry is split into two sections** (`chem`, `orgo`) where Exam Master lists one subject,
  "General and Organic Chemistry." Kept as-is: it is a pedagogically useful split, the combined weight
  (0.21) is a single-subject share, and merging would require re-tagging 75 questions with no accuracy gain.
- `pa-cat-q0244` (biochem) describes the glycerol-3-phosphate shuttle as delivering electrons "at complex
  II." Strictly, mitochondrial glycerol-3-phosphate dehydrogenase is its own FAD enzyme that reduces
  ubiquinone directly rather than passing through complex II; the ATP-yield consequence (~1.5 vs ~2.5) and
  the rationale's phrasing ("entering downstream of complex I") are correct, and the simplification is
  standard in prerequisite-level texts, so it was left.
- `pa-cat-q0134` (micro) describes a microaerophile as growing "in the upper few millimeters" of
  thioglycolate; the classic band is just below the surface. The stem's exclusivity ("only") still
  separates it cleanly from the aerotolerant and facultative distractors, so no edit.
- `pa-cat-q0001` states supraspinatus initiates "roughly the first 15 degrees" of abduction; sources give
  15–30 degrees. "Roughly 15" is within the defensible range and the key is unaffected.
- Duplicate concepts exist across sections (q0117/q0171 carrier probability; q0100/q0209 competitive
  inhibition; q0114/q0192 crossing over; q0058/q0211 Bohr effect). Both members of each pair are factually
  correct; duplication is a content-design issue, not an accuracy error, and is out of scope.

## Verdict

High quality. 360 items, every calculation reproducible, keys and rationales consistent; three corrections
in total (one metadata overstatement, one ambiguous stem, one internally contradictory number). No wrong
answer keys, no scope errors, no outdated guidance found.

## Validation

`node tools/validate.mjs` prints `ok` with no `x` for `content/exams/pa-cat.json` and for the built merge of
the three part files (remaining output is two warnings that the `gen` and `orgo` pools hold 35 items where a
240-item attempt wants 36 — pre-existing, not introduced by this audit).
