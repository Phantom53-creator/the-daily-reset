# The Daily Reset — Deployment README

## Your deploy (takes 2 minutes — Vercel, free)

Since you already have a Vercel account, this is the fastest path.

### Step 1: Deploy via Vercel dashboard

1. Open **https://vercel.com/new** in your browser (log in if needed)
2. Scroll down to **"Import a project"** or look for the drag-and-drop area
3. Drag the entire `build` folder into the window:
   ```
   /Users/shanecarrol/Sample Checkers Dropbox/Shane Carrol/Wayland/Projects/Executive Burnout/build
   ```
4. Click **Deploy**
5. You get a live URL in seconds (e.g. `https://the-daily-reset-abc123.vercel.app`)

**That's it. The site is live.**

### Alternative: Vercel CLI (if you prefer terminal)

If you have Node installed on your Mac:
1. Open Terminal
2. `npm i -g vercel`
3. `cd "/Users/shanecarrol/Sample Checkers Dropbox/Shane Carrol/Wayland/Projects/Executive Burnout/build"`
4. `vercel` (follow the prompts — it will ask you to log in via browser)
5. `vercel --prod` (to deploy to production)

### Re-deploying after changes

Any time you edit a file (e.g. pasting Stripe links), just drag the `build` folder to Vercel again, or run `vercel --prod` from the build directory. The URL stays the same.

---

## After deploy: Stripe Payment Links (takes 5 minutes)

This activates the payment buttons so you can take money.

1. Log in to **https://dashboard.stripe.com** (create account if needed)
2. Go to **Payment Links** → **Create payment link**
3. Create two products:
   - **Product 1:** "The Daily Reset — Monthly" / $8.00 USD / recurring monthly
   - **Product 2:** "The Daily Reset — Annual" / $79.00 USD / recurring yearly
4. After each, copy the Payment Link URL (looks like `https://buy.stripe.com/abc123...`)
5. Open `stripe.js` in TextEdit (or any text editor)
6. Find these two lines:
   ```
   monthlyPaymentLink: 'https://buy.stripe.com/REPLACE_MONTHLY_LINK',
   annualPaymentLink: 'https://buy.stripe.com/REPLACE_ANNUAL_LINK',
   ```
7. Paste your links, and change `active: false` to `active: true`
8. Save and re-deploy (drag the folder to Vercel again)

**The payment buttons are now live.** When someone clicks "Upgrade — $8/month," they go to Stripe's secure checkout. Stripe collects the payment and deposits to your bank account on Stripe's payout schedule (typically 2-7 days).

---

## After Stripe: Custom domain (optional, takes 10 minutes)

1. Buy a domain (e.g. `thedailyreset.com`) from Namecheap or Cloudflare
2. In Vercel: Project settings → Domains → Add your domain
3. Follow DNS instructions (Vercel gives you the exact records to add to your domain registrar)
4. SSL is automatic and free on Vercel

---

## Vercel free plan — what you get

- **100 GB bandwidth/month** (more than enough for a static site)
- **Unlimited static deployments**
- **Automatic HTTPS/SSL**
- **Custom domain support**
- **Preview deployments** (every upload gets a unique preview URL)
- **Zero cost** for a static site like this

No credit card required on the Hobby plan. No surprise charges. The site will never cost you money to host on Vercel's free tier.

---

## File inventory

| File | Purpose |
|---|---|
| `index.html` | Landing page + app shell |
| `styles.css` | All styling |
| `app.js` | App logic — breaks, learning, topic picker, shuffle |
| `breaks.js` | Break definitions (eyes, shoulders, breathe, stand, posture) |
| `quotes.js` | Morning anchor quote library |
| `learning.js` | Lunch Break Learning episodes (transcripts + metadata) |
| `stripe.js` | Trial logic + Stripe Payment Link integration |

All files are static. No server, no database, no build step. Just upload and go.
