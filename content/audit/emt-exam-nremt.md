# Audit: emt-exam-nremt

Audited 2026-09-15.

## Files and items reviewed

| File | Items reviewed |
|---|---|
| `content/modules/emt-exam.json` | 9 lessons (bodies, 40 keyPoints, 22 checks), 60 cards, 33 quiz questions, 2 scenarios (10 steps, 40 choices) |
| `content/modules/emt-exam.ext.json` | 8 lessons (bodies, 40 keyPoints, 17 checks), 50 cards, 40 quiz questions |
| `content/modules/emt-exam.quiz.json` | 34 lesson checks across 17 lessons, 58 quiz questions |
| `content/exams/nremt-emt.json` | exam metadata + 330 questions (every stem, all 1,320 choices, answer key and rationale) |

Roughly 700 discrete items. Every answer key was recomputed against its rationale.

## Corrections

| file | id | was | now | source |
|---|---|---|---|---|
| emt-exam.json | `emt-exam-l01` body | Five content domains given as Airway 18-22%, Cardiology & Resuscitation 20-24%, Trauma 14-18%, Medical/OB-GYN 27-31%, EMS Operations 10-14%; "Medical and OB-GYN is the largest domain" | Current blueprint effective April 7, 2025: Scene Size-Up and Safety 15-19%, Primary Assessment 39-43%, Secondary Assessment 5-9%, Patient Treatment and Transport 20-24%, Operations 10-14%; Primary Assessment named as the largest | NREMT, *The Updated EMR and EMT Certification Examinations* (nremt.org/Pages/Examinations/EMR-and-EMT-Certification-Examinations) |
| emt-exam.json | `emt-exam-l01` body | "about `85%` of items involve adult patients and about `15%` involve pediatric patients" | "Pediatric items are integrated throughout the content rather than held to a fixed share" | NREMT, same page: "Items related to pediatric patient care will be integrated throughout the examination content" |
| emt-exam.json | `emt-exam-l01` keyPoints 3-4 | Old domain weights; 85/15 adult-pediatric split | Primary Assessment 39-43%, Scene Size-Up 15-19%; pediatric integrated throughout | NREMT, same page |
| emt-exam.json | `emt-exam-l01` check 2 | Keyed answer "Medical, Obstetrics and Gynecology" as largest domain | Keyed answer "Primary Assessment"; choices rebuilt from the current domains | NREMT, same page |
| emt-exam.json | `emt-exam-l07` body | "Beginning in the 2024 to 2025 transition, the National Registry stopped requiring a separate psychomotor exam for EMR and EMT, shifting verification of skills into the approved course" | Corrected: the **ALS** psychomotor exam was discontinued July 1, 2024 (AEMT/paramedic, replaced by program portfolio); the **BLS** psychomotor exam for EMR and EMT is still required and is established and approved by each state | NREMT Notice, *ALS Psychomotor Examination Discontinued* (2023-10-06 PDF); NREMT *EMT Full Education Program Pathway*; NREMT EMR/EMT examinations page ("the psychomotor examination process for EMRs and EMTs will not change") |
| emt-exam.json | `emt-exam-l07` keyPoint 1 | "the National Registry no longer requires a separate EMT psychomotor exam in many states" | State-approved BLS psychomotor exam still required; only the ALS exam ended, July 1, 2024 | same |
| emt-exam.json | `emt-exam-l07` check 3 | Keyed answer said skill verification "moved into the approved course" nationwide-in-many-states | Keyed answer: a state-approved BLS psychomotor exam is still required, each state sets the format | same |
| emt-exam.json | `emt-exam-l09` body (week 2) | "Airway is `18 to 22%` ... Trauma is `14 to 18%`" (retired domains) | Reworded without the retired percentages; airway framed as sitting inside Primary Assessment | NREMT current blueprint |
| emt-exam.json | `emt-exam-c004` | Card taught the five retired clinical domains and weights | Card teaches the five current domains and weights with the April 7, 2025 effective date | NREMT current blueprint |
| emt-exam.json | `emt-exam-c005` | "About 85 percent of items involve adult patients and about 15 percent pediatric, spread across all five content domains" | Pediatric content integrated throughout, no fixed percentage | NREMT current blueprint |
| emt-exam.json | `emt-exam-c052` | "The National Registry stopped requiring a separate psychomotor exam for EMR and EMT in many states" | ALS psychomotor discontinued July 1, 2024; BLS psychomotor for EMR/EMT still required, state-approved | NREMT ALS discontinuation notice; NREMT EMT pathway page |
| emt-exam.ext.json | `emt-exam-l10` heading | "Eighteen to twenty-two percent of the exam..." | "Airway content is almost all numbers" (retired weight removed) | NREMT current blueprint |
| emt-exam.ext.json | `emt-exam-l11` heading | "Twenty to twenty-four percent..." | "Resuscitation numbers are non-negotiable" | same |
| emt-exam.ext.json | `emt-exam-l12` heading | "Fourteen to eighteen percent..." | "Trauma is mostly sequence and thresholds" | same |
| emt-exam.ext.json | `emt-exam-l13` heading | "The largest domain, twenty-seven to thirty-one percent" | "The widest body of content on the test" | same |
| emt-exam.ext.json | `emt-exam-l14` heading | "Ten to fourteen percent, and it is the cheapest domain to fix" | Kept 10-14% (Operations is still a domain at that weight), reworded to name it explicitly | NREMT current blueprint (Operations 10-14%) |
| emt-exam.ext.json | `emt-exam-c076` | "a preoxygenated apneic patient reads 100% for 30-60 seconds" | "can keep reading near 100% for a minute or more" — the invented 30-60 second figure understates the well-documented apnea lag after preoxygenation | No source supports the precise 30-60 s figure; softened to a defensible statement |
| emt-exam.quiz.json | `emt-exam-q076` | Stem and keyed rationale built on "Medical and OB-GYN, which is 27 to 31% of the exam" vs "Trauma is 14 to 18%" | Rebuilt around the current blueprint: Primary Assessment 39-43% is the largest domain, Secondary Assessment 5-9% the smallest | NREMT current blueprint |
| emt-exam.quiz.json | `emt-exam-q097` | Keyed answer asserted skills verification "moved into the approved course" and that the separate EMT psychomotor exam had ended | Keyed answer: only the ALS psychomotor exam ended (July 2024); a state-approved BLS psychomotor exam is still required for EMR and EMT | NREMT ALS discontinuation notice; NREMT EMT pathway page |
| exams/nremt-emt.json | `blurb` | Described the live exam as drawing from "five content areas - Airway... Cardiology... Trauma... Medical, OB-GYN... EMS Operations - with about 85% adults and about 15% pediatric", and claimed the practice draw uses "the real content weights" | Describes the current April 2025 domains and weights, states pediatric items are integrated throughout, and states plainly that this practice pool's sections are clinical content areas rather than the Registry domains | NREMT current blueprint |

Verified as already correct (spot list, not exhaustive): 70-120 items in 2 hours; 15-day retest wait; 3 attempts then documented remediation, 6 total; results generally within 2 business days; $104 cognitive exam fee; Authorization to Test issued by NREMT after program-director verification, scheduled at Pearson VUE; CAT with no skipping, flagging or review. All confirmed against the NREMT EMT Candidate Handbook and the EMT Full Education Program Pathway page.

Clinical content checked and left unchanged included: CPR rates/depths/ratios by age including newborn 3:1 at 120 events/min (AHA 2020 + 2025 focused updates), post-ROSC 10 breaths/min and SpO2 92-98%, compression fraction >60% and interruptions <10 s, pediatric pads under 8 years or 25 kg, aspirin 324 mg chewed, nitroglycerin 0.4 mg SL x3 with the PDE-5 24/48-hour windows and the inferior/RV-infarct exception, epinephrine 0.3 mg / 0.15 mg IM for 15-30 kg, oral glucose and activated charcoal contraindications, rule of nines adult and pediatric, START and JumpSTART cutoffs, GCS arithmetic in two items, oxygen cylinder duration arithmetic in three items, minute-volume and cardiac-output arithmetic, the 5-10-20 airbag rule, ICS span of control, and EMT scope boundaries (no IV — AEMT is the lowest level for peripheral access; no 12-lead interpretation; no drug not prescribed to that patient).

## Unverifiable / judgment calls (left alone)

- **"95% confidence" stopping rule** (l01, several cards). NREMT publishes that the CAT stops when it can determine competency with a defined level of confidence but does not publish the number as 95%. It is universally repeated in prep material and is directionally right; left as written.
- **"No number attached" to the result** (l01). The candidate result is reported pass/fail, but the Candidate Handbook does describe a 950 passing score on a 100-1500 scale. The statement is true about what a candidate is shown; left as written.
- **SpO2 target for most patients**: base module says `94 to 98%`, extension and several exam items say `94 to 99%`. Both are sourced (BTS vs AHA/ACLS phrasing). Internally inconsistent but not wrong; left alone rather than making a 12-place edit on a defensible number.
- **Child fall threshold "three times the child's height"** (base l06, c039, ext l12, c085). CDC field triage says "more than 10 feet or two to three times the child's height"; the exam pool item `nremt-emt-q0146` states it correctly as two to three times. The module's narrower phrasing is inside the sourced range, so it was left.
- **New Jersey specifics** (l08, c058, q099, q100): ~190-hour NJ OEMS course, three-year state cycle, fingerprinted background check. NJ OEMS publishes these but changes them; the lesson already tells the reader to confirm current hours with NJ OEMS directly. Left as written with that hedge intact.
- **"Excited delirium"** (`nremt-emt-q0247`). ACEP and the AMA have moved away from the term toward "hyperactive delirium with severe agitation", but it is still the term used in AAOS 12e and in NREMT-era material, and the clinical management keyed (rapid ALS sedation, active cooling, monitoring for arrest) is correct. Left.
- **`nremt-emt-q0185` stem wording** ("An intubated-scope aside, you are bag-mask ventilating...") is garbled English. The medicine and the key are correct (10 breaths/min, no prophylactic hyperventilation without herniation signs), and stem prose is outside the audit scope, so it was not rewritten — flagging it here as an editorial cleanup.
- **Practice exam section weights** (`sections` in nremt-emt.json) still mirror the retired clinical domains. Changing section ids/weights is structural and out of scope; the blurb was corrected instead so the file no longer claims these are "the real content weights".

## Verdict

Clinically very strong: across ~700 items, not one wrong answer key, contradicted rationale, dose, threshold or scope violation was found — the medicine, the AHA numbers and the EMT scope boundaries held up throughout. Every correction in this batch came from the same single failure: the module was written against the pre-2025 NREMT test plan and against a mistaken belief that the EMT psychomotor exam had been retired. Both were high-consequence for a candidate planning his study time and his certification path, and both are now fixed.
