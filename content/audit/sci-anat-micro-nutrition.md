# Accuracy audit — sci-anat-micro-nutrition

## Files reviewed

- `content/modules/sci-anat1.json` — A&P I
- `content/modules/sci-anat2.json` — A&P II
- `content/modules/sci-micro.json` — Microbiology
- `content/modules/sci-nutrition.json` — The Science of Nutrition

No `.ext.json` or `.quiz.json` files exist for any of these four modules.

## Items reviewed

| File | Lessons | Lesson checks | Cards | Quiz | Scenarios (steps) |
|---|---|---|---|---|---|
| sci-anat1 | 10 | 30 | 80 | 40 | 2 (10) |
| sci-anat2 | 10 | 30 | 80 | 40 | 2 (10) |
| sci-micro | 10 | 30 | 75 | 38 | 2 (10) |
| sci-nutrition | 10 | 30 | 70 | 38 | 2 (10) |
| **Total** | **40** | **120** | **305** | **156** | **8 (40)** |

629 discrete items, every lesson body, keyPoint, check, card, quiz item (stem + 4 choices + key + rationale) and scenario step read individually. Every worked example was recomputed by hand: kcal-from-macros, percent-of-energy, relative-to-absolute risk, glycemic load, Friedewald LDL, protein g/kg, Mifflin-St Jeor, activity factors, 3,500 kcal rule, BMI, label %DV, sweat-loss replacement, iron absorption fractions, bacterial generation counts (N0 × 2^n), CFU/mL serial dilutions, MAP, cardiac output/EF, alveolar ventilation, net glomerular filtration pressure, Poiseuille radius^4, rule of nines.

## Corrections

| file | id | was | now | source |
|---|---|---|---|---|
| sci-anat1.json | sci-anat1-l02 | "Water is `60–70%` of body weight" | "Water is `50–60%` of adult body weight" | OpenStax A&P 26.1: ~75% in infants, **50–60% in adult men and women**, ~45% in old age. The module's own A&P II lesson (`sci-anat2-l09`) already stated 60% men / 50% women, so this was also an internal contradiction. |
| sci-micro.json | sci-micro-l09 | "vehicle (airborne on droplet nuclei over `5 micrometers` distance, waterborne, foodborne)" | "vehicle (airborne on droplet nuclei of `5 micrometers` or less, which stay suspended and travel well beyond the short range of larger droplets, plus waterborne and foodborne)" | CDC Isolation Precautions / SARS core glossary: droplet nuclei are the small-particle residue **≤5 µm** that stays suspended; droplets **>5 µm** fall within 1–2 m. The original inverted the size criterion and attached "micrometers" to distance. |
| sci-anat2.json | sci-anat2-l05 | "Small molecules become immunogenic only when bound to a carrier — a **hapten**, which is how poison ivy … work." | "A small molecule that is only immunogenic once it binds a larger carrier protein is a **hapten**, which is how poison ivy … work." | Standard immunology definition (Marieb/Tortora): the **hapten is the small molecule**, not the carrier. As written the appositive named the carrier the hapten. |
| sci-nutrition.json | sci-nutrition-l06 check 0 | choices `1,530 / 1,830 / 1,930 / 2,130`; why: "The 1,530 answer uses the female constant incorrectly and 2,130 omits the age term" | choices `1,664 / 1,830 / 1,930 / 2,030`; why names the correct derivations | Keyed answer 1,830 was right, but the rationale's stated derivations were arithmetically false. Recomputed Mifflin-St Jeor: female constant gives 900+1,125−200−161 = **1,664**; omitting age gives 900+1,125+5 = **2,030**. |
| sci-nutrition.json | sci-nutrition-q019 | choices `1,514 / 1,680 / 1,694 / 1,880`, answer = "1,694"; why: "= about 1,694" | choices `1,508 / 1,449 / 1,674 / 1,899`, answer index unchanged (2) = "1,674"; why recomputed | **Wrong answer key value.** 10×80 = 800; 6.25×175 = 1,093.75; 5×45 = 225; 800+1,093.75−225+5 = **1,673.75 ≈ 1,674**, not 1,694. Distractors also relabeled to their true derivations (female constant 1,508; double age subtraction 1,449; no age term 1,899). Answer index unchanged, so the file's answer-index spread is untouched. |
| sci-nutrition.json | sci-nutrition-s01 step s2 | feedback on "About 1,761 kcal/day": "That result adds 5 instead of subtracting 161, which is the male version" | "That result adds the 161 constant instead of subtracting it. Women subtract 161 and men add 5…" | Adding 5 gives 1,605, not 1,761. 1,761 = 1,600 + 161, i.e. the sign of the female constant flipped. The feedback described an arithmetic path that does not produce the number shown. |

All four files re-validated: `node tools/validate.mjs` prints `ok` with no `x` for each. (`sci-micro.json` carries a pre-existing non-blocking `!` word-count warning on `sci-micro-l10`, a lesson this audit did not touch.)

## Unverifiable / judgment calls (left alone)

- **Complement protein count.** `sci-anat2-l05` says "about `20` plasma proteins"; `sci-micro-l10` says "about 30 proteins". Both are defensible against their source texts (Marieb ~20 for the classical set; Tortora "over 30" for the full system) and the two modules are separate files, so neither is internally contradictory. Left as-is.
- **Primary antibody response latency.** `sci-anat2-l05` says `3–6` days; `sci-micro-l10` says `5–10` days. Textbooks vary (lag of several days, peak 10–17 days). Both are inside the defensible band for their course; no cross-module contradiction within a single file.
- **Alveolar surface area** (`70 m2`) and **alveolar count** (`300 million`) in `sci-anat2-l06` — sources range roughly 70–100 m² and 300–500 million. Kept the low, most commonly taught figure.
- **Small-intestine absorbing surface**: `sci-nutrition-l02` says `250 m^2`, standard in nutrition texts (Whitney/Rolfes); A&P texts often state a lower figure. Discipline-appropriate, left alone.
- **Synaptic cleft `20–40 nm`** (`sci-anat1-l09`) — Marieb gives 30–50 nm, OpenStax 20–40 nm. Within range of a cited authority.
- **Aerobic ATP yield**: `sci-micro` uses the older `38 ATP` (Tortora's convention for prokaryotes) while `sci-anat1`/`sci-anat2` use `30–32` (Marieb/OpenStax). Each matches its own discipline's textbook; no single file contradicts itself.
- **Epiphyseal plate closure at 18 F / 21 M** (`sci-anat1-l06`) — a textbook simplification of a range, standard for the level.
- **`sci-nutrition-s02` step s4** rounds 45/200 = 22.5% to "about 20 percent" and the two-bar figure 45% to "about 40 percent". Both are hedged with "about" and the underlying arithmetic shown is correct, so no edit was made.
- **`sci-anat2-q023`** has a garbled stem ("at 500 mL of dead space-heavy breaths"); the physiology, key and rationale are all correct, and stem prose is out of scope per the brief.

## Verdict

High-quality batch. Across 629 items the only true content errors were one inverted droplet-nuclei size criterion, one overstated body-water percentage, one misplaced hapten definition, and three arithmetic defects clustered in the Mifflin-St Jeor material of `sci-nutrition` — one of which (q019) was a genuinely wrong answer key. Every other worked example recomputed exactly, every answer key matched its rationale, and no scope, mechanism, or drug-class errors were found.
