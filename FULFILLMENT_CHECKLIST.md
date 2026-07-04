# The Daily Reset — Fulfillment Checklist

## What happens when someone signs up (free trial)

1. User enters name + email on the signup modal
2. Trial starts — 5 days of full access
3. All 5 breaks, Lunch Break Learning (1 episode/day), scheduling all unlocked
4. Trial data stored in localStorage (no backend needed for MVP)
5. After 5 days, trial expires → upgrade prompt appears

**Your job:** Nothing. The app handles this automatically. You only act when the trial expires and they click upgrade.

## What happens when someone pays (Stripe)

1. User clicks "Upgrade — $8/month" or "$79/year"
2. Stripe Payment Link opens — Stripe handles checkout, card processing, receipts
3. Stripe sends you an email notification: "You got a payment!"
4. User is redirected back to the site with `?checkout=success` in the URL
5. App unlocks full access permanently (stored in localStorage)

**Your job:** Check your Stripe dashboard. The money arrives automatically. No manual fulfillment needed — the app is the product. Access is instant.

## What you should do daily (2 minutes)

- [ ] Check Stripe dashboard for new payments
- [ ] If someone paid, send them a personal thank-you email (template below)

## Thank-you email template (copy-paste)

```
Subject: Welcome to The Daily Reset — you're in

Hi [First Name],

Thank you for upgrading to The Daily Reset. You now have full access to all 5 break types, Lunch Break Learning, and weekly rotation.

Here's my one recommendation: start with just one break today. The Eyes break at 3 minutes is the easiest entry point. Do it once this afternoon. That's it. Tomorrow, add another.

The science is clear — consistency beats intensity. Three minutes, done daily, will change more than a 30-minute session done once.

If you have any questions, just reply to this email. I read every one.

Shane
Founder, The Daily Reset
```

## What you should do weekly (10 minutes)

- [ ] Review how many trial signups vs. paid conversions (Google Analytics or just check Stripe)
- [ ] Note any feedback emails and add common questions to the FAQ
- [ ] If you have new learning episodes recorded, add them to learning.js

## What you should do monthly

- [ ] Add 2-4 new Lunch Break Learning episodes
- [ ] Review pricing — consider testing $12/month if conversion is strong
- [ ] Collect any testimonials from happy users → add to landing page
- [ ] Check competitor pricing and positioning

## Audio recording fulfillment (when ready)

Each learning episode needs a 3-5 minute voice recording. See `RECORDING_PACK.md` for the full recording script.

Steps:
1. Record each episode script using your phone or a USB microphone
2. Save as MP3 with the exact filename from the episode's `audioFile` field
3. Upload the audio files to the same deploy folder under `audio/learning/`
4. Re-deploy

Until audio is uploaded, the app shows the transcript text as a readable fallback. The product works without audio — audio is an enhancement, not a dependency.

## Customer support

- Support channel: Reply to any email from a user
- Response time goal: within 24 hours
- Common questions are covered in the landing page FAQ
- For technical issues (rare for a static site), check the browser console

## Refund policy

- Stripe handles refunds through the dashboard
- Recommended policy: full refund within 14 days, no questions asked
- To issue a refund: Stripe Dashboard → Payments → Find the payment → Refund
