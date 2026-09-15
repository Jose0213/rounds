# Audit: ed-codes-equipment-wound

Reviewed 2026-09-15.

## Files

| File | Lessons | Lesson checks | Extra checks | Cards | Quiz Q | Scenarios (steps) |
|---|---|---|---|---|---|---|
| `content/modules/ed-codes-acls-pals.json` | 10 | 30 | — | 75 | 38 | 3 (16) |
| `content/modules/ed-codes-acls-pals.quiz.json` | — | — | 20 | — | 55 | — |
| `content/modules/ed-equipment-respiratory.json` | 10 | 30 | — | 75 | 40 | 2 (10) |
| `content/modules/ed-wound-ortho.json` | 10 | 30 | — | 72 | 38 | 2 (10) |
| `content/modules/ed-wound-ortho.quiz.json` | — | — | 20 | — | 59 | — |

**Total items reviewed: 668** (30 lesson bodies + keyPoints blocks, 90 lesson checks, 40 extra checks, 222 cards, 230 quiz questions, 7 scenarios / 36 steps).

Every lesson body, keyPoints block, check, card front/back, quiz stem/choices/answer/rationale and scenario step was read. All cylinder-duration, drug-dose and defibrillation-energy arithmetic was recomputed independently.

## Corrections

| file | id | was | now | source |
|---|---|---|---|---|
| `ed-codes-acls-pals.json` | `ed-codes-acls-pals-q029` | Distractor "A proximal tibia in a leg with a mid-shaft femur fracture", with a rationale explicitly asserting that site is acceptable. A fracture proximal to the insertion site in the same limb **is** a contraindication (infusate extravasates through the fracture; compartment syndrome risk), so the question had two defensible correct answers and taught an unsafe site as safe. | Distractor changed to "A proximal tibia in a patient with a fractured left forearm"; rationale rewritten to state that a fracture in the target bone **or proximal to the site in the same limb** is also a contraindication. | Teleflex Arrow EZ-IO procedure/competency document (contraindications: fracture in target bone; IO in target bone within 48 h; infection at site; inadequate landmarks; prosthesis at site). StatPearls, *Intraosseous Vascular Access* — fracture at or proximal to the insertion site causes extravasation and raises compartment syndrome risk. |
| `ed-equipment-respiratory.json` | `ed-equipment-respiratory-l09` (lesson body) | "The cabinet runs at roughly `130 to 200 F` depending on facility setting, and a blanket straight out of it can burn skin…" | "AORN and ECRI cap blanket-warming cabinets at `130 F` (`54 C`), and a blanket straight out of one at that setting can still burn skin…" | AORN Guideline for Patient Temperature Management and the ECRI hazard-report update both cap blanket-warming cabinets at 130 °F / 54 °C. 200 °F exceeds every current recommendation, so quoting it as a normal facility setting endorses an unsafe configuration. |
| `ed-wound-ortho.quiz.json` | `ed-wound-ortho-q071` (rationale) | "inability to lift the heel (a positive straight leg raise test)" | "inability to lift the heel off the bed" | The straight-leg-raise (Lasègue) test is a lumbar nerve-root tension test, not a hip-fracture sign, and a "positive" SLR means radicular pain — the opposite of what was described. The module's own back-pain lesson (`ed-wound-ortho-l10`) uses SLR in its correct radicular sense, so the label was wrong and internally contradictory. |

## Checked and confirmed correct (representative, not exhaustive)

Verified against AHA 2020 ECC guidelines + focused updates, NRP, ABA burn criteria, Ottawa rules, Gustilo-Anderson, CDC/ACIP, AAOS 12e:

- **BLS numbers** — depths (adult ≥2 in / ≤2.4 in, child ~2 in or one third, infant ~1.5 in), rate 100–120, 30:2 vs 15:2, chest compression fraction ≥60%, pulse check ≤10 s, rescue breathing 1 q6 s adult and 1 q2–3 s pediatric (correct per the 2020 update), adult-pads-rather-than-no-shock rule.
- **ACLS drugs and energy** — epinephrine 1 mg q3–5 min with the correct shockable/non-shockable timing split; amiodarone 300 → 150 mg; lidocaine 1–1.5 → 0.5–0.75 mg/kg; biphasic 120–200 J and monophasic 360 J; atropine **1 mg** to a 3 mg maximum (the 2020 change from 0.5 mg is correctly reflected, including in the distractor rationale); dopamine 5–20 mcg/kg/min; epinephrine infusion 2–10 mcg/min; norepinephrine 0.1–0.5 mcg/kg/min; cardioversion 50–100 / 120–200 / 100 J; adenosine 6 → 12 mg; procainamide 20–50 mg/min to 17 mg/kg with the >50% QRS-widening stop rule; sotalol 100 mg (1.5 mg/kg) over 5 min; magnesium 1–2 g for torsades.
- **Capnography** — <10 mmHg as a perfusion instruction, sudden rise >35–40 as ROSC, sustained waveform as placement confirmation, flat trace vs low-but-shaped trace correctly distinguished in `q061`.
- **Post-ROSC** — SpO2 92–98%, PaCO2 35–45 mmHg, SBP ≥90 and MAP ≥65, TTM 32–37.5 °C for ≥24 h, prognostication deferred to ≥72 h after normothermia.
- **PALS / NRP** — 2 → 4 J/kg (up to 10 J/kg or the adult dose); epinephrine 0.01 mg/kg = 0.1 mL/kg of 0.1 mg/mL with a 1 mg maximum single dose; amiodarone 5 mg/kg; atropine 0.02 mg/kg (min 0.1 mg, max single 0.5 mg); HR <60 with poor perfusion despite oxygenation → CPR; SVT >220 infant / >180 child; adenosine 0.1 → 0.2 mg/kg; cardioversion 0.5–1 → 2 J/kg; boluses 20 mL/kg with 10 mL/kg for neonates, cardiac dysfunction and DKA; newborn PPV within the golden minute at 40–60/min for HR <100, 3:1 compressions (90/30) if HR <60 after 30 s of effective ventilation, preductal probe on the right hand.
- **Cylinder math, recomputed** — `(psi − 200) × 0.28 ÷ L/min`. 1500 psi @ 10 L/min = 36.4 min; 1200 @ 6 = 46.7 ≈ 47; 900 @ 4 = 49. M constant 1.56 and H/K 3.14 both correct.
- **Oxygen devices** — NC 1–6 L / 24–44%; simple mask 6–10 L / 35–60% with the ≥6 L rebreathing floor; Venturi 24–60%; partial rebreather 10–12 L / 60–75%; NRB 10–15 L / 80–95%; targets 94–98% general and 88–92% COPD.
- **HFNC / NIV** — 20–60 L/min at FiO2 21–100%, prongs filling no more than half the nares; CPAP 5–15 cmH2O; IPAP ~10–20 / EPAP ~4–8; the pressure-difference mechanism for BiPAP in hypercapnic COPD is stated correctly.
- **Suction** — adult 100–150, child 80–120, infant 60–100 mmHg; 10–15 s adult / 5 s infant; catheter no more than half the tube's inner diameter; no routine saline instillation; mouth-before-nose in infants.
- **Intubation setup** — BVM volumes 1000–1600 / 450–500 / 250 mL; ETT 7.0–7.5 female and 7.5–8.0 male at 21 / 23 cm depth; ear canal level with sternal notch; SOAP-ME contents.
- **Monitoring** — 3- and 5-lead placement; carbon monoxide false-normal SpO2; cuff bladder 80% circumference / 40% width with too-small-reads-high; dependent arm ≈ +10 mmHg; probe rotation every 4 h.
- **Wound care** — wound-class infection rates; bite rates and organisms with amoxicillin-clavulanate vs cephalexin; lidocaine 4.5 mg/kg (300 mg cap) and 7 mg/kg (500 mg cap), with all dose calculations recomputed (70 kg → 31.5 mL, 60 kg → 42 mL, 50 kg → 225 mg, 4 cm → 200–400 mL, 6 cm → 300–600 mL); LET 4% / 0.1% / 0.5% soaked 20–30 min; irrigation 50–100 mL/cm at 5–8 psi; suture sizes and removal windows; tetanus 5-year vs 10-year intervals and TIG 250 units; rabies wash 15 min, RIG 20 IU/kg, vaccine days 0/3/7/14 (days 0/3 with no RIG if previously vaccinated), the 10-day observation species list and the sleeping-bat rule.
- **Burns** — depth table, TBSA excluding superficial burn, 20 min cooling effective up to 3 h, silver sulfadiazine contraindications, ABA referral criteria, escharotomy vs fasciotomy.
- **Orthopedics** — Ottawa ankle and foot rules including the distal-6-cm and four-step details and the stated exclusions; Weber and Maisonneuve; calcaneus/lumbar burst ~10%; Lisfranc >2 mm; Gustilo grades I–IIIC; antibiotics within 1 h; delta pressure <30 mmHg and 4–6 h necrosis with pulses preserved; hip dislocation reduced within 6 h; position of safety 20–30° / 70–90°; radial nerve in 10–18% of humeral shaft fractures; Salter-Harris SALTR with type II ≈75%; nursemaid's and toddler's fracture age ranges; NJ universal mandated reporting to the State Central Registry.

## Unverifiable / judgment calls (left alone)

- **E-cylinder conventions.** The module subtracts a **200 psi** safe residual inside the duration formula but uses **500 psi** as the swap threshold. Both are standard and serve different purposes (AAOS uses a 200 psi residual; 500 psi is the common change-the-tank rule), and the module states each purpose explicitly — but the pairing can read as inconsistent to a new student.
- **Suction pressure ranges.** Published adult wall-suction ranges vary between texts (80–120 vs 100–150 mmHg). The table is internally consistent and within the commonly taught band.
- **Non-rebreather FiO2 "80 to 95%".** Sources quote anywhere from "up to 90%" to "60–100%". Not changed.
- **Suture removal, arm/trunk.** The table says 7–12 days; the keyPoint compresses this to 7–10. Both are inside accepted ranges, so this was treated as a summary, not an error.
- **Bite infection rates.** Cat 30–50% and human 10–25% sit at the conservative end of published ranges (some sources quote up to 80% for cat bites to the hand). Defensible as written.
- **Epinephrine "after the second shock."** AHA phrases this as "after initial defibrillation attempts have failed" rather than naming a shock number. The module's version is the standard ACLS-course teaching and is applied consistently across lessons, cards, quiz and scenario.
- **"Free-hosing is a named never-event."** Burns from any source in a healthcare setting are an NQF serious reportable event, so the claim is defensible, although "free-hosing" is not itself a listed item name.
- **Scope of practice.** The module repeatedly hedges that whether a tech may administer nebulized medication or perform tracheal suctioning "varies by facility policy and state," and never has a tech program a pump, set NIV pressures, or clear an infusion alarm. That handling is correct and consistent with NJ practice.

## Verdict

High quality. Three corrections across 668 items — one genuine two-correct-answers defect that also taught an unsafe IO site, one out-of-date equipment temperature, one mislabelled physical-exam eponym. Every dose, energy, ratio, pressure and arithmetic result in the batch checked out against current guidelines.
