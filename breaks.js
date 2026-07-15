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
    countup(to, opts) {
      opts = opts || {};
      const leadSeconds = opts.leadSeconds || 1;
      if (opts.lead && t < duration) { list.push({ t, say: opts.lead, rate: 'count' }); t += leadSeconds; }
      for (let n = 1; n <= to; n++) {
        if (t < duration) list.push({ t, say: COUNT_WORDS[n - 1], rate: 'count' });
        t += 1;
      }
      return api;
    },
    build() { return list; }
  };
  return api;
}

// Box-breathing: a phase label or count word EVERY second for the whole cycle.
function boxBreathCues(duration) {
  const phaseLabel = ['Breathe in', 'Hold', 'Breathe out', 'Hold'];
  const list = [];
  for (let t = 0; t < duration; t++) {
    const posInPhase = t % 4;
    const phase = Math.floor(t / 4) % 4;
    list.push({ t, say: posInPhase === 0 ? phaseLabel[phase] : COUNT_WORDS[posInPhase - 1], rate: 'count' });
  }
  return list;
}

const BREAKS = {
  eyes: {
    id: 'eyes',
    name: 'Eyes',
    duration: 180,
    icon: '👁',
    description: 'The 20-20-20 rule and palming technique to reduce digital eye strain.',
    source: '[S2] American Optometric Association',
    isFree: true,
    steps: [
      {
        duration: 15,
        instruction: 'Sit comfortably. Look straight ahead. Notice any tension around your eyes.',
        cues: cues(15)
          .line('Sit comfortably in your chair, and look straight ahead of you.', 6)
          .line('Notice any tension around your eyes, in those small hardworking muscles.', 6)
          .line('Let them soften now.', 3)
          .build()
      },
      {
        duration: 20,
        instruction: 'Look at something 20 feet away (or as far as possible) for 20 seconds.',
        cues: cues(20)
          .line('Find something far away — across the room, or out a window.', 6)
          .line('Rest your eyes on it, and let your focus go completely soft.', 7)
          .line('Keep gazing into the distance.', 4)
          .line('A few seconds more.', 3)
          .build()
      },
      {
        duration: 30,
        instruction: 'Close your eyes. Place your palms gently over them without pressure. Breathe slowly.',
        cues: cues(30)
          .line('Now close your eyes gently.', 4)
          .line('Cup your palms over them softly — no pressure, just darkness.', 7)
          .line('Feel the warmth of your hands relaxing the muscles around your eyes.', 7)
          .line('Breathe slowly. In through your nose... and slowly out again.', 7)
          .line('Stay in the dark a moment longer.', 5)
          .build()
      },
      {
        duration: 30,
        instruction: 'With eyes still closed, look up, down, left, right. Repeat 3 times slowly.',
        cues: cues(30)
          .line('Keep your eyes closed now.', 4)
          .line('Slowly look up... and then down.', 6)
          .line("Now look left... and then right. That's round one.", 7)
          .line('Round two — up... down... left... and right.', 7)
          .line('Last round, nice and slow. Then rest.', 6)
          .build()
      },
      {
        duration: 26,
        instruction: 'Open your eyes. Blink slowly 10 times. Notice the difference.',
        cues: cues(26)
          .line('Gently open your eyes again.', 4)
          .countup(10, { lead: 'Blink slowly.', leadSeconds: 2 })
          .line('Notice the difference in how your eyes feel.', 6)
          .line('Clarity. Moisture. Ease.', 4)
          .build()
      }
    ],
    closingQuote: { useFromLibrary: true, category: 'focus' }
  },

  shoulders: {
    id: 'shoulders',
    name: 'Shoulders',
    duration: 240,
    icon: '👐',
    description: 'Seated tension release for trapezius and neck. Reverses forward-head strain.',
    source: '[S3] Hansraj, Surgical Technology International (2014)',
    isFree: false,
    steps: [
      {
        duration: 20,
        instruction: 'Sit tall. Feet flat. Let your arms hang loose. Notice where you hold tension.',
        cues: cues(20)
          .line('Sit tall in your chair, with both feet flat on the floor.', 6)
          .line('Let your arms hang loose and heavy by your sides.', 6)
          .line("Notice where you're holding tension.", 4)
          .line("We'll release it piece by piece.", 4)
          .build()
      },
      {
        duration: 30,
        instruction: 'Lift shoulders toward ears. Hold 5 seconds. Drop suddenly. Repeat 3 times.',
        cues: cues(30)
          .line('Lift both shoulders up toward your ears, and squeeze.', 5)
          .countdown(5, { lead: 'Hold' })
          .line('And drop. Let go.', 2)
          .line('Again.', 2)
          .countdown(5, { lead: 'Hold' })
          .line('And drop.', 2)
          .line('Last one.', 1)
          .countdown(5, { lead: 'Hold' })
          .build()
      },
      {
        duration: 40,
        instruction: 'Roll shoulders backward slowly — 5 full rotations. Then forward — 5 rotations.',
        cues: cues(40)
          .line('Roll your shoulders backward.', 3)
          .countup(5)
          .line('Now forward.', 2)
          .countup(5)
          .line('Keep the circles big and slow, as large as they can go.', 8)
          .line('Feel the trapezius muscles loosening with every single slow rotation you make.', 8)
          .line('Let the last of the stiffness go. Your shoulders are waking up.', 9)
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
        duration: 40,
        instruction: 'Interlace fingers behind head. Gently press head back into hands. Hold 10 sec. Release. Repeat 2 times.',
        cues: cues(40)
          .line('Press the back of your head into your hands.', 5)
          .countdown(10, { lead: 'Hold' })
          .line('And release. Rest a moment.', 3)
          .line('Once more.', 2)
          .countdown(10, { lead: 'Hold' })
          .line('And release completely.', 3)
          .line('Feel how much lighter your neck is.', 5)
          .build()
      },
      {
        duration: 20,
        instruction: 'Sit tall. Roll shoulders back and down. Let them settle. Breathe.',
        cues: cues(20)
          .line('Now sit tall once again.', 4)
          .line('Roll your shoulders back and down.', 5)
          .line('Let them settle into their natural place.', 5)
          .line('Notice the space between your ears and shoulders.', 6)
          .build()
      },
      {
        duration: 20,
        instruction: 'Final breath. Inhale through nose, exhale through mouth. Ready to continue.',
        cues: cues(20)
          .line('One final breath together now.', 4)
          .line('Breathe in slowly through your nose.', 5)
          .line('And let it out through your mouth.', 5)
          .line('Shoulders lower, neck longer. Ready to continue your day.', 6)
          .build()
      }
    ],
    closingQuote: { useFromLibrary: true, category: 'tension' }
  },

  stand: {
    id: 'stand',
    name: 'Stand',
    duration: 120,
    icon: '🧍',
    description: 'Two-minute standing reset with hip extension. Restores circulation and alertness.',
    source: '[S4] Harvard Health / sedentary behaviour research',
    isFree: false,
    steps: [
      {
        duration: 15,
        instruction: 'Stand up. Plant feet hip-width apart. Feel the floor.',
        cues: cues(15)
          .line('Stand up out of your chair.', 4)
          .line('Plant your feet hip-width apart.', 4)
          .line('Feel the solid floor beneath you.', 4)
          .line('Settle your weight evenly.', 3)
          .build()
      },
      {
        duration: 20,
        instruction: 'Rise onto toes, lower. Repeat 5 times, following the count.',
        cues: cues(20)
          .line('Rise up onto your toes.', 4)
          .countup(5, { lead: 'Go.' })
          .line('And again at your own pace — up and down, pumping blood up from your calves.', 10)
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
        duration: 21,
        instruction: 'Arms down. Shake out hands and arms. Roll shoulders 3 times.',
        cues: cues(21)
          .line('Shake out your hands and arms.', 5)
          .line('Loose and floppy, like rubber.', 5)
          .countup(3, { lead: 'Roll your shoulders.', leadSeconds: 2 })
          .line('And let everything settle.', 6)
          .build()
      },
      {
        duration: 20,
        instruction: 'Stand still. Breathe deeply 3 times. Notice your alertness.',
        cues: cues(20)
          .line('Stand still now.', 3)
          .line('Breathe in deeply.', 3)
          .line('And breathe out.', 3)
          .line('Again — breathe in.', 3)
          .line('And out.', 3)
          .line("Notice the alertness. That's two minutes well spent.", 5)
          .build()
      }
    ],
    closingQuote: { useFromLibrary: true, category: 'movement' }
  },

  breathe: {
    id: 'breathe',
    name: 'Breathe',
    duration: 240,
    icon: '🌬',
    description: 'Box breathing 4-4-4-4. Used by Navy SEALs. Validated for acute stress reduction.',
    source: '[S5] Jerath et al., Medical Hypotheses (2006)',
    isFree: true,
    steps: [
      {
        duration: 20,
        instruction: 'Sit comfortably. Feet flat. Hands resting on thighs. Close your eyes if comfortable.',
        cues: cues(20)
          .line('Sit comfortably and settle in.', 4)
          .line('Feet flat on the floor, hands resting on your thighs.', 6)
          .line('Close your eyes if that feels comfortable.', 6)
          .line('Here we go.', 4)
          .build()
      },
      { duration: 40, instruction: 'Follow the count. Inhale 4 → Hold 4 → Exhale 4 → Hold 4.', cues: boxBreathCues(40) },
      { duration: 40, instruction: 'Same steady rhythm. Let the breath slow naturally.', cues: boxBreathCues(40) },
      { duration: 40, instruction: 'Notice your heart rate. It should be slowing.', cues: boxBreathCues(40) },
      { duration: 40, instruction: 'Smooth, even breaths. The box is steady.', cues: boxBreathCues(40) },
      {
        duration: 20,
        instruction: 'Return to natural breathing. Open eyes. Notice the calm.',
        cues: cues(20)
          .line('Let your breathing return to its own natural rhythm.', 6)
          .line('Gently open your eyes.', 5)
          .line("Notice the calm you've created.", 5)
          .line('Carry it into your day.', 4)
          .build()
      }
    ],
    closingQuote: { useFromLibrary: true, category: 'calm' }
  },

  posture: {
    id: 'posture',
    name: 'Posture',
    duration: 180,
    icon: '🪑',
    description: 'Forward-head correction with chin tucks and scapular retraction. Opens the diaphragm.',
    source: '[S6] Kolar et al., Clinical Biomechanics (2012)',
    isFree: false,
    steps: [
      {
        duration: 20,
        instruction: 'Sit tall. Feet flat. Notice your head position — is it forward?',
        cues: cues(20)
          .line('Sit tall, with both feet flat on the floor.', 5)
          .line('Notice the position of your head right now.', 5)
          .line('Is it drifting forward toward the screen?', 5)
          .line("Let's bring it back home.", 5)
          .build()
      },
      {
        duration: 30,
        instruction: 'Chin tuck: Pull chin straight back (make a double chin). Hold 5 sec. Release. Repeat 5 times.',
        cues: cues(30)
          .line('Chin tucks.', 2)
          .countdown(5, { lead: 'Hold' })
          .countdown(5)
          .countdown(5, { lead: 'Again' })
          .countdown(5)
          .countdown(5)
          .line('Release.', 1)
          .build()
      },
      {
        duration: 30,
        instruction: 'Scapular retraction: Squeeze shoulder blades together. Hold 5 sec. Release. Repeat 5 times.',
        cues: cues(30)
          .line('Squeeze your shoulder blades together.', 3)
          .countdown(5, { lead: 'Hold' })
          .countdown(5)
          .countdown(5, { lead: 'Again' })
          .countdown(5)
          .countdown(5)
          .build()
      },
      {
        duration: 30,
        instruction: 'Wall angel: Sit with back against chair. Arms out to sides, slide up and down 5 times.',
        cues: cues(30)
          .line('Sit back against your chair, arms out to the sides.', 5)
          .line('Elbows bent, like a goalpost.', 5)
          .countup(5, { lead: 'Go.' })
          .line('Nice and slow, keep them moving.', 6)
          .line('One more set.', 3)
          .countup(5)
          .build()
      },
      {
        duration: 30,
        instruction: 'Sit tall. Place one hand on belly. Breathe into belly 5 times (diaphragmatic breathing).',
        cues: cues(30)
          .line('Rest one hand gently on your belly.', 5)
          .line('Breathe in.', 3)
          .line('And out.', 3)
          .line('Again — in.', 3)
          .line('And out.', 3)
          .line('Keep it going — in.', 4)
          .line('And out.', 3)
          .line('Two more slow belly breaths on your own.', 6)
          .build()
      },
      {
        duration: 20,
        instruction: 'Sit tall. Roll shoulders back and down. Settle. Notice the openness.',
        cues: cues(20)
          .line('Sit tall again.', 3)
          .line('Roll your shoulders back and down.', 5)
          .line('Let everything settle.', 4)
          .line('Notice the openness in your chest.', 4)
          .line('Take this posture with you.', 4)
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
