# Audit: pa-pharm-infectious

Batch: `pa-pharm-infectious`
Date: 2026-09-15

## Files reviewed

| File | Items |
|---|---|
| `content/modules/pa-pharm.json` | 10 lessons (+30 checks), 77 cards, 37 quiz, 2 scenarios (11 steps) |
| `content/modules/pa-pharm.ext.json` | 9 lessons (+23 checks), 78 cards, 45 quiz, 3 scenarios (16 steps) |
| `content/modules/pa-pharm.quiz.json` | 38 extra lesson checks (19 lessons x 2), 60 quiz |
| `content/modules/pa-infectious.json` | 10 lessons (+30 checks), 72 cards, 38 quiz, 2 scenarios (9 steps) |

Total discrete items read and checked: **526** (39 lessons, 121 lesson-body claim sets, 227 cards, 180 quiz questions, 121 checks, 7 scenarios / 36 steps). Every lesson body, keyPoint, check, card front/back, quiz stem + 4 choices + key + rationale, and scenario step/choice/feedback was read.

## Corrections

| file | id | was | now | source |
|---|---|---|---|---|
| `pa-pharm.quiz.json` | `pa-pharm-q103` (choice 0 = keyed answer, and `why`) | "Despite older teaching, doxycycline for a short course is now considered reasonable in pregnancy for Lyme disease…" — keyed as correct | "Doxycycline is avoided in pregnancy for Lyme disease because amoxicillin and cefuroxime axetil are proven alternatives; the 2020 IDSA guideline treats pregnant patients exactly like non-pregnant ones except that doxycycline is omitted." Rationale rewritten to cite the guideline and to keep the RMSF exception as the reason choice 1's "no exceptions ever" wording is still wrong. | IDSA/AAN/ACR 2020 Lyme guideline: "Pregnant and lactating patients may be treated in a fashion identical to nonpregnant patients with the same disease manifestation, except that doxycycline should be avoided" (Clin Infect Dis 2021;72(1):e1) |
| `pa-infectious.json` | `pa-infectious-l02` check 0 (CURB-65) | Vignette scores 4 (confusion, BUN 24, RR 32, age 72) but the keyed choice read "3, consider intensive care" and the rationale conceded "That is 4 points, but the graded question asks the mapping" — a keyed answer stating a false score, with a second choice ("4, ward admission") carrying the right number. | Keyed choice now "4, consider intensive care"; distractor changed to "2, ward admission"; rationale rewritten to state the score is 4, that BP 104/64 does not score (needs SBP <90 or DBP ≤60), and that 3–5 means consider ICU. | CURB-65 (Lim et al., Thorax 2003); ATS/IDSA 2019 CAP guideline |
| `pa-infectious.json` | `pa-infectious-l07` OI-by-CD4 table, MAC row | "under 50 — *Mycobacterium avium* complex — azithromycin weekly" (unconditional) | "…azithromycin weekly, only if the patient is not on fully suppressive antiretroviral therapy" | NIH/DHHS Adult & Adolescent OI Guidelines, Disseminated MAC: primary prophylaxis is *not* recommended for those starting ART immediately; reserved for CD4 <50 who are off ART, viremic on ART, or without a suppressive option |
| `pa-pharm.json` | `pa-pharm-l04` check 1 | Correct choice read "400 to 600 mL, which is 20 to 30 mL/kg of isotonic crystalloid" — the 20–30 mL/kg figure is the adult sepsis bolus, and contradicts the same lesson's own body text ("the bolus is 20 mL/kg") | "400 mL, which is 20 mL/kg of isotonic crystalloid"; rationale adds "while reassessing" | PALS 2020 (AHA): pediatric shock bolus 20 mL/kg (10–20 mL/kg aliquots in septic shock) |
| `pa-pharm.quiz.json` | `pa-pharm-q138` stem, and `pa-pharm-l19` check 1 stem | "A patient needs 1 g of **elemental** calcium replaced…" — implausible/unsourced dose (calcium gluconate 1 g contains only ~93 mg elemental calcium, so 1 g elemental ≈ 10 g of gluconate) | "A patient needs IV calcium replaced urgently…" — the item still turns on gluconate-vs-chloride and peripheral-vs-central, which was its point | Standard formulary: calcium gluconate 1 g = 4.65 mEq (93 mg) elemental; calcium chloride 1 g = 13.6 mEq (273 mg) |

No answer indices were changed, so each file's answer-index spread is unchanged. `node tools/validate.mjs` prints `ok` with no `x` for all four files.

## Verified and left alone (spot checks that could have been wrong but were not)

Dose/number claims independently confirmed rather than assumed: morphine PO:IV 3:1 and 25–30% oral bioavailability; hydromorphone 5–7x and the 30 PO / 10 IV / 1.5 IV HM / 20 PO oxycodone / 100 mcg fentanyl conversion table; ketorolac 15 mg criteria; lidocaine 4.5 and 7 mg/kg; NAC 150/50/100 mg/kg; succinylcholine and rocuronium doses, onsets, and the >48 h burn/crush rule; sugammadex 16 mg/kg; levetiracetam 60 mg/kg (max 4,500), fosphenytoin 20 mg PE/kg, valproate 40 mg/kg, phenytoin ≤50 mg/min; TCA bicarbonate 1–2 mEq/kg with pH goal 7.45–7.55; lipid emulsion 1.5 mL/kg then 0.25 mL/kg/min; hydroxocobalamin 5 g; fomepizole 15 mg/kg; glucagon 3–5 mg; HIE 1 unit/kg; octreotide 50 mcg q6h; pyridoxine 5 g; LR and 3% saline compositions; hyponatremia ≤8 mEq/L/24 h with 100–150 mL 3% boluses for a 4–6 mEq/L rise; MAP 65 (80–85 in chronic hypertensives); vasopressin fixed 0.03 units/min; phentolamine 5–10 mg; CHA2DS2-VASc components and thresholds; all 15 pediatric worked examples, 4-2-1 totals, 2/4 J/kg and 0.5–1/2 J/kg energies, and the ETT formulas; every infusion-math answer (heparin 14.4 and 16.2 mL/h, norepinephrine 30 mL/h, dopamine 15 mL/h, 21 gtt/min, 31 mL lidocaine). Infectious: Sepsis-3 and hour-1 bundle; qSOFA/SIRS; neutropenic fever thresholds; CSF pattern table; meningitis regimen with ceftriaxone 2 g q12h, ampicillin 2 g q4h, dexamethasone 0.15 mg/kg; acyclovir 10 mg/kg q8h; CDC 2021 STI treatments (ceftriaxone 500 mg / 1 g ≥150 kg, doxycycline 7 d, PID triple 14 d, benzathine penicillin 2.4 MU, desensitization in pregnancy); TST cutoffs and RIPE; HIV testing algorithm, PEP 28 d / 72 h; Lyme staging, EM ≥5 cm, doxycycline prophylaxis 200 mg within 72 h after ≥36 h attachment; RMSF doxycycline at all ages; rabies RIG 20 IU/kg and days 0/3/7/14; needlestick risks 30% / 1.8% / 0.3%; precautions table; C. difficile oral vancomycin 125 mg QID x10 d; hepatitis B serology patterns. Pneumococcal vaccination at age 50+ is current (ACIP, Oct 2024) and was left as written.

## Unverifiable / judgment calls (left alone)

- **`pa-pharm-l09`: "esmolol lasts only 9 minutes."** 9 minutes is the elimination half-life; clinical duration after a bolus runs ~10–30 minutes. The shorthand is near-universal in EM/pharm teaching and the teaching point (it is the beta blocker you can undo) is correct, so it was left.
- **`pa-pharm-l03`: vancomycin "trough 15–20 mcg/mL for serious infection."** IDSA 2020 moved to AUC/MIC-guided dosing; trough 15–20 remains the figure on most exams and in many institutions. Left as level-appropriate.
- **`pa-pharm-l07` and `pa-pharm.quiz` l02 check:** doxycycline "avoid under 8 years" and tetracyclines/fluoroquinolones on an "absolute avoid in pregnancy" list. This is standard PANCE framing and is correct as a default, but AAP Red Book permits short-course doxycycline at any age for rickettsial disease (which the infectious module states correctly in l09). The two modules are not strictly consistent in tone; neither statement is false in its own context, so no edit was made.
- **`pa-pharm-l14`: "quetiapine is the safest in Parkinson disease."** Defensible and commonly taught; clozapine has the stronger efficacy evidence and pimavanserin is FDA-labeled for Parkinson disease psychosis. Left as a level-appropriate simplification.
- **`pa-pharm-l08` / `l10`: aspirin "324 mg chewed."** The guideline range is 162–325 mg; 324 mg is 4 x 81 mg and is the real-world number. Left.
- **`pa-infectious-l08`: trichomoniasis "metronidazole 2 g once, or 500 mg BID x 7 days."** CDC 2021 now prefers the 7-day regimen in women and the single 2 g dose in men. The card offers both without specifying sex; not wrong, but less precise than CDC. Left because the module never keys a question on the distinction.
- **`pa-pharm-l15`: the acetaminophen ceiling example** ("a 60 kg teenager calculates to 900 mg, but the single adult dose stops at 1000 mg") illustrates a cap that the example never actually hits. Confusing, not false; style is out of scope.

## Verdict

High quality. Across 526 items the batch produced **five** corrections, only two of which were outright teaching errors (the CURB-65 item with a false keyed score, and the Lyme-in-pregnancy item keyed against IDSA 2020); one was an outdated guideline row (MAC prophylaxis), one an internal contradiction (pediatric bolus), and one an implausible number. Dosing arithmetic — the highest-risk content here — was correct in every one of the ~40 worked calculations checked.
