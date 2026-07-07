# Pre-Recorded Audio Guide — The Daily Reset

The app now has an audio engine (`audio.js`) that plays **pre-recorded MP3s first** and only falls back to the browser's built-in voice when a recording doesn't exist. Once the MP3s are in place, every customer hears the same high-quality narration on any computer.

## Where the scripts are

All 47 narration scripts (break steps + learning episodes) are in `script-review.html` — open it in a browser to read or listen to each one before recording. The same text lives in `breaks.js` (per-step `narration`) and `learning.js` (per-episode `transcript`).

## Recording checklist

Generate with ElevenLabs (decided 2026-07-05) or any studio source. Export MP3, one file per script, two voices (female + male) if both narrator options should be studio-quality.

### File names (must match exactly)

| Content | Path | Count |
|---|---|---|
| Eyes break steps | `audio/breaks/eyes-step1-<g>.mp3` … `eyes-step5-<g>.mp3` | 5 per voice |
| Shoulders break steps | `audio/breaks/shoulders-step1-<g>.mp3` … `shoulders-step7-<g>.mp3` | 7 per voice |
| Stand break steps | `audio/breaks/stand-step1-<g>.mp3` … `stand-step6-<g>.mp3` | 6 per voice |
| Breathe break steps | `audio/breaks/breathe-step1-<g>.mp3` … `breathe-step6-<g>.mp3` | 6 per voice |
| Posture break steps | `audio/breaks/posture-step1-<g>.mp3` … `posture-step6-<g>.mp3` | 6 per voice |
| Midpoint cue ("Keep going.") | `audio/breaks/keep-going-<g>.mp3` | 1 per voice |
| Learning episodes | `audio/learning/lunch-001-<g>.mp3` … `lunch-022-<g>.mp3` | 22 per voice |

`<g>` = `female` or `male`. Total: 53 files per voice.

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
