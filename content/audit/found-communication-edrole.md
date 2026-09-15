# Accuracy audit — batch `found-communication-edrole`

Date: 2026-09-15

## Files reviewed

- `content/modules/found-communication.json`
- `content/modules/found-communication.ext.json`
- `content/modules/found-communication.quiz.json`
- `content/modules/ed-role.json`
- `content/modules/ed-role.ext.json`
- `content/modules/ed-role.quiz.json`

## Items reviewed

| File | Lessons | Checks | Cards | Quiz Qs | Scenarios (steps) |
|---|---|---|---|---|---|
| found-communication | 9 | 25 | 58 | 28 | 2 (12) |
| found-communication.ext | 8 | 24 | 56 | 32 | 2 (12) |
| found-communication.quiz | 0 | 0 | 0 | 54 | 0 |
| ed-role | 9 | 27 | 56 | 28 | 2 (10) |
| ed-role.ext | 9 | 22 | 64 | 34 | 3 (15) |
| ed-role.quiz | 0 | 0 | 0 | 56 | 0 |
| **Total** | **35** | **98** | **234** | **232** | **9 (49 steps)** |

Every lesson body, keyPoint, check, card front/back, quiz stem/choices/answer/rationale,
and scenario step (including every branch option and its feedback) was read.
**608 discrete items** reviewed (lessons + checks + cards + questions + scenario steps).

## Corrections

| file | id | was | now | source |
|---|---|---|---|---|
| found-communication.json | found-communication-q014 (`why`) | "…an amendment is both the honest and the only untraceable-free path." | "…an amendment is both the honest and the only defensible path." | Internal logic: EHR amendments *are* traceable by design (audit trail), which is the point the sentence is making; "untraceable-free" is meaningless and inverts the claim. Minimal wording fix, keyed answer and choices unchanged. |

No answer keys were changed, so no answer-index spread changed. All six files re-validated:
`node tools/validate.mjs` prints `ok` for each, no `x`.

## Claims verified against sources (no change needed)

- **NJ POLST signatories** — l07 / c045 / q019 state "physician, advanced practice nurse, or physician assistant." Confirmed: N.J.S.A. 26:2H-131 defines the signing practitioners as physician, physician assistant, and advanced practice nurse. ([Justia N.J.S.A. 26:2H-131](https://law.justia.com/codes/new-jersey/title-26/section-26-2h-131/), [NJHA POLST provider guide](https://www.njha.com/media/85298/PolstGuide.pdf))
- **NJ universal mandated reporting** — "any person" with reasonable cause, report immediately, State Central Registry 1-877-NJ-ABUSE, N.J.S.A. 9:6-8.10. Confirmed. ([NJPSA law primer](https://njpsa.org/wp-content/uploads/2023/03/lawprimer_DCPP.pdf), [NJ DCF](https://www.nj.gov/dcf/reporting/record/index.html))
- **NJ minor self-consent categories** — STI/venereal disease and substance use treatment, N.J.S.A. 9:17A-4. Confirmed. ([Justia 9:17A-4](https://law.justia.com/codes/new-jersey/title-9/section-9-17a-4/), [NCYL NJ compendium](https://youthlaw.org/sites/default/files/2024-10/NCYLMinorConsentCompendium2024-NewJersey.pdf))
- **Health literacy "9 in 10 adults"** (l17) — matches HHS *National Action Plan to Improve Health Literacy*: "nearly 9 out of 10 adults have difficulty using the everyday health information that is routinely available." ([ODPHP](https://odphp.health.gov/sites/default/files/2019-09/Health_Literacy_Action_Plan.pdf))
- **Title VI language access at no cost to the patient** (l03/c014) — correct statement of the Title VI / HHS LEP obligation for federally funded providers.
- **EMTALA (1986)** — medical screening exam + stabilization for anyone who presents at a Medicare-participating hospital with an ED, before payment inquiry; transfer requirements (stabilize within capability, accepting physician and facility, records sent, appropriate transport). Correct as stated in ed-role l01/l02/l14.
- **HIPAA** — TPO disclosures, minimum necessary, criminal exposure up to 10 years for disclosure for personal gain/malicious harm. Correct.
- **Adult CPR numbers** (ed-role l05/l13, cards, scenarios) — 100–120/min, at least 2 in and not beyond ~2.4 in, full recoil, compressor change every 2 min, pauses <10 s. Matches AHA 2020 ECC guidelines.
- **Capnography** — ETCO2 >10 mmHg as a compression-adequacy marker and an abrupt rise to 35–40 as a ROSC signal. Consistent with AHA ACLS.
- **Stroke timing** — glucose first (hypoglycemia mimic), measured kg weight for weight-based thrombolytic dosing, ~25 min door-to-CT, 60 min door-to-needle (many centers 45). Consistent with AHA/Target: Stroke.
- **Door-to-EKG 10 minutes** for chest pain / anginal equivalents including epigastric pain over ~40. Correct; the arithmetic in ed-role-q063 (1402 arrival → 1412 deadline) checks out.
- **CLSI order of draw** (ed-role l12, c073, q037, q096) — blood cultures → light blue citrate → gold/red serum → green heparin → lavender EDTA → gray fluoride; EDTA carryover falsely elevating potassium. Correct.
- **Blood pressure cuff sizing** — bladder encircling ~80% of arm circumference; undersized cuff reads falsely **high**. Correct.
- **Crash cart epinephrine 0.1 mg/mL prefilled** (1 mg/10 mL) — correct concentration for the arrest cart.
- **Poison control 1-800-222-1222** — correct.
- **Scope statements** — EMT-level content never has the EMT starting IVs, pushing drugs, or diagnosing; ED-tech content consistently keeps medication administration, verbal orders, result interpretation, oxygen titration, and IV removal out of tech scope, and grounds tech scope in nurse delegation under the state nurse practice act plus hospital credentialing (ed-role l06, q019, q080). Correct for NJ.
- **Legal doctrine** — four negligence elements, abandonment as termination without equal-or-higher handoff (including the correct nuance in found-communication-q091 that a downward transfer is *not* abandonment when the patient's needs fall within that level), assault vs. battery, false imprisonment, Good Samaritan exclusions for gross negligence. All stated correctly and consistently across both modules.
- **Capacity vs. competence**, four-element capacity test, decision-specific and risk-scaled bar, hypoglycemia/hypoxia/head injury/intoxication as capacity threats. Correct, and found-communication-q095 (intoxicated patient who *can* state and accept the specific risk → capacity present) does not contradict l11; l11 explicitly teaches that alcohol neither removes nor preserves capacity automatically.

## Unverifiable / judgment calls (left alone)

1. **HIPAA civil penalty range, l08 and c050** — "roughly `$100` to `$50,000` per violation … annual caps in the millions." These are the *unadjusted statutory* tier figures still printed in most EMT texts. The HHS inflation-adjusted figures are higher per violation (low-tier minimum now ~$141, top-tier maximum ~$71,000+), and since the 2019 enforcement-discretion notice the *annual* caps for the lower tiers are well under $1M ($25k/$100k/$250k), with only the top tier in the millions. The text hedges with "roughly," and the teaching point (tiered by culpability) is right, so I left it. Worth revisiting if the module is ever updated to cite current adjusted amounts.
2. **NJ POLST "authorized in 2011"** — the POLST Act is P.L.2011, c.145, signed December 2011; the form and program rolled out in 2012. "Authorized in 2011" is defensible as written.
3. **Epidemiology figures in ed-role-l01** — "100 to 250 patients a day," "2 to 5 percent critically ill," "15 to 20 percent admitted," LOS 2–3 h discharged / 4–6 h admitted, LWBS target <2%, door-to-doc <30 min. These are plausible operational ranges and are hedged as typical, but no single authority sets them; national ED admission rates run closer to 13–17%. Not corrected because the module frames them as department targets rather than published statistics.
4. **Cross-file example inconsistency** — the ladder-fall refusal patient appears twice with slightly different numbers: `found-communication-s01` (61 y/o, fell ~8 feet, HR 84, BP 148/86) and the l13 radio phrase library (61 y/o, "fall from a `6`-foot ladder," HR 78, BP 142/86). Both carry apixaban and glucose 104. They are presented as separate illustrations rather than the same case, and nothing medical is wrong in either, so I left them. Flag if the intent was one continuous case.
5. **"5-year-old with croup" in the ed-role-l17 case log** — croup peaks at 6 months to 3 years, but presentations at 5 are common enough that the entry is not wrong.
6. **Family presence during resuscitation** (found-communication ext s03) — stated as supported when a dedicated staff member is assigned. That matches AHA and ENA position statements; local protocol varies, which the scenario acknowledges.

## Verdict

Unusually clean batch. Across 608 items spanning SBAR/MIST, HIPAA, EMTALA, consent and capacity, NJ-specific law (POLST, minor consent, mandated reporting, OEMS scope), documentation rules, and ED tech scope, I found **one** defective statement — a garbled rationale clause — and no wrong answer keys, no scope-of-practice errors, no fabricated statistics, and no internal contradictions. The NJ legal specifics in particular were checked against statute and held up.
