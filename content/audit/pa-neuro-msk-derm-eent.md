# Audit: pa-neuro-msk-derm-eent

Files reviewed:

- `content/modules/pa-anatomy-neuro-msk.json`
- `content/modules/pa-anatomy-neuro-msk.ext.json`
- `content/modules/pa-anatomy-neuro-msk.quiz.json`
- `content/modules/pa-derm.json`
- `content/modules/pa-eent.json`

## Items reviewed

| File | Lessons | Checks | Cards | Quiz Q | Scenarios (steps) |
|---|---|---|---|---|---|
| pa-anatomy-neuro-msk.json | 10 | 30 | 74 | 34 | 2 (10) |
| pa-anatomy-neuro-msk.ext.json | 8 | 24 | 62 | 42 | 2 (10) |
| pa-anatomy-neuro-msk.quiz.json | - | 20 | - | 55 | - |
| pa-derm.json | 10 | 30 | 70 | 37 | 2 (9) |
| pa-eent.json | 10 | 26 | 72 | 37 | 2 (8) |
| **Total** | **38** | **130** | **278** | **205** | **8 (37)** |

Every lesson body, keyPoint, check, card, quiz question with its choices/answer key/rationale, and every scenario step and choice feedback was read.

## Corrections

| file | id | was | now | source |
|---|---|---|---|---|
| pa-eent.json | pa-eent-l08 (body) | "Giving amoxicillin or ampicillin produces a widespread itchy rash in most patients with mono." | "...in a large minority of patients with mono, reported in roughly a third to half in modern studies rather than the near-universal rate older texts claim" | Chovel-Sella et al., *Pediatrics* 2013;131:e1424 (amoxicillin 29.5%); systematic review/meta-analysis, *Eur J Clin Microbiol Infect Dis* 2025 (pooled 43%, CI 18-72%); Cleveland Clinic J Med 2025;92:335 |
| pa-eent.json | pa-eent-l08#1 (check rationale) | "Aminopenicillins produce a widespread maculopapular rash in most EBV patients." | "...in a substantial share of EBV patients, roughly a third to half in modern studies." | same |
| pa-eent.json | pa-eent-s02 step s2 (feedback) | "aminopenicillins produce a widespread rash in most mono patients" | "...in a large minority of mono patients" | same |
| pa-derm.json | pa-derm-l05 (body) | tinea capitis "usually griseofulvin or terbinafine for `6` to `8` weeks" | "usually griseofulvin for `6` to `8` weeks or terbinafine for `2` to `6` weeks" | Terbinafine trials: Fuller BJD 2001 (4 wk terbinafine = 8 wk griseofulvin); Friedlander duration-finding study 2002; AAFP/Medscape tinea management reviews. Terbinafine courses are 2-6 weeks, not 6-8 |
| pa-derm.json | pa-derm-l05#0 (keyed correct choice) | "Oral griseofulvin or terbinafine for 6 to 8 weeks" | "Oral griseofulvin for 6 to 8 weeks, or terbinafine for 2 to 6 weeks" | same |
| pa-derm.json | pa-derm-q015 (choice 1, keyed) | "Oral antifungal therapy for 6 to 8 weeks is required" | "Oral antifungal therapy for several weeks is required" | same (duration depends on agent) |
| pa-anatomy-neuro-msk.json | l04 body, l04 keyPoint, c028 | Circle of Willis "complete in only about 20 to 50% of people" | "20 to 45%" | Reported prevalence of the complete configuration ranges ~12-45% (Tromsø Study, *PLOS One* 2020: 11.9%; Jones et al., *Clin Anat* 2021 meta-analysis: 12.2-45.0%). The 50% upper bound was unsupported |
| pa-anatomy-neuro-msk.quiz.json | q091 (choice + rationale) | "complete in only about 20 to 50 percent of people" | "20 to 45 percent" | same |

No answer-key changes were required, so answer-index spread is unchanged. All five files pass `node tools/validate.mjs` with `ok` and no `x`.

## Unverifiable / judgment calls (left as written)

- **Salter-Harris V "the worst and the easiest to miss"** and the SALTR mnemonic: standard teaching, imprecise but defensible.
- **"1.9 million neurons per minute" in untreated stroke** (base l04): traceable to Saver, *Stroke* 2006; it is an estimate, and the text already hedges with "often-quoted."
- **TIA: ~10% stroke at 90 days, half within 48 hours** (ext l12): the classic Johnston figures; modern cohorts on urgent treatment run lower. Left because the text is used to justify urgency, which is still correct.
- **Kocher criteria "all four suggests >93%"**: Kocher 1999 reported 99.6%, the 2004 prospective validation 93%. The lower, conservative figure was kept.
- **Splenomegaly "in about 50%" of mononucleosis**: consistent with standard texts; ultrasound-detected rates are higher than palpable rates.
- **Amaurosis fugax "2-30 minutes"** and **CRAO irreversible damage "around 90 minutes"**: both are conventional teaching ranges, not hard thresholds.
- **Anaphylaxis biphasic reaction "4 to 12 hours later"**: biphasic reactions are usually described as occurring within 8-10 hours but can occur up to 72 hours; the stated window is narrow but not wrong for the typical case.
- **Ottawa ankle rules "close to 100% sensitive"**: pooled sensitivity is ~98-99%; the text's hedge ("close to") is acceptable.
- **ext scenario `pa-anatomy-neuro-msk-s04` is titled "the ankle that will not bear weight" but the case is a febrile hip** (septic arthritis). Content is medically correct; the title is a naming mismatch, which the brief puts out of scope, so it was left alone. Worth a one-word title fix if titles are ever touched.
- **pa-derm-l10 trap on epinephrine-containing local anesthetic** is vaguely worded ("check protocol"), but it states the modern position (digital/nasal epinephrine is acceptable) rather than the old myth, so nothing false was left in place.

## Verdict

High quality. Across 38 lessons, 130 checks, 278 cards, 205 quiz questions and 8 scenarios, no wrong answer keys, no internal lesson/card contradictions, and no scope or mechanism errors were found; the only defects were three overstated or outdated numbers (mono aminopenicillin rash rate, terbinafine tinea capitis duration, Circle of Willis completeness), all corrected in place.
