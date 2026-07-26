// words.js — "Today's Word" vocabulary library
// One advanced, executive-relevant word per day, played as the opening
// segment of Lunch Break Learning before that day's topic episode.
// 30 words — a full month's rotation before repeating.

const WORDS = [
  { id: 'w01', word: 'Perspicacious', definition: 'Having keen insight or understanding; mentally sharp.', example: "Her perspicacious analysis of the market caught risks everyone else had missed." },
  { id: 'w02', word: 'Ephemeral', definition: 'Lasting for a very short time.', example: "Quarterly wins can feel ephemeral if they're not built on a durable strategy." },
  { id: 'w03', word: 'Cogent', definition: 'Clear, logical, and convincing.', example: "He made a cogent case for delaying the product launch." },
  { id: 'w04', word: 'Ubiquitous', definition: 'Present, appearing, or found everywhere.', example: "Video calls have become ubiquitous in modern leadership." },
  { id: 'w05', word: 'Nascent', definition: 'Just coming into existence; beginning to develop.', example: "The nascent partnership showed promise after just one meeting." },
  { id: 'w06', word: 'Pragmatic', definition: 'Dealing with things sensibly and realistically.', example: "A pragmatic leader chooses the achievable plan over the perfect one." },
  { id: 'w07', word: 'Equanimity', definition: 'Mental calmness and composure, especially in a difficult situation.', example: "She responded to the crisis with remarkable equanimity." },
  { id: 'w08', word: 'Circumspect', definition: 'Wary and unwilling to take risks; cautious.', example: "Being circumspect about new hires saved the team from a costly mistake." },
  { id: 'w09', word: 'Assiduous', definition: 'Showing great care and perseverance.', example: "His assiduous attention to detail caught the error before it shipped." },
  { id: 'w10', word: 'Ameliorate', definition: 'To make something better or more tolerable.', example: "The new policy helped ameliorate tension between the two departments." },
  { id: 'w11', word: 'Vindicate', definition: 'To clear someone of blame or suspicion; to prove correct.', example: "The results ultimately vindicated her unconventional strategy." },
  { id: 'w12', word: 'Ostensible', definition: 'Stated or appearing to be true, but not necessarily so.', example: "The ostensible reason for the delay was supply issues, though morale played a part too." },
  { id: 'w13', word: 'Pertinacious', definition: 'Holding firmly to an opinion or course of action; stubbornly persistent.', example: "His pertinacious pursuit of the client finally paid off after a year." },
  { id: 'w14', word: 'Sagacious', definition: 'Having good judgment; wise.', example: "The board valued her sagacious counsel during the merger talks." },
  { id: 'w15', word: 'Fortuitous', definition: 'Happening by chance, especially a happy or beneficial one.', example: "A fortuitous introduction at the conference led to their biggest client." },
  { id: 'w16', word: 'Laconic', definition: 'Using very few words; concise to the point of terseness.', example: "His laconic email left no room for misinterpretation." },
  { id: 'w17', word: 'Magnanimous', definition: 'Generous or forgiving, especially toward a rival or less powerful person.', example: "She was magnanimous in victory, praising her competitor's product publicly." },
  { id: 'w18', word: 'Ineffable', definition: 'Too great or extreme to be expressed in words.', example: "There was an ineffable sense of relief when the deal finally closed." },
  { id: 'w19', word: 'Prescient', definition: 'Having knowledge of events before they happen.', example: "His prescient warning about the market shift proved accurate within months." },
  { id: 'w20', word: 'Judicious', definition: 'Having, showing, or done with good judgment or sense.', example: "A judicious use of resources kept the project under budget." },
  { id: 'w21', word: 'Tenacious', definition: 'Tending to keep a firm hold; persistent.', example: "Her tenacious follow-up turned a cold lead into a signed contract." },
  { id: 'w22', word: 'Candid', definition: 'Truthful and straightforward; frank.', example: "He gave candid feedback that the team badly needed." },
  { id: 'w23', word: 'Astute', definition: 'Having an ability to accurately assess situations; shrewd.', example: "An astute observation about customer behavior reshaped the entire campaign." },
  { id: 'w24', word: 'Diligent', definition: "Showing care and conscientiousness in one's work.", example: "Diligent preparation is what made the presentation land so well." },
  { id: 'w25', word: 'Meticulous', definition: 'Showing great attention to detail; very careful and precise.', example: "Her meticulous review of the contract caught a costly clause." },
  { id: 'w26', word: 'Resilient', definition: 'Able to withstand or recover quickly from difficult conditions.', example: "The most resilient teams treat setbacks as data, not verdicts." },
  { id: 'w27', word: 'Acumen', definition: 'The ability to make good judgments and quick decisions.', example: "His business acumen turned a struggling division into the company's top performer." },
  { id: 'w28', word: 'Discerning', definition: 'Showing good judgment, especially about taste or quality.', example: "A discerning eye for talent is one of her greatest strengths as a manager." },
  { id: 'w29', word: 'Indefatigable', definition: 'Persisting tirelessly.', example: "His indefatigable energy carried the team through the final stretch of the launch." },
  { id: 'w30', word: 'Sanguine', definition: 'Optimistic or positive, especially in a difficult situation.', example: "She remained sanguine about the quarter despite the early setbacks." }
];

function getTodaysWord(dayIndex) {
  return WORDS[dayIndex % WORDS.length];
}

if (typeof window !== 'undefined') {
  window.WORDS = WORDS;
  window.getTodaysWord = getTodaysWord;
}
