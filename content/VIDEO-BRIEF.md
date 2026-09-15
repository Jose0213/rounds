# Video curation brief

Goal: one good YouTube video per lesson (up to 3 where it genuinely helps), embedded under the lesson as "Watch". The student is an adult beginner going EMT-Basic → ED tech → PA school in New Jersey, studying on an iPad with cellular.

## Output

`content/modules/<module id>.videos.json`:

```json
{ "schema": 1, "extends": "<module id>", "videos": { "<lesson id>": [ { "id": "<11-char YouTube id>", "title": "<short descriptive title>", "channel": "<channel name>", "start": 0 } ] } }
```

Lesson ids and titles: read `content/modules/<id>.json` (`lessons[].id`, `.title`, `.keyPoints`) and `<id>.ext.json` if it exists (more lessons). Cover every lesson you can; skip a lesson only if no suitable video exists (say so in your report).

## Verification is mandatory

1. Find candidates with `node tools/yt-search.mjs "<query>" 8` (real YouTube search, prints id, duration, channel, title, views). Do NOT use WebSearch (its budget is exhausted) and do NOT spawn subagents (the slot cap is full; do all modules yourself, one at a time). Do not invent ids from memory; only ids printed by yt-search. Two or three queries per lesson is usually enough; pick the best match by title, channel and duration.
2. Write the file, then run `node tools/yt-check.mjs content/modules/<id>.videos.json`. It calls YouTube oEmbed, stamps `verified: true` and fills `ytTitle` with the real title. Any `x` line means the video does not exist or cannot be embedded: replace it.
3. Re-open the file and compare each `ytTitle` with the lesson title. If the real title does not match the lesson's topic, replace the video. This is the step that catches wrong ids.
4. Run `node tools/validate.mjs content/modules/<id>.videos.json` until it prints `ok`.

## Picking well

- The video must teach the same topic at the same level as the lesson. A 12-minute focused explainer beats a 90-minute lecture. 3–40 minutes ideal. No Shorts, no playlists, no livestream recordings, no "reaction" or vlog content.
- Preferred channels by track: EMT — EMTprep, Paramedic Coach, Wilderness Medicine, AHA, NREMT (skill videos), Medic Tests, EMS SEO, Prodigy EMS, ProMed, Hospital and EMS educator channels. ED tech / phlebotomy / EKG — nursing skills channels (RegisteredNurseRN, Nurse Sarah), NHA, phlebotomy educator channels, Mayo Clinic, Stanford Medicine 25. Pre-PA physiology and medicine — Ninja Nerd, Osmosis, Armando Hasudungan, Khan Academy Medicine, Dr. Matt & Dr. Mike, Strong Medicine, Life in the Fast Lane, MedCram, Zero To Finals, Dirty Medicine. Sciences — Khan Academy, Crash Course, Professor Dave Explains, The Organic Chemistry Tutor, Amoeba Sisters, Bozeman Science, Leah4sci, StatQuest, Dr. Najeeb (long), Kevin Ahern. PA pathway — The PA Platform, PA Student Advice, Physician Assistant Forum, official CASPA/PAEA/NCCPA channels.
- Current guidelines matter: for CPR/ACLS/PALS pick 2020-or-later videos; for NREMT exam prep pick videos that reflect the April 2025 blueprint or are blueprint-neutral.
- Use `start` (seconds) to jump into the relevant segment of a longer video when the topic starts late.
- Do not reuse the same video for many lessons; one video per topic.

## Report

Files written, lessons covered / total, lessons left without a video and why, and the yt-check summary lines. Do not ask questions.
