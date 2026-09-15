# Accuracy audit — ed-ekg-monitoring

**Batch files**

- `content/modules/ed-ekg.json`, `ed-ekg.ext.json`, `ed-ekg.quiz.json`
- `content/modules/ed-monitoring.json`, `ed-monitoring.ext.json`, `ed-monitoring.quiz.json`

**Items reviewed:** 36 lessons (bodies + keyPoints), 180 gated checks, 265 cards, 249 quiz questions, 10 scenarios (45 steps, all choices/feedback/debriefs) — 775 items.

## Corrections

| file | id | was | now | source |
|---|---|---|---|---|
| ed-monitoring.ext.json | ed-monitoring-l16 (body, "Numbers with a pediatric twist") | "In an infant, a heart rate under `100` with poor perfusion is an indication to begin compressions under most protocols" | "…a heart rate under `60` with poor perfusion is an indication to begin compressions under PALS" | AHA 2020 PALS/PBLS: start compressions for HR <60/min with signs of poor perfusion despite oxygenation/ventilation ([AHA PBLS](https://www.ahajournals.org/doi/10.1161/circulationaha.110.971085), [2020 PBLS update summary](https://www.uspharmacist.com/article/key-updates-from-the-2020-aha-pediatric-basic-life-support-guidelines)) |
| ed-monitoring.json | ed-monitoring-l05 (body) | bladder spans "roughly `80%` of the arm circumference and about `40%` of the arm width" | "…and about `40%` of that circumference in width" | AHA BP measurement: bladder width 40% **of arm circumference**, length 80% of arm circumference ([AAFP summary of AHA recommendations](https://www.aafp.org/pubs/afp/issues/2005/1001/p1391.html)) |
| ed-monitoring.json | ed-monitoring-c026 | "`80%` of arm circumference and `40%` of arm width" | "`80%` of arm circumference and `40%` of that circumference in width" | same |
| ed-monitoring.ext.json | ed-monitoring-l16 (body, "Cuff size") | "the bladder spans about `40%` of the arm width and `80-100%` of its circumference" | "…about `40%` of the arm circumference in width and `80-100%` of that circumference in length" | same |
| ed-monitoring.quiz.json | ed-monitoring-q093 | choice 0 read "About 1.1 — concerning for compensated shock" while the keyed answer (3) read "About 1.06 — concerning for compensated shock"; HR 140 / SBP 132 = 1.06, which also rounds to 1.1, so two choices were defensible | choice 0 replaced with "About 0.94 — within the normal range, so no concern"; keyed answer unchanged (index 3) | arithmetic; answer-index spread unchanged (validator `ok`) |

Answer keys, choice counts and ids unchanged except as noted; `node tools/validate.mjs` prints `ok` for all six files.

## Unverifiable / judgment calls (left alone)

- **Posterior-lead threshold** (`ed-ekg-l15`, `c102`, `q051`, scenario s04): text says "`0.5 mm` of elevation in a single posterior lead is considered diagnostic." The 2013 ACCF/AHA STEMI guideline states ≥0.5 mm in V7–V9 without a lead count; ESC/Fourth Universal Definition requires two contiguous posterior leads (and ≥1 mm in men <40). Defensible as written for the ED-tech level; flagged rather than changed.
- **"Roughly 40% of inferior infarcts involve the right ventricle"** (several places): literature range is ~30–50%. Left as "roughly/up to 40%".
- **"Over 85% of hospital monitor alarms are false or clinically insignificant"** (`ed-monitoring-l02`, `c006`): published figures span ~72–99% depending on setting and definition. The hedged "commonly cited as over 85%" is defensible.
- **Cuff error direction framing** (`ed-monitoring-l05`): the text calls the oversized-cuff (falsely low) error "far more dangerous." Both errors are harmful in different ways; the claim is a teaching emphasis, not a factual error.
- **ESI-based vitals intervals** (`ed-monitoring-l05`, `c030`): ESI v5 assigns acuity, not reassessment intervals — those are departmental policy. The text already says "vary by department protocol," so it was left.
- **ED-tech scope**: both modules have the tech placing peripheral IVs, drawing blood cultures and running point-of-care lactate (`ed-ekg-l18`, `ed-monitoring-l13`, scenarios s04/s05). That is within typical hospital ED-tech protocols (this is the `edtech` track, not EMT field scope), and the content is explicit that techs never push drugs or change ventilator settings. Left as written.
- **Sinus tachycardia "100–150"** (`ed-ekg-l08`): a standard textbook simplification; true upper bound is age-dependent.

## Verdict

High quality. All ACLS/PALS/AHA numbers (compression rate and depth, 30:2, epinephrine 1 mg q3–5 min, amiodarone 300/150, atropine 1 mg to 3 mg, EtCO2 <10 and >40 thresholds), STEMI criteria (1 mm; V2–V3 2/2.5/1.5 mm by sex and age), lead placement (V1–V6, V4R, V7–V9), interval and filter values (25 mm/s, 10 mm/mV, 0.05–150 Hz, 250 Hz pediatric), sepsis tools (SIRS, qSOFA, NEWS2, hour-1 bundle, MAP 65, 30 mL/kg), post-thrombolytic monitoring (q15 min × 2 h, <180/105), GCS/RASS/Aldrete scoring and pediatric vitals checked out against current guidance. One genuinely dangerous error (pediatric compression threshold stated as HR <100 instead of <60), one repeated cuff-sizing error, and one question with two defensible answers — five edits across 775 items.
