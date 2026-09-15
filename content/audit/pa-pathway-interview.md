# Accuracy audit — batch `pa-pathway-interview`

Date: 2026-09-15

## Files

| File | Lessons | Key points | Checks | Cards | Quiz | Scenarios (steps) |
|---|---|---|---|---|---|---|
| `content/modules/pa-pathway.json` | 9 | 45 | 27 | 50 | 24 | 1 (6) |
| `content/modules/pa-pathway.ext.json` | 6 | 30 | 18 | 55 | 32 | 2 (8) |
| `content/modules/pa-pathway.quiz.json` | — | — | 30 | — | 56 | — |
| `content/modules/pa-interview-essays.json` | 10 | 50 | 30 | 70 | 32 | 2 (11) |
| `content/modules/pa-interview-essays.quiz.json` | — | — | 20 | — | 53 | — |
| **Total** | **25** | **125** | **125** | **175** | **197** | **5 (25)** |

**672 discrete items reviewed** (every lesson body, key point, check, card front/back, quiz stem/choices/answer/rationale, and scenario step with all branch feedback).

This batch is about the PA application process rather than clinical facts, so the authorities used were: CASPA (Liaison) applicant help centre for the current cycle, ARC-PA *Accreditation Standards for PA Education* **6th edition** (effective 2025-09-01) and the ARC-PA program directory, NCCPA, Exam Master (PA-CAT), ETS (GRE), Acuity Insights (Casper), BLS Occupational Outlook Handbook, PAEA Program Report 36 / Student Report 6, HRSA/NHSC, Federal Student Aid and the 2025 reconciliation law, plus the live admissions pages of the NJ/Philadelphia-region PA programs.

---

## Corrections

### A. Federal labour-market numbers (BLS OOH, Physician Assistants, fetched 2026-09-15)

| file | id | was | now | source |
|---|---|---|---|---|
| pa-pathway.json | l01 body table | Median PA salary "roughly `$130,000` per year" | "roughly `$136,000` per year" | BLS OOH: median **$135,880**, May 2025 data — https://www.bls.gov/ooh/healthcare/physician-assistants.htm |
| pa-pathway.json | l01 body table | Projected job growth "roughly `25%` to `28%`, far above average" | "roughly `21%`, much faster than average" | BLS OOH: **21%, 2025–35**. The 27–28% figure is from retired 2021–31/2022–32 editions |
| pa-pathway.json | l01 KP3 | "median pay near $130,000, projected growth around 25 to 28 percent" | "median pay near $136,000, projected growth around 21 percent this decade" | same |
| pa-pathway.json | c004 | "$130,000 … 25 to 28 percent … far above the average occupation" | "$136,000 … around 21 percent over the next decade, much faster than average" | same |
| pa-pathway.quiz.json | extra check `pa-pathway-l01#0` (why) | "The lesson gives roughly 25 to 28 percent…" | "…roughly 21 percent…, and federal projections have in fact been revised downward from the higher numbers still circulating" | same |

### B. Number of accredited programs

| file | id | was | now | source |
|---|---|---|---|---|
| pa-pathway.json | l01 body table | "Programs accredited nationally \| roughly `300`" | "roughly `335`" | ARC-PA: "The 335 ARC-PA accredited PA programs are listed below" — https://www.arc-pa.org/entry-level-program/currently-accredited-programs/ and https://www.arc-pa.org/entry-level-program/entry-level-program-data/ |
| pa-pathway.json | l01 KP3 | "roughly 300 accredited programs" | "roughly 335 accredited programs" | same |
| pa-pathway.json | l02 body | "There are roughly `300` accredited programs nationally" | "roughly `335`" | same |

### C. CASPA verification timing (the module asserted a figure CASPA does not publish)

CASPA's own stated turnaround is **up to 10 business days** once an application reaches Complete status, with transcripts taking up to five business days to post *before* that clock starts. "Two to six weeks" is advising folklore, not a CASPA figure.

| file | id | was | now | source |
|---|---|---|---|---|
| pa-pathway.json | l02 body | "**This takes weeks**, commonly two to six, and longer at peak." | "CASPA states this takes **up to 10 business days** once your file is complete, but every transcript has to arrive and post first, and the summer peak stretches it, so plan on several weeks." | https://help.liaisonedu.com/CASPA_Applicant_Help_Center/Submitting_and_Monitoring_Your_CASPA_Application/Verification_and_GPA_Calculations_for_CASPA/1_What_is_Verification%3F |
| pa-pathway.json | c010 | "That takes weeks, commonly two to six and longer at peak." | "CASPA states that takes up to 10 business days once the file is complete, but transcripts must arrive and post first and the summer peak stretches it." | same |
| pa-pathway.ext.json | l14 body | "Typical turnaround is **two to six weeks**" | "CASPA states verification takes **up to 10 business days** once the file is complete, but each transcript takes up to five business days to post before that clock starts…" | same |
| pa-pathway.ext.json | l14 KP2 | "then takes roughly two to six weeks" | "CASPA states it then takes up to 10 business days, longer at the summer peak" | same |
| pa-pathway.ext.json | s03 step 3 feedback | "Verification takes two to six weeks" | "…CASPA states it then takes up to 10 business days, longer at the summer peak." | same |
| pa-pathway.ext.json | s03 closing summary | "Verification then takes two to six weeks" | "…CASPA states it then takes up to 10 business days, longer at the summer peak." | same |
| pa-pathway.quiz.json | q103 (choice 2 + why) | "beyond the normal two-to-six-week range" / "beyond the standard two-to-six-week window" | "well beyond the 10 business days CASPA states" / "beyond the 10 business days CASPA states for a completed file" | same |

### D. Projected / anticipated PCE hours — **the largest error in the batch**

The modules repeatedly taught that CASPA lets you enter anticipated future hours with a stated completion date. CASPA's instruction is the opposite: *"Enter only current and in-progress experiences (not planned experiences)"*, and hours are entered as an **average weekly figure actually completed** over the date range, with the verified application reflecting hours completed as of submission. There is no projected-hours field. A student who followed the old text would have entered hours he had not worked.

Source for all rows: https://help.liaisonedu.com/CASPA_Applicant_Help_Center/Filling_Out_Your_CASPA_Application/CASPA_Supporting_Information/2_Experiences

| file | id | was | now |
|---|---|---|---|
| pa-pathway.json | l04 body bullet | "**Hours in progress may be projected** to a stated future date, and you must say so. Programs expect this…" | "**CASPA takes only current and in-progress experiences, not planned ones.** You enter an average weekly hour figure over the date range, and the verified application reflects the hours completed as of submission. If a program wants anticipated hours, it asks for them separately." |
| pa-pathway.json | l04 KP4 | "projected future hours are allowed if declared" | "CASPA counts hours completed at submission and does not take planned future experiences" |
| pa-pathway.json | l04 check 3 (correct choice + why) | "Enter hours completed to date and separately project remaining hours to a stated future date, identified as projected" | "Enter the job as a current, in-progress experience with the hours actually worked so far, since CASPA counts completed hours as of submission" (answer index unchanged) |
| pa-pathway.json | c025 | "Hours in progress may be projected to a stated future date if identified as projected." | "Experience type, organization, supervisor name and contact, job title, dates, average weekly hours actually worked, whether it was paid, and a duty description. Only current and in-progress experiences are entered." |
| pa-pathway.json | l08 body + check 3 why | "roughly `3,400` completed hours plus projected hours through matriculation" | "roughly `3,400` completed hours, and keeps accumulating more between submission and matriculation" |
| pa-pathway.ext.json | l13 body ("Projected hours" section) | "Hours not yet worked may be entered as **anticipated**, with a stated completion date, and programs expect this…" | Section retitled "Hours you have not worked yet" and rewritten to CASPA's actual rule |
| pa-pathway.ext.json | l13 body (fields list) | "**total hours completed to date**, **anticipated additional hours with a completion date**" | "**average weekly hours actually completed** over that date range" |
| pa-pathway.ext.json | l13 KP3 | "Anticipated hours are allowed with a stated completion date" | "CASPA takes only current and in-progress experiences, never planned ones, and counts the hours completed as of submission" |
| pa-pathway.ext.json | c080 | "hours completed, anticipated hours with a completion date" | "average weekly hours actually completed" |
| pa-pathway.ext.json | c085 | Front "What are the two rules for projecting anticipated hours?" / back describing projection rules | Front "How does CASPA handle hours you have not worked yet?" / back "It does not take them…" |
| pa-pathway.ext.json | q044 | Correct choice "Entered as anticipated hours with a stated completion date"; why asserted projections are "explicitly supported" | Correct choice rewritten to the in-progress entry; why rewritten (answer index unchanged) |
| pa-pathway.quiz.json | extra check `pa-pathway-l13#1` | Correct choice "Entered as anticipated hours with a stated completion date…" | "Entered in CASPA as a current, in-progress experience showing only the hours actually worked so far" (index unchanged) |
| pa-pathway.quiz.json | q064 | Whole item premised on projecting hours to a future date | Stem and all four choices rewritten to test CASPA's actual instruction (answer index unchanged) |

### E. CASPA experience categories — eight named, nine exist, and **Shadowing was missing**

| file | id | was | now | source |
|---|---|---|---|---|
| pa-pathway.ext.json | l13 body | "The experience types are patient care, healthcare, volunteer, employment, research, teaching, leadership, and extracurricular activities." | "The nine experience types are patient care, healthcare, **shadowing**, volunteer, **non-healthcare employment**, research, teaching, leadership, and extracurricular activities." | CASPA Experiences page (nine categories listed) |
| pa-pathway.ext.json | c081 | "Name the eight CASPA experience categories" / eight listed | "Name the nine…" / nine listed, shadowing added, "employment" corrected to "non-healthcare employment" | same |

### F. PCE vs HCE role classification — medical assistant was on the wrong side

CASPA's own HCE example list names *medical assistant* and *scribe* explicitly, and names *CNA* in **both** lists ("depending on job description"). Its PCE list names nurse, paramedic, EMT, CNA, phlebotomist, physical therapist, dental hygienist. "Taking vitals" is listed under HCE.

| file | id | was | now | source |
|---|---|---|---|---|
| pa-pathway.json | l04 table row | "Medical assistant with hands-on duties" (PCE) / "Pharmacy technician in most roles" (HCE) | "Physical therapist, dental hygienist" (PCE) / "Medical assistant, pharmacy technician" (HCE) | CASPA Experiences page |
| pa-pathway.json | l04 body | "Ambiguous roles exist, and CASPA lets you categorize each entry yourself." | Added: CASPA's own lists put CNA in both categories depending on job description, and put taking vital signs on the healthcare side | same |
| pa-pathway.json | l04 KP1 | "EMT, ED tech, CNA, medical assistant, and phlebotomy … are PCE" | "EMT, ED tech, CNA, and phlebotomy … are PCE; scribe, **medical assistant**, transport, unit clerk, and registration are HCE" | same |
| pa-pathway.json | c022 | "hands-on medical assistant" listed under PCE | moved to HCE; note added that CASPA lists CNA in both | same |
| pa-interview-essays.json | l04 table | PCE examples included "medical assistant" | medical assistant moved to the HCE row; "physical therapist" added to PCE | same |
| pa-interview-essays.json | c020 | "(EMT, ED tech, CNA, MA, phlebotomist)" as PCE | MA removed from PCE, added to HCE; CNA caveat added | same |

### G. PCE hour minimums — the stated floor was far too high

Verified minimums at the region's programs: Rutgers **none stated**, Seton Hall **100**, Jefferson (both campuses) **200**, Arcadia **200**, Monmouth **200**, Salus at Drexel **300**, Rowan-Virtua **350**, Drexel CNHP / Penn State / DeSales / Kean **500**. Nothing in the region requires 2,000.

| file | id | was | now | source |
|---|---|---|---|---|
| pa-pathway.json | l04 body | "Program minimums range from **500 to 2,000 hours**" | "range from **none at all to 2,000 hours**, and they sit far lower than applicants expect: regional programs commonly ask **100 to 500**" | program admissions pages (see list at end) |
| pa-pathway.json | l04 KP2 | "Program minimums run 500 to 2,000 hours" | "run from none at all to 2,000 hours, often only 200 to 500" | same |
| pa-pathway.json | c023 | "Program minimums run 500 to 2,000 hours" | "run from none at all to 2,000 hours, often only 200 to 500 at regional programs" | same |
| pa-interview-essays.json | l04 body | "many require `500 to 2,000` hours of direct patient care" | "regional programs commonly ask `100 to 500` hours, a minority require up to `2,000`" | same |
| pa-interview-essays.json | l04 KP3 | "commonly 500 to 2,000 PCE hours" | "from none at all to 2,000 PCE hours and commonly only 100 to 500" | same |
| pa-interview-essays.json | c025 | "many require 500 to 2,000 direct patient care hours" | "regional programs commonly ask 100 to 500 …, a minority require up to 2,000" | same |

### H. Prerequisite expiration window — stated as 5–7 years, actually 5–10

Verified windows: Penn State **7 years** (A&P + micro); Seton Hall, Salus at Drexel, Rowan-Virtua, Monmouth, Kean, Drexel CNHP all **10 years**. Ten years is the most common regional window, so "5 to 7" would make a student retake courses unnecessarily.

| file | id | was | now |
|---|---|---|---|
| pa-pathway.json | l03 body, l03 KP1, l03 check 3, c015, l07 body, l07 check 3 | "5 to 7 years" (6 places, incl. `` `5` to `7` `` in l07) | "5 to 10 years", with "10 years the most common regional window" noted in the l03 body |
| pa-pathway.ext.json | l12 body, l12 KP4, l12 check 1, c076, q037 | "5 to 7 years" (5 places) | "5 to 10 years" |

Source: program admissions pages (Penn State, Seton Hall, Salus at Drexel, Rowan-Virtua, Monmouth, Kean, Drexel).

### I. NCCPA certification maintenance — the self-assessment/PI requirement no longer exists

NCCPA: 100 CME credits per two-year cycle with **a minimum of 50 Category 1**. Self-assessment CME and PI-CME are explicitly *"no longer required"* — they now carry bonus weighting only.

| file | id | was | now | source |
|---|---|---|---|---|
| pa-pathway.json | l09 body | "`100` hours of CME every `2` year cycle, with a portion **required** to be self-assessment or performance improvement" | "`100` credits … every `2` year cycle, at least `50` of them Category 1" | https://www.nccpa.net/maintain-certification/continuing-medical-education/ |
| pa-pathway.json | l09 KP2 | "100 hours of CME every 2 years plus the PANRE every 10 years" | "100 CME credits every 2 years, at least 50 of them Category 1, plus recertification by the end of year 10 through the PANRE or the longitudinal PANRE-LA" | same |
| pa-pathway.json | q024 (why) | "part of which must be self-assessment or performance improvement" | "at least 50 of them Category 1" | same |
| pa-pathway.quiz.json | extra check `pa-pathway-l09#0` (choice 0 + why) | "Roughly 100 hours of CME every 2-year cycle, plus the PANRE every 10 years" | "Roughly 100 CME credits every 2-year cycle, at least 50 of them Category 1, plus recertification by the end of year 10" | same |

### J. Grad PLUS was eliminated for new borrowers on 2026-07-01

The modules taught Grad PLUS as the normal route for the gap between the Direct Unsubsidized limit and cost of attendance. The 2025 reconciliation law (H.R.1, signed 2025-07-04) eliminated Grad PLUS for new borrowers effective **July 1, 2026** and capped graduate borrowing at **$20,500/yr and $100,000 lifetime**; borrowers already holding a Direct Loan for the same program before that date keep limited legacy access. Whether a PA master's counts as a "professional degree" (higher $50,000/$200,000 caps) was still in litigation at the time of audit, so the text now says to check rather than asserting either way. This is the single most financially consequential correction in the batch.

| file | id | was | now | source |
|---|---|---|---|---|
| pa-pathway.json | l09 body | "Graduate federal borrowing runs through unsubsidized Direct Loans and then **Grad PLUS** for the remainder" | rewritten: Grad PLUS eliminated for new borrowers 2026-07-01, caps of ~$20,500/yr and ~$100,000 total, professional-degree status unsettled | FSA loan-limits FAQ; https://ticas.org/federal-student-loan-amounts-and-terms-for-loans/ |
| pa-pathway.ext.json | l11 body | "then **Grad PLUS** for the remainder up to the cost of attendance" | rewritten with the elimination date, the caps, the legacy exception, and the 4% origination fee retained for legacy borrowers | same |
| pa-pathway.ext.json | l11 KP1 | "Direct Unsubsidized to about $20,500 a year, then Grad PLUS…" | "…to about $20,500 a year and $100,000 lifetime, with Grad PLUS eliminated for new borrowers from July 1, 2026" | same |
| pa-pathway.ext.json | l11 check 1 (stem) | "Why does borrowing $50,000 in Grad PLUS deliver less than $50,000?" | "A borrower with legacy Grad PLUS access borrows $50,000. Why does less than $50,000 reach the account?" | same |
| pa-pathway.ext.json | c063 | "then Grad PLUS for the remainder up to cost of attendance" | "…eliminated for new borrowers from July 1, 2026, so anything above the cap now means private borrowing" | same |
| pa-pathway.ext.json | q031 (stem + why) | present tense "How is the rest typically borrowed federally?" | scoped to "a student starting before July 1, 2026" and the why notes the gap now falls to private lenders | same |
| pa-pathway.quiz.json | q092 (stem) | "An applicant … wants to know what a Grad PLUS origination fee actually costs" | "A borrower with legacy Grad PLUS eligibility takes out $40,000…" | same |

### K. NHSC loan repayment maximum

| file | id | was | now | source |
|---|---|---|---|---|
| pa-pathway.json | l09 body | "commonly up to roughly `$50,000` for a two-year full-time commitment" | "currently up to roughly `$75,000` for a two-year full-time primary care commitment at an approved high-need site and roughly `$50,000` otherwise" | HRSA/NHSC LRP: $75,000 full-time primary care, $50,000 other disciplines, two-year term |
| pa-pathway.json | c046 | "commonly up to about $50,000" | "currently up to about $75,000 … about $50,000 otherwise" | same |
| pa-pathway.ext.json | l11 body | "up to roughly `$50,000` for a two-year full-time commitment" | "up to roughly `$75,000` … roughly `$50,000` for other disciplines and lower-scoring sites, with half-time options at half the amount" | same |
| pa-pathway.ext.json | c067 | "Commonly up to roughly $50,000" | "Currently up to roughly $75,000 … $50,000 for other disciplines" | same |

### L. CASPA letters of recommendation — the minimum was wrong, and one answer key was wrong

CASPA: *"You are required to request at least 2 and may request a maximum of 5 evaluations."* The module taught a minimum of 3 and **keyed a quiz answer to 3**, which was simply wrong.

| file | id | was | now | source |
|---|---|---|---|---|
| pa-interview-essays.json | l06 body | "CASPA requires a minimum of `3` references and allows up to `5`." | "CASPA itself requires a minimum of `2` … Most programs require `3` …, so the program list sets the real number." | https://help.liaisonedu.com/CASPA_Applicant_Help_Center/Filling_Out_Your_CASPA_Application/CASPA_Supporting_Information/1_Evaluations |
| pa-interview-essays.json | l06 KP0 | "CASPA takes 3 to 5 references" | "CASPA takes 2 to 5 references and most programs require 3" | same |
| pa-interview-essays.json | c032 | Front "How many references does CASPA **require**…"; back "A minimum of 3, up to 5" | Front "How many references does CASPA **accept**…"; back "CASPA's own minimum is 2 and its maximum is 5, but most programs require 3" | same |
| pa-interview-essays.json | **q017** | Stem "How many references does CASPA require at minimum?"; **keyed answer `3` (index 0) — wrong** | Stem clarified to "the minimum CASPA itself requires, as distinct from what an individual program requires"; **answer changed to index 1 (`2`)**; rationale rewritten | same |

Answer-index spread after the change: pa-interview-essays.json quiz = 18.8 / 28.1 / 25.0 / 28.1 percent; validator passes.

### M. ARC-PA required public disclosures — "attrition" became "graduation rate" in the 6th edition

The 6th edition of the Standards took effect 2025-09-01. Required disclosure moved from A3.12 to **A3.11**, and item (i) changed from *attrition* to *"current annual student graduation rate information, on the table provided by the ARC-PA."* Item (f) is now *"estimates of the total cost of enrollment."*

| file | id | was | now | source |
|---|---|---|---|---|
| pa-pathway.json | l08 body | "**Attrition.** … Published in the program's required disclosures." | "**Attrition, or its mirror image the graduation rate.** Accredited programs are required to publish an annual student graduation rate on a table supplied by ARC-PA." | https://www.arc-pa.org/wp-content/uploads/2025/10/Standards-6e-10-03-25-Pub-10-09-25.pdf (A3.11) |
| pa-pathway.json | l08 KP3 | "PANCE first-time pass rate, attrition, accreditation status…" | "PANCE first-time pass rate, graduation or attrition rate, accreditation status…" | same |
| pa-pathway.json | c050 | "the student attrition rate. Both are required disclosures." | "the student graduation or attrition rate"; also "national average sits in the low-to-mid 90s" → "the national first-time rate has run about 91 to 93 percent" | NCCPA PANCE pass-rate table (2021–25: 93.2 / 91.9 / 92.0 / 92.4 / 91.5 percent) |
| pa-pathway.ext.json | l10 body | "required to publish its **PANCE first-time pass rate over five years**, its **attrition** figures, its **cost**, and its **program goals**" | "its **five-year PANCE first-time pass rate report**, its **annual student graduation rate** on a table supplied by ARC-PA, its **estimated total cost of enrollment**, and **evidence that it meets its goals**" | ARC-PA 6e A3.11 |
| pa-pathway.ext.json | l10 KP1, c051, c052, q025 (why), s02 step 1 choice | four further repetitions of the same disclosure list | all updated to the 6th-edition wording | same |

Note: attrition remains a legitimate comparison metric, and the quiz items that use published attrition percentages to compare two programs (`pa-pathway-q021`, `pa-pathway-q026`, `pa-pathway-q076`) were left alone — they are sound as analysis even though the mandated disclosure is now phrased as a graduation rate.

### N. CASPA Fee Assistance Program mechanism

CASPA distributes a limited number of waivers **first come, first served**, each covering the first two programs ($185 + $65 = $250); it must be requested **before** submitting, and funds deplete. The modules described awards "released at intervals"/"in batches".

| file | id | was | now | source |
|---|---|---|---|---|
| pa-pathway.json | l02 body | "a limited number of awards released at intervals during the cycle" | "a limited number of waivers granted first come, first served, each covering the first two programs. It has to be requested before you submit, and funds run out" | https://help.liaisonedu.com/CASPA_Applicant_Help_Center/Starting_Your_CASPA_Application/Getting_Started_with_Your_CASPA_Application/3_CASPA_Application_Fees |
| pa-pathway.ext.json | l14 body | "a limited number of awards released in batches during the cycle" | same correction | same |

### O. PA-CAT subject list (incomplete)

| file | id | was | now | source |
|---|---|---|---|---|
| pa-pathway.json | l05 body | "anatomy, physiology, biology, chemistry, biochemistry, microbiology, genetics, and behavioral sciences" | "…general and organic chemistry, …, **statistics**, and behavioral sciences" | Exam Master: 240 questions across nine subjects incl. statistics — https://www.pa-cat.com/about-the-pa-cat/ |
| pa-pathway.json | c028 | same list | same correction | same |

### P. Regional tuition figures

| file | id | was | now | source |
|---|---|---|---|---|
| pa-pathway.json | l07 body | "Community college in New Jersey: roughly `$150` to `$200` per credit in-county" | "roughly `$135` to `$260` per credit in-county, depending on the college and how it bundles fees" | Camden County College $134/credit in-county; Rowan College at Burlington County $258.50/credit in-county (comprehensive) |
| pa-pathway.ext.json | l12 body, l12 KP1, c072 | "roughly $150 to $200 per credit" (3 places) | "roughly $135 to $260 per credit" | same |
| pa-pathway.quiz.json | q089 (choice 0 + why) | "Roughly $15,000 to $25,000 or more"; why cited "$150 to $200 per credit" and "well over $15,000" | "Roughly $10,000 to $25,000 or more"; why cites "$135 to $260 per credit" and "well over $10,000" | arithmetic against the corrected per-credit range |
| pa-pathway.json | l09 body table | "Total tuition, private \| `$100,000` to `$160,000`" | "`$80,000` to `$150,000`, averaging near `$100,000`" | PAEA Program Report 36: private total tuition **mean $100,212**; public resident mean $57,955 (so the public `$50,000`–`$90,000` row was left as is) |
| pa-pathway.json | c047 | "private roughly $100,000 to $160,000" | "private roughly $80,000 to $150,000 and averaging near $100,000" | same |

---

## Checked and found correct (left unchanged)

- **CASPA fee: $185 first program, $65 each additional.** Verbatim on the CASPA fees page. The arithmetic in `pa-pathway-l02#0` ("near $380 total" for four programs) is correct.
- **Personal statement: 5,000 characters including spaces.** CASPA states characters include spaces, carriage returns and punctuation, and the field cannot be edited after submission. All items keyed on this are correct, including `pa-interview-essays-q001` and `q037`.
- **Experience description limit: 600 characters.** Not printed on any Liaison page I could reach, but consistent across university pre-health offices and advising sources and matching the in-portal counter. Left as stated; see judgment calls.
- **CASPA opens in late April.** 2025-26 opened April 24, 2025; 2026-27 opened April 30, 2026. "Late April" is accurate and no fixed date is asserted anywhere in the batch.
- **CASPA does not recognise grade replacement; every attempt at every institution counts; WF is treated as F.** Confirmed verbatim. `pa-pathway-l03`, `c018`, `q008`, `q009` all correct. The GPA arithmetic in `q009` (30 credits at 2.0 plus 60 at 3.5 = 3.0) checks out.
- **CASPA computes cumulative, science and BCP GPAs** from all coursework, with BCP = biology, chemistry (inorganic, organic, biochemistry) and physics. Correct as written.
- **PANCE: 300 multiple-choice questions**, five blocks of 60, five hours of testing. National first-time pass rate "low-to-mid 90%" is accurate (91.5% in 2025, 91.9–93.2% over 2021–25).
- **PANRE / PANRE-LA every 10 years.** Still required by the end of year 10; PANRE-LA is an alternative, not a replacement. Correct as written.
- **ARC-PA requires emergency medicine.** Confirmed twice over in the current 6th edition: B3.06(b) preceptor discipline *"emergency medicine, including emergent care"* and B3.04(a) required setting *"emergency department."* The module's seven-rotation list (family medicine, internal medicine, general surgery, pediatrics, ob-gyn, behavioral/mental health, emergency medicine) matches B3.06 exactly.
- **ARC-PA statuses.** Continued / Provisional / Probation are described correctly, including that Provisional means no graduates yet and no outcome data.
- **Bachelor's degree required before matriculation** at essentially every accredited program. Correct.
- **GRE: 130–170 verbal and quantitative in 1-point increments, analytical writing 0–6 in half-point increments, scores valid 5 years.** All correct as written.
- **Casper is scored in quartiles against the same cycle's test-takers** and cannot be content-crammed. Correct.
- **PA-CAT is accepted by a minority of programs** — 39 accepting, roughly 16 requiring, out of 335 accredited. "A minority" is accurate.
- **PSLF: 120 qualifying payments, need not be consecutive, employer of record determines eligibility, FFEL/Perkins qualify only after Direct Consolidation, forgiveness not federally taxable.** All correct. The staffing-company-versus-hospital trap in `l11` and `q032` is a real and well-put distinction.
- **Program length 24–28 months.** PAEA Program Report 36: mean 26.7, median 27.0, range 24–40. Correct.
- **Matriculant GPA roughly 3.5–3.6.** PAEA Student Report 6: mean 3.6, median 3.7. Correct.
- **Matriculant PCE averages "commonly 2,000 to 3,000".** Sits between PAEA's national median (3,200 hours) and regional program-reported class averages (1,868 at Arcadia, 2,165 at DeSales, 2,633 at Drexel, 1,464–2,767 at Monmouth). Left as written.
- **Undergraduate institutions named as examples** — Camden County College, Rowan College at Burlington County, Rowan University, Rutgers-Camden, Stockton University, Thomas Edison State University, Western Governors University — all exist and all match the category they illustrate. The lesson explicitly frames them as examples rather than recommendations, which is the right treatment.
- **No PA program is named anywhere in this batch**, so there were no program-specific admission claims to correct; the regional research was used instead to calibrate the general claims in sections G, H and P above.
- **The entire `pa-interview-essays.quiz.json` file** (20 extra checks, 53 quiz items) required no corrections. It is derivative of the parent module's advice and contains no independent factual claims.

---

## Unverifiable / judgment calls

1. **600-character experience description limit.** Stated in `pa-interview-essays-l04`, `c019`, `q010` and used in several stems. Liaison's public help pages do not publish a character limit. The 600 figure is consistent across university pre-health offices and advising sources and matches widely-reported in-portal behaviour, so it was left in place. If a future cycle changes it, four items move together.
2. **"Update experience hours \| Only in designated update windows, and rules vary"** in `pa-pathway.ext.json` l14's what-can-change table. CASPA's public documentation does not describe an experience-update window. The row is hedged ("rules vary") so it was left alone rather than replaced with an unsourced absolute.
3. **Whether a PA master's is a "professional degree"** for the post-2026 federal loan caps. The Department of Education's rulemaking excluded PA, a court order provisionally reinstated it, and briefing ran past the audit date. The text now tells the reader the question is unsettled and to check, which is the only defensible position.
4. **"Competitive GRE is roughly 155 per section, 305–310 combined, analytical writing 4.0+."** No central body publishes a PA-specific competitive threshold; this is aggregated program-reported data. Left as written, and the lesson already frames it as approximate.
5. **"Most programs recommend rather than require shadowing, and those requiring it want 8 to 40 hours."** Regionally, Kean and Salus at Drexel both require exactly 20 hours and DeSales counts up to 50 virtual hours, which is inside the stated range. Left as written.
6. **Interview-format numbers** (MMI 6–10 stations of about 8 minutes, panel 2–4 interviewers, group 4–8 applicants, traditional 20–30 or 20–45 minutes). These are conventional descriptions with no governing body; they are internally consistent with the rest of the batch and were left alone. The small discrepancy between `pa-pathway-l06` ("20 to 45 minutes") and `pa-interview-essays-l07` ("20 to 30 minutes") is within the honest range for a traditional interview and is not worth forcing into agreement.
7. **"Scenario s01 fork four: waiting a year costs about $60,000 of forgone PA salary."** Roughly a year of new-graduate PA pay net of continued ED tech earnings. Defensible as an order-of-magnitude figure; left alone.
8. **ARC-PA program count (335)** carries no as-of date on ARC-PA's own pages. The most recent posted commission actions are from July 2026, so the figure is current within a meeting cycle. Both places that cite it are already hedged with "roughly".

---

## Validator

```
ok   content\modules\pa-pathway.json
ok   content\modules\pa-pathway.ext.json
  ! lesson[1] pa-pathway-l11: body long (827 words, aim <= 700)
ok   content\modules\pa-pathway.quiz.json
ok   content\modules\pa-interview-essays.json
ok   content\modules\pa-interview-essays.quiz.json
```

All five files pass with no `x`. The single `!` on `pa-pathway-l11` is a pre-existing length warning; that lesson was already over the target before this audit and the Grad PLUS correction could not be made shorter without dropping the substance.

---

## Verdict

**Structurally excellent, factually stale in exactly the places that cost money and cycles.** The reasoning, the answer keys, and the strategic advice are almost uniformly sound — the rolling-admissions material, the PCE-versus-HCE reasoning test, the letters guidance, the MMI and ethics frameworks, and the whole interview module are strong and needed almost no correction. What failed was the numbers layer: the BLS figures were two handbook editions out of date, the federal loan architecture changed underneath the money lesson, and four separate CASPA mechanics (projected hours, experience categories, verification turnaround, the letter minimum) were taught from advising folklore rather than from CASPA's own instructions. One answer key was outright wrong (`pa-interview-essays-q017`). The projected-hours error was the dangerous one, because a student following it would have entered hours he had not worked into a centralised application that verifies against supervisors.
