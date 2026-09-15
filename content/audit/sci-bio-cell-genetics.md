# Audit: sci-bio-cell-genetics

**Files reviewed**

- `content/modules/sci-bio1.json` — General Biology I
- `content/modules/sci-bio2.json` — General Biology II
- `content/modules/sci-cell-bio.json` — Cell Biology
- `content/modules/sci-genetics.json` — Genetics

No `.ext.json` or `.quiz.json` companions exist for these four modules.

**Items reviewed: 850**

| File | Lessons | KeyPoints | Checks | Cards | Quiz | Scenario steps | Total |
|---|---|---|---|---|---|---|---|
| sci-bio1 | 10 | 50 | 30 | 75 | 40 | 9 | 214 |
| sci-bio2 | 10 | 50 | 30 | 75 | 38 | 11 | 214 |
| sci-cell-bio | 10 | 50 | 29 | 73 | 40 | 10 | 212 |
| sci-genetics | 10 | 50 | 30 | 72 | 36 | 12 | 210 |
| **Total** | **40** | **200** | **119** | **295** | **154** | **42** | **850** |

Every lesson body, keyPoint, check (stem + 4 choices + answer + rationale), card front/back, quiz item and scenario step (prompt + every choice + every feedback string) was read. Every Punnett square, probability chain, Hardy-Weinberg calculation, binomial, recombination frequency, three-point map and pedigree recurrence risk was recomputed by hand; every named disease was checked against its established inheritance pattern and OMIM phenotype.

## Corrections

| file | id | was | now | source |
|---|---|---|---|---|
| sci-cell-bio.json | `sci-cell-bio-l10` (lesson body) | "Complete oxidation of one glucose yields about `30-38 ATP`, depending on the shuttle carrying cytosolic NADH in" | "…about `30-32 ATP`, depending on the shuttle carrying cytosolic NADH in (older texts say 36-38)" | Lehninger 7e / Campbell 12e: modern P/O ratios (2.5 ATP per NADH, 1.5 per FADH2) give 30 ATP with the glycerol-3-phosphate shuttle and 32 with malate-aspartate; 36-38 is the superseded figure |
| sci-cell-bio.json | `sci-cell-bio-l10` keyPoint 0 | "…ATP synthase uses the return flow; about 30-38 ATP per glucose." | "…about 30-32 ATP per glucose." | same |
| sci-cell-bio.json | `sci-cell-bio-c066` | "About 30-38 ATP total depending on the shuttle used for cytosolic NADH, against a net of only 2 ATP from glycolysis." | "About 30-32 ATP total … Older texts cite 36-38." | same |
| sci-cell-bio.json | `sci-cell-bio-q037` choice 2 (the keyed answer) | "30 to 38" | "30 to 32" | same |
| sci-cell-bio.json | `sci-cell-bio-q037` rationale | "About 30 to 38 ATP, the range reflecting which shuttle carries cytosolic NADH into the mitochondrion." | "About 30 to 32 ATP, the range reflecting which shuttle carries cytosolic NADH into the mitochondrion; the older 36-38 figure used outdated P/O ratios." | same |

**Why this one mattered.** The stated reason for the range ("depending on the shuttle") only accounts for the 30-vs-32 spread; 38 comes from the abandoned integer P/O ratios. It was also a direct internal contradiction inside this batch: `sci-bio1-l06` and `sci-bio1-c048` already state "30 to 32" and explicitly label 36-38 as what "older textbooks cite." The answer index for `q037` is unchanged (still index 2), so the file's answer-index spread is untouched.

No other corrections were required. All four files pass `node tools/validate.mjs` with `ok` and no `x`.

## Verified and left alone (recomputed or checked against sources; all correct)

Recomputed math:

- `sci-bio1-q004` — pH 7.20 vs 7.40 = 10^0.2 ≈ 1.6-fold H+ increase.
- `sci-bio2-l02` worked problems — q²=0.04 → q=0.2, 2pq=0.32, p²=0.64 (sums to 1.00); 0.42/0.91 = 46%; X-linked q=0.08 → affected females q²=0.0064.
- `sci-bio2-q005/q006/q008` and `sci-bio2-q007` — CF 1/2,500 → q=0.02, 2pq=0.039 ≈ 1 in 25, with the "1 in 50" distractor correctly identified as the dropped factor of 2.
- `sci-bio2-q037` — 20,000 → 2,000 → 200 kcal at 10% per trophic level.
- `sci-bio2-s01` — q²=100/40,000=0.0025, q=0.05, 2pq=0.095 → 3,800 carriers; 0.095/(1−0.0025)=0.0952; 0.095×0.095×0.25=0.0023.
- `sci-genetics-l04` binomial — C(3,1)×(1/4)×(9/16) = 27/64 = 42%.
- `sci-genetics-q011` — C(4,2)=6 × (1/4)² × (3/4)² = 54/256 = 0.21.
- `sci-genetics-l07` three-point cross — counts sum to 1,000; parentals ABC/abc; doubles AbC/aBc; B correctly identified as the middle gene; A–B = (40+38+3+3)/1000 = 8.4 m.u.; B–C = (24+22+3+3)/1000 = 5.2 m.u.; A–C = 13.6. Interference block: expected doubles 0.084×0.052×1000 = 4.4, observed 6, CoC = 1.36, interference = −0.36 — arithmetic correct, and the text itself flags that positive interference is the usual case.
- `sci-genetics-q020` — (52+48)/1000 = 10 m.u. `sci-genetics-q027` — q²=1/1600, q=0.025, 2q ≈ 1 in 20.
- `sci-genetics-s02` — 2/3 × 1/25 × 1/4 = 1/150; a negative result on a 90%-detection panel leaves ≈1 in 250 residual carrier risk (Bayesian posterior 0.0042 — matches).
- X-linked recurrence framing throughout (1/4 per pregnancy of unknown sex, 1/2 for a known son; affected father → all daughters obligate carriers, no sons affected; unaffected sib of an AR proband = 2/3 carrier) is consistently correct, including the deliberate contrast in `sci-genetics-s01` step 5 between a 1/2 genotype probability and a 1/4 offspring risk.

Disease and inheritance claims checked against OMIM and standard references, all correct: sickle cell HBB Glu6Val (GAG→GTG at position 6); CFTR F508del as an in-frame 3-bp deletion with sweat chloride >60 mmol/L; the Duchenne/Becker reading-frame rule; HTT CAG thresholds (<27 normal, 27–35 intermediate, 36–39 reduced penetrance, ≥40 full); FMR1 CGG premutation 55–200; 15q11-q13 paternal deletion → Prader-Willi, maternal → Angelman; 22q11.2 → DiGeorge; 5p → cri-du-chat; Turner 45,X ~1/2,500 female births; Klinefelter 47,XXY ~1/600 male births; trisomy 21 ~1/700 with 40–50% CHD; trisomy 18 ~1/6,000; trisomy 13 ~1/10,000; the Down maternal-age table (1/1,500 at 20 → 1/100 at 40); Robertsonian translocation Down syndrome reading 46 chromosomes; Lynch (MLH1/MSH2, MSI), xeroderma pigmentosum (NER), BRCA1/2 (HR); BRCA1 penetrance 55–72%; t(9;22) BCR-ABL and imatinib; t(14;18) BCL-2; HER2 amplification in 15–20% of breast cancers; the Li-Fraumeni tumor spectrum; MELAS and LHON maternal inheritance; the Kartagener/PCD dynein-arm triad; I-cell (M6P) and Tay-Sachs (HexA/GM2); familial hypercholesterolemia as incomplete dominance; Bombay hh epistasis.

Cell-biology numbers verified against Alberts *Essential Cell Biology*: light-microscope resolution ~200 nm and EM 0.1 nm (1–2 nm on biological specimens); bilayer 5 nm; nucleosome 147 bp / 1.65 turns; NPC ~120 nm with a ~40 kDa passive limit; eukaryotic Okazaki fragments 100–200 nt; fidelity layers 10^5 → 10^7 → 10^9–10^10; NER patch 24–32 nt; TTAGGG; Hayflick 40–60 divisions; telomerase in 85–90% of cancers; poly-A ~200 nt; GU–AG splice boundaries; alternative splicing in ~95% of multi-exon genes; 80S/60S+40S vs 70S/50S+30S; signal sequence 16–30 residues; COPI/COPII/clathrin directions; 13 protofilaments; channel 10^8/s vs carrier 10^2–10^4/s; Na+/K+ 3:2 with 145/12 and 4/140 mM; cytosolic Ca2+ ~100 nM vs 1–2 mM extracellular; ~800 GPCRs; RAS mutations in 25–30% of cancers; TP53 in ~50%; cell-cycle phase lengths (G1 11 h, S 8 h, G2 4 h, M <1 h); the apoptotic 180-bp ladder; mtDNA 16,569 bp / 37 genes; the gap-junction <1,000 Da cutoff; the 1–2 mm tumor diffusion limit.

Other externally verified claims: the PA-CAT is 240 questions in ~4.5 hours across the nine subjects listed ([pa-cat.com](https://www.pa-cat.com/about-the-pa-cat/)); New Jersey newborn screening covers 61 disorders, so "more than 60" is accurate ([nj.gov](https://www.nj.gov/health/fhs/nbs/bloodspot/disorders-screened/)); GINA 2008 scope plus its life/disability/LTC and fewer-than-15-employee gaps; HLA-B*5701/abacavir, TPMT+NUDT15/thiopurines, CYP2C19/clopidogrel, CYP2D6/codeine; NIPT from 10 weeks with >99% trisomy 21 detection and prevalence-dependent PPV.

## Unverifiable / judgment calls (left alone)

1. **`sci-cell-bio-l04` and `sci-genetics-l01`: replication error rate "about 1 in 10^9."** Alberts and Campbell put the post-mismatch-repair rate closer to 1 in 10^9–10^10. `sci-cell-bio` already gives the full range; `sci-genetics` gives the round 10^9. Defensible at this level.
2. **`sci-bio2-l09` / `sci-bio2-c070` / `sci-bio2-q033`: primary immune response "5 to 10 days."** Campbell 12e describes the primary response as *peaking* at 10–17 days, but 5–10 days is the standard figure for the lag before detectable antibody, and the contrast being taught (primary slow/IgM vs secondary fast/IgG) is correct either way. Flagged because a strictly Campbell-keyed exam might want 10–17.
3. **`sci-bio2-l07` / `sci-bio2-c048`: small-intestine surface area "roughly 250 square meters."** Textbooks say 250–300 m²; recent morphometric work argues for ~30 m². The textbook number is what an exam will key, so it stays.
4. **`sci-genetics-l10`: CVS loss risk ~1 in 200, amniocentesis ~1 in 400.** ACOG Practice Bulletin 162 now cites procedure-related loss of 0.1–0.3% for amniocentesis, i.e. nearer 1 in 500–900. The ordering (CVS above amnio) is right and these are the figures most course texts still print, but they sit on the older, more conservative end. Worth revisiting if the module is ever aligned to current ACOG.
5. **`sci-genetics-l07`: the interference worked example yields a negative interference (−0.36).** The arithmetic is correct for the invented counts and the text explicitly notes that positive interference is the norm — but a fabricated dataset that lands on the atypical case is a pedagogically odd choice. Factually sound, so left alone.
6. **`sci-genetics-q016`:** the stem pairs a heterozygous FH father with a homozygous FH son, which silently requires the mother to carry as well. Not stated, not wrong, and irrelevant to what the item tests (incomplete dominance).
7. **`sci-bio1-l09`: "the X carries over 1,000 genes."** Campbell gives ~1,100; other counts run 800–900 protein-coding. "Over 1,000" matches the course text.
8. **`sci-bio2-l10` / `sci-genetics-l02`: "20,000 genes produce well over 100,000 proteins."** A commonly repeated textbook framing rather than a hard measured number; directionally correct and standard at this level.

## Verdict

High quality. 850 items, one substantive defect — an outdated ATP-per-glucose figure in `sci-cell-bio` that also contradicted `sci-bio1` inside the same batch. Every worked calculation in the batch (Punnett, binomial, Hardy-Weinberg, recombination mapping, three-point gene ordering, Bayesian carrier updating) recomputed correctly, every answer key matched its rationale, and no item had two defensible correct choices.
