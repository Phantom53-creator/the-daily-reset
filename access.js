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

// Fire-and-forget — never blocks or breaks signup if this fails (offline,
// ad-blocker, Supabase hiccup, etc.). The user always gets into the app.
function captureLead(name, email) {
  const source = window.location.pathname.endsWith('app.html') ? 'app' : 'landing';
  fetch(`${SUPABASE_CONFIG.url}/rest/v1/leads`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_CONFIG.publishableKey,
      'Authorization': `Bearer ${SUPABASE_CONFIG.publishableKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ name, email, source })
  }).catch(() => { /* best-effort only */ });
}

// In-app review submission — separate insert-only table from `leads`, same
// trusted RLS model (anon can INSERT, never read/update/delete). Kept as its
// own table rather than an UPDATE onto the lead's row so the public key never
// needs update rights on anything. Shane matches reviews to leads by email,
// and flips `reviewed_by_shane` himself in the Supabase table editor.
function submitReview({ name, email, rating, reviewText, marketingConsent }) {
  return fetch(`${SUPABASE_CONFIG.url}/rest/v1/reviews`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_CONFIG.publishableKey,
      'Authorization': `Bearer ${SUPABASE_CONFIG.publishableKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      name, email, rating,
      review_text: reviewText || null,
      marketing_consent: marketingConsent
    })
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
}
