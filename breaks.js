// breaks.js — The Daily Reset Break Definitions
// 5 break types, each with timed steps, instructions, and narration scripts
// Narration is text-only for MVP; will be replaced by audio file paths

const BREAKS = {
  eyes: {
    id: 'eyes',
    name: 'Eyes',
    duration: 180, // 3 minutes total
    icon: '👁',
    description: 'The 20-20-20 rule and palming technique to reduce digital eye strain.',
    source: '[S2] American Optometric Association',
    isFree: true,
    steps: [
      {
        duration: 15,
        instruction: 'Sit comfortably. Look straight ahead. Notice any tension around your eyes.',
        narration: 'Sit comfortably and look straight ahead. Just notice any tension around your eyes — the small muscles that have been locked in focus for the last hour or two.'
      },
      {
        duration: 20,
        instruction: 'Look at something 20 feet away (or as far as possible) for 20 seconds.',
        narration: 'Now look at something 20 feet away — or as far as your space allows. Hold for 20 seconds. Let your eye muscles fully relax into the distance.'
      },
      {
        duration: 30,
        instruction: 'Close your eyes. Place your palms gently over them without pressure. Breathe slowly.',
        narration: 'Close your eyes. Cup your palms gently over them — no pressure, just blocking the light. Breathe slowly. Let the warmth of your hands relax the muscles around your eyes.'
      },
      {
        duration: 30,
        instruction: 'With eyes still closed, look up, down, left, right. Repeat 3 times slowly.',
        narration: 'Keeping your eyes closed, look up, then down, then left, then right. Slowly. Do this three times. This keeps the muscles that control eye movement active and mobile.'
      },
      {
        duration: 25,
        instruction: 'Open your eyes. Blink slowly 10 times. Notice the difference.',
        narration: 'Open your eyes. Blink slowly ten times. Notice the difference — the clarity, the moisture, the release of tension.'
      }
    ],
    closingQuote: {
      useFromLibrary: true,
      category: 'focus'
    }
  },

  shoulders: {
    id: 'shoulders',
    name: 'Shoulders',
    duration: 240, // 4 minutes
    icon: 'Shoulders',
    description: 'Seated tension release for trapezius and neck. Reverses forward-head strain.',
    source: '[S3] Hansraj, Surgical Technology International (2014)',
    isFree: false,
    steps: [
      {
        duration: 20,
        instruction: 'Sit tall. Feet flat. Let your arms hang loose. Notice where you hold tension.',
        narration: 'Sit tall, feet flat on the floor. Let your arms hang loose. Notice where you hold tension — most of us carry it in the shoulders and neck without realising.'
      },
      {
        duration: 30,
        instruction: 'Lift shoulders toward ears. Hold 5 seconds. Drop suddenly. Repeat 3 times.',
        narration: 'Lift both shoulders up toward your ears. Hold for five seconds — really feel the tension build. Then drop them suddenly. Let them fall. Do this three times. The contrast teaches your muscles what "relaxed" actually feels like.'
      },
      {
        duration: 40,
        instruction: 'Roll shoulders backward slowly — 5 full rotations. Then forward — 5 rotations.',
        narration: 'Now roll your shoulders backward slowly. Five full rotations, making the circle as large as you can. Then reverse — five rotations forward. This mobilises the shoulder joint and releases the trapezius.'
      },
      {
        duration: 30,
        instruction: 'Tilt head right (ear toward shoulder). Hold 10 sec. Switch sides. Repeat 2x each side.',
        narration: 'Tilt your head to the right — ear toward shoulder, not turning. Hold for ten seconds. Feel the stretch along the left side of your neck. Switch sides. Do this twice on each side.'
      },
      {
        duration: 40,
        instruction: 'Interlace fingers behind head. Gently press head back into hands. Hold 10 sec. Release. Repeat 3x.',
        narration: 'Interlace your fingers behind your head. Gently press the back of your head into your hands — your hands resist. Hold for ten seconds. This strengthens the deep neck flexors that counter forward-head posture. Release. Repeat three times.'
      },
      {
        duration: 20,
        instruction: 'Sit tall. Roll shoulders back and down. Let them settle. Breathe.',
        narration: 'Sit tall. Roll your shoulders back and down. Let them settle into a natural position. Take a breath. Notice the space between your ears and shoulders — that space is your tension gauge.'
      },
      {
        duration: 20,
        instruction: 'Final breath. Inhale through nose, exhale through mouth. Ready to continue.',
        narration: 'One final breath. Inhale through the nose, exhale through the mouth. Your shoulders are lower, your neck is longer. Ready to continue.'
      }
    ],
    closingQuote: {
      useFromLibrary: true,
      category: 'tension'
    }
  },

  stand: {
    id: 'stand',
    name: 'Stand',
    duration: 120, // 2 minutes
    icon: '🧍',
    description: 'Two-minute standing reset with hip extension. Restores circulation and alertness.',
    source: '[S4] Harvard Health / sedentary behaviour research',
    isFree: false,
    steps: [
      {
        duration: 15,
        instruction: 'Stand up. Plant feet hip-width apart. Feel the floor.',
        narration: 'Stand up. Plant your feet hip-width apart. Feel the floor — the solid ground under you. You\'ve been sitting, and your body needs to remember what standing feels like.'
      },
      {
        duration: 20,
        instruction: 'Rise onto toes, hold 3 sec, lower. Repeat 5 times.',
        narration: 'Rise up onto your toes. Hold for three seconds. Lower down. Do this five times. This pumps blood up from your calves and wakes up your circulatory system.'
      },
      {
        duration: 25,
        instruction: 'Step one foot back into a lunge. Feel the hip stretch. Hold 10 sec. Switch sides.',
        narration: 'Step one foot back into a standing lunge. Feel the stretch in the front of your hip — the hip flexor that shortens when you sit. Hold for ten seconds. Switch sides. This is the stretch your body needs most after prolonged sitting.'
      },
      {
        duration: 20,
        instruction: 'Stand tall. Reach both arms overhead. Stretch upward. Hold 10 sec.',
        narration: 'Stand tall. Reach both arms overhead. Stretch upward — like you\'re trying to touch the ceiling. Hold for ten seconds. This opens up the ribcage and decompresses the spine.'
      },
      {
        duration: 20,
        instruction: 'Arms down. Shake out hands and arms. Roll shoulders 3 times.',
        narration: 'Arms down. Shake out your hands and arms — loosely, like they\'re made of rubber. Roll your shoulders three times. Let the last of the stagnant energy go.'
      },
      {
        duration: 20,
        instruction: 'Stand still. Breathe deeply 3 times. Notice your alertness.',
        narration: 'Stand still. Take three deep breaths. Notice the difference — the alertness, the circulation, the energy. This is what two minutes of standing does.'
      }
    ],
    closingQuote: {
      useFromLibrary: true,
      category: 'movement'
    }
  },

  breathe: {
    id: 'breathe',
    name: 'Breathe',
    duration: 240, // 4 minutes
    icon: '🌬',
    description: 'Box breathing 4-4-4-4. Used by Navy SEALs. Validated for acute stress reduction.',
    source: '[S5] Jerath et al., Medical Hypotheses (2006)',
    isFree: true,
    steps: [
      {
        duration: 20,
        instruction: 'Sit comfortably. Feet flat. Hands resting on thighs. Close your eyes if comfortable.',
        narration: 'Sit comfortably. Feet flat on the floor. Hands resting on your thighs. Close your eyes if you\'re comfortable doing so. This is box breathing — four counts in, four counts hold, four counts out, four counts hold.'
      },
      {
        duration: 40,
        instruction: 'CYCLE 1: Inhale 4 sec → Hold 4 sec → Exhale 4 sec → Hold 4 sec',
        narration: 'Cycle one. Inhale for four — one, two, three, four. Hold for four — one, two, three, four. Exhale for four — one, two, three, four. Hold for four — one, two, three, four.'
      },
      {
        duration: 40,
        instruction: 'CYCLE 2: Same rhythm. Let the breath slow naturally.',
        narration: 'Cycle two. Same rhythm. Inhale four — one, two, three, four. Hold four — one, two, three, four. Exhale four — one, two, three, four. Hold four — one, two, three, four. Let the breath slow naturally if it wants to.'
      },
      {
        duration: 40,
        instruction: 'CYCLE 3: Notice your heart rate. It should be slowing.',
        narration: 'Cycle three. Inhale four — one, two, three, four. Hold four — one, two, three, four. Exhale four — one, two, three, four. Hold four — one, two, three, four. Notice your heart rate — it should be slowing down. That\'s your parasympathetic nervous system activating.'
      },
      {
        duration: 40,
        instruction: 'CYCLE 4: Smooth, even breaths. The box is steady.',
        narration: 'Cycle four. Inhale four — one, two, three, four. Hold four — one, two, three, four. Exhale four — one, two, three, four. Hold four — one, two, three, four. The box is steady. You are steady.'
      },
      {
        duration: 20,
        instruction: 'Return to natural breathing. Open eyes. Notice the calm.',
        narration: 'Return to your natural breathing rhythm. Open your eyes. Notice the calm — the slower heart rate, the clearer head. This is what four minutes of structured breathing does.'
      }
    ],
    closingQuote: {
      useFromLibrary: true,
      category: 'calm'
    }
  },

  posture: {
    id: 'posture',
    name: 'Posture',
    duration: 180, // 3 minutes
    icon: '🪑',
    description: 'Forward-head correction with chin tucks and scapular retraction. Opens the diaphragm.',
    source: '[S6] Kolar et al., Clinical Biomechanics (2012)',
    isFree: false,
    steps: [
      {
        duration: 20,
        instruction: 'Sit tall. Feet flat. Notice your head position — is it forward?',
        narration: 'Sit tall. Feet flat on the floor. Notice your head position — is it drifting forward toward the screen? That forward position adds up to 27 kilograms of strain to your neck. Let\'s fix it.'
      },
      {
        duration: 30,
        instruction: 'Chin tuck: Pull chin straight back (make a double chin). Hold 5 sec. Release. Repeat 5 times.',
        narration: 'Chin tuck. Pull your chin straight back — not down, not up, straight back. You\'ll make a bit of a double chin. That\'s correct. Hold for five seconds. Release. Repeat five times. This strengthens the deep neck flexors that hold your head up.'
      },
      {
        duration: 30,
        instruction: 'Scapular retraction: Squeeze shoulder blades together. Hold 5 sec. Release. Repeat 5 times.',
        narration: 'Scapular retraction. Squeeze your shoulder blades together — imagine holding a pencil between them. Hold for five seconds. Release. Repeat five times. This reverses the rounded-shoulder pattern from hours of typing.'
      },
      {
        duration: 30,
        instruction: 'Wall angel: Sit with back against chair. Arms out to sides, slide up and down 5 times.',
        narration: 'Wall angel. Sit with your back flat against the chair back. Arms out to the sides, elbows bent. Slowly slide your arms up and down — like making a snow angel while seated. Five times. This mobilises the thoracic spine and opens the chest.'
      },
      {
        duration: 30,
        instruction: 'Sit tall. Place one hand on belly. Breathe into belly 5 times (diaphragmatic breathing).',
        narration: 'Sit tall. Place one hand on your belly. Breathe into your belly — feel it rise with each inhale and fall with each exhale. Five breaths. This is diaphragmatic breathing, and it\'s only possible when your posture is upright. Slouched posture compresses the diaphragm by up to 30 percent.'
      },
      {
        duration: 20,
        instruction: 'Sit tall. Roll shoulders back and down. Settle. Notice the openness.',
        narration: 'Sit tall. Roll your shoulders back and down. Let them settle. Notice the openness — the space in your chest, the ease of breathing. This is what your body feels like when it\'s stacked correctly.'
      }
    ],
    closingQuote: {
      useFromLibrary: true,
      category: 'posture'
    }
  }
};

// Export for use by app.js
if (typeof window !== 'undefined') {
  window.BREAKS = BREAKS;
}
