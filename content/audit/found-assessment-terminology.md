# Audit: found-assessment-terminology

Batch files:

- `content/modules/found-assessment.json` (8 lessons / 21 lesson checks / 53 cards / 26 quiz / 2 scenarios)
- `content/modules/found-assessment.ext.json` (8 lessons / 24 checks / 56 cards / 32 quiz / 2 scenarios)
- `content/modules/found-assessment.quiz.json` (32 extra lesson checks / 56 quiz)
- `content/modules/found-terminology.json` (9 lessons / 27 checks / 60 cards / 28 quiz / 1 scenario)
- `content/modules/found-terminology.ext.json` (8 lessons / 24 checks / 60 cards / 30 quiz / 2 scenarios)
- `content/modules/found-terminology.quiz.json` (34 extra lesson checks / 56 quiz)

**Items reviewed: 1,052** — every lesson body, keyPoint list, check, card, quiz item (stem + 4 choices + key + rationale), and every scenario step, choice, feedback and debrief.

Scope references used: National EMS Education Standards 2021 / NREMT psychomotor skill sheets, AAOS *Emergency Care and Transportation of the Sick and Injured* 12e, AHA 2020 ECC, PALS age-based vitals, FDA labeling for NARCAN nasal spray, Chabner *The Language of Medicine* / Stedman's for word parts, The Joint Commission official "Do Not Use" list, standard nursing patient-positioning references.

## Corrections

| file | id | was | now | source |
|---|---|---|---|---|
| found-assessment.json | found-assessment-l08 (body) | "naloxone is `4 mg` intranasal, **one spray per nostril**, repeated as needed" | "naloxone is `4 mg` intranasal, **the whole single-dose device sprayed into one nostril**, repeated in the other nostril as needed" | FDA label, NARCAN (naloxone HCl) nasal spray 4 mg: "Administer a single spray into one nostril"; repeat doses use a new device in the alternate nostril. The old wording instructed a double dose (8 mg) or a split of a device that cannot be split. |
| found-assessment.ext.json | found-assessment-l11 (body) | "naloxone is `4 mg` intranasal, **half a device per nostril**, repeated as needed" | "naloxone is `4 mg` intranasal, **the whole single-dose device into one nostril**, with any repeat dose given in the other nostril" | Same FDA label. The 4 mg device is single-use and non-divisible; halving it delivers an unknown fraction of the dose. (The "half per nostril" split belongs to the improvised 2 mg/2 mL atomizer, not the 4 mg spray.) |
| found-terminology.json | found-terminology-l09 (body) | "An order for `6U` of insulin read as `60` units is a **hundredfold-scale** error" | "...is a **tenfold** error" | Arithmetic: 6 → 60 is one order of magnitude. The rest of the module correctly calls the decimal-point failures tenfold. |
| found-terminology.json | found-terminology-l06 (position table) | "Fowler's — sitting upright, about `60`–`90` degrees" | "Fowler's — sitting upright, about `45`–`60` degrees (high Fowler's is `60`–`90`)" | Standard positioning definitions: low Fowler 15–30°, semi-Fowler 30–45°, Fowler 45–60°, high Fowler 60–90°. 60–90° is high Fowler's, not Fowler's. |
| found-terminology.json | found-terminology-l06 (keyPoint) | "Fowler's is upright 60–90 degrees and semi-Fowler's is 30–45 degrees" | "Fowler's is upright 45–60 degrees (high Fowler's 60–90) and semi-Fowler's is 30–45 degrees" | same |
| found-terminology.json | found-terminology-c041 | "Fowler's is sitting upright at about 60 to 90 degrees" | "Fowler's is sitting upright at about 45 to 60 degrees…; high Fowler's is 60 to 90" | same |
| found-terminology.quiz.json | check on found-terminology-l06 (#0) | stem "head of the stretcher raised to **75 degrees**"; rationale "Fowler's is… 60 to 90 degrees" | stem "raised to **55 degrees**"; rationale "Fowler's is… 45 to 60 degrees" | same. 75° is high Fowler's; the stem is re-anchored so the keyed answer (Fowler's) is unambiguously correct and consistent with the corrected lesson. |
| found-assessment.json | found-assessment-s01 (debrief) | "Orthopnea, nighttime episodes, furosemide on the medication list, and **three days of worsening**…" | "…and **a week of recurring night-time episodes**…" | Internal contradiction: the scenario's own history (step s4) states onset one hour ago with two similar episodes in the past week. No three-day history exists anywhere in the case. |

No answer keys or choice counts were changed, so the answer-index spread is unaffected; all six files re-validate `ok`.

## Unverifiable / judgment calls (left alone)

- **"A palpable radial pulse suggests a systolic of roughly 80 mmHg"** (found-assessment-l02, c013, q005; ext q064 by implication). This is the traditional ATLS/AAOS teaching and is still in current EMT texts, but Deakin & Low (*BMJ* 2000) showed the pulse-site pressure estimates systematically overestimate. The module already hedges with "roughly"/"suggests" and the clinical direction (loss of radial = hypotension) is sound, so it was left as written. Flagged here in case a future pass wants it softened further.
- **Pediatric systolic floor table** (found-assessment-l10). The "6 to 12 years → 80 mmHg" row is the common EMT-text simplification, but PALS uses 70 + (2 × age) for 1–10 years and 90 mmHg from age 10. A 12-year-old floor of 80 is below the PALS threshold. The formula given alongside the table is correct and every quiz item keys off the formula, so the table was left as the textbook-standard simplification.
- **"Up to one third of heart attacks in people over 75 present without chest pain"** (found-assessment-l10, c062). Supported by NRMI/Bayer-era data and conservative relative to later estimates in the very elderly; left as a defensible floor rather than a precise claim.
- **Suction limited to "10 seconds at a time" in adults** — AAOS gives 10–15 s; 10 s is the stricter and commonly tested value. Left.
- **Oral glucose "typically 15 g of gel"** — tube sizes vary (15 g, 24 g, 31 g, 45 g). "Typically" is doing honest work. Left.
- **"Tracheectomy"** (found-terminology-l13, c095) is a rare word used illustratively to complete the -otomy/-ostomy/-ectomy set; real-world practice says "tracheal resection". Kept because the teaching point is the suffix contrast, not the operation.
- **Joint Commission list scoping** was checked item by item: the official list (U/u, IU, Q.D./QD, Q.O.D./QOD, trailing zero, missing leading zero, MS, MSO4, MgSO4) is reproduced correctly, and cc / µg / AD-AS-AU / OD-OS-OU / D/C / HS / SC-SQ / TIW are correctly presented as institutional or "possible future inclusion" items rather than official ones. No change needed.
- Every root, prefix, suffix, eponym and abbreviation in the terminology module was checked individually (including `myel/o` vs `my/o`, `pyel/o` vs `py/o` vs `pyr/o`, `ileum` vs `ilium`, `cyst/o` dual meaning, `natr/o`/`kal/i`/`calc/i`, Kussmaul respirations vs Kussmaul's sign, Osborn/J wave, Babinski age cutoff, Trousseau 3-minute cuff, Cullen/Grey Turner 24–48 h latency, Kehr's/Rovsing's/Murphy's/Brudzinski's/Kernig's/Beck's/Levine's, McBurney's point location, the nine abdominal regions, the three planes, and the CBC/BMP/blood-gas vocabulary). All were correct as written.

## Verdict

High-quality batch. Two genuine patient-safety errors (a naloxone administration instruction repeated in two different lessons, in two different wrong forms), one arithmetic error, one positioning-definition error propagated across four items, and one internal contradiction in a scenario debrief — 8 corrections across 1,052 items. Everything else, including the entire word-part and Joint Commission content, checked out against source.
