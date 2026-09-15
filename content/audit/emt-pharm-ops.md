# Accuracy audit — emt-pharm-ops

## Batch

| File | Lessons | Cards | Quiz Q | Scenarios | Checks | Items |
|---|---|---|---|---|---|---|
| `content/modules/emt-pharm.json` | 9 | 60 | 32 | 2 | 27 | 130 |
| `content/modules/emt-pharm.ext.json` | 9 | 64 | 34 | 3 | 25 | 135 |
| `content/modules/emt-pharm.quiz.json` | — | — | 56 | — | 36 | 92 |
| `content/modules/emt-ops.json` | 9 | 63 | 28 | 2 | 25 | 127 |
| `content/modules/emt-ops.ext.json` | 8 | 56 | 32 | 2 | 24 | 122 |
| `content/modules/emt-ops.quiz.json` | — | — | 55 | — | 34 | 89 |
| **Total** | **35** | **243** | **237** | **9** | **171** | **695** |

Every lesson body, keyPoint, check, card, quiz question with its choices/key/rationale, and every scenario step and feedback line was read.

## Corrections

| file | id | was | now | source |
|---|---|---|---|---|
| emt-pharm.json | `emt-pharm-l01` (body) | Routes listed "fastest to slowest" as IV/IO → inhaled → IN (`2 to 5 min`) → IM (`5 to 10 min`) → SL (`1 to 3 min`) → buccal → PO → SC. The stated order contradicts the file's own onset numbers: SL was ranked slower than IM despite being listed as three times faster. | Reordered to IV/IO → inhaled → SL (`1 to 3 min`) → buccal → IN (`2 to 5 min`) → IM (`5 to 10 min`) → PO → SC. Onset numbers unchanged. | Internal contradiction; onset values consistent with FDA Nitrostat label (SL onset 1–3 min) and AAOS *Emergency Care and Transportation* 12e route-onset table |
| emt-pharm.json | `emt-pharm-l01` keyPoint 2 | "IV fastest, then inhaled, IN, IM, SL, then oral at 30 to 60 minutes." | "IV fastest, then inhaled, SL at 1 to 3 minutes, IN at 2 to 5, IM at 5 to 10, then oral at 30 to 60 minutes." | same as above (keyPoint had to track the corrected lesson) |
| emt-pharm.json | `emt-pharm-c002` | "…then intranasal at 2 to 5 minutes, intramuscular at 5 to 10, sublingual at 1 to 3, then oral…" — card taught the same wrong ranking | "…then sublingual at 1 to 3 minutes, intranasal at 2 to 5, intramuscular at 5 to 10, then oral…" | same as above |
| emt-pharm.json | `emt-pharm-l09` (body, "Reading a syringe") | "On a `1 mL` syringe each long mark is usually `0.1 mL` and each short mark `0.02 mL`." | "…each short mark `0.01 mL`." | Standard 1 mL / tuberculin syringes are graduated in 0.01 mL increments with numbered marks every 0.1 mL (BD tuberculin syringe product specifications; McKesson / Vitality Medical catalog specs) |
| emt-pharm.json | `emt-pharm-c064` | "Long marks are 0.1 mL and short marks 0.02 mL." | "Long marks are 0.1 mL and short marks 0.01 mL." | same as above |
| emt-pharm.json | `emt-pharm-s02` step `s1`, feedback on "Assist with albuterol first" | "It does nothing for the swelling closing his throat or for a systolic of 48 diastolic." — misstates the vitals; the step's BP is `82/48`, so 48 is the diastolic, not a systolic | "…or for a blood pressure of 82/48." | Internal contradiction with the step's own `vitals` block |
| emt-ops.json | `emt-ops-s02` step `z2` (prompt) | Placard on the chlorine tanker described as "a four-digit number `1017` above a green-and-white symbol" | "…above a white placard symbol you cannot make out clearly" | Chlorine (UN 1017) is Division 2.3, placarded POISON GAS / TOXIC GAS / CHLORINE — white background with a black skull-and-crossbones (49 CFR 172.504 Table 1 and 172.532; PHMSA/DOT placard references). Green is the Division 2.2 non-flammable-gas placard, which would have misidentified the hazard class the scenario then teaches |

## Verified and left alone (spot list of the numbers I checked rather than assumed)

Drugs and doses: aspirin `324 mg` chewed non-enteric (four `81 mg`); nitroglycerin `0.4 mg` SL q5min ×3, systolic >`100` per protocol, PDE-5 windows 24 h sildenafil/vardenafil and 48 h tadalafil; epinephrine `0.3 mg` ≥30 kg / `0.15 mg` 15–30 kg / `0.1 mg` device 7.5–15 kg / `0.01 mg/kg` drawn up, `1 mg/mL` vs `0.1 mg/mL` concentrations; naloxone IN `4 mg` device, `2 mg` atomizer split, IM `0.4–2 mg`, duration 30–90 min; albuterol `2.5 mg` in `3 mL` at 6–8 L/min, MDI `90 mcg`/puff; oral glucose `15 g` buccal; activated charcoal `1 g/kg`, 25–50 g adult / 12.5–25 g child, caustic/hydrocarbon/alcohol/metal exclusions; glucagon `1 mg` IM ≥25 kg, `0.5 mg` below, `3 mg` IN, onset 8–15 min; D50 `50 mL` = 25 g, D10 `250 mL` = 25 g, pediatric `5 mL/kg` D10; glucagon `1–5 mg` IV for refractory beta-blocked anaphylaxis. Oxygen: SpO2 targets 94–98% / 88–92% COPD / 15 L/min NRB in CO; NC 24–44%, NRB 80–90%+; cylinder constants D `0.16`, E `0.28`, M `1.56` with a `200 psi` residual (all four worked examples recompute correctly).

Ops: START thresholds (>30/min, absent radial pulse or cap refill >2 s, cannot follow commands; apnea after positioning = black); JumpSTART (<15 or >45, peripheral pulse, 5 rescue breaths, AVPU mapping); SALT sort order, 2 rescue breaths for a child, the five categories; ICS command/general staff and span of control 3–7 (target 5); NFPA 704 by position and the 0–4 scale; ERG page colors and the ~330 ft / 100 m default isolation; clothing removal = 80–90% of contaminant; needlestick risks HBV ≤30% unvaccinated / HCV ~1.8% / HIV ~0.3% and the 72 h / 24 h prophylaxis windows; PPE don/doff order; lights-and-siren time saving 1.7–3.6 min; ~4,500–6,500 ambulance crashes and ~30 fatal per year; 17–19 h awake ≈ 0.05% BAC and ~24 h ≈ 0.10%; caffeine half-life ~5 h; the 2015 EMS survey figures (37% / 6.6%); NNT and absolute-vs-relative risk arithmetic (all worked examples correct). New Jersey specifics — OEMS within DOH, N.J.A.C. 8:40 / 8:41, hospital-based non-transporting MICU fly cars, no routine AEMT tier, naloxone broadly authorized, EMT epinephrine-by-syringe program, universal mandated child-abuse reporting to 1-877-NJ-ABUSE — all check out. No scope-of-practice violations were found anywhere in the batch: every ALS-only act (IV, dextrose, intubation, 12-lead interpretation) is correctly attributed, and every state-variable item is labeled "per protocol."

## Unverifiable / judgment calls (left as written)

- **Epinephrine auto-injector: "hold `10 seconds` with older devices, or `3 seconds` with most current designs… massage the site for `10 seconds`."** The US EpiPen Instructions for Use still carries both the 3-second hold and the 10-second massage, and AAOS 12e teaches the massage. Australia's TGA removed the massage step from its labeling on the grounds that it causes tissue irritation and adds nothing. The content already says "Follow the device's own instructions," which is the defensible position for a US/NREMT student, so I left it. Flagging it because the massage step may disappear from US labeling too.
- **Biphasic anaphylaxis "returns `4 to 12 hours` later."** This is the standard EMT-textbook figure, but the published range is wider (most within 8 h, reported out to 72 h). Defensible at this level; not narrowed.
- **"Hypoxic drive" framing for the 88–92% COPD target.** The lesson states it and then immediately says V/Q mismatch is "the more important reason," which is the current physiological understanding. Left as written since the correction is already in the text.
- **START capillary refill >2 s.** Retained in the original START algorithm but de-emphasized in favor of the radial pulse in later versions and unreliable in cold or dark conditions. The content gives both criteria, which matches how NREMT tests it.
- **Landing zone slope "under about `8 degrees`."** Air-medical guidance varies between 5 and 10 degrees by program and airframe. 8 is a commonly published figure; not changed.
- **"Portable oxygen cylinder replaced at or below `500 psi`"** is an agency convention rather than a standard, but it is the near-universal EMS teaching and the file distinguishes it correctly from the 200 psi safe residual.
- **Ambulance crash counts (4,500–6,500/yr, ~30 fatal)** are derived from older NHTSA/FARS analyses; no current authoritative single figure exists. The content hedges with "estimates," which is appropriate.

## Verdict

Unusually strong batch — 695 items yielded 7 corrections, and none of them was a dose, route, threshold or scope error. The two substantive fixes were an internally self-contradicting route-onset ranking and a syringe graduation off by a factor of two; the rest were a placard color, a garbled vital sign, and the cards/keyPoints that propagated the route error. Pharmacology numbers, NJ scope statements, and the triage algorithms are accurate throughout.
