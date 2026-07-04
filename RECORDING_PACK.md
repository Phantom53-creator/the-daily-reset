# Reset Recording Pack — Human Voice Production

## Production decision

Reset uses **human voice recording from launch**. Do not ship AI/TTS narration as the production experience.

## Audio format

- Voice: calm, grounded, executive, non-spiritual, non-meditation
- Pace: slower than normal speech, but not sleepy
- Tone: physiotherapy / elite-performance coach, not wellness influencer
- Format: MP3, 128kbps minimum, mono acceptable, stereo preferred
- Loudness: normalize all files to consistent perceived volume
- Noise floor: clean room, no hum, no clicks, no background music for MVP
- File naming must match the app references exactly

## Folder structure

Create this folder inside `/build` before deployment:

```text
audio/
  breaks/
    eyes.mp3
    shoulders.mp3
    stand.mp3
    breathe.mp3
    posture.mp3
  learning/
    lunch-001-3pm-crash.mp3
    lunch-002-roman-decisions.mp3
    lunch-003-box-breathing.mp3
    lunch-004-chess-break.mp3
    lunch-005-seneca-time.mp3
    lunch-006-slumped-posture.mp3
    lunch-007-negative-visualization.mp3
    lunch-008-walking-thinking.mp3
    lunch-009-churchill-change-work.mp3
    lunch-010-attention-residue.mp3
    lunch-011-seal-lesson.mp3
    lunch-012-monks-repetition.mp3
    lunch-013-physical-cues.mp3
    lunch-014-pomodoro-principle.mp3
    lunch-015-inner-citadel.mp3
    lunch-016-screen-eyes.mp3
    lunch-017-ma-space.mp3
    lunch-018-scheduled-recovery.mp3
    lunch-019-compound-breaks.mp3
    lunch-020-one-next-action.mp3
```

## Break narration scripts

The break narration scripts are already embedded in:

```text
build/breaks.js
```

For each break, record the `narration` field in each step, in sequence.

Record as:

1. `eyes.mp3` — all `BREAKS.eyes.steps[].narration`
2. `shoulders.mp3` — all `BREAKS.shoulders.steps[].narration`
3. `stand.mp3` — all `BREAKS.stand.steps[].narration`
4. `breathe.mp3` — all `BREAKS.breathe.steps[].narration`
5. `posture.mp3` — all `BREAKS.posture.steps[].narration`

Recommended recording style:

- Leave 1.0–1.5 seconds between instructions
- Do not read source citations aloud
- Do not add music
- Do not add “welcome back” or “namaste” style language
- Keep it practical and physical

## Lunch Break Learning scripts

The 20 full scripts are already embedded in:

```text
build/learning.js
```

For each episode, record the `transcript` field exactly as written.

Record as:

1. `lunch-001-3pm-crash.mp3`
2. `lunch-002-roman-decisions.mp3`
3. `lunch-003-box-breathing.mp3`
4. `lunch-004-chess-break.mp3`
5. `lunch-005-seneca-time.mp3`
6. `lunch-006-slumped-posture.mp3`
7. `lunch-007-negative-visualization.mp3`
8. `lunch-008-walking-thinking.mp3`
9. `lunch-009-churchill-change-work.mp3`
10. `lunch-010-attention-residue.mp3`
11. `lunch-011-seal-lesson.mp3`
12. `lunch-012-monks-repetition.mp3`
13. `lunch-013-physical-cues.mp3`
14. `lunch-014-pomodoro-principle.mp3`
15. `lunch-015-inner-citadel.mp3`
16. `lunch-016-screen-eyes.mp3`
17. `lunch-017-ma-space.mp3`
18. `lunch-018-scheduled-recovery.mp3`
19. `lunch-019-compound-breaks.mp3`
20. `lunch-020-one-next-action.mp3`

## Quality-control checklist

Before upload:

- [ ] File names exactly match the list above
- [ ] No background noise
- [ ] No clipped peaks
- [ ] Similar volume across all 25 files
- [ ] No accidental retakes left in audio
- [ ] Break files feel instructional and calm
- [ ] Learning files feel intelligent but accessible
- [ ] Total learning episode length remains roughly 3–5 minutes
- [ ] Audio files placed under `/build/audio/...`

## Future improvement

After proofing the first build, the app can be updated so break audio plays step-by-step against the live timer. For the current proof build, the scripts and file paths are prepared; final playback wiring should happen once audio files exist and can be tested against real durations.
