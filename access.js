// access.js — The Daily Reset access system
// Handles: 5-day free trial (name + email), paid full access (Stripe Payment Links),
// and permanent REVIEWER access via access codes (for Shane + selected testers).
// No backend — all state lives in localStorage.

const TRIAL_DAYS = 5;

const STRIPE_CONFIG = {
  active: true, // Payment Links created in Stripe Dashboard (currently TEST mode)
  monthlyPaymentLink: 'https://buy.stripe.com/test_6oUdRbbm44fx1xPchp0x200',
  annualPaymentLink: 'https://buy.stripe.com/test_4gMbJ3cq87rJa4l4OX0x201'
};

// --- Reviewer access codes ---
// Permanent, unrestricted access. Add/remove codes here.
// Reviewers get: no trial expiry, no daily episode cap, episode browser,
// and a REVIEWER badge in the app header.
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

function startTrial(name, email) {
  const trialData = {
    name: name,
    email: email,
    startDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + TRIAL_DAYS * 86400000).toISOString()
  };
  localStorage.setItem('reset_trial', JSON.stringify(trialData));
  return trialData;
}

function isTrialActive() {
  const trial = getTrialData();
  if (!trial) return false;
  return new Date(trial.expiryDate) > new Date();
}

function trialDaysRemaining() {
  const trial = getTrialData();
  if (!trial) return 0;
  const ms = new Date(trial.expiryDate) - new Date();
  return Math.max(0, Math.ceil(ms / 86400000));
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

function isPaidUser() {
  return localStorage.getItem('reset_full_access') === 'true';
}

function hasFullAccess() {
  return isReviewer() || isPaidUser() || isTrialActive();
}

// Single source of truth for "where is this user in the lifecycle"
// Returns: 'reviewer' | 'paid' | 'trial' | 'expired' | 'none'
function getAccessLevel() {
  if (isReviewer()) return 'reviewer';
  if (isPaidUser()) return 'paid';
  if (isTrialActive()) return 'trial';
  if (getTrialData()) return 'expired';
  return 'none';
}

// Display name for greetings — trial name, or reviewer label as fallback
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

// --- Stripe Payment Link checkout (no backend needed) ---

function goToStripePayment(plan) {
  const link = plan === 'annual' ? STRIPE_CONFIG.annualPaymentLink : STRIPE_CONFIG.monthlyPaymentLink;
  window.location.href = link;
}

function unlockFullAccessAfterPayment() {
  localStorage.setItem('reset_full_access', 'true');
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
        return;
      }
    }
  }

  // Payment success redirect (Stripe Payment Link success URL adds ?checkout=success)
  if (params.get('checkout') === 'success') {
    unlockFullAccessAfterPayment();
    window.history.replaceState({}, '', window.location.pathname);
    if (!window.location.pathname.endsWith('app.html')) {
      window.location.href = 'app.html';
    }
  }
});

if (typeof window !== 'undefined') {
  window.STRIPE_CONFIG = STRIPE_CONFIG;
  window.TRIAL_DAYS = TRIAL_DAYS;
  window.getTrialData = getTrialData;
  window.startTrial = startTrial;
  window.isTrialActive = isTrialActive;
  window.trialDaysRemaining = trialDaysRemaining;
  window.getReviewerData = getReviewerData;
  window.isReviewer = isReviewer;
  window.activateAccessCode = activateAccessCode;
  window.isPaidUser = isPaidUser;
  window.hasFullAccess = hasFullAccess;
  window.getAccessLevel = getAccessLevel;
  window.getUserName = getUserName;
  window.getUserFirstName = getUserFirstName;
  window.goToStripePayment = goToStripePayment;
  window.unlockFullAccessAfterPayment = unlockFullAccessAfterPayment;
}
