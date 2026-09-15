# Accuracy audit: ed-phlebotomy-procedures

Date: 2026-09-15

## Files reviewed

- `content/modules/ed-phlebotomy.json` — 9 lessons (+27 checks), 64 cards, 28 quiz, 2 scenarios
- `content/modules/ed-phlebotomy.ext.json` — 9 lessons (+27 checks), 60 cards, 35 quiz, 3 scenarios
- `content/modules/ed-phlebotomy.quiz.json` — 36 lesson checks, 54 quiz
- `content/modules/ed-procedures.json` — 10 lessons (+26 checks), 75 cards, 34 quiz, 2 scenarios
- `content/modules/ed-procedures.ext.json` — 9 lessons (+27 checks), 76 cards, 49 quiz, 3 scenarios
- `content/modules/ed-procedures.quiz.json` — 38 lesson checks, 57 quiz

Every lesson body, keyPoint, check, card front/back, quiz stem/choices/answer/rationale and scenario step was read. **Items reviewed: ~730.**

## Corrections

| file | id | was | now | source |
|---|---|---|---|---|
| ed-phlebotomy.json | `ed-phlebotomy-l02` (body) | "When light blue is the only tube ordered, many laboratories still require a discard tube first … because the first few milliliters can contain tissue thromboplastin from the needle puncture" | "When light blue is the only tube ordered and you are using a straight needle, no discard tube is needed. CLSI withdrew that requirement after studies disproved the old idea that tissue thromboplastin from the puncture meaningfully changes the PT or aPTT. A few laboratories still have their own policy…" | Outdated guidance. CLSI revoked the routine discard-tube requirement for PT/aPTT in the late 1990s after the tissue-thromboplastin theory was disproved; a discard tube is required only when a winged/butterfly set is used, which the lesson already teaches separately. Center for Phlebotomy Education summary of CLSI H21/GP41: https://www.phlebotomy.com/phlebotomyblog/what-every-phlebotomist-must-know-about-drawing-coags.html |
| ed-phlebotomy.quiz.json | `ed-phlebotomy-q067` (stem + why) | Stem: "INR of 5.8 that does not match the clinical picture"; why: "Clot activator carried into citrate shortens rather than prolongs clotting times, which is the direction to reason about here, and either way the sequence is wrong" | Stem: "A patient on a stable warfarin dose has an INR of 1.0 that does not match the clinical picture"; why: "Clot activator carried into the citrate tube shortens clotting times, which fits an unexpectedly low INR on a patient who should be anticoagulated." | Internal contradiction: the keyed mechanism (clot-activator carryover produces a *shortened* PT/INR) was the opposite direction from the falsely *elevated* INR in the original stem, and the rationale admitted it. Artifact direction per Labcorp coagulation specimen guidance: https://www.labcorp.com/test-menu/resources/blood-specimens-coagulation |
| ed-procedures.json | `ed-procedures-q021` (stem, choices 2 and 3, why) | "An 80 kg adult… maximum dose of plain lidocaine?" keyed **About 360 mg**; distractor "About 560 mg" | "A 60 kg adult…" keyed **About 270 mg**; distractor "About 420 mg"; why now states the 300 mg adult ceiling | 4.5 mg/kg plain lidocaine is capped at **300 mg** in an adult (7 mg/kg capped at 500 mg with epinephrine), so the keyed 360 mg exceeded the maximum and contradicted the module's own lesson table and card c047. FDA labeling / StatPearls: https://www.ncbi.nlm.nih.gov/books/NBK539881/ |

All six files re-validated: `node tools/validate.mjs` prints `ok` for each, no `x`. No answer index was changed, so the index spread is unchanged.

## Verified as correct (spot-checks that could have gone either way)

- CLSI GP41 order of draw and additive carryover effects (EDTA raises K and lowers Ca; heparin or clot activator shortens PT/aPTT); 9:1 citrate ratio, underfill prolonging PT/aPTT; inversion counts (3–4 citrate, 5 SST, 8–10 EDTA/heparin/fluoride/trace).
- Tourniquet under 1 minute, release and wait about 2 minutes; 21 G adult standard with hemolysis risk below 23 G; hemolysis analyte pattern (K, LDH, AST, Mg, PO4 up; glucose and Na down).
- Blood cultures: 8–10 mL per bottle, 20 mL per set, two sets from two sites, under 3% contamination target, chlorhexidine 30 s scrub plus at least 30 s dry, povidone-iodine about 2 minutes, aerobic first with a butterfly and anaerobic first with a syringe, contaminant versus pathogen organism lists, time to positivity 24–48 h.
- Neonatal: total blood volume 80–100 mL/kg, limits of 1–5% in 24 h and 10% in 8 weeks, heel stick no deeper than 2.0 mm on the medial or lateral plantar surface, capillary order (gas, EDTA, other additives, serum), sucrose 24% 0.5–2 mL, newborn screen at 24–48 h.
- Blood bank: 72-hour specimen validity with transfusion or pregnancy within 3 months, wrong blood in tube as the dominant root cause (about 1 in 1,000–2,000), emergency release of group O red cells and AB plasma, vitals before, at 15 minutes and at completion.
- OSHA/CDC exposure management: soap and water, 15-minute mucous membrane flush, HIV PEP 28 days started ideally within 2 hours and generally not beyond 72 hours, HBIG plus vaccine within 24 hours and at most 7 days, no HCV prophylaxis (RNA at 3–6 weeks, antibody at 4–6 months), federal sharps injury log, containers no more than three-quarters full.
- ABG: radial then brachial then femoral, air bubble raises PO2 and lowers PCO2, plastic syringe at room temperature within about 30 minutes, PT within 24 h and aPTT within 4 h.
- Plaster: 8–10 ply upper extremity and 12–15 lower, dip water about 20–25 °C, and 20+ ply plus hot water plus insulation as the burn combination (Halanski et al., JBJS 2007: https://pmc.ncbi.nlm.nih.gov/articles/PMC2288595/); plaster full strength at 24 h (24–48 h before weight bearing), fiberglass near full strength in about 30 minutes.
- Tetanus table matches CDC (boost over 10 years for a clean minor wound, over 5 years for a dirty one; TIG for fewer than 3 doses or unknown series with a dirty wound); suture sizes and removal windows; lidocaine 1% = 10 mg/mL; bupivacaine 2.5 mg/kg lasting 4–8 h; the epinephrine-in-digits prohibition correctly described as overturned.
- Foley (14–16 French, coudé for BPH, urine then advance 2–5 cm then 10 mL sterile water), NG measured nose to earlobe to xiphoid and confirmed by X-ray only, bladder scan thresholds, eye irrigation pH goal 7.0–7.4 rechecked 5–10 minutes after stopping, alkali worse than acid.
- Chest tube safe triangle, passing over the top of the lower rib, −20 cm H2O, tidaling versus bubbling, 100–200 mL/h reporting threshold, three-sided dressing for a dislodged tube; LP at L3–L4 or L4–L5 below the L1–L2 cord end, opening pressure only in the lateral position, tube 1 versus tube 4; arterial line never infused, phlebostatic axis, about 7.5 mmHg per 10 cm of leveling error.
- Sedation: naloxone 0.4 mg, flumazenil 0.2 mg, capnography versus pulse oximetry lag, Aldrete 9 or more, RASS +4 to −5, about 30 minutes of post-dose monitoring, no fasting delay for urgent ED sedation; LET 20–30 minutes, EMLA 60 minutes, LMX-4 about 30 minutes, ketamine avoided under about 3 months.

## Unverifiable / judgment calls (left alone)

- **Wound irrigation "8–15 psi"** (ed-procedures l06, c039, q018, q101, s02). The canonical figure for a 35–60 mL syringe through an 18–19 G catheter is about 7–8 psi, with 5–8 psi the most commonly quoted target and roughly 4–15 psi the accepted working band; above 15–20 psi everyone agrees bacteria are driven deeper. The module's range is defensible at its upper edge but is stated more confidently than the literature supports. Left as written because no single number in it is wrong and the safety message is correct.
- **Modified Allen test color return** is "about 5–15 seconds" in ed-phlebotomy.ext l15 and "about 5–10 seconds" in ed-procedures.ext l17. Both fall inside published acceptable windows and both lessons correctly flag the test's weak predictive value, so neither was changed.
- **Splint length figures** (sugar-tong 75–90 cm, coaptation 75–100 cm), **ED hemolysis rate 5–10%**, **glucose falling 5–7 mg/dL per hour**, and **intracellular-to-plasma potassium about 25×** are all within commonly published ranges but are the kind of precise numbers that vary by source. Left as written.
- **"Two attempts, then hand off"** and **"forearm preferred over the antecubital fossa for a routine IV"** are presented as near-universal policy. They are standard practice rather than a guideline number, and the text already tells the reader to confirm local policy.
- **ED tech scope** (peripheral IV starts, ABG draws, point-of-care testing) is consistently hedged as department-credentialed and varying by hospital, which matches New Jersey practice. No scope overreach was found: IO placement, central line and port access, ultrasound-guided access, transfusion administration and chest tube reinsertion are all correctly assigned to credentialed nurses or providers.

## Verdict

High quality. Three defects in roughly 730 items, only one of which (the lidocaine maximum) could have led to a wrong action at the bedside; the other two were an outdated CLSI recommendation and a self-contradicting question stem. Numbers, mechanisms and scope boundaries were otherwise accurate and current throughout.
