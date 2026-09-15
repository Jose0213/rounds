# Audit: ed-presentations-competency

Date: 2026-09-15

## Files and items reviewed

| File | Items |
|---|---|
| `content/modules/ed-presentations.json` | 10 lessons (bodies + keyPoints) + 27 lesson checks, 73 cards, 34 quiz questions, 3 scenarios (15 steps, 60 options) |
| `content/modules/ed-presentations.ext.json` | 9 lessons + 27 lesson checks, 76 cards, 45 quiz questions, 3 scenarios (15 steps, 60 options) |
| `content/modules/ed-presentations.quiz.json` | 38 extra lesson checks, 59 quiz questions |
| `content/exams/ed-tech-competency.json` | 200 questions (all 6 sections: vitals, ekg, lab, proc, safety, flow) |

**Total: 19 lessons, 149 cards, 138 module quiz questions, 92 checks, 6 scenarios (30 steps), 200 exam questions — every key and rationale read.**

## Corrections

| file | id | was | now | source |
|---|---|---|---|---|
| `exams/ed-tech-competency.json` | q0136 | Keyed choice + rationale gave doffing order "gloves, gown, eye protection, mask" | "gloves, eye protection, gown, mask" (choice text and rationale) | CDC *Sequence for Removing PPE* (gloves → goggles/face shield → gown → mask). Also removed a direct contradiction with q0143 in the same exam, which already keyed the CDC order. |
| `modules/ed-presentations.json` | l07 body (agitated patient) | "Stand between the patient and the door, keep an exit behind you" | "Keep your own exit clear and stay nearer the door than the patient without cornering them or blocking their way out" | Standard workplace-violence/de-escalation teaching: never block the patient's egress. The old wording contradicted this module's own items — `quiz.json` check `ed-presentations-l07` keys "Stand between the patient and the door so they cannot leave" as wrong, and exam q0154 keys "blocking the doorway" as wrong. |
| `modules/ed-presentations.quiz.json` | check `ed-presentations-l11` #2 (intraocular metal / imaging) | Distractor "Bedside ultrasound of the globe"; rationale asserted "plain films and ultrasound carry no magnetic risk" | Distractor replaced with "Documented visual acuity in each eye"; rationale rewritten accordingly | Ocular ultrasound is avoided in a possibly open globe because it applies pressure, so the old item had two defensible "must not be ordered" answers and endorsed an unsafe action. Answer index unchanged (1, MRI). |
| `exams/ed-tech-competency.json` | q0068 | Stem: "regular, narrow-complex rhythm at **100 bpm**" keyed as sinus tachycardia, rationale said "at a rate above 100" | Stem now "118 bpm" | Sinus tachycardia is defined as >100/min; 100 is upper-limit normal, so the stem contradicted its own rationale. |
| `exams/ed-tech-competency.json` | q0174 | Choice 3 contained corrupted text: "Setting,باckground, Assessment, Review" | "Setting, Background, Assessment, Review" | Encoding defect in the distractor. |

Answer indices were changed on no item, so the exam's answer-index spread is unchanged (exactly 50/50/50/50 across indices 0-3). All four files re-validated: `node tools/validate.mjs` prints `ok` for each.

## Checked and confirmed correct (spot list of the load-bearing numbers)

- Chest pain: door-to-ECG ≤10 min; hs-troponin at 0 and 1-3 h with delta; ASA 324 mg chewed; O2 only if SpO2 <90%; ~1/3 of infarcts with non-diagnostic first ECG.
- Stroke: door-to-CT ≤25 min, read ≤45 min; alteplase window 4.5 h from last known well; thrombectomy to 24 h in selected LVO; pre-lytic BP <185/110, post <180/105; neuro checks q15 min ×2 h; NIHSS 0-42; ~87% ischemic; ~1.9 million neurons/min.
- Sepsis (SSC Hour-1): lactate >2 abnormal / ≥4 triggers bolus; 2 culture sets before antibiotics; 30 mL/kg (2.1 L at 70 kg, 1.8 L at 60 kg, 2.8 L at 92 kg — arithmetic verified in every item); norepinephrine for MAP <65; repeat lactate 2-4 h; temp <36 °C as abnormal as fever.
- Trauma: ABCDE; 14-16 g ×2; 1:1:1 MTP; TXA within 3 h; tertiary survey ~24 h; lethal triad.
- Anaphylaxis: epi 0.3-0.5 mg IM (1 mg/mL) outer thigh, repeat q5-15 min; supine with legs elevated; 4-6 h observation, biphasic typically 4-12 h; two autoinjectors on discharge.
- DKA: fluids before insulin; K is the killer; hold insulin / replace first at K 3.1; dextrose added under ~250 mg/dL; BMP q2-4 h.
- Peds: infant fever ≥38.0 °C rectal, <28 d full workup incl. LP, 28-60 d risk-stratified; dexamethasone 0.6 mg/kg once; albuterol 2.5 mg <20 kg / 5 mg above; racemic epi → 2-3 h observation; bradycardia = hypoxia.
- Hyperkalemia: calcium gluconate 1 g (membrane only, 30-60 min), insulin 10 u + 25 g dextrose with glucose checks at 30 and 60 min, albuterol 10-20 mg neb, dialysis definitive; hemolysis falsely raises K.
- OB: Rh immune globulin 50 mcg <12 wk / 300 mcg later within 72 h; discriminatory zone ~1500-3500 mIU/mL; preeclampsia to 6 wk postpartum; Mg 4-6 g load then 1-2 g/h, reflexes lost first, calcium gluconate antidote; McRoberts + suprapubic, never fundal.
- Environmental: heat stroke >40 °C + AMS, cool to <39 °C in 30 min, stop at 38.5-39 °C, immersion 1-15 °C, antipyretics useless; afterdrop / truncal rewarming; snakebite antivenom dosed by severity not weight.
- Eye: irrigation before acuity, pH target 7.0-7.4 rechecked 5-10 min after stopping; IOP 10-21 normal; CRAO 90-240 min; no MRI with possible metal.
- Lab/procedure (exam): CLSI order of draw (cultures first, then light blue); citrate fill ratio; hemolysis raises K; gray top for glucose/alcohol; 2 identifiers, bedside labeling; wound irrigation 5-8 psi; face sutures 3-5 d, high-tension 10-14 d; restraint checks q2 h non-violent / q15 min violent; TB airborne, influenza droplet, MRSA contact, C. diff soap and water; sharps at 3/4 full; ESI 1-5 resource logic.

## Unverifiable / judgment calls left alone

- **Exam q0006** rationale says temporal artery readings "run close to core temperature." Temporal thermometry is in fact the least reliable route in children; the keyed answer (report the fever) is still correct, and the module itself teaches rectal-only for infants, so the item was left as written rather than rewritten.
- **Exam q0004** takes the standing orthostatic reading at 2 minutes while the module teaches 1 and 3 minutes. Both sit inside the accepted "1-3 minutes standing" window, so this is not an error.
- **Pediatric respiratory rates** in ext l18 ("infant 25-50") are the EMS-textbook ranges rather than the PALS ranges (infant 30-53). Both are in print; left as the level-appropriate version.
- **Torsion "roughly 6 hours"**, **priapism "about 4 hours"**, **CRAO "90-240 minutes"** and **post-void residual ">300 mL"** are all commonly quoted soft thresholds rather than hard guideline numbers. They are hedged ("roughly", "about", "supports") throughout, so they were left.
- **Septic shock mortality "30-40%"** is at the low end of the published range (SSC cites >40% in some cohorts). Defensible as written.
- **Restraint monitoring intervals** are CMS/Joint Commission-consistent but genuinely facility-specific; every item already says "or per facility policy."

## Verdict

High quality. Across roughly 600 individually keyed items the batch produced four genuine defects — one wrong PPE sequence that also contradicted another item in the same exam, one unsafe line of de-escalation advice that contradicted two of its own quiz items, one item with two defensible answers, and one internally inconsistent rhythm stem — plus one encoding artifact. Guideline numbers (Sepsis-3/SSC, ACS timing, stroke windows, AHA/AAP pediatrics, CLSI, CDC isolation) were accurate and internally consistent throughout, and scope-of-practice boundaries for an ED tech were handled carefully and correctly.
