// access.js — The Daily Reset access system
// Handles: free ongoing access (name + email required, no expiry, no payment),
// and permanent REVIEWER access via access codes (for Shane + selected testers).
// No backend — all state lives in localStorage.
// (An earlier version gated this behind a 5-day trial + Stripe paywall — full
// access is free while the product is being built out.)

// --- Lead capture (Supabase) ---
// The publishable key below is designed to be public (Supabase's own model —
// it can only INSERT into `leads`, per the RLS policy set on that table; it
// cannot read, update, or delete anything). No secret lives in this file.
const SUPABASE_CONFIG = {
  url: 'https://nbhrrozrypetprnowzbx.supabase.co',
  publishableKey: 'sb_publishable_D75EX5UMfSJ4OHsXHHxdSg_mjtaUxQy'
};

// --- Saving to Supabase (insert-only) ---
// A save can fail: offline, ad-blocker, project paused, key or policy rejected. The
// visitor is never blocked (they always get into the app), but a failed save is no
// longer lost or silent: it is logged to the console, parked in localStorage and
// retried on every later page load and whenever the phone comes back online. After
// MAX_SAVE_ATTEMPTS it stops retrying but is kept. On a reviewer's device (Shane's)
// a red banner shows anything that has not reached Supabase.
// Limit: this can only be seen on the device that failed — a customer's phone cannot
// tell Shane. Outages are caught separately by .github/workflows/supabase-keepalive.yml.
const PENDING_SAVES_KEY = 'reset_pending_saves';
const MAX_SAVE_ATTEMPTS = 8;

function insertRow(table, row) {
  return fetch(`${SUPABASE_CONFIG.url}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_CONFIG.publishableKey,
      'Authorization': `Bearer ${SUPABASE_CONFIG.publishableKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(row)
  }).then(res => {
    // fetch() only rejects on network errors; a 401/403/404/5xx still "succeeds".
    if (!res.ok) throw new Error('Supabase answered ' + res.status);
  });
}

function getPendingSaves() {
  try { return JSON.parse(localStorage.getItem(PENDING_SAVES_KEY) || '[]'); } catch (e) { return []; }
}

function setPendingSaves(list) {
  try { localStorage.setItem(PENDING_SAVES_KEY, JSON.stringify(list)); } catch (e) { /* storage blocked */ }
}

// Never rejects, so callers can ignore the result.
function saveRow(table, row) {
  return insertRow(table, row).catch(err => {
    console.warn(`[Daily Reset] Could not save to "${table}" (${err.message}); kept to retry.`);
    const list = getPendingSaves();
    list.push({
      id: Date.now() + '-' + Math.random().toString(36).slice(2, 8),
      table, row, attempts: 1, lastError: err.message, failedAt: new Date().toISOString()
    });
    setPendingSaves(list);
    if (document.body) showPendingBanner();
  });
}

let retryingSaves = false;
async function retryPendingSaves() {
  if (retryingSaves) return;
  retryingSaves = true;
  try {
    const due = getPendingSaves().filter(p => p.attempts < MAX_SAVE_ATTEMPTS);
    for (const item of due) {
      let error = null;
      try { await insertRow(item.table, item.row); } catch (e) { error = e.message; }
      // Re-read each time so saves queued meanwhile are not overwritten.
      const list = getPendingSaves();
      const i = list.findIndex(p => p.id === item.id);
      if (i === -1) continue;
      if (error) { list[i].attempts++; list[i].lastError = error; } else { list.splice(i, 1); }
      setPendingSaves(list);
    }
  } finally {
    retryingSaves = false;
  }
}

function showPendingBanner() {
  const old = document.getElementById('pending-saves-banner');
  if (old) old.remove();
  const stuck = getPendingSaves();
  if (!stuck.length || !isReviewer()) return;
  const el = document.createElement('div');
  el.id = 'pending-saves-banner';
  el.setAttribute('role', 'status');
  el.style.cssText = 'position:fixed;left:12px;right:12px;bottom:12px;z-index:9999;padding:10px 14px;' +
    'border-radius:10px;background:#7a1f1f;color:#fff;font:14px/1.4 system-ui,sans-serif;' +
    'box-shadow:0 2px 10px rgba(0,0,0,.3);cursor:pointer';
  el.textContent = `Reviewer notice: ${stuck.length} sign-up/review save(s) on this device have not reached ` +
    `Supabase (${stuck[stuck.length - 1].lastError}). Retrying on each visit. Tap to dismiss.`;
  el.addEventListener('click', () => el.remove());
  document.body.appendChild(el);
}

function captureLead(name, email) {
  const source = window.location.pathname.endsWith('app.html') ? 'app' : 'landing';
  saveRow('leads', { name, email, source });
}

// In-app review submission — separate insert-only table from `leads`, same
// trusted RLS model (anon can INSERT, never read/update/delete). Kept as its
// own table rather than an UPDATE onto the lead's row so the public key never
// needs update rights on anything. Shane matches reviews to leads by email,
// and flips `reviewed_by_shane` himself in the Supabase table editor.
function submitReview({ name, email, rating, reviewText, marketingConsent }) {
  return saveRow('reviews', {
    name, email, rating,
    review_text: reviewText || null,
    marketing_consent: marketingConsent
  });
}

// --- Reviewer access codes ---
// Permanent, unrestricted access. Add/remove codes here.
// Reviewers get: no daily episode cap, episode browser, and a REVIEWER badge.
const ACCESS_CODES = {
  'SHANE-FOUNDER':    { level: 'reviewer', label: 'Founder' },
  'RESET-REVIEW-01':  { level: 'reviewer', label: 'Reviewer' },
  'RESET-REVIEW-02':  { level: 'reviewer', label: 'Reviewer' },
  'RESET-REVIEW-03':  { level: 'reviewer', label: 'Reviewer' },
  'RESET-REVIEW-04':  { level: 'reviewer', label: 'Reviewer' },
  'RESET-REVIEW-05':  { level: 'reviewer', label: 'Reviewer' }
};

// --- Core access state ---

function getTrialData() {
  return JSON.parse(localStorage.getItem('reset_trial') || 'null');
}

// Despite the name (kept for compatibility with existing signed-up users'
// stored data), this grants permanent free access — there is no expiry.
function startTrial(name, email) {
  const trialData = {
    name: name,
    email: email,
    startDate: new Date().toISOString()
  };
  localStorage.setItem('reset_trial', JSON.stringify(trialData));
  captureLead(name, email);
  return trialData;
}

// Anyone who has signed up (name + email) has free access, indefinitely.
function hasSignedUp() {
  return !!getTrialData();
}

function getReviewerData() {
  const stored = JSON.parse(localStorage.getItem('reset_access_code') || 'null');
  if (!stored) return null;
  const def = ACCESS_CODES[stored.code];
  if (!def) return null; // code was revoked — access ends
  return { code: stored.code, level: def.level, label: def.label, activatedAt: stored.activatedAt };
}

function isReviewer() {
  return !!getReviewerData();
}

function activateAccessCode(rawCode) {
  const code = (rawCode || '').trim().toUpperCase();
  if (!ACCESS_CODES[code]) return { ok: false, error: 'That code is not valid. Check it and try again.' };
  localStorage.setItem('reset_access_code', JSON.stringify({
    code: code,
    activatedAt: new Date().toISOString()
  }));
  return { ok: true, level: ACCESS_CODES[code].level, label: ACCESS_CODES[code].label };
}

function hasFullAccess() {
  return isReviewer() || hasSignedUp();
}

// Single source of truth for "where is this user in the lifecycle"
// Returns: 'reviewer' | 'free' | 'none'
function getAccessLevel() {
  if (isReviewer()) return 'reviewer';
  if (hasSignedUp()) return 'free';
  return 'none';
}

// Display name for greetings — signup name, or reviewer label as fallback
function getUserName() {
  const trial = getTrialData();
  if (trial && trial.name) return trial.name;
  const reviewer = getReviewerData();
  if (reviewer) return reviewer.label;
  return null;
}

function getUserFirstName() {
  const name = getUserName();
  return name ? name.split(' ')[0] : null;
}

// --- Shared boot logic (runs on both landing page and app) ---

document.addEventListener('DOMContentLoaded', () => {
  // Access code in URL: app.html?code=SHANE-FOUNDER or index.html?code=...
  const params = new URLSearchParams(window.location.search);
  const urlCode = params.get('code') || params.get('access');
  if (urlCode) {
    const result = activateAccessCode(urlCode);
    if (result.ok) {
      // Clean the code out of the URL, then land in the app
      window.history.replaceState({}, '', window.location.pathname);
      if (!window.location.pathname.endsWith('app.html')) {
        window.location.href = 'app.html';
      }
    }
  }

  // Re-send any sign-up or review that failed earlier (see "Saving to Supabase").
  retryPendingSaves().then(showPendingBanner);
  window.addEventListener('online', () => retryPendingSaves().then(showPendingBanner));
});

if (typeof window !== 'undefined') {
  window.getTrialData = getTrialData;
  window.startTrial = startTrial;
  window.hasSignedUp = hasSignedUp;
  window.getReviewerData = getReviewerData;
  window.isReviewer = isReviewer;
  window.activateAccessCode = activateAccessCode;
  window.hasFullAccess = hasFullAccess;
  window.getAccessLevel = getAccessLevel;
  window.getUserName = getUserName;
  window.getUserFirstName = getUserFirstName;
  window.submitReview = submitReview;
  window.getPendingSaves = getPendingSaves; // entries that have not reached Supabase yet
  // Exposed so premium.js can reuse the same project config instead of
  // duplicating it — this key is insert-only/public by design (see comment
  // above), so exporting it changes nothing about what it can do.
  window.SUPABASE_CONFIG = SUPABASE_CONFIG;
}
