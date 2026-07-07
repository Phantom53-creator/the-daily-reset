# Reviewer Access — The Daily Reset

Permanent, unrestricted access for Shane and selected testers. No trial expiry, no daily episode cap, plus reviewer-only tools.

## Active codes

| Code | Label | Give to |
|---|---|---|
| `SHANE-FOUNDER` | Founder | Shane |
| `RESET-REVIEW-01` | Reviewer | (unassigned) |
| `RESET-REVIEW-02` | Reviewer | (unassigned) |
| `RESET-REVIEW-03` | Reviewer | (unassigned) |
| `RESET-REVIEW-04` | Reviewer | (unassigned) |
| `RESET-REVIEW-05` | Reviewer | (unassigned) |

Codes are case-insensitive. To add or revoke a code, edit the `ACCESS_CODES` list at the top of `access.js` — removing a code from the list immediately ends that person's access next time they load the app.

## Three ways to activate

1. **One-click link (easiest to share):** `https://the-daily-reset-woad.vercel.app/app.html?code=RESET-REVIEW-01`
   The code activates automatically and is removed from the address bar.
2. **In the app welcome screen:** open `app.html`, click "I have an access code".
3. **In Settings:** if already signed up, Settings → Account → "Have an access code?"

## What reviewers get

- **★ REVIEWER ACCESS badge** in the app header (gold on black — instantly recognisable)
- **No trial expiry** — access never ends while the code is in `access.js`
- **No daily episode cap** — "Done for today" never locks
- **Reviewer tools in the learning player:**
  - Episode browser — dropdown listing all 22 episodes, jump to any of them
  - "Next episode →" button — step through episodes freely
- Everything a paying customer gets (all 5 breaks, narration, scheduling)

## Notes

- Access is stored in the browser (localStorage), so a reviewer activates once per browser/device.
- "Clear all my data" in Settings also removes the activated code — re-activate with the link.
