# Accuracy audit — emt-obgyn-special

## Files reviewed

- `content/modules/emt-obgyn-peds.json` — 8 lessons, 23 checks, 60 cards, 32 quiz, 2 scenarios (11 steps)
- `content/modules/emt-obgyn-peds.ext.json` — 9 lessons, 24 checks, 68 cards, 34 quiz, 3 scenarios (15 steps)
- `content/modules/emt-obgyn-peds.quiz.json` — 34 lesson checks, 55 quiz
- `content/modules/emt-special-populations.json` — 10 lessons, 30 checks, 64 cards, 36 quiz, 2 scenarios (9 steps)
- `content/modules/emt-anatomy-lifespan.json` — 10 lessons, 28 checks, 62 cards, 34 quiz, 2 scenarios (9 steps)

**665 items reviewed** (every lesson body, keyPoint, check, card, quiz question with choices/answer/rationale, and scenario step/choice/feedback).

Scope frame: EMT-Basic (NREMT / New Jersey), AHA 2020 ECC + NRP/PALS numbers, AAOS 12e / Brady 14e, AAP/PALS pediatric vital ranges.

## Corrections

| file | id | was | now | source |
|---|---|---|---|---|
| emt-obgyn-peds.quiz.json | check `emt-obgyn-peds-l06` #0 | `answer: 2` ("Above the floor of 79, so it is acceptable for now") — the keyed choice contradicted the item's own rationale, which correctly computes the floor as 88 and calls the patient decompensated | `answer: 0` ("Below the floor of 88, so he is in decompensated shock") | PALS/ATLS hypotension floor 70 + (2 x age) for 1-10 yr; 70 + 18 = 88, so SBP 84 is below it. The rationale text already said this. |
| emt-obgyn-peds.json | lesson `l01` body | "She can lose `1,500 mL` — roughly a third of her volume" | "…roughly a quarter of her volume" | Third-trimester blood volume is about 6 L (pre-pregnancy ~4.5 L plus 45-50%). 1,500 / 6,000 = 25%, not 33%. The 30-35% figure the same lesson gives for the point at which BP finally falls is the sourced number (AAOS 12e) and is preserved. |
| emt-obgyn-peds.json | lesson `l07` body (Trap callout) | "blood pressure … drops only after `30 to 45%` volume loss" | "drops only after about `30%` volume loss" | PALS: hypotension in children appears after roughly 25-30% blood volume loss; 45% is unsupported. Also aligns with `emt-anatomy-lifespan` l08, which already says "30 percent or more". |
| emt-obgyn-peds.json | lesson `l07` check #1 rationale | "it drops only after 30 to 45% volume loss" | "it drops only after about 30% volume loss" | same |
| emt-obgyn-peds.json | card `emt-obgyn-peds-c053` | "hold a normal pressure until 30 to 45 percent volume loss" | "until about 30 percent volume loss" | same |
| emt-anatomy-lifespan.json | lesson `l04` body | "Infants under about `30` days are obligate nose breathers" | "Infants under about `4` to `6 months` are obligate nose breathers" | Obligate/preferential nasal breathing persists roughly to 2-6 months, with the transition usually at 4-6 months. The 30-day figure is far too narrow and contradicted `emt-obgyn-peds.ext` l09, which says "about 4 months". |
| emt-anatomy-lifespan.json | lesson `l10` body | "obligate nose breathers in the first weeks" | "for the first few months" | same |
| emt-anatomy-lifespan.json | quiz `emt-anatomy-lifespan-q014` rationale | "Infants under about a month breathe almost exclusively through the nose" | "Infants in the first months of life breathe almost exclusively through the nose" | same (keyed answer unaffected — the stem patient is 2 weeks old) |

No other answer keys, doses, ratios, thresholds or scope statements required change. All five files validate `ok`; the answer-index spread in the quiz bank stays even (0: 25.5%, 1: 25.5%, 2: 25.5%, 3: 23.6%).

## Verified and deliberately left alone (spot-checks that passed)

- Neonatal resuscitation: PPV 40-60/min for apnea, gasping or HR under 100; compressions at HR under 60 after 30 s of chest-rising ventilation; 3:1 at 120 events/min = 90 compressions plus 30 breaths; two-thumb, lower third of sternum, one-third depth; MR SOPA order; room air for term and 21-30% for preterm; preductal SpO2 targets 60-65% at 1 min rising to 85-95% at 10 min; plastic wrap without drying under 32 weeks, target 36.5-37.5 C. All match AHA/NRP 2020.
- APGAR table, cut points (7-10 / 4-6 / 0-3) and both worked examples recompute correctly.
- Pediatric vital-sign table (identical in both modules): matches PALS/AAP ranges, including preschool RR 20-28 and school-age 18-25, which are the PALS values rather than the narrower AAOS ones.
- Ventilation of an infant or child with a pulse at 1 breath every 2-3 s (20-30/min) — the 2020 AHA change, correctly applied, including in head injury where hyperventilation is explicitly rejected.
- Albuterol 2.5 mg in 3 mL nebulized at 6-8 L/min; MDI 90 mcg per actuation; dexamethasone 0.6 mg/kg (hospital); 20 mL/kg isotonic bolus over 5-20 min to about 60 mL/kg (ALS).
- DuoDote/ATNAA atropine 2.1 mg plus pralidoxime 600 mg IM titrated to secretions rather than pupils; SLUDGEM/DUMBELS; blast-injury phases; OSHA 19.5% oxygen-deficient threshold; 5-10-20 airbag rule; orange HV cabling at 200-800 V DC; about 90% of contamination removed with clothing.
- Anatomy and physiology numbers: 206 bones; 7-12-5-5-4 vertebrae; true/false/floating ribs; femur 1-2 L and pelvis 2 L or more; trachea 10-12 cm, about 23 generations, about 300 million alveoli, about 70 square meters; TV 500 and dead space 150; SA 60-100, AV 40-60, Purkinje 20-40; SV about 70 mL; 70 mL/kg; 30-32 ATP aerobic vs 2 anaerobic; oliguria under 0.5 mL/kg/h; lethal triad below 35 C; fontanelle closure 3 mo and 9-18 mo; weight doubles 4-6 mo and triples at 1 yr.
- Scope: nothing in the batch has an EMT starting an IV, intubating, giving oxytocin, magnesium or IV epinephrine, or performing a vaginal exam — several items explicitly name those as out of scope. DuoDote appears only where the scenario states protocol authorizes it, which matches the National EMS Scope of Practice Model and NJ CHEMPACK practice.
- Commotio cordis "the wrong 20 milliseconds": checked and kept — the experimental vulnerable window is a 10-30 ms band on the T-wave upstroke, commonly described as a 20 ms window.
- Cord clamps at "6 and 9 inches": inside the range EMS protocols teach (first clamp 6-8 in from the infant, second 2-3 in beyond).

## Unverifiable / judgment calls (left as written)

- **Postpartum hemorrhage defined as more than 500 mL** (base l03, ext l15). ACOG's 2017 reVITALize definition is 1,000 mL or more for all delivery routes, but 500 mL after a vaginal birth is still the figure in AAOS 12e / Brady 14e and on the NREMT. Kept at the EMT-text value.
- **Delayed cord clamping "1 to 3 minutes"** for a vigorous term newborn. AHA 2020 says longer than 30 seconds, ACOG says at least 30-60 s, WHO says 1-3 min. Defensible, but not the only number a grader might want.
- **Febrile seizures in "about 1 in 25 children between 6 months and 6 years."** 2-5% prevalence is accepted (1 in 25 = 4%); AAP defines the age band as 6-60 months while EMT texts commonly say 6 months to 6 years. Left at the EMT-text framing.
- **Scenario `emt-obgyn-peds-s05`**: an 84-year-old woman on tamsulosin. That is off-label in women (FDA-labeled for BPH) but genuinely common for retention and stones, and the teaching point — a new alpha blocker as a fall cause — is sound.
- **Down syndrome congenital heart defects "about 50%"**: reported ranges run about 40-50%. Kept.
- **"Atlantoaxial instability in roughly 10-15%"** is the radiographic-laxity figure; symptomatic instability is 1-2%. The lesson's use of it (handle the neck gently) is correct either way.
- **Suction limits 10 s adult / 5 s infant and suction pressures 60-100 / 100-120 mmHg**: protocol-variable, and both files say so.
- **`emt-special-populations` lesson l10 body is 833 words**, which trips the validator's "body long" warning. That is a warning, not an error, and length is out of audit scope, so no content change was made.

## Verdict

Strong batch. Across 665 items there was one hard answer-key error (a pediatric hypotension check whose keyed choice contradicted its own arithmetic) and a handful of overstated or internally inconsistent numbers; the clinical guidance, drug doses, resuscitation algorithms and EMT scope boundaries were otherwise accurate and current.
