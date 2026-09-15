# Audit: sci-chem-orgo-biochem

Batch files:

- `content/modules/sci-chem1.json` — General Chemistry I
- `content/modules/sci-chem2.json` — General Chemistry II
- `content/modules/sci-orgo.json` — Organic Chemistry
- `content/modules/sci-biochem.json` — Biochemistry

No `.ext.json` or `.quiz.json` companions exist for any of these four.

## Items reviewed

| File | Lessons | Lesson checks | Cards | Quiz Qs | Scenarios (steps) |
|---|---|---|---|---|---|
| sci-chem1 | 10 | 30 | 70 | 40 | 2 (10) |
| sci-chem2 | 10 | 30 | 74 | 40 | 2 (10) |
| sci-orgo | 10 | 30 | 75 | 40 | 2 (12) |
| sci-biochem | 10 | 30 | 75 | 38 | 2 (10) |
| **Total** | **40** | **120** | **294** | **158** | **8 (42)** |

**654 items reviewed** (every lesson body + keyPoints, every check, card, quiz item with its choices/answer/rationale, and every scenario step with all options and feedback).

Every worked numeric example was recomputed by hand: sig-fig/dimensional-analysis dosing, weighted atomic mass, molar mass and mole conversions, empirical formulas, limiting reagent and percent yield, molarity/dilution/titration, all gas-law and Dalton/alveolar-gas problems, calorimetry and Hess's-law enthalpies, Bohr-model photon energies and wavelengths, colligative properties and osmotic pressure, first/zero-order kinetics and half-lives, ICE-table quadratics, strong- and weak-acid pH, Henderson–Hasselbalch (bench and blood-gas), Ksp and common-ion solubility, Gibbs crossover temperatures and ΔG°/K coupling, Nernst/cell potentials and Faraday charge, radioactive-decay activity, A-values and conformational equilibria, CIP priorities, degrees of unsaturation, pI calculations, and the glycolysis/TCA/ETC/beta-oxidation ATP and reducing-equivalent accounting.

## Corrections

| file | id | was | now | source |
|---|---|---|---|---|
| sci-chem2.json | sci-chem2-l05 (body) | "Carbonic acid has `Ka1 = 4.3 x 10^-7` (`pKa1 = 6.1`)" — 4.3e-7 gives pKa 6.37, not 6.1; 6.1 is the apparent pKa′ of the whole dissolved-CO2/HCO3− system | "…(`pKa1 = 6.37`; the apparent pKa' of 6.1 used clinically describes the whole dissolved-CO2/bicarbonate system, not H2CO3 alone)" | −log(4.3×10⁻⁷) = 6.37; OpenStax *Chemistry 2e* ionization-constant table; Lehninger 8e (apparent pKa′ 6.1 for the CO2/HCO3− buffer) |
| sci-chem2.json | sci-chem2-l05 (keyPoint 4) | "carbonic acid pKa1 is 6.1" | "the CO2/bicarbonate system's apparent pKa' is 6.1" | same as above; removes the internal contradiction with the corrected body text |
| sci-chem2.json | sci-chem2-l05 (body) | "Phosphoric acid's `pKa2` of `6.8`" — contradicted this module's own `sci-chem2-q021`, which keys "dihydrogen phosphate, pKa 7.20" as correct | "Phosphoric acid's `pKa2` of `7.2`" | H3PO4 Ka2 = 6.2×10⁻⁸ → pKa2 = 7.21 (OpenStax *Chemistry 2e*; CRC). Internal contradiction with q021 resolved. |
| sci-chem2.json | sci-chem2-q006 (stem) | "A liter of 3% NaCl (about 513 mOsm/L)" — 513 is the **millimolarity** of NaCl, not the osmolarity | "(about 1030 mOsm/L)" | 30 g/L ÷ 58.44 g/mol = 0.513 mol/L × 2 particles = 1027 mOsm/L. Keyed answer (water leaves cells) unchanged and still correct. |
| sci-orgo.json | sci-orgo-l04 (body) | "Nineteen of the twenty amino acids in your proteins are `S`" — glycine is achiral and has no R/S designation, so it cannot be one of the nineteen | "Glycine is achiral, and eighteen of the other nineteen amino acids in your proteins are `S`" | Klein *Organic Chemistry* 4e; Lehninger 8e Ch. 3 — 19 of the 20 proteinogenic amino acids are chiral; of those, all are (S) except cysteine (R). Consistent with this module's own `sci-biochem-q006`/`sci-orgo` glycine statements. |
| sci-orgo.json | sci-orgo-l06 (body, step 2 of degrees of unsaturation) | "Add nitrogens to the hydrogen count as if each N were `-1` H: **subtract `N` from the numerator**… more simply, treat each N as adding `1` to the `2C+2` term." — the first clause states the wrong operation and contradicts the second | "Add `1` to the `2C + 2` term for each nitrogen, so the full formula is `(2C + 2 + N - H - X)/2`." | Klein *Organic Chemistry* 4e (degree-of-unsaturation formula); matches this module's own card `sci-orgo-c038` |

No answer indices were changed, so the answer-index spread was not affected. `node tools/validate.mjs` prints `ok` for all four files.

## Unverifiable / judgment calls (left alone)

- **sci-chem1-l09 / c059 — C–H bond polarity boundary.** The lesson says "A difference under about 0.4 is nonpolar covalent (`C-H` at `0.4`)" and then defines 0.4–2.0 as polar covalent, so C–H sits exactly on the boundary it is being used to illustrate. Classifying C–H as nonpolar is universal in gen-chem texts and the word "about" covers it; not rewritten.
- **sci-chem1-l09 — expanded octets "because period 3+ have empty d orbitals available."** Modern computational work rejects meaningful d-orbital participation, but this is the explanation OpenStax and Zumdahl still print at this level. Left as the standard course-level treatment.
- **sci-chem1-l05 / c035 — 22.4 L molar volume at STP (0 °C, 1 atm).** IUPAC's current STP (100 kPa) gives 22.7 L. Every gen-chem course still teaches 22.4 L at 1 atm and the module states the conditions explicitly, so it is internally sound.
- **sci-chem1-l04 — solubility rules list Ba²⁺, Pb²⁺, Ca²⁺ as the insoluble/slightly soluble sulfates.** Incomplete (Sr²⁺, Ag⁺, Hg₂²⁺ also belong), but nothing stated is false and no question depends on the omission.
- **Phosphate buffer pKa: 7.2 (chem2) vs 6.86 (biochem-l01/c005).** These are the thermodynamic value (CRC/OpenStax) and the value at physiological ionic strength (Lehninger 8e, which prints 6.86). Both are correct within their own textbook convention and each module is internally consistent, so the two modules were deliberately left different rather than forced to match.
- **sci-chem1-l08, c058 — electronegativity values (F 4.0, O 3.5, N 3.0, C 2.5, H 2.1, Na 0.9).** These are the older Pauling-scale roundings; current values are 3.98/3.44/3.04/2.55/2.20/0.93. The rounded set is what gen-chem courses ask students to memorize and all the module's comparisons still hold.
- **sci-orgo-l03 — "tert-butyl costs roughly 5.4 kcal/mol axial."** Published A-values for *tert*-butyl range from ~4.7 to >5 kcal/mol depending on method; Klein's table prints 5.4. The conclusion drawn (>99 % equatorial) holds at any value in that range.
- **sci-orgo-l09 — "roughly three of every four small-molecule drugs carry [an amine]."** The ~75 % figure is widely repeated in med-chem literature but no single authoritative count exists. Softened by "roughly"; left alone.
- **sci-orgo-l03 / l04 — cysteine is R "only because sulfur outranks the carboxyl carbon."** True as stated (CIP, not geometry), verified against Klein.
- **sci-biochem-l04 — "Enzymes are classified into six groups."** IUBMB added a seventh class (translocases) in 2018, but every current biochemistry course still teaches the six. Not changed.
- **sci-biochem-l09 — threonine listed as both glucogenic and ketogenic.** Lehninger lists it in both columns; some newer sources classify it as purely glucogenic. Kept the Lehninger classification the module is built on.
- **sci-chem1-s02 step s4 — an A–a gradient of 18 mmHg called "within normal range for an older adult."** No age is given in the vignette; 18 is normal for roughly age 55 and up by the age/4 + 4 estimate, which is what "older adult" implies. Defensible as written.

## Verdict

High quality. Across 654 items the numeric work is essentially flawless — every stoichiometry, gas-law, thermochemistry, kinetics, equilibrium, pH/buffer, Ksp, Gibbs, Nernst, decay, and ATP-accounting calculation recomputed to the stated answer, including the harder ones (ICE-table quadratic, 1:2 Ksp cube root, palmitate's 106 ATP, the 30–32 ATP shuttle range). Six corrections were needed: two genuine numeric errors (a pKa that did not match its own Ka, an osmolarity off by a factor of two), two internal contradictions, one wrong count of S-configured amino acids, and one self-contradicting formula statement. Nothing found would have led to a clinical error; the DKA, blood-gas, CO-poisoning, local-anesthetic, and drug-ionization tie-ins were all accurate.
