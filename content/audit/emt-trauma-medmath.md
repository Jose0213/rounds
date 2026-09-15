# Audit: emt-trauma-medmath

Batch files:

- `content/modules/emt-trauma.json` (10 lessons + 30 lesson checks, 74 cards, 36 quiz, 3 scenarios)
- `content/modules/emt-trauma.ext.json` (10 lessons + 30 lesson checks, 80 cards, 50 quiz, 3 scenarios)
- `content/modules/emt-trauma.quiz.json` (40 extra lesson checks, 56 quiz)
- `content/modules/emt-med-math.json` (10 lessons + 30 lesson checks, 70 cards, 38 quiz, 2 scenarios)
- `content/modules/emt-med-math.quiz.json` (20 extra lesson checks, 56 quiz)

Items reviewed: 40 lesson bodies + keyPoint sets, 148 lesson/extra checks, 224 cards, 236 quiz questions, 8 scenarios (44 steps, ~176 branch options). Every med-math worked example, card answer, check and quiz answer was recomputed by hand (conversions, dose formula, weight-based chains, drip/pump rates, 4-2-1, Parkland including the burn-clock offsets, cylinder duration, MAP/pulse pressure/shock index/CPP, GCS, APGAR, ECG rate methods, pediatric estimates). All arithmetic verified correct except where noted below.

## Corrections

| file | id | was | now | source |
|---|---|---|---|---|
| emt-trauma.ext.json | emt-trauma-l13 (lesson body, maternal arrest) | "CPR continues with continuous manual left uterine displacement and hand placement slightly higher on the sternum." | "...continuous manual left uterine displacement, with standard hand placement on the lower half of the sternum." | AHA "Cardiac Arrest in Pregnancy" scientific statement (Circulation 2015) / AHA 2020 ECC — the 2010-era cephalad hand shift was withdrawn after MRI showed no vertical cardiac displacement |
| emt-trauma.ext.json | emt-trauma-c098 (card back) | "...with hand position slightly higher on the sternum." | "...with standard hand position on the lower half of the sternum." | same |
| emt-trauma.quiz.json | checks: emt-trauma-l13 #1 (keyed choice + rationale) | keyed choice read "...with hand placement slightly higher on the sternum"; rationale asserted "the hands go slightly higher on the sternum" | keyed choice "...with standard hand placement on the sternum"; rationale now states hand placement stays standard on the lower half of the sternum and that moving the hands higher is no longer recommended | same |
| emt-med-math.json | emt-med-math-q037 (distractor 3) | "A 5 mL syringe, graduated every 0.5 mL" | "A 5 mL syringe, graduated every 0.2 mL" | Invented graduation spec; standard 5 mL syringes are marked every 0.2 mL. The distractor is still wrong (0.35 mL is not measurable on 0.2 mL marks), so the keyed answer is unchanged |
| emt-med-math.json | emt-med-math-s01 step s5, option 0 | "17 mL/h", scored 0, i.e. the same numeric answer as the keyed option 1 (17 mL/h), with a self-contradicting rationale ("the correct rate is 17 mL/h only if he weighed 90.6 kg") | "19 mL/h", with the working shown: 5 x 100 x 60 = 30,000 mcg/h divided by 1,600 mcg/mL = 18.75, so 19 mL/h | Recomputed by hand; the 100 kg error the distractor describes yields 19 mL/h, not 17. Removes two identically-valued choices scored differently |
| emt-med-math.quiz.json | emt-med-math-q058 (rationale) | "80 mmHg is the adult floor, not the pediatric one" | "80 mmHg is the floor for a 5-year-old, not a 9-year-old" | Adult hypotension threshold is systolic under 90 mmHg (AAOS 12e; PALS), and the module's own scenario text calls 90 the adult figure. 70 + 2(5) = 80 is what that distractor actually represents |
| emt-med-math.quiz.json | emt-med-math-q059 (rationale) | "Answering 5 uses the cuffed formula's offset incorrectly" | "Answering 5 undershoots by a full size" | The cuffed formula for an 8-year-old gives (8/4) + 3.5 = 5.5, not 5, so the stated explanation was wrong. Keyed answer (6, uncuffed) unchanged |

No answer indices were changed, so the validator's answer-index distribution is unaffected by this audit.

## Verified-correct spot checks worth recording

Checked against AAOS 12e / PHTLS 10e / AHA-PALS / CDC field triage and recomputed where numeric; all found correct and left alone: field triage thresholds (adult fall over 20 ft, child over 10 ft or 2–3x height, occupant intrusion over 12 in or over 18 in anywhere, motorcycle over 20 mph; physiologic GCS 13 or less, SBP under 90, RR under 10 or over 29); ATLS hemorrhage classes I–IV volumes and vitals; rule of nines adult and infant (head 18%, leg 13.5%) and palm = 1%; Parkland 4 mL x kg x %TBSA with the 8-hour clock running from the burn (all six clock-offset problems recomputed); cylinder constants D 0.16 / E 0.28 / M 1.56 / G 2.41 / H-K 3.14 with the 200 psi residual (all durations recomputed); 4-2-1 maintenance and the 20 mL/kg pediatric bolus; three dopamine mcg/kg/min to mL/h conversions; MAP = DBP + PP/3, shock index above 0.9, CPP = MAP minus ICP with a 60 mmHg target; GCS component scoring in every vignette; APGAR scoring; the 300 / 1500 / 6-second ECG rate methods; pediatric weight (age x 2) + 8 and systolic floor 70 + 2(age); blood volume 70–80 mL/kg; TXA 1 g over 10 minutes then 1 g over 8 hours with the 1-hour and 3-hour windows; tourniquet placement 2–3 in proximal, never over a joint, second device directly above the first, roughly 2 hours routine safe time; pelvic binder over the greater trochanters; herniation ventilation at 20/min versus the 10–12/min default; CO affinity 200–250x with a falsely normal SpO2; eardrum rupture around 5 psi versus blast lung at 15–40 psi; crush third-spacing of 10–12 L over 48 hours; anticoagulant reversal pairs (idarucizumab/dabigatran, andexanet alfa/factor Xa inhibitors, vitamin K plus factor concentrate/warfarin, none for antiplatelets); START and JumpSTART tagging in the MCI scenario.

Scope: nothing in the batch has an EMT performing an out-of-scope skill as an EMT. The med-math module's IV, drip, pump and TXA material is framed as ED-tech or hospital arithmetic, or is explicitly labelled ALS-only in the text (needle decompression, TXA, fluids), which matches the module's stated purpose.

## Unverifiable / judgment calls (left alone)

- **Airbag "deploy and deflate in about 0.05 seconds"** (emt-trauma l01, c007, q002, q085). Deployment is roughly 20–30 ms and deflation is fast but not precisely 0.05 s; the figure is the standard EMT-text simplification and the teaching point (lift the bag, inspect the wheel) is sound.
- **Flail chest defined as "three or more ribs broken in two or more places"** (l06, c040). AAOS 12e uses three or more; PHTLS 10e and some other texts use two or more adjacent ribs. Defensible at this level.
- **emt-trauma-q107** (3-year-old, entire head plus entire left leg, keyed 31.5%). 31.5% uses infant proportions (18 + 13.5). Applying the module's own "1% shifts from head to legs per year" rule to a 3-year-old gives roughly 15 + 15 = 30%. The keyed answer is still the closest choice and the distractors (27, 22.5, 18) are clearly wrong, so it was not changed, but the stem would be cleaner with an infant.
- **"Direct pressure for a full 3 minutes"** is used uniformly for both plain pressure and hemostatic packing. The 3-minute hold is well established for hemostatic gauze; for plain direct pressure sources vary from "at least 3 minutes" to "5–10 minutes." Defensible and internally consistent.
- **emt-med-math extra check on l05** offers "200 mL/h" among gtt/min choices, a unit mismatch used deliberately as a distractor and named as such in the rationale. Style rather than accuracy, so out of scope per the brief.
- **emt-trauma-s06** intro says the gunshot was "14 minutes ago" while the handoff option says "about 16 minutes ago" — consistent with elapsed time during arrival at the bay; not corrected.
- **Trauma-center level descriptions** are ACS-style summaries; exact criteria vary by state designation, including New Jersey. Accurate at the level taught.

## Verdict

High-quality batch: every med-math computation across five files was reproduced by hand and only one numeric defect surfaced (a scenario distractor whose value duplicated the keyed answer); the one substantive clinical error was a single piece of outdated AHA maternal-arrest guidance, plus three rationale/distractor statements that were wrong in their explanations rather than in their answer keys. Nothing dangerous was found in dosing, scope, or the hemorrhage and airway algorithms.
