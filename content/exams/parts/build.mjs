import fs from 'node:fs';
const P = 'C:/Users/zay/rounds/content/exams/parts/';
const O = 'C:/Users/zay/rounds/content/exams/';

const specs = [
  {
    id: 'nha-cpt',
    title: 'NHA Phlebotomy Technician (CPT)',
    blurb: 'The NHA Certified Phlebotomy Technician exam is 120 questions (100 scored plus 20 unscored pretest items) in 2 hours, covering safety and compliance, patient preparation, routine blood collections, special collections, and processing. This bank mirrors that blueprint: each timed attempt draws 100 items from the pool in the real domain proportions.',
    minutes: 120,
    count: 100,
    sections: [
      { id: 'safety', title: 'Safety & Compliance', weight: 0.14, file: 'cpt-safety.json' },
      { id: 'prep', title: 'Patient Preparation', weight: 0.22, file: 'cpt-prep.json' },
      { id: 'routine', title: 'Routine Blood Collections', weight: 0.34, file: 'cpt-routine.json' },
      { id: 'special', title: 'Special Collections', weight: 0.16, file: 'cpt-special.json' },
      { id: 'process', title: 'Processing', weight: 0.14, file: 'cpt-process.json' },
    ],
  },
  {
    id: 'nha-cet',
    title: 'NHA EKG Technician (CET)',
    blurb: 'The NHA Certified EKG Technician exam is 120 questions (100 scored plus 20 unscored pretest items) in 2 hours, covering safety, compliance and coordinated care; EKG acquisition; and EKG analysis and interpretation. This bank mirrors that blueprint: each timed attempt draws 100 items from the pool in the real domain proportions.',
    minutes: 120,
    count: 100,
    sections: [
      { id: 'care', title: 'Safety, Compliance & Coordinated Care', weight: 0.32, file: 'cet-care.json' },
      { id: 'acq', title: 'EKG Acquisition', weight: 0.40, file: 'cet-acq.json' },
      { id: 'interp', title: 'EKG Analysis & Interpretation', weight: 0.28, file: 'cet-interp.json' },
    ],
  },
];

for (const s of specs) {
  const questions = [];
  let n = 0;
  const counts = {};
  for (const sec of s.sections) {
    const arr = JSON.parse(fs.readFileSync(P + sec.file, 'utf8'));
    counts[sec.id] = arr.length;
    for (const q of arr) {
      n += 1;
      questions.push({
        id: `${s.id}-q${String(n).padStart(4, '0')}`,
        section: sec.id,
        q: q.q,
        choices: q.choices,
        answer: q.answer,
        why: q.why,
        difficulty: [1, 2, 3].includes(q.difficulty) ? q.difficulty : 2,
      });
    }
  }
  const out = {
    schema: 1,
    id: s.id,
    title: s.title,
    blurb: s.blurb,
    minutes: s.minutes,
    count: s.count,
    sections: s.sections.map(({ id, title, weight }) => ({ id, title, weight })),
    questions,
  };
  fs.writeFileSync(O + s.id + '.json', JSON.stringify(out, null, 2) + '\n');
  const dist = [0, 0, 0, 0];
  questions.forEach((q) => dist[q.answer]++);
  console.log(s.id, 'total', questions.length, JSON.stringify(counts), 'answers', JSON.stringify(dist));
}
