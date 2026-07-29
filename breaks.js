// breaks.js — The Daily Reset Break Definitions
// 5 break types. Each step has:
//   - duration    (seconds; drives the on-screen timer)
//   - instruction (short on-screen text)
//   - cues        [{ t, say, rate }] — spoken guidance placed across the WHOLE step.
//
// TWO PACES, PLATFORM-WIDE:
//   rate:'count'  → every spoken NUMBER (holds, reps, breathing) — one per second.
//   (no rate)     → general guidance at the calm default rate.
//
// NO DEAD AIR: each general line is written with enough words to FILL the
// seconds allotted to it (~1.5 words/sec at the slow speaking rate), so the
// voice talks through the gap instead of finishing early and going silent.
//
// `narration` (the studio recording script) is auto-derived from the cues.
//
// REUSABLE CLIPS: a step can optionally set `clipId: 'some-stable-id'`. Steps
// without one keep today's exact positional filename (auto-derived from the
// break id + step number) and behave exactly as before. When a future
// sequence variant repeats an exercise that already exists elsewhere (e.g.
// the same "20-20-20 rule" step reused across multiple Eyes sequences), give
// both steps the SAME clipId so tts-generate.js only generates and stores the
// audio once instead of duplicating it. Every step sharing a clipId MUST have
// identical `duration`/`cues` — tts-generate.js enforces this and throws a
// clear error at build time if they ever drift, since a shared clip silently
// carrying the wrong pacing for one of its sequences would be worse than not
// sharing it at all.

const COUNT_WORDS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

// Fluent per-step timeline builder.
function cues(duration) {
  let t = 0;
  const list = [];
  const api = {
    line(text, holdSeconds) {
      if (t < duration) list.push({ t, say: text });
      t += holdSeconds;
      return api;
    },
    // leadSeconds lets a multi-word lead ("Blink slowly.", "Roll your
    // shoulders.") get more than the 1-second slot a single word like "Hold"
    // or "Go." needs — squeezing a whole phrase into 1s forced a huge
    // playback speed-up when recorded, which is audibly robotic/glitchy.
    countdown(from, opts) {
      opts = opts || {};
      const leadSeconds = opts.leadSeconds || 1;
      if (opts.lead && t < duration) { list.push({ t, say: opts.lead, rate: 'count' }); t += leadSeconds; }
      for (let n = from; n >= 1; n--) {
        if (t < duration) list.push({ t, say: COUNT_WORDS[n - 1], rate: 'count' });
        t += 1;
      }
      return api;
    },
    // stepSeconds lets a specific count-up run slower than the platform's
    // normal one-per-second pace (default, unchanged everywhere it isn't
    // passed) — e.g. counting 10 slow blinks needs real time for each blink
    // to actually happen, not just for the number to be spoken.
    countup(to, opts) {
      opts = opts || {};
      const leadSeconds = opts.leadSeconds || 1;
      const stepSeconds = opts.stepSeconds || 1;
      if (opts.lead && t < duration) { list.push({ t, say: opts.lead, rate: 'count' }); t += leadSeconds; }
      for (let n = 1; n <= to; n++) {
        if (t < duration) list.push({ t, say: COUNT_WORDS[n - 1], rate: 'count' });
        t += stepSeconds;
      }
      return api;
    },
    build() { return list; }
  };
  return api;
}

// Box-breathing: a phase label or count word every second, for a WHOLE number
// of complete 4-4-4-4 cycles (16s each) — never a partial cycle. A duration
// that wasn't a clean multiple of 16 used to cut a step off mid-phase (often
// losing "breathe out" entirely) and then the next step restarted cold on
// "breathe in," which is what produced two "breathe in"s in a row with no
// "breathe out" between them. Every cycle now always completes in full, then
// an explicit spoken pause (not a raw stop) signals the step is done before
// the next one begins.
function boxBreathCues(cycles, pauseText, pauseSeconds) {
  const phaseLabel = ['Breathe in', 'Hold', 'Breathe out', 'Hold'];
  const list = [];
  const total = cycles * 16;
  for (let t = 0; t < total; t++) {
    const posInPhase = t % 4;
    const phase = Math.floor(t / 4) % 4;
    list.push({ t, say: posInPhase === 0 ? phaseLabel[phase] : COUNT_WORDS[posInPhase - 1], rate: 'count' });
  }
  list.push({ t: total, say: pauseText });
  return list;
}

const BREAKS = {
  eyes: {
    id: 'eyes',
    name: 'Eyes',
    duration: 93,
    icon: '👁',
    description: 'The 20-20-20 rule and palming technique to reduce digital eye strain.',
    source: '[S2] American Optometric Association',
    isFree: true,
    steps: [
      {
        duration: 12,
        instruction: 'Sit comfortably. Look straight ahead. Notice any tension around your eyes.',
        cues: cues(12)
          .line('Sit comfortably in your chair, and look straight ahead of you.', 5)
          .line('Notice any tension around your eyes, in those small hardworking muscles.', 5)
          .line('Let them soften now.', 2)
          .build()
      },
      {
        duration: 15,
        instruction: 'Look at something 20 feet away (or as far as possible) for 20 seconds.',
        cues: cues(15)
          .line('Find something far away — across the room, or out a window.', 5)
          .line('Rest your eyes on it, and let your focus go completely soft.', 5)
          .line('Keep gazing into the distance.', 3)
          .line('A few seconds more.', 2)
          .build()
      },
      {
        duration: 19,
        instruction: 'Close your eyes. Place your palms gently over them without pressure. Breathe slowly.',
        cues: cues(19)
          .line('Now close your eyes gently.', 3)
          .line('Cup your palms over them softly — no pressure, just darkness.', 4)
          .line('Feel the warmth of your hands relaxing the muscles around your eyes.', 4)
          .line('Breathe slowly. In through your nose... and slowly out again.', 5)
          .line('Stay in the dark a moment longer.', 3)
          .build()
      },
      {
        duration: 18,
        instruction: 'With eyes still closed, look up, down, left, right. Repeat 3 times slowly.',
        cues: cues(18)
          .line('Keep your eyes closed now.', 2)
          .line('Slowly look up... and then down.', 3)
          .line("Now look left... and then right. That's round one.", 5)
          .line('Round two — up... down... left... and right.', 5)
          .line('Last round, nice and slow. Then rest.', 3)
          .build()
      },
      {
        duration: 29,
        instruction: 'Open your eyes. Blink slowly 10 times. Notice the difference.',
        cues: cues(29)
          .line('Gently open your eyes again.', 4)
          .countup(10, { lead: 'Blink slowly.', leadSeconds: 2, stepSeconds: 1.5 })
          .line('Notice the difference in how your eyes feel.', 5)
          .line('Clarity. Moisture. Ease.', 3)
          .build()
      }
    ],
    closingQuote: { useFromLibrary: true, category: 'focus' }
  },

  shoulders: {
    id: 'shoulders',
    name: 'Shoulders',
    duration: 166,
    icon: '👐',
    description: 'Seated tension release for trapezius and neck. Reverses forward-head strain.',
    source: '[S3] Hansraj, Surgical Technology International (2014)',
    isFree: false,
    steps: [
      {
        duration: 14,
        instruction: 'Sit tall. Feet flat. Let your arms hang loose. Notice where you hold tension.',
        cues: cues(14)
          .line('Sit tall in your chair, with both feet flat on the floor.', 4)
          .line('Let your arms hang loose and heavy by your sides.', 4)
          .line("Notice where you're holding tension.", 3)
          .line("We'll release it piece by piece.", 3)
          .build()
      },
      {
        duration: 29,
        instruction: 'Lift shoulders toward ears. Hold 5 seconds. Drop suddenly. Repeat 3 times.',
        cues: cues(29)
          .line('Lift both shoulders up toward your ears, and squeeze.', 4)
          .countdown(5, { lead: 'Hold' })
          .line('And drop.', 2)
          .countdown(5, { lead: 'Hold' })
          .line('And drop.', 2)
          .countdown(5, { lead: 'Hold' })
          .line('And drop. Well done.', 3)
          .build()
      },
      {
        duration: 30,
        instruction: 'Roll shoulders backward slowly — 5 full rotations. Then forward — 5 rotations.',
        cues: cues(30)
          .line('Roll your shoulders backward.', 3)
          .countup(5)
          .line('Now forward.', 2)
          .countup(5)
          .line('Keep the circles big and slow, as large as they can go.', 5)
          .line('Feel the trapezius muscles loosening with every single slow rotation you make.', 5)
          .line('Let the last of the stiffness go. Your shoulders are waking up.', 5)
          .build()
      },
      {
        duration: 30,
        instruction: 'Tilt head right (ear toward shoulder). Hold 10 sec. Switch sides.',
        cues: cues(30)
          .line('Tilt your head to the right.', 3)
          .countdown(10, { lead: 'Hold' })
          .line('Now tilt to the left.', 3)
          .countdown(10, { lead: 'Hold' })
          .line('Back to center.', 2)
          .build()
      },
      {
        duration: 38,
        instruction: 'Interlace fingers behind head. Gently press head back into hands. Hold 10 sec. Release. Repeat 2 times.',
        cues: cues(38)
          .line('Press the back of your head into your hands.', 5)
          .countdown(10, { lead: 'Hold' })
          .line('And release. Rest a moment.', 3)
          .line('Once more.', 2)
          .countdown(10, { lead: 'Hold' })
          .line('And release completely.', 2)
          .line('Feel how much lighter your neck is.', 4)
          .build()
      },
      {
        duration: 12,
        instruction: 'Sit tall. Roll shoulders back and down. Let them settle. Breathe.',
        cues: cues(12)
          .line('Now sit tall once again.', 2)
          .line('Roll your shoulders back and down.', 3)
          .line('Let them settle into their natural place.', 3)
          .line('Notice the space between your ears and shoulders.', 4)
          .build()
      },
      {
        duration: 13,
        instruction: 'Final breath. Inhale through nose, exhale through mouth. Ready to continue.',
        cues: cues(13)
          .line('One final breath together now.', 3)
          .line('Breathe in slowly through your nose.', 3)
          .line('And let it out through your mouth.', 3)
          .line('Shoulders lower, neck longer. Ready to continue your day.', 4)
          .build()
      }
    ],
    closingQuote: { useFromLibrary: true, category: 'tension' }
  },

  stand: {
    id: 'stand',
    name: 'Stand',
    duration: 103,
    icon: '🧍',
    description: 'Two-minute standing reset with hip extension. Restores circulation and alertness.',
    source: '[S4] Harvard Health / sedentary behaviour research',
    isFree: false,
    steps: [
      {
        duration: 11,
        instruction: 'Stand up. Plant feet hip-width apart. Feel the floor.',
        cues: cues(11)
          .line('Stand up out of your chair.', 3)
          .line('Plant your feet hip-width apart.', 3)
          .line('Feel the solid floor beneath you.', 3)
          .line('Settle your weight evenly.', 2)
          .build()
      },
      {
        duration: 18,
        instruction: 'Rise onto toes, lower. Repeat 5 times, following the count.',
        cues: cues(18)
          .line('Rise up onto your toes.', 4)
          .countup(5, { lead: 'Go.' })
          .line('And again at your own pace — up and down, pumping blood up from your calves.', 8)
          .build()
      },
      {
        duration: 25,
        instruction: 'Step one foot back into a lunge. Feel the hip stretch. Hold 10 sec. Switch sides.',
        cues: cues(25)
          .line('Step one foot back.', 2)
          .countdown(10, { lead: 'Hold' })
          .line('Switch.', 1)
          .countdown(10, { lead: 'Hold' })
          .build()
      },
      {
        duration: 20,
        instruction: 'Stand tall. Reach both arms overhead. Stretch upward. Hold 10 sec.',
        cues: cues(20)
          .line('Reach both arms up overhead.', 4)
          .countdown(10, { lead: 'Hold' })
          .line('And slowly lower your arms.', 5)
          .build()
      },
      {
        duration: 16,
        instruction: 'Arms down. Shake out hands and arms. Roll shoulders 3 times.',
        cues: cues(16)
          .line('Shake out your hands and arms.', 4)
          .line('Loose and floppy, like rubber.', 3)
          .countup(3, { lead: 'Roll your shoulders.', leadSeconds: 2 })
          .line('And let everything settle.', 4)
          .build()
      },
      {
        duration: 13,
        instruction: 'Stand still. Breathe deeply 3 times. Notice your alertness.',
        cues: cues(13)
          .line('Stand still now.', 2)
          .line('Breathe in deeply.', 2)
          .line('And breathe out.', 2)
          .line('Again — breathe in.', 2)
          .line('And out.', 2)
          .line("Notice the alertness. That's two minutes well spent.", 3)
          .build()
      }
    ],
    closingQuote: { useFromLibrary: true, category: 'movement' }
  },

  breathe: {
    id: 'breathe',
    name: 'Breathe',
    duration: 227,
    icon: '🌬',
    description: 'Box breathing 4-4-4-4. Used by Navy SEALs. Validated for acute stress reduction.',
    source: '[S5] Jerath et al., Medical Hypotheses (2006)',
    isFree: true,
    steps: [
      {
        duration: 11,
        instruction: 'Sit comfortably. Feet flat. Hands resting on thighs. Close your eyes if comfortable.',
        cues: cues(11)
          .line('Sit comfortably and settle in.', 2)
          .line('Feet flat on the floor, hands resting on your thighs.', 3)
          .line('Close your eyes if that feels comfortable.', 4)
          .line('Here we go.', 2)
          .build()
      },
      { duration: 51, instruction: 'Follow the count. Inhale 4 → Hold 4 → Exhale 4 → Hold 4.', cues: boxBreathCues(3, 'Relax for a moment.', 3) },
      { duration: 51, instruction: 'Same steady rhythm. Let the breath slow naturally.', cues: boxBreathCues(3, 'Relax for a moment.', 3) },
      { duration: 51, instruction: 'Notice your heart rate. It should be slowing.', cues: boxBreathCues(3, 'Relax for a moment.', 3) },
      { duration: 51, instruction: 'Smooth, even breaths. The box is steady.', cues: boxBreathCues(3, 'Relax for a moment.', 3) },
      {
        duration: 12,
        instruction: 'Return to natural breathing. Open eyes. Notice the calm.',
        cues: cues(12)
          .line('Let your breathing return to its own natural rhythm.', 4)
          .line('Gently open your eyes.', 3)
          .line("Notice the calm you've created.", 3)
          .line('Carry it into your day.', 2)
          .build()
      }
    ],
    closingQuote: { useFromLibrary: true, category: 'calm' }
  },

  posture: {
    id: 'posture',
    name: 'Posture',
    duration: 161,
    icon: '🪑',
    description: 'Forward-head correction with chin tucks and scapular retraction. Opens the diaphragm.',
    source: '[S6] Kolar et al., Clinical Biomechanics (2012)',
    isFree: false,
    steps: [
      {
        duration: 12,
        instruction: 'Sit tall. Feet flat. Notice your head position — is it forward?',
        cues: cues(12)
          .line('Sit tall, with both feet flat on the floor.', 3)
          .line('Notice the position of your head right now.', 3)
          .line('Is it drifting forward toward the screen?', 3)
          .line("Let's bring it back home.", 3)
          .build()
      },
      {
        duration: 45,
        instruction: 'Chin tuck: Pull chin straight back (make a double chin). Hold 5 sec. Release. Repeat 5 times.',
        cues: cues(45)
          .line('Pull your chin straight back — make a double chin.', 4)
          .countdown(5, { lead: 'Hold' })
          .line('Release.', 2)
          .countdown(5, { lead: 'Hold' })
          .line('Release.', 2)
          .countdown(5, { lead: 'Hold' })
          .line('Release.', 2)
          .countdown(5, { lead: 'Hold' })
          .line('Release.', 2)
          .countdown(5, { lead: 'Hold' })
          .line('Release. Well done.', 3)
          .build()
      },
      {
        duration: 45,
        instruction: 'Scapular retraction: Squeeze shoulder blades together. Hold 5 sec. Release. Repeat 5 times.',
        cues: cues(45)
          .line('Squeeze your shoulder blades together and down.', 4)
          .countdown(5, { lead: 'Hold' })
          .line('Release.', 2)
          .countdown(5, { lead: 'Hold' })
          .line('Release.', 2)
          .countdown(5, { lead: 'Hold' })
          .line('Release.', 2)
          .countdown(5, { lead: 'Hold' })
          .line('Release.', 2)
          .countdown(5, { lead: 'Hold' })
          .line('Release. Let your shoulders settle.', 3)
          .build()
      },
      {
        duration: 25,
        instruction: 'Wall angel: Sit with back against chair. Arms out to sides, slide up and down 5 times.',
        cues: cues(25)
          .line('Sit back against your chair, arms out to the sides.', 4)
          .line('Elbows bent, like a goalpost.', 4)
          .countup(5, { lead: 'Go.' })
          .line('Nice and slow, keep them moving.', 4)
          .line('One more set.', 2)
          .countup(5)
          .build()
      },
      {
        duration: 22,
        instruction: 'Sit tall. Place one hand on belly. Breathe into belly 5 times (diaphragmatic breathing).',
        cues: cues(22)
          .line('Rest one hand gently on your belly.', 8)
          .line('Breathe in.', 1)
          .line('And out.', 1)
          .line('Again — in.', 1)
          .line('And out.', 1)
          .line('Keep it going — in.', 2)
          .line('And out.', 1)
          .line('One more — in.', 2)
          .line('And out.', 1)
          .line('Last one — in.', 2)
          .line('And out. Well done.', 2)
          .build()
      },
      {
        duration: 12,
        instruction: 'Sit tall. Roll shoulders back and down. Settle. Notice the openness.',
        cues: cues(12)
          .line('Sit tall again.', 2)
          .line('Roll your shoulders back and down.', 3)
          .line('Let everything settle.', 3)
          .line('Notice the openness in your chest.', 2)
          .line('Take this posture with you.', 2)
          .build()
      }
    ],
    closingQuote: { useFromLibrary: true, category: 'posture' }
  }
};

// Derive `narration` for each step from its cues (studio recording script).
Object.values(BREAKS).forEach(b => {
  b.steps.forEach(step => {
    if (step.cues && !step.narration) {
      step.narration = step.cues.map(c => c.say).join(' ');
    }
  });
});

if (typeof window !== 'undefined') {
  window.BREAKS = BREAKS;
}
