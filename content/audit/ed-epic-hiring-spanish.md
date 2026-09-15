# Audit — ed-epic-hiring-spanish

## Files reviewed

| File | Items reviewed |
|---|---|
| `content/modules/ed-epic-charting.json` | 10 lessons + 30 checks, 66 cards, 30 quiz, 2 scenarios (11 steps) |
| `content/modules/ed-epic-charting.quiz.json` | 20 checks, 55 quiz |
| `content/modules/ed-getting-hired.json` | 10 lessons + 30 checks, 66 cards, 30 quiz, 2 scenarios (11 steps) |
| `content/modules/ed-getting-hired.quiz.json` | 20 checks, 55 quiz |
| `content/modules/ed-medical-spanish.json` | 10 lessons + 30 checks, 70 cards, 32 quiz, 2 scenarios (10 steps) |
| `content/modules/ed-medical-spanish.quiz.json` | 20 checks, 55 quiz |

Total: 6 files, ~700 discrete items (every lesson body, keyPoint, check, card front/back, quiz stem/choices/answer/rationale, and scenario step/choice/feedback).

All six files re-validated: `node tools/validate.mjs` prints `ok` with no `x`. No answer indices were changed, so the answer-index spread is unchanged.

## Corrections

| file | id | was | now | source |
|---|---|---|---|---|
| ed-getting-hired.json | l02 requirements table | "New Jersey OEMS certification, obtained by passing the National Registry cognitive and psychomotor exams" | "...the National Registry cognitive exam plus the state-approved psychomotor (skills) exam" | NREMT: "The BLS psychomotor examination process is established and approved by each state" (nremt.org, EMR and EMT Certification Examinations) |
| ed-getting-hired.json | l02 keyPoint | "after passing the National Registry cognitive and psychomotor exams." | "...cognitive exam and the state-approved psychomotor exam; the National Registry no longer administers the EMT psychomotor exam." | same |
| ed-getting-hired.json | c007 | "pass the National Registry cognitive and psychomotor exams" | "pass the National Registry cognitive exam and the state-approved psychomotor exam (the National Registry does not administer the EMT-level psychomotor exam)" | same |
| ed-getting-hired.json | l02 body (phlebotomy) | "Programs usually require ... commonly 30 venipunctures and 10 capillary sticks, before they sign you off." | "NHA requires evidence of at least 30 successful venipunctures and 10 capillary or finger sticks on live individuals before you can sit for it." | NHA CPT eligibility (nhanow.com / NHA CPT eligibility update, 2022 finger-stick clarification). Requirement is the certifying body's, not the school's |
| ed-getting-hired.json | l02 body (immunizations) | "Tdap within the last 10 years" | "a Tdap dose (healthcare personnel get one Tdap regardless of interval, then a Td or Tdap booster every 10 years)" | CDC ACIP immunization recommendations for healthcare personnel |
| ed-getting-hired.json | l01 map table | "Penn Medicine \| Philadelphia and Cherry Hill" | "Penn Medicine \| Philadelphia" | Penn Medicine Cherry Hill is an outpatient multispecialty site with no emergency department (pennmedicine.org location page) |
| ed-getting-hired.quiz.json | XCHECK l01#0 | posting text "freestanding campus, Mullica Hill" | "freestanding emergency department" | Inspira Mullica Hill is a full inpatient hospital, not a freestanding ED; the example named a real site incorrectly |
| ed-medical-spanish.json | l08 phrase table | "`¿Está usando toalla?` … Are you using a pad?" | "`¿Está usando toalla sanitaria?` … Are you using a sanitary pad?" (pronunciation updated) | Spanish usage: `toalla` alone is a towel; a menstrual pad is `toalla sanitaria` / `toalla femenina` |
| ed-medical-spanish.quiz.json | q068 | choice 0 `¿Está usando toalla?`; rationale said it "asks about a pad" | choice 0 `¿Está usando toalla sanitaria?`; rationale now notes that `toalla` alone asks about a towel | same |
| ed-medical-spanish.quiz.json | q042 | Stem `mi hijo tomo la medicina` keyed to "her son takes the medicine"; rationale was self-contradicting ("often a data-entry slip for the ongoing present-tense idea") | Stem `mi hijo toma la medicina`; rationale rewritten as the clean `toma` (present) vs `tomó` (past) contrast | Spanish conjugation: `tomo` = I take (1st person), so `mi hijo tomo` is ungrammatical and the keyed answer could not be right as written |
| ed-medical-spanish.quiz.json | XCHECK l02#0 | "How should you pronounce the r in `respire`?" keyed to a light tap; rationale said the trill is for "`rr` or a word-initial r in some contexts" | Stem now asks about the single r in `orina` / `herida`; rationale states the trill belongs to `rr` and to a word-initial r, as in `respire` | Standard Spanish phonology; also an internal contradiction with lesson l02, which correctly states "`rr` and a word-initial `r` are trilled" |
| ed-epic-charting.quiz.json | q064 | Rationale was garbled and implied personal texting is "reserved for urgent or emergent situations" | Rewritten: overhead page is for urgent situations, a personal text is never an acceptable channel for PHI | Contradicted lesson l09 and HIPAA/hospital secure-messaging policy |
| ed-epic-charting.quiz.json | q067 | Keyed choice and rationale defined boarding hours as running to "the time an inpatient bed is actually assigned" | Now "the time the patient physically leaves the department" | Boarding time is standardly measured from admit-decision time to ED departure time (CMS ED-2 / ACEP boarding definition) |

## Verified and left alone (spot-checked against sources)

- Epic ED module = **ASAP**; **Storyboard** side panel; **Playground** training environment; **SmartPhrases**; Business Continuity read-only access during downtime — all correct current Epic terminology.
- CMS restraint rules: violent/self-destructive order limits 4 h (18+), 2 h (9–17), 1 h (<9); face-to-face within 1 hour; 15-minute monitoring as a common policy operationalization. Correct, and correctly hedged as "commonly".
- Joint Commission do-not-use list (U/u, IU, QD, QOD, trailing zero, missing leading zero, MS/MSO4/MgSO4) and the stated reasons — correct.
- GCS 1–4 / 1–5 / 1–6, total 3–15. Door-to-EKG 10 minutes. Cultures before antibiotics. Glucose first in a stroke protocol. All correct.
- Critical-value table (glucose <50 / >500, K <2.5 / >6.5, Na <120 / >160, Hgb <7, platelets <50k) — within the range of published laboratory critical limits and correctly labeled "vary by laboratory".
- Pediatric weight arithmetic: 40 lb ≈ 18.1 kg, 42 lb ≈ 19 kg, typical 4-year-old 16–18 kg. Correct in both lessons and both quiz items.
- Hepatitis B 0/1/6 months + anti-HBs titer 1–2 months after the last dose (7–8 months total); two-step TST = four visits; IGRA = one visit; annual N95 fit test under OSHA. Correct.
- IRS §127 employer education assistance limit $5,250. Correct.
- CASPA opens late April; rolling admissions. Correct.
- Caffeine half-life ~5 h; 20–30 min or 90 min naps; melatonin 0.5–3 mg. Correct and appropriately hedged.
- Cooper = only Level I trauma center in South Jersey; Temple and ChristianaCare Level I. Correct.
- Differential arithmetic ($21.00 + $4.00 + $2.50 = $27.50 × 12 = $330) — correct in all three places it appears.
- Every other Spanish phrase, accent mark, and pronunciation gloss in the batch was checked individually (vowels, `j`/`g`, `ll`, `ñ`, `h`, stress rules, `once`, `constipado`, `intoxicado`, `sano`, `embarazada`, `hace` + time, `de repente` / `poco a poco`, imperative forms, the red-flag list). `usted` register is used consistently and correctly throughout; the imperatives (`Siéntese`, `Acuéstese`, `Apriete`, `Abra`, `Haga`, `Relaje`, `Manténgalo`, `No se mueva`) are all correct usted forms. 38 C = 100.4 F, 38.5 C = 101.3 F, 39 C = 102.2 F all check out.

## Unverifiable / judgment calls (left as written)

- **`Estamos cuidándole`** (l09, c062, q031, keyPoint). `cuidar` takes a direct object, so strict Latin American usage would be `cuidándolo` / `cuidándola`. The `le` form is accepted leísmo, is very common as a courtesy form with *usted*, and the module is otherwise consistent in its `le` dative usage. Left alone as a dialect choice, not an error, but flagged here.
- **`vacuna del tétano`** (l08, q071). `el tétanos` is the more usual spelling; `tétano` is also admitted by the RAE. No clinical consequence.
- **`intoxicado` = "poisoned, most often food poisoning"**. Correct as the primary meaning and the right teaching point, though in some regions and registers it is also used for drunk. The module already routes the specific exposure to an interpreted history, which is the safe handling.
- **Pay ranges** ($18–26/hr staff, $25–34 per diem, differential ranges, $2,500–5,250 tuition reimbursement, LOS 2–3 h discharged / 4–6 h admitted, LWBS <2%, door-to-provider <30 min). These move constantly and are all explicitly labeled approximate with an instruction to verify against the posting. Not changed.
- **HIPAA penalty framing** in epic l01 ("civil penalties fall on the institution and criminal penalties exist for knowing misuse"). Criminal liability under 42 USC 1320d-6 does attach to individuals and civil money penalties can in narrow cases too, so the sentence is a simplification. The practical consequence stated for a technician (termination, reportable event) is accurate, so I left it.
- **Hospital-specific configuration claims** were already appropriately softened throughout the Epic module ("names and order vary by build", "where techs draw", "most builds", "commonly", "where in scope"). Nothing in it asserts a Cooper/Virtua/Jefferson-specific build as fact; the one place it names hospitals it does so to make the opposite point.

## Verdict

Strong batch. Content is accurate, well hedged, and internally consistent; the Spanish is unusually good for AI-generated material (register, accent marks, and imperative forms are right almost everywhere). The 13 corrections are one outdated credentialing fact (NREMT psychomotor), two real-world facility errors, one genuine Spanish grammar error in a quiz stem, one Spanish word-choice error that would have produced a confusing bedside question, one internally contradictory pronunciation item, one garbled rationale that stated something unsafe, and one wrong metric definition. Nothing in the batch was clinically dangerous as written.
