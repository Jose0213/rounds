# Accuracy audit — found-body-vitals

## Batch files

- `content/modules/found-body.json`
- `content/modules/found-body.ext.json`
- `content/modules/found-body.quiz.json`
- `content/modules/found-vitals.json`
- `content/modules/found-vitals.ext.json`
- `content/modules/found-vitals.quiz.json`

Scope context: beginner physiology and vital signs; normal ranges by age (AHA/AAP/PALS for peds), BP classification per 2017 ACC/AHA, SpO2 targets, temperature routes.

## Items reviewed

| Item type | Count |
|---|---|
| Lessons (full body read) | 34 |
| Key points | 170 |
| In-lesson checks | 102 |
| Extra checks (`.quiz.json` `checks` block) | 68 |
| Flashcards | 238 |
| Quiz questions | 226 |
| Scenarios / steps / step choices | 7 / 31 / 109 |

Every lesson body, key point, check, card front/back, quiz stem + 4 choices + answer + rationale, and scenario step (including every vitals block and feedback string) was read. All arithmetic in the content was recomputed by hand: MAP, pulse pressure, shock index, GCS totals, Celsius/Fahrenheit conversions, cardiac output, dead-space subtraction, pediatric `70 + 2×age` / `90 + 2×age`, lactate clearance percentages, orthostatic deltas. All of it checked out.

## Corrections

| file | id | was | now | source |
|---|---|---|---|---|
| `content/modules/found-body.json` | `found-body-l07` (lesson body) | "Atropine `0.5 mg IV` blocks the parasympathetic brake to raise a dangerously slow heart rate." | "Atropine `1 mg IV` blocks the parasympathetic brake to raise a dangerously slow heart rate." | AHA 2020 ECC Adult Bradycardia Algorithm — first dose raised from 0.5 mg to 1 mg bolus, repeat q3–5 min, max 3 mg (cpr.heart.org algorithm PDF, `algorithmacls_bradycardia_200612.pdf`) |
| `content/modules/found-body.quiz.json` | check on `found-body-l07` ("Which drug works by blocking the parasympathetic brake on the heart?"), keyed choice `[2]` | "Atropine 0.5 mg IV" | "Atropine 1 mg IV" | same |
| `content/modules/found-vitals.json` | `found-vitals-l03` (lesson body) | "Adult normal is about `90`–`140` systolic over `60`–`90` diastolic. Hypertension is commonly defined at `130/80` and above in current guidelines, and hypotension in an adult is often quoted as a systolic under `90`." | "EMS vital-sign references list roughly `90`–`140` systolic over `60`–`90` diastolic as the acceptable adult range. Diagnostically, the 2017 ACC/AHA classification is tighter: normal is under `120/80`, elevated is `120`–`129` systolic with diastolic under `80`, stage 1 hypertension starts at `130/80`, and stage 2 at `140/90`. Hypotension in an adult is often quoted as a systolic under `90`." | 2017 ACC/AHA Hypertension Guideline BP categories: normal <120/80; elevated 120–129/<80; stage 1 130–139 or 80–89; stage 2 ≥140 or ≥90 |

Note on the third fix: as written, the sentence was internally contradictory — it called up to `140/90` "normal" and then defined hypertension at `130/80` in the next clause, so `135/85` was simultaneously normal and hypertensive. The edit keeps the EMS reference range (which the age table in `found-vitals-l08` and card `found-vitals-c055` also use, correctly, as a *vital-sign* range) and separates it from the diagnostic classification the scope asked for.

No answer indices were changed, so the answer-index spread is untouched. `node tools/validate.mjs` prints `ok` with no `x` for all six files.

## Unverifiable / judgment calls (left alone)

- **Tissue tolerance to anoxia table** (`found-body-l01`, card `found-body-c005`, `found-body-q003`, `found-body-q060`): brain `4`–`6 min`, heart muscle `20`–`30 min`, kidney `30`–`60 min`, skeletal muscle `2`–`4 h`. The classic AAOS/Brady EMT table groups heart, brain and lungs together at 4–6 minutes. The module's heart figure instead reflects the pathology literature on regional coronary ischemia (irreversible myocardial necrosis begins ~20–30 minutes), which is a separate and well-sourced fact. Left as written: no keyed answer depends on the heart number, the brain figure (the one that drives CPR teaching) is correct everywhere it appears, and both claims are defensible. Flagged in case the intent was to match the EMT text exactly.
- **Orthostatic heart-rate criterion of `≥20 bpm`** (`found-vitals-l04`, card `found-vitals-c028`, `found-vitals-q013`, `q071`, scenario `found-vitals-s01`). The most-cited research standard is the "30/20/10" rule (postural pulse increment **≥30** bpm, McGee *JAMA* 1999), but `≥20 bpm` is what a large share of nursing and EMS orthostatic protocols actually use, and the module is internally consistent with it throughout. Changing it to 30 would invalidate the keyed answer in `q013` (24 bpm rise with 18/8 mmHg drops). Left alone; worth a one-line caveat in the lesson if the student's program teaches 30.
- **Neonatal systolic `60`–`90`** in the age table (`found-vitals-l08`, card `found-vitals-c057`): PALS reference values for term neonates run a bit higher (~67–84) and AAOS 12e runs lower (50–70). The module's range spans both, and the lesson explicitly says "ranges vary somewhat between textbooks and protocols… use your service's reference for exact cutoffs." Left alone.
- **Pediatric SBP ranges generally** are the AAOS/Brady EMT values, which sit below the PALS ranges for school-age and adolescent children. Consistent with the stated EMT authority, and the lesson flags the variation. Left alone.
- **"Roughly 30 trillion cells"** (`found-body-l01`): published estimates range 30–37 trillion (Sender 2016 vs Bianconi 2013). "Roughly" carries it.
- **"A 20-point fall"** in `found-body-s03` step `s3` feedback describes a 100→84 systolic change (16 points). Rounding in prose rather than a medical claim; left alone under the style exclusion.

## Verified-correct spot checks (non-exhaustive)

Aerobic vs anaerobic ATP yield (30–32 vs 2 + lactate); adult blood volume 70 mL/kg and ~5 L; ATLS hemorrhage tolerance (~15% silent, 30–40% hypotensive); pediatric hypotension and expected-SBP formulas; anaphylaxis epinephrine 0.3 mg IM adult / 0.15 mg small child; anatomic dead space 150 mL; normal pH 7.35–7.45; K⁺ >6.5 mEq/L as a lethal threshold; SIRS and qSOFA criteria; lactate bands and the ≥10% clearance target; base deficit beyond −6 mmol/L in trauma; body-water compartments (28/11/3 L of 42 L); heat-loss route shares (60/22/15/3%) and water conducting ~25× air; hypothermia staging 32–35 / 28–32 / <28 °C; Liebermeister's rule (~8–10 bpm per °C); MAP formula and the 65 mmHg autoregulation floor; cuff bladder 40% width / 80% length and both error directions; Korotkoff phases I and V; deflation 2–3 mmHg/s; auscultatory gap, pseudohypertension, pulsus paradoxus >10 mmHg, arm-to-arm difference >10–15 mmHg; pulse oximeter wavelengths 660/940 nm, CO and methemoglobin behavior, ~3× occult hypoxemia in Black patients (Sjoding, *NEJM* 2020), COPD target 88–92%, adult 94% threshold; fever ≥38.0 °C, infant-under-3-months rectal rule, heat stroke >40 °C + altered mental status, cool-first/transport-second; GCS component scales, severity bands and the 3-point floor; glucose thresholds (70 / 54 / 250 / 600 mg/dL); EtCO2 35–45 mmHg, arrest targets >10 and >20 mmHg, ROSC jump, waveform capnography as the tube-confirmation standard; shock index bands (0.5–0.7 / 0.7–0.9 / >0.9 / >1.0); NEWS2 seven parameters and trigger thresholds; pregnancy physiology (volume +30–50%, HR +10–20 bpm, BP nadir 20–24 weeks, PaCO2 ~30 mmHg, 140/90 and 160/110 thresholds, supine hypotensive syndrome after 20 weeks); Pediatric Assessment Triangle, periodic breathing <20 s, HR <60 with poor perfusion as a compression indication; FLACC / PAINAD / CPOT / CRIES / NIPS population fits; sleep-deprivation-to-BAC equivalences (17–19 h ≈ 0.05%, 24 h ≈ 0.10%), caffeine half-life ~5 h, IARC group 2A classification of circadian-disrupting shift work.

## Verdict

High quality. Three corrections across six files and roughly 845 reviewed items, of which only one was a hard clinical error (the atropine dose, appearing twice) and one an internal contradiction about BP classification; arithmetic, answer keys, rationales and scenario feedback were accurate throughout, with no reversed keys, no two-defensible-answer items, and no lesson/card/question contradictions found.
