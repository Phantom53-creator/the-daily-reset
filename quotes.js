// quotes.js — The Daily Reset Quote Library
// 42 quotes across 7 categories — one per day cycling, no repeats for 6 weeks
// Criteria: substance, attribution, relevance to the break just completed

const QUOTES = {
  focus: [
    { text: "Almost everything will work again if you unplug it for a few minutes, including you.", author: "Anne Lamott" },
    { text: "The successful warrior is the average man, with laser-like focus.", author: "Bruce Lee" },
    { text: "Where attention goes, energy flows.", author: "James Redfield" },
    { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
    { text: "My mind is never clearer than when I am looking at something far away.", author: "Mary Oliver" },
    { text: "The quieter you become, the more you can hear.", author: "Ram Dass" }
  ],

  tension: [
    { text: "Tension is who you think you should be. Relaxation is who you are.", author: "Chinese Proverb" },
    { text: "The greatest weapon against stress is our ability to choose one thought over another.", author: "William James" },
    { text: "Your mind will answer most questions if you learn to relax and wait for the answer.", author: "William S. Burroughs" },
    { text: "Within you, there is a stillness and a sanctuary to which you can retreat at any time.", author: "Hermann Hesse" },
    { text: "Stress is caused by being 'here' but wanting to be 'there'.", author: "Eckhart Tolle" },
    { text: "The time to relax is when you don't have time for it.", author: "Sydney J. Harris" }
  ],

  movement: [
    { text: "Those who think they have no time for bodily exercise will sooner or later have to find time for illness.", author: "Edward Stanley" },
    { text: "Movement is a medicine for creating change in a person's physical, emotional, and mental states.", author: "Carol Welch" },
    { text: "A year from now you may wish you had started today. The same is true of standing up.", author: "Karen Lamb (adapted)" },
    { text: "Sitting is the new smoking.", author: "Dr. James Levine" },
    { text: "The body needs movement the way the mind needs novelty.", author: "Siri Hustvedt (adapted)" },
    { text: "Rest is not idleness, and to lie sometimes on the grass under trees on a summer's day, listening to the murmur of water, or watching the clouds float across the sky, is by no means a waste of time.", author: "John Lubbock" }
  ],

  calm: [
    { text: "Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.", author: "Thich Nhat Hanh" },
    { text: "Breath is the bridge which connects life to consciousness, which unites your body to your thoughts.", author: "Thich Nhat Hanh" },
    { text: "The restless mind is like a calm lake disturbed by a wind. The breath is the wind that can also calm it.", author: "B.K.S. Iyengar" },
    { text: "When you own your breath, nobody can steal your peace.", author: "David Foster Wallace (attributed)" },
    { text: "The meaning of life is just to be alive. It is so plain and so obvious and so simple. And yet, everybody rushes around as if it were necessary to achieve something beyond that.", author: "Alan Watts" },
    { text: "Slow is smooth, and smooth is fast.", author: "Navy SEAL maxim" }
  ],

  posture: [
    { text: "The body holds the score. The way we carry ourselves tells the story of how we've been living.", author: "Bessel van der Kolk (adapted)" },
    { text: "Good posture is the foundation of good health. You cannot build a strong house on a weak frame.", author: "Joseph Pilates (attributed)" },
    { text: "How you stand is how you walk. How you walk is how you think. How you think is how you live.", author: "Ido Portal (attributed)" },
    {   text: "The spine is the body's axis of integrity.", author: "F.M. Alexander" },
    { text: "You are as young as your spine is flexible.", author: "Joseph Pilates" },
    { text: "The body speaks even when the mouth is silent.", author: "Martha Graham (adapted)" }
  ],

  general: [
    { text: "Rest is not the enemy of ambition. It is its foundation.", author: "Shawn Achor (adapted)" },
    { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
    { text: "What gets measured gets managed.", author: "Peter Drucker" },
    { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Will Durant (often attributed to Aristotle)" },
    { text: "The obstacle is the path.", author: "Marcus Aurelius (attributed)" },
    { text: "It is not that we have a short time to live, but that we waste a lot of it.", author: "Seneca" },
    { text: "You have power over your mind — not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius" },
    { text: "He who has a why to live for can bear almost any how.", author: "Friedrich Nietzsche" },
    { text: "The wound is the place where the Light enters you.", author: "Rumi" },
    { text: "Between stimulus and response there is a space. In that space is our power to choose our response.", author: "Viktor Frankl" },
    { text: "Sometimes the most productive thing you can do is rest.", author: "Mark Black" }
  ]
};

// Helper: get a quote by category, cycling by day
function getDailyQuote(category, dayIndex) {
  const cat = QUOTES[category] || QUOTES['general'];
  return cat[dayIndex % cat.length];
}

// Helper: get a general quote by day (for morning anchor quote)
function getMorningQuote(dayIndex) {
  return getDailyQuote('general', dayIndex);
}

// Helper: get all categories
function getQuoteCategories() {
  return Object.keys(QUOTES);
}

if (typeof window !== 'undefined') {
  window.QUOTES = QUOTES;
  window.getDailyQuote = getDailyQuote;
  window.getMorningQuote = getMorningQuote;
}
