/* Rounds — case generator for the simulations (radio report, PCR, history taking). Seeded, offline, and each case carries its own answer key. */
(function () {
  const rnd = (seed) => { let s = seed >>> 0 || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
  const pick = (r, a) => a[Math.floor(r() * a.length)];
  const between = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
  const NAMES = { m: ['Walter', 'Ray', 'Dennis', 'Marcus', 'Luis', 'Frank', 'Tyler', 'George', 'Samir', 'Kevin', 'Anthony', 'Eddie'], f: ['Donna', 'Maria', 'Gloria', 'Keisha', 'Ellen', 'Priya', 'Rose', 'Jasmine', 'Carol', 'Linda', 'Ana', 'Brenda'] };
  const LAST = ['Rivera', 'Thompson', 'Nguyen', 'Okafor', 'Kowalski', 'Bennett', 'Santos', 'Murphy', 'Patel', 'Greene', 'DiMarco', 'Washington'];
  const PLACES = ['a two-story home on Kings Highway in Cherry Hill', 'the ShopRite parking lot on Route 70', 'a rowhome in Camden off Federal Street', 'a diner on the Black Horse Pike', 'a senior apartment building in Voorhees', 'a warehouse in Pennsauken', 'a soccer field in Haddonfield', 'a Wawa on Route 38'];

  // Each template: how the patient presents, the hidden SAMPLE/OPQRST answers, vitals over time, the EMT interventions, and personality for the AI patient.
  const T = [
    { id: 'acs', cc: 'chest pain', sex: 'any', age: [48, 78], moi: false,
      s: 'pressure in the center of the chest, some sweating, a little short of breath, nauseated',
      a: 'penicillin (rash)', m: 'metoprolol, atorvastatin, lisinopril; took one nitro from his own bottle 20 minutes ago', p: 'high blood pressure, high cholesterol, a stent placed 3 years ago', l: 'coffee and a bagel about 3 hours ago', e: 'was carrying groceries in from the car when it started',
      o: 'about 40 minutes ago, came on gradually while carrying bags', pq: 'nothing makes it better; walking makes it worse; nitro helped a little for a few minutes', q: 'pressure, like a weight, not sharp', rad: 'goes into the left arm and jaw', sev: '7 out of 10', t: 'constant since it started',
      v1: { hr: 96, bp: '156/92', rr: 22, spo2: 95, skin: 'pale, cool, diaphoretic', gcs: 15, glu: null, pain: 7 }, v2: { hr: 90, bp: '148/88', rr: 20, spo2: 97, pain: 5 },
      tx: ['aspirin 324 mg chewed', 'assisted one nitroglycerin 0.4 mg sublingual after confirming SBP above 100 and no PDE-5 inhibitor', 'oxygen 2 L/min by nasal cannula for SpO2 95%', 'position of comfort, semi-Fowler', '12-lead acquired and transmitted'],
      dx: 'possible acute coronary syndrome', priority: 'high', persona: 'Worried but trying to downplay it. Volunteers the pressure and the sweating; only mentions the nitro and the stent if asked about medications or history. Denies "pain," calls it pressure.' },
    { id: 'asthma', cc: 'difficulty breathing', sex: 'any', age: [19, 44], moi: false,
      s: 'wheezing, can only speak in short phrases, sitting tripod, using neck muscles',
      a: 'none known', m: 'albuterol inhaler (empty since yesterday), fluticasone inhaler', p: 'asthma since childhood, one hospital admission last year, never intubated', l: 'pizza about 4 hours ago', e: 'was cleaning a dusty basement, started wheezing, inhaler was empty',
      o: 'about 1 hour ago', pq: 'sitting up forward helps a little; lying back is worse', q: 'tight, like breathing through a straw', rad: 'none', sev: 'breathing is 8 out of 10 hard', t: 'getting worse over the hour',
      v1: { hr: 118, bp: '138/84', rr: 30, spo2: 90, skin: 'flushed, moist', gcs: 15, glu: null, pain: 0 }, v2: { hr: 106, bp: '132/80', rr: 22, spo2: 95, pain: 0 },
      tx: ['oxygen by non-rebreather 15 L/min', 'assisted albuterol 2.5 mg by nebulizer per protocol (MDI with spacer if nebulizer unavailable)', 'position of comfort, upright', 'reassessed lung sounds after treatment: wheezes improved, better air movement'],
      dx: 'acute asthma exacerbation', priority: 'high', persona: 'Speaks only in 2 to 4 word phrases. Answers slowly and gets irritated by long questions. Forgets to mention the empty inhaler unless asked what medications she has or took.' },
    { id: 'hypogly', cc: 'altered mental status', sex: 'any', age: [30, 70], moi: false,
      s: 'confused, sweaty, combative at first, slurred words; family says he "seems drunk"',
      a: 'sulfa drugs', m: 'insulin glargine at night and insulin lispro with meals, metformin', p: 'type 1 diabetes for 20 years', l: 'took morning insulin but skipped breakfast', e: 'wife found him confused on the couch at about 10 in the morning',
      o: 'wife noticed around 10:00, unknown exactly when', pq: 'unknown', q: 'not applicable', rad: 'not applicable', sev: 'not applicable', t: 'about 30 minutes before the call',
      v1: { hr: 112, bp: '142/86', rr: 18, spo2: 98, skin: 'pale, cool, very diaphoretic', gcs: 13, glu: 38, pain: 0 }, v2: { hr: 92, bp: '138/84', rr: 16, spo2: 98, gcs: 15, glu: 96, pain: 0 },
      tx: ['blood glucose checked: 38 mg/dL', 'oral glucose 15 g given after confirming he could swallow and protect his airway', 'repeat glucose after 15 minutes: 96 mg/dL, mental status back to baseline', 'wife encouraged to have him eat a meal; transport advised'],
      dx: 'symptomatic hypoglycemia', priority: 'high', persona: 'At first confused and repeating himself; after the glucose, clear and embarrassed. The wife is in the room and fills in medications and history if the student asks her.' },
    { id: 'stroke', cc: 'facial droop and weakness', sex: 'any', age: [60, 88], moi: false,
      s: 'left facial droop, left arm drift, slurred speech; understands questions',
      a: 'none known', m: 'apixaban (blood thinner), amlodipine, metformin', p: 'atrial fibrillation, high blood pressure, type 2 diabetes', l: 'dinner at 6 pm', e: 'daughter heard a crash and found her on the kitchen floor about 10 minutes before calling 911; she was last seen normal 25 minutes before that, making a sandwich',
      o: 'last known well about 35 minutes before your arrival; found on the floor 25 minutes after that', pq: 'nothing changes it', q: 'cannot describe, says the arm "feels heavy"', rad: 'not applicable', sev: 'not applicable', t: 'constant since found',
      v1: { hr: 88, bp: '188/104', rr: 18, spo2: 96, skin: 'warm, dry', gcs: 14, glu: 142, pain: 0 }, v2: { hr: 86, bp: '184/100', rr: 18, spo2: 97, pain: 0 },
      tx: ['Cincinnati stroke scale positive: facial droop, arm drift, abnormal speech', 'blood glucose 142 mg/dL (rules out hypoglycemia mimic)', 'last known well time established from the daughter and relayed to the stroke center', 'oxygen not given, SpO2 above 94%', 'stroke alert called; rapid transport to a stroke center; nothing by mouth; head elevated 30 degrees'],
      dx: 'acute stroke, within the treatment window', priority: 'high', persona: 'Slurred but understandable. Frustrated that words come out wrong. The daughter is present and knows the last-known-well time (she was making a sandwich, normal, about 35 minutes before the ambulance arrived) and the blood thinner if asked.' },
    { id: 'anaph', cc: 'allergic reaction', sex: 'any', age: [16, 40], moi: false,
      s: 'hives on the chest and arms, lip swelling, throat feels tight, wheezing, dizzy',
      a: 'peanuts (had an EpiPen prescribed, does not carry it)', m: 'none daily; loratadine sometimes', p: 'peanut allergy, no other problems', l: 'a cookie from a coworker about 20 minutes ago', e: 'ate the cookie at work, started itching within 10 minutes',
      o: 'about 20 minutes ago, fast', pq: 'nothing helps; getting worse', q: 'throat tight, itching everywhere', rad: 'not applicable', sev: 'scared, throat 6 out of 10 tight', t: 'progressing over 20 minutes',
      v1: { hr: 124, bp: '92/58', rr: 26, spo2: 92, skin: 'flushed with hives, warm', gcs: 15, glu: null, pain: 0 }, v2: { hr: 104, bp: '112/70', rr: 20, spo2: 97, pain: 0 },
      tx: ['epinephrine 0.3 mg intramuscular, lateral thigh, by auto-injector', 'oxygen by non-rebreather 15 L/min', 'supine with legs elevated for hypotension', 'ALS intercept requested', 'reassessed at 5 minutes: hives fading, BP up, wheezing improved; second dose not needed'],
      dx: 'anaphylaxis', priority: 'high', persona: 'Anxious, talking fast, scratching. Volunteers the hives and throat; only mentions the cookie if asked what she ate or what happened. Knows about the peanut allergy and the EpiPen at home.' },
    { id: 'opioid', cc: 'unresponsive', sex: 'any', age: [22, 50], moi: false,
      s: 'unresponsive, pinpoint pupils, breathing 6 times a minute, snoring respirations, blue lips',
      a: 'unknown', m: 'friend says he uses "percs" bought on the street; no prescriptions known', p: 'friend says he was in rehab last year', l: 'unknown', e: 'friend found him on the bathroom floor with a straw and powder nearby',
      o: 'found about 5 minutes before the call, last seen 30 minutes ago', pq: 'not applicable', q: 'not applicable', rad: 'not applicable', sev: 'not applicable', t: 'not applicable',
      v1: { hr: 58, bp: '98/60', rr: 6, spo2: 82, skin: 'cyanotic lips, cool', gcs: 3, glu: 104, pain: 0 }, v2: { hr: 88, bp: '118/74', rr: 16, spo2: 96, gcs: 14, pain: 0 },
      tx: ['airway opened with head-tilt chin-lift, oropharyngeal airway placed', 'bag-valve-mask ventilation with high-flow oxygen at 1 breath every 6 seconds', 'naloxone 4 mg intranasal, one spray in one nostril', 'responded after 3 minutes: breathing 16, GCS 14, agitated', 'glucose 104 mg/dL', 'transport encouraged; patient initially wanted to refuse'],
      dx: 'opioid overdose with respiratory depression', priority: 'high', persona: 'Cannot answer anything until after naloxone. After waking: groggy, irritable, denies using, wants to leave. The friend answers history questions.' },
    { id: 'hip', cc: 'fall, hip pain', sex: 'f', age: [74, 92], moi: true,
      s: 'right hip pain after a ground-level fall, right leg shortened and externally rotated, cannot bear weight',
      a: 'codeine (nausea)', m: 'warfarin, levothyroxine, alendronate, furosemide', p: 'atrial fibrillation, osteoporosis, low thyroid', l: 'tea and toast at 8 am', e: 'tripped on the bathroom rug at about 9:30 am, no loss of consciousness, did not hit her head',
      o: 'about 40 minutes ago', pq: 'any movement of the leg makes it much worse', q: 'sharp, deep', rad: 'stays in the hip, a little into the groin', sev: '8 out of 10', t: 'constant',
      v1: { hr: 98, bp: '146/84', rr: 20, spo2: 96, skin: 'pale, warm, dry', gcs: 15, glu: null, pain: 8 }, v2: { hr: 94, bp: '142/82', rr: 18, spo2: 97, pain: 6 },
      tx: ['leg stabilized in the position found with pillows and a long board strap', 'distal pulse, motor and sensation checked before and after: intact', 'no spinal immobilization: no midline tenderness, no neuro deficit, alert', 'warfarin noted and relayed as a bleeding risk', 'moved with a scoop stretcher to reduce hip movement'],
      dx: 'suspected right hip fracture on an anticoagulant', priority: 'medium', persona: 'Polite, apologetic for the trouble, minimizes pain until asked directly. Knows her medications well, keeps a list in her purse if asked.' },
    { id: 'mvc', cc: 'motor vehicle crash', sex: 'any', age: [18, 55], moi: true,
      s: 'restrained driver, moderate front-end damage, airbag deployed, neck pain and a 4 cm bleeding laceration on the forehead',
      a: 'none known', m: 'none', p: 'none', l: 'lunch 2 hours ago', e: 'rear-ended a stopped car at about 30 mph; no loss of consciousness reported; remembers the whole thing',
      o: 'crash about 15 minutes ago', pq: 'turning the head makes the neck worse', q: 'aching neck, stinging cut', rad: 'no', sev: 'neck 5 out of 10', t: 'constant',
      v1: { hr: 104, bp: '132/80', rr: 20, spo2: 98, skin: 'warm, dry', gcs: 15, glu: null, pain: 5 }, v2: { hr: 92, bp: '128/78', rr: 18, spo2: 98, pain: 4 },
      tx: ['scene safety: vehicle in park, hazards on, police on scene', 'manual in-line stabilization, then cervical collar; midline cervical tenderness present', 'direct pressure and a dressing to the forehead laceration; bleeding controlled', 'full secondary assessment: no other injuries found', 'rapid extrication to the stretcher with spinal motion restriction'],
      dx: 'MVC with possible cervical spine injury and a scalp laceration', priority: 'medium', persona: 'Shaken, talkative, keeps asking about the car. Remembers everything. Denies head strike until asked specifically, then says the airbag hit his face.' },
    { id: 'appy', cc: 'abdominal pain', sex: 'f', age: [17, 35], moi: false,
      s: 'right lower abdominal pain, nausea, vomited twice, no appetite, feels feverish',
      a: 'none known', m: 'birth control pill', p: 'none', l: 'soup last night, nothing today', e: 'pain started around the belly button yesterday afternoon and moved to the right lower side overnight',
      o: 'yesterday afternoon, about 20 hours ago', pq: 'walking and the bumps in the ambulance make it worse; lying still with knees bent is better', q: 'steady ache, sharp when moving', rad: 'started around the navel, now stays low on the right', sev: '7 out of 10', t: 'constant and worsening',
      v1: { hr: 108, bp: '118/72', rr: 20, spo2: 98, skin: 'warm, dry, flushed', gcs: 15, glu: null, pain: 7, temp: 100.9 }, v2: { hr: 104, bp: '116/72', rr: 18, spo2: 98, pain: 7 },
      tx: ['position of comfort, knees bent', 'nothing by mouth', 'last menstrual period asked and documented: 2 weeks ago, normal', 'gentle transport, prepared for vomiting with an emesis bag'],
      dx: 'suspected appendicitis', priority: 'medium', persona: 'Uncomfortable, short answers, does not volunteer the migration of the pain unless asked where it started. Embarrassed about the pregnancy question but answers honestly.' },
    { id: 'syncope', cc: 'fainted', sex: 'any', age: [65, 85], moi: false,
      s: 'passed out at church while standing, came around within a minute, now pale and lightheaded, skinned knee',
      a: 'none known', m: 'metoprolol, tamsulosin (started last week), aspirin', p: 'high blood pressure, enlarged prostate', l: 'coffee only this morning, no breakfast', e: 'stood up after kneeling, felt warm and dizzy, went down; bystanders say no shaking, no incontinence',
      o: 'about 20 minutes ago', pq: 'lying down feels better; standing brings the dizziness back', q: 'lightheaded, "gray" vision before it happened', rad: 'not applicable', sev: 'dizziness 4 out of 10 now', t: 'unconscious under 1 minute; lightheaded since',
      v1: { hr: 54, bp: '102/62', rr: 16, spo2: 97, skin: 'pale, cool, dry', gcs: 15, glu: 88, pain: 2 }, v2: { hr: 58, bp: '110/68', rr: 16, spo2: 97, pain: 2 },
      tx: ['supine, legs elevated', 'orthostatic vitals: standing BP 88/56 with HR 62, symptomatic', 'blood glucose 88 mg/dL', '12-lead acquired: sinus bradycardia, no acute changes flagged', 'knee abrasion cleaned and dressed', 'transport advised given age, new medication, and bradycardia'],
      dx: 'syncope, likely orthostatic on a new alpha blocker, bradycardic', priority: 'medium', persona: 'Cheerful, wants to go home, "just skipped breakfast." Mentions the new prostate pill only when asked whether any medication changed recently.' },
    { id: 'seizure', cc: 'seizure', sex: 'any', age: [20, 45], moi: false,
      s: 'witnessed generalized tonic-clonic seizure lasting about 2 minutes, now drowsy and confused, bit his tongue, incontinent of urine',
      a: 'none known', m: 'levetiracetam, missed the last 2 days because the prescription ran out', p: 'epilepsy diagnosed at 19', l: 'sandwich at noon', e: 'coworkers saw him fall and shake at his desk at about 2:15 pm',
      o: 'seizure at 14:15, lasted about 2 minutes', pq: 'not applicable', q: 'not applicable', rad: 'not applicable', sev: 'not applicable', t: 'postictal for about 15 minutes now',
      v1: { hr: 110, bp: '138/86', rr: 20, spo2: 94, skin: 'warm, moist', gcs: 12, glu: 118, pain: 0 }, v2: { hr: 92, bp: '130/82', rr: 16, spo2: 97, gcs: 15, pain: 0 },
      tx: ['protected from injury during the postictal period, recovery position, suction ready', 'oxygen 4 L/min by nasal cannula for SpO2 94%', 'blood glucose 118 mg/dL', 'no second seizure during care; mental status cleared to GCS 15 by arrival', 'missed medication doses documented'],
      dx: 'breakthrough seizure from missed anticonvulsant doses', priority: 'medium', persona: 'Confused for the first few questions (repeats "what happened?"), then clears. Embarrassed about the missed medication; admits it only when asked directly whether he has been taking it.' },
    { id: 'lac-refusal', cc: 'hand laceration, wants to refuse', sex: 'm', age: [24, 50], moi: true,
      s: '3 cm laceration across the palm from a box cutter, bleeding controlled, can move all fingers, numbness at the tip of the ring finger',
      a: 'none known', m: 'none', p: 'none; last tetanus shot unknown, "maybe 10 years"', l: 'coffee 1 hour ago', e: 'slipped while opening a box at work 30 minutes ago; coworker called; he does not want to go because he has no insurance',
      o: '30 minutes ago', pq: 'pressure helps the bleeding', q: 'stinging', rad: 'tip of the ring finger is numb', sev: '3 out of 10', t: 'constant',
      v1: { hr: 84, bp: '128/78', rr: 16, spo2: 99, skin: 'warm, dry', gcs: 15, glu: null, pain: 3 }, v2: { hr: 80, bp: '126/76', rr: 16, spo2: 99, pain: 3 },
      tx: ['direct pressure, wound irrigated with saline, sterile dressing', 'distal circulation, motor and sensation checked: capillary refill under 2 seconds, movement intact, decreased sensation at the ring fingertip', 'patient refuses transport: alert and oriented, sober, understands the risks explained (nerve or tendon injury, infection, tetanus), alternatives offered (urgent care, own doctor today), told to call 911 back any time', 'refusal signed and witnessed by the coworker; medical direction contacted per protocol'],
      dx: 'palm laceration with possible digital nerve injury; informed refusal', priority: 'low', refusal: true, persona: 'Friendly, wants to get back to work, worried about cost. Does not mention the numb fingertip unless asked about feeling or numbness. Will sign the refusal after the risks are explained.' },
  ];

  function generate(seed, opts = {}) {
    const r = rnd(seed);
    let pool = T; if (opts.refusal === true) pool = T.filter((t) => t.refusal); if (opts.id) pool = T.filter((t) => t.id === opts.id);
    const t = pick(r, pool.length ? pool : T);
    const sex = t.sex === 'any' ? pick(r, ['m', 'f']) : t.sex;
    const age = between(r, t.age[0], t.age[1]);
    const first = pick(r, NAMES[sex]); const last = pick(r, LAST);
    const place = pick(r, PLACES);
    const base = new Date(); base.setHours(between(r, 6, 22), between(r, 0, 59), 0, 0);
    const mins = (n) => new Date(base.getTime() + n * 60000);
    const hhmm = (d) => String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    const times = { dispatch: hhmm(mins(0)), enroute: hhmm(mins(1)), onscene: hhmm(mins(between(r, 5, 9))), contact: hhmm(mins(between(r, 10, 12))), v1: hhmm(mins(between(r, 13, 15))), tx: hhmm(mins(between(r, 16, 19))), v2: hhmm(mins(between(r, 24, 28))), depart: hhmm(mins(between(r, 29, 33))), arrive: hhmm(mins(between(r, 41, 52))) };
    if (t.refusal) { times.depart = null; times.arrive = null; times.clear = hhmm(mins(between(r, 36, 44))); }
    const unit = 'BLS ' + between(r, 3, 9) + between(r, 10, 89);
    const eta = between(r, 6, 14);
    const dest = t.id === 'stroke' ? 'Cooper (stroke center)' : t.id === 'mvc' ? 'Cooper (trauma)' : pick(r, ['Virtua Voorhees', 'Cooper', 'Jefferson Cherry Hill', 'Virtua Marlton', 'Inspira Mullica Hill']);
    return { seed, tid: t.id, name: first + ' ' + last, first, sex, sexWord: sex === 'm' ? 'male' : 'female', age, place, unit, eta, dest, times, cc: t.cc, moi: t.moi, refusal: !!t.refusal, dx: t.dx, priority: t.priority, persona: t.persona,
      sample: { s: t.s, a: t.a, m: t.m, p: t.p, l: t.l, e: t.e }, opqrst: { o: t.o, p: t.pq, q: t.q, r: t.rad, s: t.sev, t: t.t }, v1: t.v1, v2: t.v2, tx: t.tx };
  }

  // Dispatch text (what the crew knows before contact) and the full story (what a good history uncovers).
  function dispatch(c) { return `${c.unit}, respond to ${c.place} for a ${c.age}-year-old ${c.sexWord}, ${c.cc}. Time out ${c.times.dispatch}.`; }
  function vitalsLine(v) { return `HR ${v.hr}, BP ${v.bp}, RR ${v.rr}, SpO2 ${v.spo2}%` + (v.gcs ? `, GCS ${v.gcs}` : '') + (v.glu ? `, glucose ${v.glu}` : '') + (v.temp ? `, temp ${v.temp} F` : '') + (v.skin ? `, skin ${v.skin}` : '') + (typeof v.pain === 'number' && v.pain ? `, pain ${v.pain}/10` : ''); }
  function story(c) {
    return [`Patient: ${c.name}, ${c.age}-year-old ${c.sexWord}. Chief complaint: ${c.cc}. Location: ${c.place}.`,
      `Presentation: ${c.sample.s}.`, `Allergies: ${c.sample.a}. Medications: ${c.sample.m}. History: ${c.sample.p}. Last oral intake: ${c.sample.l}. Events: ${c.sample.e}.`,
      `OPQRST: onset ${c.opqrst.o}; provocation ${c.opqrst.p}; quality ${c.opqrst.q}; radiation ${c.opqrst.r}; severity ${c.opqrst.s}; time ${c.opqrst.t}.`,
      `Initial vitals at ${c.times.v1}: ${vitalsLine(c.v1)}.`, `Treatment (${c.times.tx}): ${c.tx.join('; ')}.`, `Repeat vitals at ${c.times.v2}: ${vitalsLine(c.v2)}.`,
      c.refusal ? `Outcome: patient refused transport; cleared ${c.times.clear}.` : `Transport: departed ${c.times.depart}, arrived ${c.dest} ${c.times.arrive}, ETA given ${c.eta} minutes.`].join('\n');
  }

  // Radio report rubric: what must be in a MIST or SBAR report for this case.
  function reportRubric(c) {
    const items = [
      { k: 'unit', label: 'Unit and ETA', test: (s) => /\beta\b|minutes? out|min out|\bout\b/i.test(s) && (/\d+\s*(min|minutes)/i.test(s) || /\beta\b/i.test(s)) },
      { k: 'age', label: 'Age and sex', test: (s) => new RegExp('\\b' + c.age + '\\b').test(s) && new RegExp(c.sex === 'm' ? '\\b(male|man|m)\\b' : '\\b(female|woman|f)\\b', 'i').test(s) },
      { k: 'cc', label: 'Chief complaint', test: (s) => c.cc.split(/[ ,]+/).filter((w) => w.length > 3).some((w) => new RegExp(w.replace(/[^\w]/g, ''), 'i').test(s)) || (c.tid === 'acs' && /chest/i.test(s)) || (c.tid === 'hypogly' && /(sugar|glucose|altered|confus)/i.test(s)) || (c.tid === 'opioid' && /(overdose|unresponsive|opioid|narcan|naloxone)/i.test(s)) },
      { k: c.moi ? 'moi' : 'hx', label: c.moi ? 'Mechanism of injury' : 'Relevant history', test: (s) => c.moi ? /(fall|fell|crash|mvc|collision|rear-ended|box cutter|cut|mechanism)/i.test(s) : /(history|hx|diabet|asthma|stent|a-?fib|epilep|seizure|allerg|blood thinner|anticoag|warfarin|apixaban|prostate|hypertens|cardiac)/i.test(s) },
      { k: 'find', label: 'Key findings', test: (s) => ({ acs: /(diaphor|sweat|pressure|radiat|arm|jaw)/i, asthma: /(wheez|tripod|accessory|phrases|words)/i, hypogly: /(38|glucose|sugar|diaphor|confus)/i, stroke: /(droop|drift|slur|weak|cincinnati|be-?fast|last known|lkw)/i, anaph: /(hives|swell|wheez|throat|hypotens|92)/i, opioid: /(pinpoint|pupil|resp|breath|6|cyan|blue)/i, hip: /(shorten|rotat|hip|groin)/i, mvc: /(neck|cervical|tender|lacerat|forehead|airbag)/i, appy: /(right lower|rlq|nausea|vomit|fever|migrat)/i, syncope: /(orthostat|brady|54|dizz|lighthead|pale)/i, seizure: /(tonic|clonic|postictal|tongue|incontin|2 min)/i, 'lac-refusal': /(palm|lacerat|numb|nerve|tendon|cm)/i })[c.tid].test(s) },
      { k: 'vit', label: 'Vitals: HR, BP, RR, SpO2', test: (s) => [String(c.v1.hr), c.v1.bp.split('/')[0], String(c.v1.rr), String(c.v1.spo2)].filter((n) => new RegExp('\\b' + n + '\\b').test(s)).length >= 3 },
      { k: 'mental', label: 'Mental status (GCS or AVPU)', test: (s) => /(gcs|alert|oriented|a&o|avpu|unresponsive|responsive|confus|verbal|x ?[1-4]|\bao\b)/i.test(s) },
      { k: 'tx', label: 'Treatments given and response', test: (s) => c.tx.map((t) => t.split(/[ ,(]+/)[0]).filter((w) => w.length > 3).some((w) => new RegExp(w, 'i').test(s)) || /(gave|administer|treated|nebul|oxygen|o2|aspirin|nitro|epi|narcan|naloxone|glucose|collar|splint|dressing|pressure)/i.test(s) },
      { k: 'req', label: 'Requests or alerts (stroke alert, trauma, ALS, room)', test: (s) => /(alert|activate|als|intercept|request|need|room|bed|trauma team|stroke team|cath)/i.test(s) },
    ];
    if (c.tid === 'stroke') items.push({ k: 'lkw', label: 'Last known well time', test: (s) => /(last known well|lkw|last seen normal)/i.test(s) });
    if (c.tid === 'hip' || c.tid === 'stroke') items.push({ k: 'thin', label: 'Anticoagulant named', test: (s) => /(warfarin|coumadin|apixaban|eliquis|blood thinner|anticoag)/i.test(s) });
    return items;
  }

  // PCR narrative rubric.
  const SUBJECTIVE = [/\bseem(ed|s)?\b/i, /\bappear(ed|s)? (drunk|intoxicated|fine|normal|ok)\b/i, /\bdrunk\b/i, /\bnormal\b(?! sinus| saline)/i, /\bi think\b/i, /\bprobably\b/i, /\bobviously\b/i, /\bcrazy\b/i, /\bfaking\b/i, /\bfrequent flyer\b/i, /\bnothing wrong\b/i, /\bfine\b/i, /\bhysterical\b/i, /\bin no distress\b/i];
  function pcrRubric(c) {
    const items = [
      { k: 'times', label: 'Times: dispatch, on scene, patient contact' + (c.refusal ? ', cleared' : ', depart, arrive'), test: (s) => [c.times.dispatch, c.times.onscene, c.times.contact, c.refusal ? c.times.clear : c.times.depart].filter((t) => s.includes(t) || s.includes(t.replace(':', ''))).length >= 3 },
      { k: 'dispatch', label: 'Dispatch information and scene description', test: (s) => /(dispatch|respond|arriv|found|scene)/i.test(s) },
      { k: 'demo', label: 'Age and sex', test: (s) => new RegExp('\\b' + c.age + '\\b').test(s) && /\b(male|female|man|woman|m|f)\b/i.test(s) },
      { k: 'cc', label: 'Chief complaint in the patient\'s words', test: (s) => /(chief complaint|c\/o|complain|states|reports|"|“)/i.test(s) },
      { k: 'hpi', label: 'History of present illness (OPQRST / events)', test: (s) => /(onset|started|began|ago|prior to arrival|pta|denies|reports)/i.test(s) },
      { k: 'sample', label: 'SAMPLE: allergies, meds, history, last intake', test: (s) => [/allerg|nkda/i, /med(ication)?s|takes|prescri/i, /(history|hx|pmh)/i, /(last (oral|ate|meal|intake)|ate|drank|npo)/i].filter((re) => re.test(s)).length >= 3 },
      { k: 'exam', label: 'Physical exam findings, pertinent negatives', test: (s) => /(exam|assess|lung|breath sounds|pupil|skin|abdomen|extremit|no (signs|evidence)|denies|negative|intact|cms|pms)/i.test(s) },
      { k: 'v1', label: 'Initial vital signs with time', test: (s) => [String(c.v1.hr), c.v1.bp, String(c.v1.rr), String(c.v1.spo2)].filter((n) => s.includes(n)).length >= 3 },
      { k: 'v2', label: 'Repeat vitals showing the trend', test: (s) => [String(c.v2.hr), c.v2.bp, String(c.v2.rr), String(c.v2.spo2)].filter((n) => s.includes(n)).length >= 3 },
      { k: 'tx', label: 'Each treatment with time, dose, route, and response', test: (s) => c.tx.map((t) => t.split(/[ ,(]+/)[0]).filter((w) => w.length > 3).filter((w) => new RegExp(w, 'i').test(s)).length >= Math.min(3, c.tx.length) && /(mg|l\/min|lpm|nrb|nc|sl|im|in|po)\b/i.test(s) },
      { k: 'response', label: 'Patient response to treatment', test: (s) => /(improv|no change|resolv|relief|better|worse|tolerated|responded)/i.test(s) },
      { k: 'transfer', label: c.refusal ? 'Refusal: capacity, risks explained, alternatives, call back, signature and witness' : 'Transfer of care: to whom, condition on arrival, report given', test: (s) => c.refusal ? [/(alert|oriented|capacity|competent|sober|a&o)/i, /(risk|consequence|death|worse)/i, /(alternative|urgent care|doctor|physician)/i, /(call (911|back)|re-?contact)/i, /(sign|witness)/i].filter((re) => re.test(s)).length >= 4 : /(transfer|care transferred|report (given|to)|handoff|handed|rn|nurse|triage|room)/i.test(s) },
      { k: 'objective', label: 'Objective language (no opinions or labels)', test: (s) => !SUBJECTIVE.some((re) => re.test(s)) },
    ];
    return items;
  }
  function subjectiveHits(s) { const hits = []; for (const re of SUBJECTIVE) { const m = s.match(re); if (m) hits.push(m[0]); } return [...new Set(hits)]; }

  // History-taking audit: which SAMPLE/OPQRST elements were actually asked.
  const HIST = [
    { k: 'S', label: 'Signs and symptoms', re: /(what('s| is) (going on|wrong|bothering)|what happened|how are you feeling|what brings|symptom|tell me about|what('s| is) the problem|hurt)/i },
    { k: 'A', label: 'Allergies', re: /allerg/i },
    { k: 'M', label: 'Medications', re: /(medic|meds\b|pills|prescri|inhaler|insulin|taking anything)/i },
    { k: 'P', label: 'Past medical history', re: /(history|medical (problems|conditions)|diagnos|conditions|ever had|been told|health problems|see a doctor)/i },
    { k: 'L', label: 'Last oral intake', re: /(last (time you )?(ate|eat|drank|drink|meal)|eaten|when did you eat|food|breakfast|lunch|dinner|anything to (eat|drink))/i },
    { k: 'E', label: 'Events leading up', re: /(what were you doing|before (this|it) (started|happened)|leading up|how did (this|it) happen|what happened (before|right))/i },
    { k: 'O', label: 'Onset', re: /(when did (it|this) (start|begin)|how long ago|start(ed)? suddenly|come on (sudden|gradual)|what time)/i },
    { k: 'Pr', label: 'Provocation / palliation', re: /(make(s)? it (better|worse)|better or worse|anything help|worse when|relieve|palliat|provok|position)/i },
    { k: 'Q', label: 'Quality', re: /(describe (the|it|your)|what does it feel like|sharp|dull|pressure|burning|tight|kind of pain|type of pain)/i },
    { k: 'R', label: 'Radiation', re: /(radiat|spread|go anywhere|move anywhere|travel|arm|jaw|back\b.*pain|anywhere else)/i },
    { k: 'Sv', label: 'Severity', re: /(scale|1 to 10|one to ten|out of (10|ten)|how bad|how severe|rate (the|your))/i },
    { k: 'T', label: 'Time / course', re: /(how long|since|constant|come and go|getting (better|worse)|changed|intermittent|all the time)/i },
  ];
  function historyAudit(userTurns) {
    // A question about allergies mentions "medications" too; do not let it count as the medication question.
    const forM = userTurns.filter((t) => !/allerg/i.test(t)).join('\n'); const text = userTurns.join('\n');
    return HIST.map((x) => ({ k: x.k, label: x.label, asked: x.re.test(x.k === 'M' ? forM : text) }));
  }

  function patientSystem(c) {
    return `ROLE: You are ${c.name}, a ${c.age}-year-old ${c.sexWord} patient in an EMT training simulation. The EMT student is interviewing you at ${c.place}. Chief complaint: ${c.cc}.
Personality and behavior: ${c.persona}
Facts about you (answer ONLY what is asked; never volunteer the whole list; short, natural, in first person; use lay words, not medical terms):
- Symptoms right now: ${c.sample.s}
- Allergies: ${c.sample.a}
- Medications: ${c.sample.m}
- Past medical history: ${c.sample.p}
- Last oral intake: ${c.sample.l}
- Events before this: ${c.sample.e}
- Onset: ${c.opqrst.o}. What makes it better or worse: ${c.opqrst.p}. Quality: ${c.opqrst.q}. Radiation: ${c.opqrst.r}. Severity: ${c.opqrst.s}. Time course: ${c.opqrst.t}.
Rules: Stay in character as the patient (or the named family member/bystander when the student addresses them). If asked something not covered, improvise consistently and briefly. If the student asks a vague question, give a vague answer. If the student asks two things at once, answer only the first. Never grade, coach, or break character unless the student writes "END SIM". Reply in 1 to 3 sentences.`;
  }

  window.Cases = { generate, dispatch, story, vitalsLine, reportRubric, pcrRubric, subjectiveHits, historyAudit, patientSystem, templates: T.map((t) => ({ id: t.id, cc: t.cc, refusal: !!t.refusal })) };
})();
