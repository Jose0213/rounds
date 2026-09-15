# Accuracy audit — batch `emt-medical`

Scope: EMT-Basic (NREMT / New Jersey), AAOS *Emergency Care and Transportation of the Sick and Injured* 12e, Brady *Emergency Care* 14e, AHA 2020 ECC + 2025 focused updates, AAP/IDSA/ACOG where relevant.

## Files and items reviewed

| File | Lessons (checks) | Cards | Quiz | Scenarios |
|---|---|---|---|---|
| `content/modules/emt-medical.json` | 10 (30) | 74 | 36 | 3 |
| `content/modules/emt-medical.ext.json` | 9 (27) | 78 | 46 | 2 |
| `content/modules/emt-medical.quiz.json` | — | — | 55 | — |
| `content/modules/emt-medical-systems.json` | 10 (30) | 64 | 36 | 2 |
| **Total** | **29 lessons / 87 checks** | **216** | **173** | **7 (38 steps)** |

Every lesson body, keyPoint, check, card front/back, quiz stem/choices/answer/rationale and scenario step was read.

## Corrections

| file | id | was | now | source |
|---|---|---|---|---|
| `emt-medical.json` | `emt-medical-l08` (body, Key callout) | High-flow O2 "shortens the half-life from about `4–5 hours` on room air to under `1 hour`" | "...to about `60–90 minutes`" | COHb half-life ~300 min room air, ~80–90 min on 100% O2 by NRB (Weaver et al., *Chest* 2000; StatPearls, *Hyperbaric Treatment of Carbon Monoxide Toxicity*) |
| `emt-medical.json` | `emt-medical-l08` check 0 (`why`) | "cuts the half-life from hours to under an hour" | "cuts the half-life from about 4 to 5 hours to roughly 60 to 90 minutes" | same |
| `emt-medical.json` | `emt-medical-c056` | "falls from about 4 to 5 hours on room air to under 1 hour on a non-rebreather" | "...to about 60 to 90 minutes on a non-rebreather" | same; also resolves a direct contradiction with `emt-medical-c124` in the ext file, which already said 60–90 min |
| `emt-medical.quiz.json` | `emt-medical-q118` | **Answer key = "Complex, because it reached the 5-minute mark"** for a 2-year-old's single generalized 5-minute febrile seizure; the rationale itself argued the opposite ("5 minutes sits well within the simple range") | Answer key = **"Simple, since it was generalized, lasted under 15 minutes, and did not recur within 24 hours"**; distractor 3 reworded to be clearly wrong; rationale rewritten to match, and to keep the point that the child is still transported | AAP clinical practice guideline: a simple febrile seizure is generalized, <15 min, and does not recur within 24 h — this is also what `emt-medical-l13` and card `emt-medical-c096` in this same batch teach |
| `emt-medical.quiz.json` | `emt-medical-q129` | Stem: "A **newborn several weeks old**" with episodic knee-drawing + currant jelly stool, keyed to intussusception | Stem: "A **9-month-old**"; the colic distractor reworded to "common in early infancy" | Intussusception peaks ~6 months–3 years (module's own `emt-medical-l17` / card `c129`); it is rare in neonates, so the stem as written keyed a diagnosis inconsistent with the age given |
| `emt-medical-systems.json` | `emt-medical-systems-q013` | Correct choice: "**Oxygen**, warmth, gentle handling, and transport..." in a sickle cell patient explicitly described with a room-air `SpO2` of 98% | "Warmth, gentle handling, and transport while believing the reported pain, **with oxygen only if he becomes hypoxic**"; rationale updated | Supplemental O2 is not indicated in a normoxic patient; `emt-medical.ext.json` `emt-medical-l18` already states "oxygen if the saturation is below `94%`" |

Answer-index spread after edits (validator limit 40% on any index): `emt-medical` 25/25/25/25; `.ext` 26.1/26.1/23.9/23.9; `.quiz` 25.5/27.3/27.3/20.0; `-systems` 27.8/25.0/25.0/22.2. `node tools/validate.mjs` prints `ok` for all four files.

## Verified and left alone (spot-checked against sources)

Epinephrine 0.3 mg / 0.15 mg IM anterolateral thigh, peak ~8 min, repeat 5–15 min; biphasic up to ~20%; time-to-arrest 5/15/30 min (IV drug/sting/food). Stroke 87% ischemic / 13% hemorrhagic; 1.9 million neurons/min (Saver 2006); Cincinnati any-one-abnormal ≈72%; alteplase 4.5 h, thrombectomy 24 h; O2 only below 94%. LAMS scoring 0–1/0–2/0–2 with ≥4 suggesting LVO. Status epilepticus at 5 min; febrile seizures 6 mo–5 y; eclampsia >20 wk to 6 wk postpartum, magnesium 4–6 g. Hypoglycemia <70 mg/dL, rule of 15, glucagon 1 mg IM / 3 mg intranasal; SGLT2 euglycemic DKA; sulfonylurea recurrence. Activated charcoal 1 g/kg (25–50 g) within ~1 h; Poison Control 1-800-222-1222; CO binds Hb ~200–250×; TCA QRS >100 ms / >160 ms thresholds; acetaminophen 150 mg/kg, 4-h level, NAC within 8 h; oil of wintergreen ≈7 g salicylate per teaspoon. Heat stroke >104 °F/40 °C with AMS, cold-water immersion ~0.2 °C/min, stop cooling at 38.5–39 °C; hypothermia staging 90–95 / 82–90 / <82 °F. Neutropenic fever ≥38.3 °C once or ≥38.0 °C for 1 h, nadir 7–10 days, antibiotics within 60 min. Hemophilia A = factor VIII, B = factor IX; vWD most common inherited bleeding disorder. Thyroid storm >104 °F; hydrocortisone 100 mg IM for adrenal crisis. Croup 6 mo–3 y; epiglottitis "nothing in the mouth". Scope: nothing in the batch has an EMT starting an IV, pushing a drug outside EMT scope, or treating from a 12-lead — naloxone, epinephrine auto-injector, albuterol, oral glucose, charcoal, CPAP and (protocol-dependent) glucagon are all correctly framed, with bicarbonate, magnesium, hydroxocobalamin, atropine/2-PAM and nitroglycerin correctly labeled ALS/hospital.

## Unverifiable / judgment calls (left as written)

- **BVM rate "10–12 breaths per minute"** (`emt-medical-l07`, `c046`). AHA 2020 rescue breathing is 1 breath every 6 s (10/min); "10–12" is still the phrasing in AAOS/Brady. Left as the textbook range.
- **Intranasal naloxone "2 mg per nostril with an atomizer"** (`emt-medical-l07`, `c047`). MAD dosing varies by protocol (2 mg/2 mL split 1 mg per nostril is also common); the 4 mg prefilled-spray figure is unambiguous and correct. Defensible as written, protocol-dependent.
- **Frostbite rewarming water "99–102 °F"** (`emt-medical-l09`, `q108`). AAOS 12e says 102–104 °F; Wilderness Medical Society says 37–39 °C (98.6–102.2 °F). Both are sourced; left alone.
- **Sepsis thresholds differ between files**: `emt-medical-l10` and cards use SBP <90 (SIRS-style), `emt-medical-systems-l03` uses SBP <100 (qSOFA-style). Both are real published thresholds, so this is an inconsistency of convention rather than an error.
- **Pediatric auto-injector weight band**: base module says "under about 30 kg", systems module says "roughly 15–30 kg" (with <15 kg per protocol). The systems wording is more precise; the base wording is the standard EMT simplification. Left both.
- **Biphasic reaction timing**: base module "usually within 8 hours, described up to 72"; systems module "4 to 12 hours, up to 72". Reported ranges vary widely in the literature (1–20% incidence, most within 8–12 h). Both defensible.
- **"Acute chest syndrome is the leading cause of death"** — ext file qualifies it to adults, systems file does not. The unqualified version is how AAOS states it; left alone.
- **"Excited delirium" terminology** is retained alongside "hyperactive delirium with severe agitation". ACEP has moved away from the former term, but NREMT-level texts still use it and the batch already presents both; this is terminology, not a clinical error.

## Verdict

High quality. 173 quiz items, 87 checks, 216 cards and 7 scenarios yielded one true answer-key error (`q118`, where the rationale already contradicted the key), one internally inconsistent stem (`q129`), one outdated/optimistic number repeated in three places (CO half-life on a non-rebreather), and one choice that endorsed routine oxygen in a normoxic patient. Doses, thresholds, mnemonics, toxidromes and scope boundaries were otherwise accurate and consistent across all four files.
