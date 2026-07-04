// learning.js — The Daily Reset Lunch Break Learning
// Multiple launch episodes across categories. Audio is human-recorded for production; transcripts included for recording and fallback display.
// Episode selection is handled by app.js (topic-group picker → daily random shuffle, 1 new episode/day).

const LEARNING_EPISODES = [
  {
    id: 'lunch-001',
    title: 'Why the 3 PM Crash Happens',
    category: 'science',
    duration: 240,
    audioFile: 'audio/learning/lunch-001-3pm-crash.mp3',
    oneIdea: 'The afternoon crash is not weakness; it is biology meeting workload design.',
    takeaway: 'Schedule lighter decisions after lunch and use a physical reset before high-stakes afternoon work.',
    transcript: `There is a moment in most working days when the mind starts to feel slightly underwater. For many people it arrives somewhere between two and four in the afternoon. The mistake is to treat it as a character flaw. It is not laziness. It is not lack of discipline. It is a predictable collision between circadian rhythm, glucose regulation, digestion, and decision load.

Your body is not built to deliver identical mental output for ten straight hours. Alertness rises and falls. After lunch, blood flow shifts toward digestion. Core body temperature changes. The brain, which has been making decisions all morning, begins to protect itself by demanding less complexity.

The practical answer is not another coffee by default. It is a reset. Stand up. Move. Breathe. Let the visual system look away from the screen. Then return with one clear afternoon priority rather than ten competing ones.

The takeaway: if your energy drops at three, do not shame it. Design around it. Use that dip as a signal to reset the body before you ask the mind to perform again.`
  },
  {
    id: 'lunch-002',
    title: 'How Romans Managed Decision Fatigue',
    category: 'history',
    duration: 250,
    audioFile: 'audio/learning/lunch-002-roman-decisions.mp3',
    oneIdea: 'Ancient leaders reduced decision fatigue with routine, counsel, and ritualised timing.',
    takeaway: 'Protect your best thinking by deciding when you decide.',
    transcript: `Roman public life was full of decisions: legal disputes, military choices, alliances, taxes, patronage, succession. A senior Roman did not simply drift through those choices as they arrived. The day had structure. Public business happened at particular times. Counsel was sought from particular people. Ritual mattered because ritual reduced uncertainty.

We tend to think of decision-making as pure mental horsepower. The Romans understood something more practical: the frame around a decision changes the quality of the decision. When you decide everything immediately, you become available to urgency rather than judgment.

Modern executives face a different world, but the pressure is familiar. Slack messages, meetings, approvals, hiring decisions, product trade-offs. Without structure, every hour becomes a courtroom.

The Roman lesson is not to wear a toga or quote Cicero. It is to decide when decisions deserve your full mind. Put important choices into protected windows. Use counsel deliberately. Refuse to let every interruption become a verdict.

The takeaway: decision fatigue is not solved by being tougher. It is solved by giving judgment a container.`
  },
  {
    id: 'lunch-003',
    title: 'Box Breathing and the Nervous System',
    category: 'science',
    duration: 230,
    audioFile: 'audio/learning/lunch-003-box-breathing.mp3',
    oneIdea: 'Controlled breathing gives the nervous system a mechanical signal of safety.',
    takeaway: 'Use box breathing before difficult calls, not only after stressful ones.',
    transcript: `Box breathing is simple: inhale, hold, exhale, hold, usually for four counts each. Its power is not mystical. It works because breathing is one of the few body systems that is both automatic and controllable. You do not have to think about breathing, but you can choose to change it.

When breathing becomes slow and regular, the body receives information. The nervous system interprets the pattern as evidence that immediate danger has passed. Heart rate can stabilise. Muscle tension can decrease. Attention can sharpen because the system is no longer spending as much energy scanning for threat.

This is why box breathing is used in high-pressure environments. It is not about becoming soft. It is about staying useful under pressure.

The mistake is waiting until you are already overwhelmed. The best moment to use controlled breathing is before a difficult conversation, before a presentation, or between meetings when the last conversation is still living in your shoulders.

The takeaway: your breath is not just a symptom of your state. It is a lever. Use it before the stakes rise.`
  },
  {
    id: 'lunch-004',
    title: 'The Chess Grandmaster Break',
    category: 'performance',
    duration: 235,
    audioFile: 'audio/learning/lunch-004-chess-break.mp3',
    oneIdea: 'Elite thinkers step away to preserve pattern recognition.',
    takeaway: 'A short break is often the fastest route back to strategic vision.',
    transcript: `Watch a strong chess player during a long game and you will notice something interesting. They do not stare at the board every second. They stand. They walk. They look away. To a casual observer, that can look like disengagement. In reality, it is part of thinking.

Chess is a pattern-recognition game under pressure. So is leadership. The board may be a market, a team, a cash position, or a difficult negotiation. If you stare too long, the mind starts to loop. You see the same threats, the same options, the same assumptions.

Stepping away changes the visual field and interrupts the loop. The unconscious mind keeps working, but the conscious mind stops grinding. When the player returns, the position can look different — not because the pieces changed, but because perception did.

This is what a short break can do in work. It does not waste strategic time. It protects it.

The takeaway: if you cannot see the move, stop staring at the board. Step away for three minutes, then come back with fresher eyes.`
  },
  {
    id: 'lunch-005',
    title: 'Seneca on Time Pressure',
    category: 'philosophy',
    duration: 245,
    audioFile: 'audio/learning/lunch-005-seneca-time.mp3',
    oneIdea: 'The ancient complaint was not short life, but leaked attention.',
    takeaway: 'Treat attention as the real calendar.',
    transcript: `Seneca wrote that life is long enough if you know how to use it. He was not writing to people with empty schedules. He was writing in a world of politics, obligation, status, and distraction. Different tools, same human problem.

Most executives do not lose the day in one dramatic failure. They lose it by leakage: half-attention in meetings, messages checked while thinking, decisions delayed because the mind is too crowded to choose.

Time management often focuses on the calendar. But the deeper asset is attention. An hour of fractured attention is not an hour. It is a collection of fragments pretending to be work.

A deliberate break can feel counterintuitive because the calendar is full. But a three-minute reset can return the quality of the next thirty minutes. That is not a luxury. It is arithmetic.

The takeaway: protect attention as seriously as time. A full calendar is survivable. A scattered mind is not.`
  },
  {
    id: 'lunch-006',
    title: 'The Physiology of Slumped Posture',
    category: 'science',
    duration: 230,
    audioFile: 'audio/learning/lunch-006-slumped-posture.mp3',
    oneIdea: 'Posture changes breathing, and breathing changes cognition.',
    takeaway: 'When your thinking feels compressed, open the body first.',
    transcript: `Slumped posture looks harmless. It is just how people sit when the day gets long. But the body is not separate from thinking. When the shoulders round forward and the head drifts toward the screen, the ribcage closes. The diaphragm has less room to move. Breathing becomes shallower.

Shallow breathing is not just a comfort issue. It changes the signal the body sends to the brain. A compressed body can feel like a compressed mind: narrower, more reactive, less patient.

This is why posture breaks are not cosmetic. They are not about looking confident in a photograph. They are about restoring mechanical space for breath, circulation, and attention.

The fastest intervention is simple: feet flat, spine long, chin gently back, shoulder blades slightly together, one deep diaphragmatic breath. The mind often follows the body faster than the body follows the mind.

The takeaway: if your thinking feels tight, do not start by forcing clarity. Start by giving your lungs room.`
  },
  {
    id: 'lunch-007',
    title: 'Overcoming Obstacles: Insights from the Leaders in Their Fields',
    category: 'motivation',
    duration: 250,
    audioFile: 'audio/learning/lunch-007-overcoming-obstacles.mp3',
    oneIdea: 'Every obstacle contains the seed of an equal or greater benefit — if you reframe it as fuel.',
    takeaway: 'When you hit a wall, ask: what is this obstacle teaching me that easy progress never could?',
    transcript: `Some of the most respected voices in motivation and performance converge on one idea: obstacles are not the problem. The meaning you assign to them is.

One legendary sales trainer used to say that obstacles are what you see when you take your eyes off the goal. He was not being glib. He was pointing at something that every leader eventually faces: the wall.

A sports psychologist who studied Olympic athletes and POW survivors found that the ones who endured were not the ones who ignored hardship. They were the ones who reframed it. They did not say "this is fine." They said "this is the curriculum."

A well-known performance coach takes the same idea further. He argues that the quality of your life is determined by the meaning you assign to events. The obstacle is not the obstacle. The meaning you give it is either the barrier or the bridge.

For an executive, this matters daily. A deal collapses. A key person resigns. A quarter misses. You can read these as proof that things are falling apart, or as data about what to fix next. The first reading creates paralysis. The second creates movement.

The practical technique is simple. When you hit a wall, ask three questions: What is this teaching me? What would I do differently because of this? What opportunity does this open that easy progress would have hidden?

These thinkers come from different worlds. But they converge on one truth: the people who overcome are not the ones who avoid obstacles. They are the ones who use them.

The takeaway: when you hit a wall today, do not ask why this is happening to you. Ask what this is doing for you. Then take one action that the obstacle just made visible.`
  },
  {
    id: 'lunch-008',
    title: 'Why Walking Helps Thinking',
    category: 'science',
    duration: 235,
    audioFile: 'audio/learning/lunch-008-walking-thinking.mp3',
    oneIdea: 'Movement changes cognition by changing rhythm, circulation, and attention.',
    takeaway: 'Use movement for problems that are stuck, not just for fitness.',
    transcript: `Many people discover by accident that they think better while walking. This is not just a romantic idea about poets and philosophers. Movement changes the state of the body, and the state of the body changes the mind.

Walking increases circulation. It gives the eyes a changing visual field. It creates rhythm without requiring intense conscious effort. That combination can loosen fixed thinking.

At a desk, attention narrows. That is useful for execution, but not always for insight. When a problem has become circular, more screen time often deepens the groove. A short walk, even indoors, interrupts the pattern.

The lesson for busy leaders is practical. Do not reserve movement for the gym. Use it as a thinking tool. If a decision is stuck, stand up. Walk for three minutes. Let the body carry part of the cognitive load.

The takeaway: movement is not only recovery from work. Sometimes movement is the work that makes better thinking possible.`
  },
  {
    id: 'lunch-009',
    title: 'Churchill and the Change of Work',
    category: 'history',
    duration: 240,
    audioFile: 'audio/learning/lunch-009-churchill-change-work.mp3',
    oneIdea: 'A change of activity can restore energy better than simple idleness.',
    takeaway: 'Recover by switching modes, not only by stopping.',
    transcript: `Winston Churchill carried immense pressure, and not always in healthy ways. But one of his useful observations was that a change of work can be restorative. He painted. He built walls. He wrote. He shifted modes.

The modern version matters because many executives think recovery means doing nothing. Sometimes it does. But often the mind recovers by changing channels: from verbal to physical, from analytical to visual, from screen-based to sensory.

A three-minute desk break works partly because it changes the mode of attention. You stop processing words and start processing breath, posture, distance, or movement. That shift gives the tired part of the system a rest without requiring a full stop in the day.

The principle is not to romanticise overwork. It is to choose recovery that actually restores the part of you that has been depleted.

The takeaway: when you are drained, ask what kind of work tired you. Then recover by changing mode, not just by pushing through.`
  },
  {
    id: 'lunch-010',
    title: 'The Attention Residue Problem',
    category: 'performance',
    duration: 245,
    audioFile: 'audio/learning/lunch-010-attention-residue.mp3',
    oneIdea: 'Part of the mind remains stuck on the last task after switching.',
    takeaway: 'Use a reset ritual between meetings to clear residue before the next conversation.',
    transcript: `Attention residue is the mental smear left behind when you switch tasks. You leave one meeting, enter another, and part of your mind is still in the previous room. The calendar says you have moved on. The brain has not.

This matters because executive work is often a sequence of context switches. Finance review, people issue, customer call, product decision, investor update. Each one asks for a different version of you.

Without a reset, the residue accumulates. You carry irritation from one conversation into another. You bring analytical intensity into a human conversation that needed patience. You answer the wrong emotional context.

A three-minute break between meetings can function like a mental airlock. Stand. Breathe. Look away. Ask: what am I carrying from the last thing, and what does the next thing need from me?

The takeaway: transitions are work. If you do not manage them, they manage you.`
  },
  {
    id: 'lunch-011',
    title: 'The Navy SEAL Lesson That Actually Transfers',
    category: 'performance',
    duration: 230,
    audioFile: 'audio/learning/lunch-011-seal-lesson.mp3',
    oneIdea: 'Elite calm is trained through simple repeatable protocols.',
    takeaway: 'Do not wait for confidence. Run the protocol.',
    transcript: `It is easy to misuse military examples in business. Most office pressure is not battlefield pressure, and pretending otherwise is silly. But one lesson does transfer: under stress, people do not rise to vague intentions. They fall back on trained protocols.

That is why breathing drills matter. That is why checklists matter. That is why simple repeatable actions beat complex advice when the pressure rises.

A leader under stress does not need a long lecture about calm. They need a thing to do: breathe four in, hold four, out four, hold four. Put feet on the floor. Lower the shoulders. Name the next action.

Confidence often arrives after the protocol begins, not before. The body starts to feel safer, the mind gets a cleaner signal, and the next decision becomes easier.

The takeaway: calm is not a mood you wait for. It is a sequence you can run.`
  },
  {
    id: 'lunch-012',
    title: 'What Monks Understand About Repetition',
    category: 'philosophy',
    duration: 235,
    audioFile: 'audio/learning/lunch-012-monks-repetition.mp3',
    oneIdea: 'Repetition is not always boredom; it can be the path to automatic steadiness.',
    takeaway: 'Keep the useful routine, refresh the meaning around it.',
    transcript: `A monastery runs on repetition. Bells, meals, prayer, work, silence, return. To outsiders, that can look like monotony. To practitioners, repetition is the container that makes depth possible.

Modern productivity culture often confuses novelty with value. If something becomes familiar, we assume it has stopped working. But many of the most useful practices become valuable because they are repeated until they are automatic.

A desk break is similar. The first week, it may feel new. By the third week, the motions are familiar. That is not failure. That is the habit forming.

The challenge is to keep the routine alive without needing to reinvent it constantly. That is why meaning matters: the eye break protects vision; the posture break restores breathing; the breathing break changes your nervous system.

The takeaway: do not abandon a routine just because it has become familiar. Familiar can mean the system is starting to work.`
  },
  {
    id: 'lunch-013',
    title: 'Why Leaders Need Physical Cues',
    category: 'leadership',
    duration: 240,
    audioFile: 'audio/learning/lunch-013-physical-cues.mp3',
    oneIdea: 'The body often notices stress before the conscious mind admits it.',
    takeaway: 'Use shoulders, jaw, breath, and eyes as early warning signals.',
    transcript: `Most leaders are trained to read external data: revenue, churn, cash, headcount, pipeline. Fewer are trained to read internal data. But the body reports stress before the mind often admits it.

A tight jaw, shallow breath, raised shoulders, dry eyes, restless hands — these are not random discomforts. They are dashboard lights. They tell you the system is working harder than it should.

Ignoring those signals does not make you more professional. It only removes early warning. By the time stress becomes obvious, it has already been shaping tone, patience, and judgment.

A short break creates a check-in without drama. Where are my shoulders? How am I breathing? Are my eyes tired? Is my posture collapsing? Those questions take seconds, but they reconnect the operator to the instrument.

The takeaway: your body is not an interruption to leadership. It is part of the data.`
  },
  {
    id: 'lunch-014',
    title: 'The Pomodoro Principle Without the Tomato',
    category: 'productivity',
    duration: 225,
    audioFile: 'audio/learning/lunch-014-pomodoro-principle.mp3',
    oneIdea: 'Work improves when effort and recovery are structured together.',
    takeaway: 'Use breaks as part of the work cycle, not as a reward for finishing everything.',
    transcript: `The Pomodoro Technique became famous through a kitchen timer shaped like a tomato. But the deeper principle is not the tomato or the exact minutes. It is the idea that focus and recovery belong together.

Many high performers treat breaks as something earned only after everything important is done. The problem is that everything important is never done. So recovery gets postponed until the body forces it.

Structured breaks reverse the logic. They make recovery part of the working system. You work, you reset, you return. That rhythm protects both energy and quality.

For executives, the intervals may be irregular. Meetings happen. Emergencies appear. But the principle still holds: do not wait until you are empty to recover. Empty is late.

The takeaway: a break is not a reward for work completed. It is maintenance that makes the next unit of work possible.`
  },
  {
    id: 'lunch-015',
    title: 'Marcus Aurelius and the Inner Citadel',
    category: 'philosophy',
    duration: 250,
    audioFile: 'audio/learning/lunch-015-inner-citadel.mp3',
    oneIdea: 'A leader needs a place inside that the day does not own.',
    takeaway: 'Use short pauses to return to what is yours to govern.',
    transcript: `Marcus Aurelius was not writing philosophy from a quiet cabin. He wrote as an emperor dealing with war, plague, betrayal, politics, and exhaustion. His private notes return again and again to one idea: there is a part of the self that can remain governed, even when circumstances are not.

This is sometimes called the inner citadel. It is not escape. It is the capacity to return to judgment, character, and choice when the outside world is noisy.

A three-minute break can be a modern version of that return. You stop reacting for a moment. You breathe. You notice what is happening in the body. You ask what is actually yours to do next.

The inbox is not yours to fully control. Other people’s moods are not yours to fully control. The market is not yours to fully control. Your next action, your tone, your attention — those are closer to yours.

The takeaway: build a small inner room the day cannot enter without permission.`
  },
  {
    id: 'lunch-016',
    title: 'Why Screens Tire the Eyes Differently',
    category: 'science',
    duration: 230,
    audioFile: 'audio/learning/lunch-016-screen-eyes.mp3',
    oneIdea: 'Screens reduce blink rate and lock focus at a fixed distance.',
    takeaway: 'The eye break is not optional comfort; it restores a system under constant load.',
    transcript: `Reading a screen is not the same as looking around the world. The eyes hold focus at a fixed distance for long periods. Blink rate often drops. Light, contrast, small text, and glare all add load.

This is why digital eye strain can show up as dryness, headaches, blurred vision, or a heavy feeling around the eyes. The eyes were not designed for uninterrupted near-focus all day.

The 20-20-20 rule works because it gives the focusing muscles a different job. Look far away for twenty seconds. Blink. Let the visual system reset. It sounds almost too simple, which is why people ignore it. But simple does not mean trivial.

For a leader, tired eyes are not just a comfort problem. Visual fatigue affects reading, patience, and the willingness to look closely at difficult information.

The takeaway: protect your eyes because they are part of your thinking system. If they are exhausted, your judgment is working through fog.`
  },
  {
    id: 'lunch-017',
    title: 'The Japanese Idea of Ma',
    category: 'culture',
    duration: 240,
    audioFile: 'audio/learning/lunch-017-ma-space.mp3',
    oneIdea: 'Space is not emptiness; it is what lets the meaningful thing be perceived.',
    takeaway: 'Leave space between events so the next one can be met properly.',
    transcript: `In Japanese aesthetics, the word ma points to interval, pause, space. It is the silence between notes, the empty space in a room, the gap that gives form to what surrounds it.

Western work culture often treats space as inefficiency. If there is a blank slot, fill it. If there is a pause, speak. If there is a gap between meetings, answer messages.

But without space, everything becomes noise. The meeting before contaminates the meeting after. The decision just made crowds the decision coming next. The mind has no margin for meaning.

A short break creates ma in the working day. Three minutes is not much, but it is enough to mark a boundary. This is over. That is next. I am here now.

The takeaway: space is not wasted capacity. Space is what lets the next thing receive your full attention.`
  },
  {
    id: 'lunch-018',
    title: 'Why Recovery Must Be Scheduled',
    category: 'leadership',
    duration: 235,
    audioFile: 'audio/learning/lunch-018-scheduled-recovery.mp3',
    oneIdea: 'Unscheduled recovery loses to urgent work.',
    takeaway: 'Put recovery in the system before the system needs it.',
    transcript: `Everyone agrees recovery matters in theory. In practice, unscheduled recovery usually disappears. The urgent thing wins. The meeting overruns. The message arrives. The break gets postponed.

This is why relying on feeling is unreliable. By the time you feel a strong need to recover, performance has already dropped. The best recovery is preventive, not emergency-based.

Scheduling a three-minute break can feel excessive until you realise how much of modern executive work is scheduled: meetings, reviews, hiring loops, investor calls, school runs, flights. Important things go in the calendar because memory is not enough.

If your body is the instrument through which all your work happens, maintaining it deserves a slot too.

The takeaway: do not wait until recovery feels urgent. Put it in the system while you still have the clarity to protect it.`
  },
  {
    id: 'lunch-019',
    title: 'The Compound Interest of Small Breaks',
    category: 'performance',
    duration: 245,
    audioFile: 'audio/learning/lunch-019-compound-breaks.mp3',
    oneIdea: 'Small resets compound by preventing the accumulation of fatigue.',
    takeaway: 'Do not measure the break by three minutes; measure the day it protects.',
    transcript: `A single three-minute break can seem too small to matter. That is the wrong unit of measurement. The value is not only what happens in the three minutes. The value is what does not accumulate afterwards.

Without resets, tension compounds. Eye strain compounds. Shallow breathing compounds. Irritability compounds. By the end of the day, you are not dealing with one stressor. You are dealing with a stack.

Small breaks interrupt that stack. They are like small repayments on a debt before interest becomes expensive. You may not notice the full benefit immediately because the benefit is partly the absence of deterioration.

This is why consistency matters more than intensity. A dramatic recovery day once a month cannot fully compensate for daily depletion. But three brief resets a day can change the baseline.

The takeaway: do not ask whether three minutes can transform your life. Ask what your life looks like when stress is interrupted three times a day for a year.`
  },
  {
    id: 'lunch-020',
    title: 'The Rule of One Clear Next Action',
    category: 'productivity',
    duration: 230,
    audioFile: 'audio/learning/lunch-020-one-next-action.mp3',
    oneIdea: 'Clarity often returns when the next action is small enough to start.',
    takeaway: 'End each break by choosing one concrete next action.',
    transcript: `After a break, the temptation is to return to the entire mountain: inbox, strategy, team, product, money, family, health. The mind tightens because it tries to hold everything at once.

A better return is one clear next action. Not a life plan. Not a full priority system. One action that can be done next: send the reply, open the document, write the first paragraph, make the call, review the metric.

This matters because breaks create a small window of restored attention. If that attention is immediately flooded, the benefit leaks away. If it is pointed at one concrete action, momentum returns.

The question is simple: what is the next visible thing? It should be so clear that you could begin within ten seconds.

The takeaway: end the reset by choosing one action small enough to start and meaningful enough to matter. Then do that before the noise comes back.`
  },
  {
    id: 'lunch-021',
    title: 'On This Day: The Magic of Mondays — Something Massive Happened on This Date',
    category: 'history',
    duration: 240,
    audioFile: 'audio/learning/lunch-021-on-this-day-1.mp3',
    oneIdea: 'Every day on the calendar has hosted a moment that altered the course of history.',
    takeaway: 'History is not abstract. It happened on a day like today — and the people who made it were not so different from you.',
    transcript: `Pick any date on the calendar. Something pivotal happened. Not always a battle or a revolution. Sometimes a patent was filed. Sometimes a treaty was signed. Sometimes someone walked out of a room and changed everything.

On a day like today, leaders made decisions under pressure that shaped industries, nations, and lives. Some of those decisions were brilliant. Some were catastrophic. All of them were made by people who were tired, uncertain, and dealing with incomplete information — just like you.

The reason to look back is not nostalgia. It is perspective. When you are deep in your own quarter, your own targets, your own inbox, it is easy to lose scale. History reminds you that the world has always been uncertain, that leaders have always been imperfect, and that the decisions made under pressure are the ones that matter most.

Every episode in this series takes a moment from this date in history and pulls out the lesson. Not a lecture. Just one story, one decision, one takeaway.

The takeaway: history is not something that happened to other people. It is a mirror. The people who made it were executives, founders, generals, and visionaries — doing their best with what they had on a day that felt ordinary until it did not.`
  },
  {
    id: 'lunch-022',
    title: 'On This Day: Decisions Under Pressure',
    category: 'history',
    duration: 220,
    audioFile: 'audio/learning/lunch-022-on-this-day-2.mp3',
    oneIdea: 'The best historical decisions were rarely the comfortable ones.',
    takeaway: 'When you face a hard call today, remember: someone on this date in history made a harder one with less information.',
    transcript: `The decisions that echo through history are almost never the easy ones. They are the calls made when information was incomplete, stakes were high, and time was running out.

On this date in years past, leaders faced invasions, market crashes, technological breakthroughs, and political crises. Some chose boldness. Some chose caution. History judged both — sometimes kindly, sometimes not.

For an executive, the lesson is practical. You will never have perfect information. You will never feel fully ready. The decision you are avoiding because conditions are not right? Conditions will never be right. That is not a reason to wait. It is a reason to decide.

The leaders we remember are not the ones who waited for clarity. They are the ones who acted with conviction and adjusted as reality unfolded.

The takeaway: today, make the call you have been deferring. History shows that imperfect action beats perfect inaction every time.`
  }
];

function getLearningEpisode(index) {
  return LEARNING_EPISODES[index % LEARNING_EPISODES.length];
}

function getTodaysLearningEpisode() {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = new Date() - start;
  const day = Math.floor(diff / 86400000);
  return getLearningEpisode(day);
}

function getNextLearningEpisode(currentId) {
  const currentIndex = LEARNING_EPISODES.findIndex(ep => ep.id === currentId);
  return getLearningEpisode(currentIndex + 1);
}

if (typeof window !== 'undefined') {
  window.LEARNING_EPISODES = LEARNING_EPISODES;
  window.getLearningEpisode = getLearningEpisode;
  window.getTodaysLearningEpisode = getTodaysLearningEpisode;
  window.getNextLearningEpisode = getNextLearningEpisode;
}
