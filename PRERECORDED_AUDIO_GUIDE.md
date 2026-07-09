# Pre-Recorded Audio Guide — The Daily Reset

The app now has an audio engine (`audio.js`) that plays **pre-recorded MP3s first** and only falls back to the browser's built-in voice when a recording doesn't exist. Once the MP3s are in place, every customer hears the same high-quality narration on any computer.

## Where the scripts are

The narration scripts (break steps + learning episodes) are in `script-review.html` — open it in a browser to read or listen to each one before recording. The same text lives in `breaks.js` (per-step `narration`, auto-built from the timed `cues`) and `learning.js` (per-episode `transcript`).

## Pacing the performance (the app never changes the speed of a recording)

A recorded MP3 plays back **exactly as performed** — the app does not speed it up or slow it down. So the pace lives entirely in the recording. There are exactly two paces on this platform, used consistently everywhere:

- **The counting pace — one number per second, every time a number is spoken.** This applies to every hold ("Hold… five, four, three, two, one"), every rep count ("one… two… three…"), and the breathing count. It is the SAME pace in Shoulders, Stand, Posture, Eyes, and Breathe — there is only one "counting voice" on the platform, not a different speed per exercise. In `breaks.js`, any cue with `rate: 'count'` is part of this — its `t` value is the exact second it lands on.
- **General guidance — calm and unhurried**, noticeably slower than normal conversation, with small pauses between sentences. Think guided-relaxation, not a briefing. This is everything else: setup lines, transitions, closing lines. In `breaks.js` these are the cues with no `rate` field.

When recording a step, treat every `rate: 'count'` cue as a metronome beat — land each number on its own second — and read the general-guidance lines in between at the slower, calmer pace. The two paces should feel clearly different from each other: crisp counting vs. relaxed coaching.

## Important: each break-step recording must fill its step's time

Each break step now has a **continuous cue timeline** in `breaks.js` — the voice counts holds down, cues every repeat, and keeps the breath count going, so there is never a long silence. When recording a step, read its full script (the joined `cues`) at a pace that **fills the step's `duration`** listed in `breaks.js`, using the `t` values as timing marks. That way the studio audio lines up with the on-screen timer. (The browser-voice fallback already fires each cue at its `t` automatically, so you can preview the intended pacing by running the break with narration on before recording.)

## Recording checklist

Generate with ElevenLabs (decided 2026-07-05) or any studio source. Export MP3, one file per step / episode, two voices (female + male) if both narrator options should be studio-quality.

### File names (must match exactly)

| Content | Path | Count |
|---|---|---|
| Eyes break steps | `audio/breaks/eyes-step1-<g>.mp3` … `eyes-step5-<g>.mp3` | 5 per voice |
| Shoulders break steps | `audio/breaks/shoulders-step1-<g>.mp3` … `shoulders-step7-<g>.mp3` | 7 per voice |
| Stand break steps | `audio/breaks/stand-step1-<g>.mp3` … `stand-step6-<g>.mp3` | 6 per voice |
| Breathe break steps | `audio/breaks/breathe-step1-<g>.mp3` … `breathe-step6-<g>.mp3` | 6 per voice |
| Posture break steps | `audio/breaks/posture-step1-<g>.mp3` … `posture-step6-<g>.mp3` | 6 per voice |
| Learning episodes | `audio/learning/lunch-001-<g>.mp3` … `lunch-022-<g>.mp3` | 22 per voice |

`<g>` = `female` or `male`. Total: 52 files per voice (30 break steps + 22 episodes). There is no longer a separate "keep going" clip — that guidance is built into each step's script.

## After adding files — 2 steps

1. Drop the MP3s into `audio/breaks/` and `audio/learning/`.
2. From the build folder run:
   ```
   ./update-audio-manifest.sh
   ```
   This regenerates `audio-manifest.js`. Then commit and push — Vercel redeploys.

That's it. No other code changes. Partial coverage is fine: any recording that exists plays as studio audio; anything missing uses the device voice. The player shows which source is active ("Studio audio" / "Device voice") so you can verify at a glance.

## Learning episodes get real audio controls

When an episode MP3 exists, the learning player switches from the transcript-timer to a real audio player: progress tracks the actual file, and pause/resume picks up exactly where the listener left off — even across visits.
