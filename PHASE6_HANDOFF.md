# The Daily Reset — Phase 6 Handoff

## STATUS: What's now live

### ✅ Built and ready to deploy
- Landing page (full copy, proofed through 2 rounds)
- 5 break types (Eyes, Shoulders, Breathe, Stand, Posture) with guided sequences
- 5-day free trial system (name + email, no payment page)
- Lunch Break Learning with topic-group picker + daily shuffle (1 episode/day locked)
- 22 learning episodes with full transcripts
- "Who Built This" section with your executive background
- Science section with 9 cited sources (2006–2025)
- Stripe Payment Link integration (code ready, needs your links)
- Fulfillment checklist
- Launch pack with prospect criteria, 4 outreach message templates, 4 follow-up sequences

### ⏸️ Blocked — needs your action (2 things, 8 minutes total)

**THING 1: Deploy the site (2 minutes — Vercel, free)**

1. Open **https://vercel.com/new** in your browser (log in with your existing Vercel account)
2. Drag this entire folder into the deploy window:
   ```
   /Users/shanecarrol/Sample Checkers Dropbox/Shane Carrol/Wayland/Projects/Executive Burnout/build
   ```
3. Click **Deploy** — copy the live URL it gives you

**THING 2: Activate Stripe payments (5 minutes)**

1. Log in to **https://dashboard.stripe.com**
2. Go to Payment Links → Create payment link
3. Create "The Daily Reset — Monthly" at $8.00/month recurring
4. Create "The Daily Reset — Annual" at $79.00/year recurring
5. Copy both Payment Link URLs
6. Open `stripe.js` in TextEdit, find these two lines and paste your links:
   ```
   monthlyPaymentLink: 'https://buy.stripe.com/REPLACE_MONTHLY_LINK',
   annualPaymentLink: 'https://buy.stripe.com/REPLACE_ANNUAL_LINK',
   ```
7. Change `active: false` to `active: true`
8. Save, drag the folder to Vercel again (or run `vercel --prod` if using CLI)

**Done. The site is live and can take payments.**

---

## Your only job today

1. Deploy (3 min) → get live URL
2. Create Stripe Payment Links (5 min) → paste into stripe.js → redeploy
3. Send 10 outreach messages using Message A from LAUNCH_PACK.md → paste your live URL into each one
4. Start a spreadsheet to track who you sent to

That's it. The product, payment path, fulfillment, and launch messages are all built. Your job is to deploy and send the first 10.

---

## How money arrives

1. Executive clicks your link → lands on The Daily Reset
2. Enters name + email → 5-day free trial starts (full access)
3. After 5 days, trial expires → upgrade prompt appears
4. They click "Upgrade — $8/month" → Stripe Payment Link opens
5. They pay with card → Stripe processes → money goes to your bank account
6. Stripe emails you a notification
7. You send the thank-you email template from FULFILLMENT_CHECKLIST.md

**Price points:** $8/month or $79/year (save ~18%)
**Payment processor:** Stripe (Payment Links — no backend, no server)
**Payout:** Stripe deposits to your connected bank account (typically 2-7 days)

---

## v2 Polish list (after first sale)

| Priority | Item | When |
|---|---|---|
| High | Custom domain (thedailyreset.com) | After first 5 users |
| High | Real headshot photo for "Who Built This" | This week |
| High | Voice audio recordings for learning episodes | After first 10 users |
| Medium | Testimonials from early users on landing page | After first 5 paid |
| Medium | Google Analytics for conversion tracking | This week |
| Medium | Privacy policy + terms of service page | Before scaling outreach |
| Medium | LinkedIn article about why you built it | This week |
| Low | Second pricing tier ($15/month team plan) | After 50 paid users |
| Low | Mobile home-screen install prompt | After 20 users |
| Low | Account-based access (replace localStorage) | After 100 users |
| Low | More learning episodes monthly | Ongoing |
| Low | A/B test pricing ($8 vs $12) | After 50 paid users |

---

## File inventory

| File | Purpose | Status |
|---|---|---|
| `index.html` | Landing page + app shell | ✅ Ready |
| `styles.css` | All styling | ✅ Ready |
| `app.js` | App logic | ✅ Ready |
| `breaks.js` | Break definitions | ✅ Ready |
| `quotes.js` | Quote library | ✅ Ready |
| `learning.js` | Learning episodes | ✅ Ready |
| `stripe.js` | Trial + payment | ✅ Ready (needs your Payment Links) |
| `DEPLOYMENT_README.md` | Deploy instructions | ✅ Ready |
| `FULFILLMENT_CHECKLIST.md` | Fulfillment + support | ✅ Ready |
| `LAUNCH_PACK.md` | Prospect list + outreach + follow-up | ✅ Ready |
| `RECORDING_PACK.md` | Audio recording scripts | ✅ Ready |
| `HANDOFF_SUMMARY.md` | Full build documentation | ✅ Ready |

---

## One-screen summary

**What's live:** The full product — landing page, 5 breaks, learning system, trial logic, payment integration, launch pack. All code is deployment-ready.

**What's not live yet:** The URL (you deploy it) and the payment buttons (you paste Stripe links). Both take under 8 minutes combined.

**Your only job today:** Deploy → paste Stripe links → send 10 outreach messages → track responses.

**Definition of done:** A live URL that can take a payment, with 10 outreach messages sent. That's today.

---

*Built by Shane's instruction. Proofed through 2 rounds. 40+ years of executive experience baked into every word.*
