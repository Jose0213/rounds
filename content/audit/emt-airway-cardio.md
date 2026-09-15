# Accuracy audit: emt-airway-cardio

Scope: EMT-Basic (NREMT / New Jersey), AHA 2020 ECC + 2025 focused updates, AAOS 12e / Brady 14e.

## Files reviewed

| File | Lessons | Checks | Cards | Quiz | Scenarios (steps) |
|---|---|---|---|---|---|
| content/modules/emt-airway.json | 10 | 23 | 68 | 30 | 2 (12) |
| content/modules/emt-airway.ext.json | 8 | 21 | 50 | 30 | 2 (10) |
| content/modules/emt-airway.quiz.json | 0 | 36 | 0 | 56 | 0 |
| content/modules/emt-cardio.json | 10 | 25 | 68 | 30 | 2 (12) |
| content/modules/emt-cardio.ext.json | 8 | 22 | 52 | 30 | 2 (10) |
| content/modules/emt-cardio.quiz.json | 0 | 36 | 0 | 56 | 0 |
| **Total** | **36** | **163** | **238** | **232** | **8 (44)** |

**721 items reviewed** — every lesson body, keyPoint, check, card front/back, quiz stem/choices/answer/rationale, and scenario step, choice, feedback and debrief. All arithmetic was recomputed independently: dead-space and minute-volume tables, every oxygen-cylinder duration calculation and every distractor's arithmetic, cardiac output, compression fraction, pulse pressure.

## Corrections

| file | id | was | now | source |
|---|---|---|---|---|
| emt-cardio.json | emt-cardio-l08 (body + keyPoint) | post-ROSC oxygen target `94-98%` | `92-98%` | AHA post-arrest care: titrate FiO2 to SpO2 92-98% (AHA/Neurocritical Care Society scientific statement, Circulation; AHA 2020 Part 3 / Part 11). The module's own extension file (emt-cardio-l18) already said 92-98%, so this was also an internal contradiction. |
| emt-cardio.json | emt-cardio-c055 | "titrate oxygen to an SpO2 of 94-98%" | 92-98% | same |
| emt-cardio.json | emt-cardio-c056 | "oxygen to 94-98%" | 92-98% | same |
| emt-cardio.json | emt-cardio-q023 (rationale) | "Oxygen titrated to 94-98%" | 92-98% | same |
| emt-cardio.json | emt-cardio-s02 step s5, choice 0 | "titrate oxygen toward 94-98%" | 92-98% | same |
| emt-cardio.json | emt-cardio-s02 debrief | "oxygen titrated to 94-98%" | 92-98% | same |
| emt-cardio.quiz.json | emt-cardio-q080 (keyed choice + rationale) | "titrate oxygen to 94-98%" | 92-98% | same |
| emt-cardio.quiz.json | emt-cardio-q110 | Stem asked "Which element of the BLS termination rule is most often misremembered?" and the rationale conceded "all four statements are true" — no single defensible answer | Stem rewritten to a factual case: "An unwitnessed arrest received one AED shock and never regained a pulse. Which criterion of the BLS termination of resuscitation rule does this patient fail?" Rationale rewritten. Answer index unchanged (1). | BLS termination-of-resuscitation rule (AHA 2020 Part 3): not witnessed by EMS, no shock delivered, no ROSC |
| emt-airway.ext.json | emt-airway-l17 (table row + keyPoint) | "Chest pain or suspected heart attack: **withhold** oxygen if SpO2 is 90% or above" — stated absolutely, and in direct conflict with emt-cardio-l04's "give oxygen below 94%" for the same patient | "No **routine** oxygen if SpO2 is 90% or above; many EMS protocols set the give-oxygen threshold at 94%" | 2025 ACC/AHA/ACEP/NAEMSP/SCAI acute coronary syndromes guideline: do not routinely administer supplemental oxygen when SpO2 is 90% or above |
| emt-cardio.json | emt-cardio-l04 (body) | "Oxygen is given only if the SpO2 is below 94%", with no mention of the guideline floor | Same operational rule, plus: "The AHA/ACC evidence floor is 90%; most EMS protocols, New Jersey included, set the trigger at 94%, so use your protocol's number." | same guideline, reconciled with NREMT / AAOS 12e / NJ BLS practice |

On the last two rows: this was a real cross-file contradiction inside the batch — a chest-pain patient at 92% got opposite instructions from the two modules. The 94% trigger was kept as the operational number because that is what NREMT, AAOS 12e and NJ BLS protocols teach; the AHA floor is now named rather than silently contradicted. Every keyed item that tests this (emt-airway-q053, emt-airway-l17 check[0], emt-cardio-l04 check[2], emt-cardio-q114) uses a saturation that resolves identically under either threshold, so no answer key changed.

No answer index was changed anywhere in the batch. All six files re-validated with `node tools/validate.mjs`: each prints `ok`, no `x`.

## Verified correct, no change needed (spot list)

- CPR: rate 100-120 all ages; adult depth 2-2.4 in / 5-6 cm, child ~2 in, infant ~1.5 in; 30:2 single rescuer at any age, 15:2 two-rescuer child/infant; compression fraction >=60%; interruptions under 10 s; compressor switch every 2 min; two-thumb encircling preferred for infants with two rescuers; pediatric compressions started at HR <60 with poor perfusion.
- Ventilation: adult with a pulse 1 breath every 6 s; child/infant 1 every 2-3 s (AHA 2020 update); 1 every 6 s with an advanced airway during CPR.
- Suction 15/10/5 s adult/child/infant; >=300 mmHg vacuum; corner-of-mouth-to-earlobe landmark; cricoid pressure no longer recommended.
- Cylinder math: constants D 0.16, E 0.28, M 1.56 and 200 psi residual. Every worked example and every distractor rationale recomputed and correct, including CPAP circuit consumption (E ~17 min, D ~9.6 min at 30 L/min).
- Capnography: normal 35-45 mmHg; <10 mmHg at 20 min as a termination input; shark fin = bronchospasm; SpO2 lags apnea 30-60 s.
- Carbon monoxide: 200-250x hemoglobin affinity; carboxyhemoglobin half-life 4-5 h room air, 60-90 min high-flow, 20-30 min hyperbaric.
- Epinephrine 0.3 mg adult / 0.15 mg pediatric, 1 mg/mL, IM lateral thigh, repeat 5-15 min — within NJ EMT scope.
- Nitroglycerin 0.4 mg SL q5min to 3 doses, systolic above 100, PDE-5 windows 24 h (sildenafil, vardenafil) and 48 h (tadalafil), RV-infarct caution; aspirin 324 mg chewed as four 81 mg tablets.
- 12-lead within 10 min of contact; first-medical-contact-to-balloon 90 min direct, 120 min with transfer; STEMI thresholds 1 mm limb leads, 2 mm men / 1.5 mm women in V2-V3; V1-V6 landmarks and the V4-before-V3 rule.
- i-gel sizing by weight (3: 30-60 kg, 4: 50-90 kg, 5: over 90 kg) and King LT by height with matching cuff volumes.
- Hypothermia: 30-60 s pulse check, afterdrop physiology, standard AED sequence during rewarming, termination-rule exclusions.
- Naloxone 4 mg IN / 2 mg IM, 30-90 min duration, titrate to breathing not consciousness.
- Intrinsic rates 60-100 / 40-60 / 20-40; coronary anatomy and the RCA-to-SA/AV-node relationship; PEA as a mechanical rather than electrical failure.
- Scope of practice: no EMT IV access, no antihypertensives, no ventilator setting changes, magnet application left as a medical-direction decision, 12-lead acquisition/transmission without EMT interpretation for treatment. Nothing out of EMT-Basic scope was found.

## Unverifiable / judgment calls (left alone)

- "Roughly a third of infarcts do not follow the script" (emt-cardio-l03) and "about a third of ROSC patients re-arrest" (emt-cardio-l18). Both are widely cited but study-dependent; left in their already-softened form.
- "Diaphoresis is the sign experienced providers trust most" (emt-cardio-l03, q067). Clinical-lore framing rather than a measured statistic; standard in EMT texts.
- Cardiogenic shock mortality "around 40-50%" (emt-cardio-l09, q085). Contemporary registries run roughly 35-50%; the quiz forces a single band, which is the defensible one.
- ICD internal shock "25-40 joules, roughly 10-15 seconds after recognition" (emt-cardio-l13, q096). Device- and manufacturer-dependent; typical, not universal.
- Magnet over a pacemaker "usually around 85-100" (emt-cardio-l13). True per manufacturer (Medtronic 85, Boston Scientific 100, Abbott ~98-100), but not one number.
- Pocket mask "roughly 50-55%" with oxygen at 15 L/min (emt-airway-l08, q116). Texts quote 50-60%.
- LVAD doppler MAP target "about 70-90 mmHg" (emt-cardio-l14). Center-specific; commonly quoted as 60-90 or 70-90.
- emt-cardio-s04 applies pediatric AED pads to an 8-year-old, exactly on the module's own "under about 8 years or 25 kg" boundary. AHA permits either at that age; it is narrative, not a keyed answer.
- CPAP contraindication list includes "tracheostomy" (emt-airway-l09). Protocol-dependent rather than universal, but common on EMT-level checklists.
- EMT placement of supraglottic airways and application of CPAP in New Jersey (emt-airway-l09, l10, l13). The text correctly says both vary by region and standing order rather than asserting a statewide rule; not independently verified against current NJ OEMS documents.
- emt-airway.quiz check for emt-airway-l06, item [1]: the keyed choice reads "About 32%" while the rationale computes "about 33%" (21% + 3 x 4%). Inside the stated "roughly 4% per liter" approximation and the only plausible choice.

## Verdict

High quality. Across 721 items the only substantive defects were a stale post-ROSC oxygen target that also contradicted the module's own extension file, one quiz question whose own rationale admitted every choice was true, and one cross-file contradiction on the chest-pain oxygen threshold. All arithmetic, doses, scope-of-practice boundaries and AHA 2020/2025 CPR numbers were otherwise correct.
