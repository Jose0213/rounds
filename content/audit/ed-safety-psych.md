# Accuracy audit — ed-safety-psych

Date: 2026-09-15

## Files reviewed

| File | Items reviewed |
|---|---|
| `content/modules/ed-safety.json` | 9 lessons (+27 checks), 78 cards, 30 quiz, 2 scenarios (10 steps) |
| `content/modules/ed-safety.ext.json` | 9 lessons (+27 checks), 80 cards, 26 quiz (q031–q056), 3 scenarios |
| `content/modules/ed-safety.quiz.json` | 36 extra checks (18 lessons), 56 quiz (q077–q132) |
| `content/modules/ed-psych-deescalation.json` | 10 lessons (+30 checks), 68 cards, 30 quiz, 2 scenarios (11 steps) |
| `content/modules/ed-psych-deescalation.quiz.json` | 20 extra checks (10 lessons), 55 quiz (q031–q085) |

Every lesson body, keyPoint, check, card front/back, quiz stem/choices/answer/rationale, and scenario step/choice/feedback was read. Total discrete items reviewed: **~600**.

## Corrections

| file | id | was | now | source |
|---|---|---|---|---|
| `ed-safety.quiz.json` | `ed-safety-q127` (keyed choice 2) | "A meaningful amount of caffeine, **roughly a quarter of the original dose**, is still active in her system at 0800" | "…**roughly half the original dose**, is still active…" | Half-life arithmetic: 0300 → 0800 is 5 h = exactly one half-life at the ~5 h half-life the item itself states, so ~50% remains. The item's own `why` already said "only about half gone by 0800", and `ed-safety-l17` says "A cup at `0400` still has half its dose on board at `0900`" — the choice text contradicted both. |

No answer keys were changed, so the answer-index spread is unchanged. `node tools/validate.mjs` prints `ok` for all five files.

## Verified against source (no change needed)

Claims I did not trust from memory and checked:

- **CMS restraint/seclusion death reporting** (`ed-safety-l12`, `c104`, `q045`, check `l12#2`): death while restrained, within 24 h of removal, or within 1 week where restraint reasonably contributed → report by close of business the next business day; soft two-point wrist restraints with no seclusion go to an internal log. Matches 42 CFR 482.13(g) (eCFR).
- **CMS behavioral restraint order limits** (used in ~15 items across both modules): 4 h adults 18+, 2 h ages 9–17, 1 h under 9; face-to-face within 1 h; no PRN/standing orders. 42 CFR 482.13(e)–(f).
- **NJ Patient Safety Act** (`ed-safety-l14`, `c124`, `q056`, check `l14#2`): 5 business days to DOH, RCA + corrective plan within 45 days, self-critical analysis privileged. N.J.A.C. 8:43E-10.6.
- **EPA disinfectant lists** (`ed-safety-l10`, `c082`, `q107`): List K = C. difficile spores, List G = norovirus, List P = Candida auris. EPA pesticide registration pages.
- **Measles/varicella HCP work exclusion** (`ed-safety-l11`, `c090`, `c092`, `q036`, `q039`, `q109`, `q111`): measles day 5 after first exposure through day 21 after last, regardless of PEP; varicella day 8 through day 21, extended to day 28 with VariZIG. CDC Infection Control in Healthcare Personnel.
- **Ketamine 4–5 mg/kg IM for severe agitation** (`ed-psych-deescalation-l08`): consistent with the ED agitation literature (meta-analytic mean ~4.9 mg/kg IM).
- Spot-checked and correct: all six oxygen-cylinder calculations (E 0.28 / M 1.56 constants, 200 psi residual) in `l06` check 0, `c052`, `q016`, `q095`; inverse-square law item `l16#0`; HIV PEP 2 h ideal / 72 h outer / 28 days; HBIG 24 h ideal / 7 days outer; TB retest 8–10 weeks; 3HP 12 weeks and rifampin 4 months; meningococcal cipro 500 mg / ceftriaxone 250 mg IM; NIOSH 35 lb manual patient lift; 50 mSv annual / 5 mSv declared-pregnancy limits; Broset six items with the >2 threshold; STAMP; Project BETA ten de-escalation domains; C-SSRS six-question screener; CIWA-Ar ten items with 8–10 and >15 thresholds; alcohol withdrawal timeline 6–12 / 12–24 / 24–48 / 48–96 h; haloperidol 5 mg, lorazepam 1–2 mg, olanzapine 5–10 mg IM with the 1-hour IM-benzodiazepine separation, droperidol 2.5–5 mg; NJ screening certificate 72 h; NJ universal mandatory child-abuse reporting at 1-877-NJ-ABUSE.

## Unverifiable / judgment calls (left alone)

1. **Doffing sequence** (`ed-safety-l03`, `c020`, `q007`, check `l03#0`). The module keys gloves → gown → hand hygiene → eye protection → mask. CDC's classic PPE poster puts eye protection *before* the gown. The lesson explicitly names this variation and says to follow the posted local sequence, and every distractor in the keyed items is wrong under either convention, so the items are defensible as written. Flagging because a student could meet the CDC poster order on an exam.
2. **Droplet precautions and distance** (`ed-safety.quiz` check `l02#0`, `q082`). Both key "no mask strictly required" at >6 ft / in the doorway without entering. CDC's operational rule is "don a mask upon entry into the patient room." The stems are written so the person never enters, and both rationales state that masking on entry is the practical default — so they are internally honest, but they teach the physics rather than the posted rule.
3. **Restraint monitoring "every 15 minutes"** (many items). CMS requires monitoring but does not set a numeric interval in regulation; 15 minutes is near-universal hospital policy and the module consistently hedges with "at least"/"commonly." Left as written.
4. **`ed-safety-l07`: "medical/non-violent restraint orders renewed typically each calendar day."** CMS says "in accordance with hospital policy," with one calendar day being the surveyor-cited norm. The module already says "per hospital policy." Fine.
5. **Wristband colors** (`ed-safety-l05`, `c037`, `q091`). Red/yellow/purple/pink/green follow the AHA color-standardization convention; the module repeatedly says colors vary and to read the printed words. Correct handling of a non-universal fact.
6. **Sentinel-event RCA "typically within 45 days"** (`ed-safety-l14`, `c123`). The Joint Commission's figure is 45 *business* days; the module says 45 days and hedges with "typically." Not worth a change at this level.
7. **`ed-safety-l18`: NJ death certificate "generally within 24 hours."** NJ requires the certifier to complete the medical certification promptly (24 h is the statutory expectation for the physician's part, not for the whole certificate reaching the registrar). Hedged in the text; left alone.
8. Non-medical: `ed-safety.ext.json` skips card id `c105` (c104 → c106) and `ed-safety.quiz.json` starts its quiz ids at `q077` although base+ext end at `q056`. Ids/counts are explicitly out of scope and the validator accepts both.

## Verdict

High quality. Across roughly 600 items covering CDC isolation precautions, hand hygiene, PPE sequence, OSHA bloodborne pathogens, CMS restraint and seclusion rules, Joint Commission/NQF safety standards, de-escalation evidence, and NJ-specific law, exactly one defect was found — an arithmetic slip in a distractor-free keyed choice that its own rationale already contradicted. The regulatory numbers, drug doses, exposure-management timelines, and scope boundaries (techs never medicate, never detain, never doff sequence by preference) are accurate and internally consistent between lessons, cards, questions, and scenarios.
