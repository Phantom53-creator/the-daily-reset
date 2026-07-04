# The Daily Reset — Handoff Summary

## What is built

A proofable static web app has been built in:

```text
/Users/shanecarrol/Sample Checkers Dropbox/Shane Carrol/Wayland/Projects/Executive Burnout/build
```

Built files:

```text
index.html
styles.css
breaks.js
quotes.js
learning.js
stripe.js
app.js
RECORDING_PACK.md
DEPLOYMENT_README.md
FULFILLMENT_CHECKLIST.md
HANDOFF_SUMMARY.md
```

## Product name

**The Daily Reset** — confirmed by Shane.

All user-facing references, page titles, nav, footer, JS comments, and handoff docs updated.

## What the app currently does (updated after proof-review round 2)

- Presents a polished landing page for The Daily Reset
- Explains the executive burnout / microbreak problem
- Includes evidence-backed positioning and citations (sources spanning 2006–2025)
- Stats updated to current sources:
  - 50% of US employees experience daily stress — Gallup State of the Global Workplace 2026 Report (2025 data)
  - 56% of leaders report burnout (up from 52% in 2023) — LHH, 2024
- Shows 5 break types: Eyes, Shoulders, Stand, Breathe, Posture
- All 5 breaks accessible during 5-day free trial (no more 2-free / 3-locked split)
- Free trial signup = name + email only, no payment page
- Trial expires after 5 days → gentle upgrade prompt to Stripe
- Lunch Break Learning:
  - User picks a topic group (Philosophy & Wisdom, Motivation & Obstacles, Science & Body, Leadership & Strategy, On This Day — Great Events in History, or Mix It Up)
  - Daily random shuffle from selected group — 1 new episode/day
  - Cannot click ahead to next episode
  - Can re-pick a new topic group anytime, which restarts the shuffle
  - 1 new episode/day cap applies to BOTH free trial and paid users
  - Vibrant teal/emerald color scheme
  - Episode lunch-007: "Overcoming Obstacles: Insights from the Leaders in Their Fields" (names removed per Shane's request)
  - New episodes lunch-021 & lunch-022: "On This Day" history series
- "20 episodes" wording removed → "multiple topics"
- Header letter-spacing loosened for readability
- Primary button color brightened (dark forest green → vibrant teal #0d7d6e)
- "Who Built This" section added with Shane's executive background (40+ years, senior executive, GM of production factory, founder/CEO of multiple 7-figure companies across Australia, USA, UK)
- Science section updated with recent sources:
  - [S1] Kim et al., PLOS ONE (2023) — 22-study meta-analysis on microbreaks
  - [S1b] Nature Scientific Reports (2024) — 308-employee microbreak recovery study
  - [S2] Yadav et al., IJCEO (2025) — 20-20-20 rule efficacy for digital eye strain
  - [S15] Gallup State of the Global Workplace 2026 Report (2025 data)
  - [S19] LHH (2024) — leadership burnout statistics
  - Older foundational studies (2006–2014) retained with clear context
- Includes pause/resume-style learning progress tracking
- Includes a Stripe-ready upgrade modal (for paid upgrade after trial expires), inactive until Stripe setup

## What is deliberately not done yet

Per Shane's instruction, launch/promotion has not been built yet.

Not done yet:

- Launch pack
- Prospect list
- Outreach messages
- Follow-up sequence
- Public promotional push

Reason: proof and refine the product first, then launch.

## Stripe status

Stripe is incorporated but inactive.

File: `stripe.js`

Current setting: `active: false`

The Stripe modal is now positioned as a post-trial upgrade path. Free users never see a payment page during their 5-day trial.

## Your only job now

Proof the build.

Open:

```text
/Users/shanecarrol/Sample Checkers Dropbox/Shane Carrol/Wayland/Projects/Executive Burnout/build/index.html
```

Check:

1. Does the landing page feel premium enough for executives?
2. Does the app feel useful beyond an alarm clock?
3. Does Lunch Break Learning feel like the right retention layer?
4. Is the 5-day free trial model clear on the landing page?
5. Does the topic-group picker feel intuitive?
6. Is the price right: `$8/month` and `$79/year`?
7. Are there any claims that feel too strong or uncomfortable?
8. Does the "Who Built This" section land well?
9. Are the updated science sources credible and current?

## How money will arrive later

When ready:

1. Create Stripe product and prices
2. Create Stripe Payment Links
3. Replace modal buttons with live Stripe links
4. Deploy the build to Netlify or Vercel
5. Customer pays through Stripe (after 5-day free trial)
6. Stripe deposits to the connected bank account according to Stripe payout schedule

## V2 polish list after proofing

Do after the proof build is reviewed, not before:

- Custom domain
- Human-recorded audio upload (no audio files exist yet — learning episodes show transcripts only)
- Audio playback wiring and testing against real file durations
- Stripe Payment Links activation
- Privacy policy and terms
- Support email address
- Testimonials or beta-user quotes
- Account-based access instead of localStorage trial tracking
- Mobile home-screen install prompt
- Analytics for conversion and retention
- More Lunch Break Learning episodes monthly
- Real photo for "Who Built This" section (placeholder "SC" initials currently)

## Current status line

STATUS: Proof-review round 2 applied. Name confirmed as "The Daily Reset." Header spacing fixed, button color brightened, names removed from overcoming obstacles topic, "On This Day" topic group + 2 sample episodes added, science section updated with 2023–2025 sources, "Who Built This" section built with Shane's executive background. Next action: Shane reviews updated build, gives round 3 comments or approves for deployment.
