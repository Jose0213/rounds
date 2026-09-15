# Accuracy audit — batch `pa-gi-renal-endo-heme`

Audited 2026-09-15 against Guyton/Hall, Robbins, Harrison's, Abbas, ADA Standards of Care,
KDIGO AKI/CKD, CDC STI treatment guidelines, ACIP adult immunization schedule, ACOG/CDC
obstetric guidance, IDSA neutropenic fever, and USPSTF screening statements.

## Files reviewed

| File | Lessons | Cards | Quiz | Scenarios | Lesson checks |
|---|---|---|---|---|---|
| `content/modules/pa-anatomy-gi-renal-endo.json` | 10 | 75 | 32 | 2 | 26 |
| `content/modules/pa-anatomy-gi-renal-endo.ext.json` | 9 | 78 | 45 | 3 | 21 |
| `content/modules/pa-anatomy-gi-renal-endo.quiz.json` | — | — | 57 | — | — |
| `content/modules/pa-anatomy-heme-immune-repro.json` | 10 | 75 | 32 | 2 | 27 |
| `content/modules/pa-anatomy-heme-immune-repro.ext.json` | 9 | 80 | 45 | 3 | 21 |
| `content/modules/pa-anatomy-heme-immune-repro.quiz.json` | — | — | 57 | — | — |

**Total items reviewed: 617** (38 lesson bodies with keyPoints, 95 lesson checks, 308 cards,
268 quiz questions, 10 scenarios comprising 50 decision steps and 175 choice rationales).
Every body, keyPoint, check, card front/back, question stem, choice set, answer key,
rationale and scenario step was read.

## Corrections

| file | id | was | now | source |
|---|---|---|---|---|
| `pa-anatomy-gi-renal-endo.json` | `q032` (stem) | "…confused with a glucose of 44 mg/dL but is **not sweaty** or tremulous" | "…confused with a glucose of 44 mg/dL, with **no tremor and a heart rate of 62**" | Beta blockade suppresses tremor/tachycardia (beta-adrenergic) but sweating is cholinergic (sympathetic postganglionic ACh on muscarinic sweat-gland receptors) and is typically **preserved** — often the only remaining warning sign. Harrison's hypoglycemia chapter; [drugs.com clinical answer](https://www.drugs.com/medical-answers/beta-blockers-mask-hypoglycemia-3563672/); [EBM Consult: diabetics on beta blockers still sweat](https://www.ebmconsult.com/articles/diabetics-beta-blockers-hypoglycemia-sweating-sympathetic) |
| `pa-anatomy-gi-renal-endo.json` | `q032` (rationale) | "**Sweating**, tremor and tachycardia are epinephrine effects that beta blockade suppresses…" | "Tremor and tachycardia are beta-adrenergic effects that beta blockade suppresses… **Sweating is cholinergically mediated and is usually preserved, so it may be the only warning sign left.**" | same as above |

Answer index unchanged (3). Choice count unchanged (4). No other file was modified.

The clinical stake: as written, the item taught that an absent diaphoresis is expected in a
beta-blocked hypoglycemic patient. The real teaching point is the reverse — sweating is the
one adrenergic-looking warning sign that survives beta blockade, so it must not be discounted.

## Unverifiable / judgment calls (left alone)

- **"The spleen is the most commonly injured organ in blunt abdominal trauma"** (l02, c014, q082).
  This is the standard textbook teaching and appears in multiple sources (spleen ~49% of blunt
  solid-organ injuries), but some single-centre series report liver first. Standard for the level;
  left as written.
- **Febrile non-hemolytic reaction called "most common" transfusion reaction.** Standard teaching;
  some registries rank mild allergic/urticarial reactions comparably or higher. Left.
- **Melena requires "about 50 mL and roughly 14 hours."** Commonly cited figures (50–100 mL;
  transit 8–14 h). Within the defensible range.
- **Kidney stone passage rates ("under 5 mm pass about 90%", "5–10 mm about half").** Published
  ranges vary (<5 mm often quoted 68–90%). Upper end of a defensible range; left.
- **Levonorgestrel emergency contraception "less effective above a BMI of about 26."** Sourced to
  the pooled-trial reanalysis; other sources use BMI 30. Defensible as written.
- **Anemia cutoffs 13.5 / 12.0 g/dL** follow Harrison's rather than WHO (13.0 / 12.0). Consistent
  within the batch and standard for the level.
- **`pa-anatomy-gi-renal-endo.quiz.json` answer-index spread is skewed** — the validator emits a
  warning (`! [7,47,3,0]`, 82% on index 1). This is pre-existing and is an ordering issue, which
  the brief places out of scope, so no answers were moved. Worth a separate shuffle pass.
- **Formatting note:** `pa-anatomy-gi-renal-endo.json` was rewritten through a formatter that
  reproduces the repo's house JSON style byte-for-byte (verified against the untouched sibling
  module); only the two `q032` strings differ in content.

## Verdict

Exceptionally clean batch. Every numeric threshold checked — KDIGO AKI staging, CKD stages,
DKA/HHS criteria and resolution rules, potassium/calcium/magnesium ranges and treatment
sequences, hyponatremia correction limits, Winter's formula and delta-delta arithmetic, BISAP,
SAAG, SBP, West Haven, hepatitis serology, acetaminophen and King's College thresholds, KDIGO
FENa/FEUrea, transfusion products and reaction patterns, anticoagulant reversal pairings,
ANC arithmetic, CD4 thresholds, PEP/PrEP windows, ACIP adult schedule, preeclampsia severe
features, magnesium dosing, postpartum hemorrhage ladder, CDC STI regimens and contraceptive
failure rates — was accurate and current. One genuine mechanism error found and fixed.
