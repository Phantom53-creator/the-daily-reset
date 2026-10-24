# The Daily Reset — Deployment

Last verified: 2026-10-24.

This folder (`build/`) is the whole website **and** its git repository. This file lives in a public repo, so it deliberately
contains no server paths or account details; those are in the private project docs (see "More detail" at the end).

## How the site is hosted

- **Production:** https://dailyresetlabs.com, served from Shane's own web hosting (cPanel) — static files only, no build step.
- **The live files are a git clone of this repo.** Publishing a change = push to GitHub, then pull on the host.
- **Source of truth:** GitHub `Phantom53-creator/the-daily-reset`, branch `main`.
- **Backend services** (not hosted here): Supabase for sign-ups, reviews and premium sign-in. See `NEW_SESSION_START_HERE.md` (project root).

## Publishing an update

1. **Edit and test** files in `build/`. Open `app.html` in a browser to check it.
2. **Commit and push** — from this folder:
   ```
   git add -A
   git commit -m "Describe the change"
   git push origin main
   ```
3. **Pull it onto the live site (required):** sign in to cPanel → *Git™ Version Control* → the `dailyresetlabs` repository →
   *Manage* → *Pull or Deploy* → **Update from Remote**.
   A push by itself does **not** change the live site. Leave "Deploy HEAD Commit" alone; there is intentionally no `.cpanel.yml`.
4. **Check the live site in a real browser** (not only curl): load https://dailyresetlabs.com/app.html, play a break, play a Lunch Break
   Learning episode, and confirm there are no console errors. The host has a bot-check that can return a "One moment, please…" page
   with HTTP 200 to scripted clients, so a 200 from curl proves nothing — compare the size/content-type, and don't fire rapid bursts of requests.

Never edit files directly on the host: the next "Update from Remote" would conflict with them.

## Rolling back

Revert the commit locally (`git revert <commit>`), push, then **Update from Remote** again.

## Audio changes

Audio files keep the same filename when regenerated, so after adding or replacing MP3s:
```
./update-audio-manifest.sh     # or let tts-generate.js regenerate audio-manifest.js
git add -A && git commit -m "Update audio" && git push origin main
```
then **Update from Remote** on the host. The server is configured *not* to cache aggressively, so a re-recorded clip is picked up
straight away. `audio-manifest.js` must stay publicly readable — the app loads it to know which clips exist.

## What the server config does (`.htaccess`)

Forces https, redirects `www` to the bare domain, serves MP3s with the right type and CORS headers (range requests work, which iPhones
need), compresses text files, and blocks the git folder, `.md`/`.sh` files and developer tools (`tts-generate.js`, `script-review.html`,
`voice-compare.html`, `design-concept-*.html`). Edit it only with care — a mistake can take the whole site down. It is only active on the
host, not when opening files locally.

## Fallback copy (not production)

A copy of this repo is also deployed automatically to a free Vercel address every time `main` is pushed. It is a spare in case the main host
has a problem, not a second production site: don't give that address to customers, and note that anyone who signed up there appears as new on
the real domain (the app stores progress per web address).

## Payments

Stripe is **not live** (test mode only) and no payment link is wired into the app. Do not enable payments until Shane says so.

## File inventory (main files)

| File | Purpose |
|---|---|
| `index.html`, `styles.css` | Marketing landing page |
| `app.html`, `app.css`, `app.js` | The app (signup, dashboard, players, settings) |
| `access.js` | Free access, reviewer codes, Supabase sign-up/review capture |
| `premium.js` | Premium email-code sign-in (premium audio not live yet) |
| `breaks.js`, `learning.js`, `quotes.js`, `words.js` | Content: breaks, episodes, quotes, Today's Word |
| `audio.js`, `audio-manifest.js`, `voice.js` | MP3-first audio engine, clip list, browser-voice fallback |
| `calendar.js` | Downloadable calendar reminders (.ics) |
| `audio/` | All narration MP3s (Speechify voices) |
| `tts-generate.js` | Voice generator CLI (its header is the how-to); `setup-*-key.sh` store API keys in gitignored `.env` files |
| `.htaccess` | Server rules (above) |
| `REVIEWER_ACCESS.md`, `PRERECORDED_AUDIO_GUIDE.md` | Reviewer codes; audio naming |

## More detail

Private project docs (outside this repo, on Shane's Mac): `NEW_SESSION_START_HERE.md` (full handoff, file locations, services, open work)
and `CPANEL_MIGRATION.md` (hosting move record, shared-account rules, host gotchas).
