# Accuracy audit: pa-cardio-resp-ecg

Batch: pre-PA / PANCE-level cardiopulmonary anatomy & physiology and ECG interpretation.

## Files and items reviewed

| File | Lessons | Cards | Quiz | Scenarios |
|---|---|---|---|---|
| `content/modules/pa-anatomy-cardio-resp.json` | 10 (+29 checks) | 74 | 32 | 2 (10 steps) |
| `content/modules/pa-anatomy-cardio-resp.ext.json` | 9 (+27 checks) | 80 | 46 | 3 (15 steps) |
| `content/modules/pa-anatomy-cardio-resp.quiz.json` | — | — | 57 | — |
| `content/modules/pa-ecg.json` | 10 (+30 checks) | 80 | 37 | 2 (12 steps) |
| `content/modules/pa-ecg.ext.json` | 8 (+24 checks) | 71 | 48 | 2 (8 steps) |
| `content/modules/pa-ecg.quiz.json` | — | — | 80 | — |

Total discrete items reviewed: **37 lessons, 110 lesson checks, 305 cards, 300 quiz questions, 9 scenarios (45 steps)** — 806 items, each read in full (body, keyPoints, every choice, answer key and rationale).

## Corrections

| file | id | was | now | source |
|---|---|---|---|---|
| `pa-anatomy-cardio-resp.json` | `pa-anatomy-cardio-resp-l07` (body, "Lactate, the perfusion meter") | "over `4 mmol/L` marks severe tissue hypoperfusion and, with suspected infection, defines septic shock together with pressors" | "over `2 mmol/L` despite fluid resuscitation, together with a vasopressor requirement and suspected infection, defines septic shock, and over `4 mmol/L` marks severe tissue hypoperfusion" | Sepsis-3 consensus definitions (Singer et al., JAMA 2016) and Surviving Sepsis Campaign 2021: septic shock = vasopressors to keep MAP ≥65 **plus lactate >2 mmol/L** despite adequate volume resuscitation. 4 mmol/L is a severity marker, not the definitional threshold. |
| `pa-anatomy-cardio-resp.ext.json` | `pa-anatomy-cardio-resp-s05` step `s2` (prompt, and feedback on choice 3) | pre-ductal (right hand) `86%` with post-ductal (foot) `72%` in a newborn whose echo (step s4) shows transposition of the great arteries | pre-ductal `72%`, post-ductal `86%`; feedback now names it reverse differential cyanosis | In d-TGA the aorta arises from the RV (deoxygenated blood to the upper body) while the PA arises from the LV and delivers oxygenated blood to the descending aorta through the PDA, so the **lower** body saturates higher — "reverse differential cyanosis." The original numbers were the normal differential pattern of coarctation/interrupted arch/PPHN and contradicted the case's own diagnosis. (Nelson Textbook of Pediatrics; AHA/AAP CCHD screening literature.) |
| `pa-ecg.quiz.json` | `pa-ecg-q094` (stem + rationale) | stem: "deep, wide S wave in **V6** and a monophasic, notched R wave in lead I"; rationale contained a parenthetical self-correction ("actually QS in V1 is the classic finding…") | stem: "deep, wide S wave in **V1** and a monophasic, notched R wave in leads I and V6"; rationale cleaned to "broad monophasic R in I and V6 with a deep S or QS complex in V1" | LBBB morphology: broad notched/monophasic R in I, aVL, V5–V6 with QS or rS in V1 (AHA/ACCF/HRS 2009 recommendations for intraventricular conduction disturbances). The original stem described the wrong lead and contradicted its own keyed answer. |
| `pa-ecg.quiz.json` | `pa-ecg-q123` (choice 1 + rationale) | keyed choice: "**No**… 400 ms corrected at this rate is within a normal range"; rationale computed "a QTc near 520 ms…" then trailed off, contradicting the key | keyed choice: "**Yes**, because at a faster heart rate the corrected QT is longer than the raw QT: 400 divided by the square root of 0.6 is about 516 ms"; rationale rewritten with the full calculation and the 500 ms threshold | Bazett: QTc = QT/√RR. At 100 bpm, RR = 0.6 s, √0.6 = 0.775, QTc = 400/0.775 ≈ 516 ms — prolonged, and above the 500 ms torsades-risk line the module itself teaches (`pa-ecg-l08`). Answer key was wrong and the rationale contradicted it. |

All four files touched (`pa-anatomy-cardio-resp.json`, `pa-anatomy-cardio-resp.ext.json`, `pa-ecg.quiz.json`) re-validated with `node tools/validate.mjs` — all print `ok`. Answer indices were not changed, so index spread is unaffected.

## Unverifiable / judgment calls (left alone)

- **QTc normal ceilings drift between files.** `pa-ecg-l08` gives "up to about 440–450 ms in men, 460–470 ms in women"; card `pa-ecg-c065` gives "450 men / 470 women"; `pa-anatomy-cardio-resp-l13` gives "<440 men / <460 women". All are within the published ranges (AHA/ACCF/HRS 2009 uses 450/460; 440 is the older Bazett convention). Not contradictory enough to be an error; flagged for consistency if the author wants one number.
- **Inferior-wall artery share.** `pa-anatomy-cardio-resp-l02` says right dominance is ~85%; `pa-ecg-l06` says the RCA causes inferior STEMI in ~80%. Both figures are sourced and describe slightly different things (anatomic dominance vs. culprit vessel). Left as written.
- **Axis by the two-lead method.** `pa-anatomy-cardio-resp-q117`'s rationale says lead I up / aVF down "places the vector between −30 and −90 degrees." Strictly this quadrant spans 0 to −90 and lead II refines it — which the ECG module itself teaches correctly (`pa-ecg-l03`, `pa-ecg-q009`). Left as the standard teaching simplification for that module's level.
- **Bronchodilator reversibility (12% AND 200 mL).** Still the criterion in most PANCE-level texts and GOLD; ATS/ERS 2021 moved to >10% of predicted. Left at the 12%/200 mL convention the module uses consistently.
- **Type 2 respiratory failure at PaCO2 >45 mmHg.** Some texts use >50 mmHg. >45 is the definition of hypercapnia and is defensible; left alone.
- **`pa-anatomy-cardio-resp-q051` distractor** ("No, because the change is 250 mL but only about 14 percent…") is internally illogical as written, but it is a wrong-answer distractor and the keyed answer and rationale are correct. Style, not accuracy — not touched per scope.
- **`pa-ecg.ext` `pa-ecg-s04` step s2** calls amiodarone a poor choice in pre-excited AF. This is contested (ACLS lists it; multiple case reports of acceleration; 2015 AHA SVT guideline downgraded it). The content states it as "reported to accelerate," which is accurate. Left alone.

## Verdict

High quality. Numbers, doses, thresholds, ACLS/PALS energies and drug sequences, STEMI and Sgarbossa criteria, GOLD and Light's criteria, and the pediatric normals all checked out against current sources; only four defects were found in 806 items, two of which (`pa-ecg-q123`, `pa-ecg-q094`) were internal self-contradictions the rationales themselves half-admitted.
