// stripe.js — The Daily Reset payment + trial access system
// 5-day free trial with full access. Name + email signup only. No payment page for free.
// After trial expires, upgrade via Stripe Payment Links (no backend needed).

const TRIAL_DAYS = 5;

const STRIPE_CONFIG = {
  active: true, // Set to true after creating Stripe Payment Links (see DEPLOYMENT_README.md)
  // Stripe Payment Links — paste your links after creating them in Stripe Dashboard
  monthlyPaymentLink: 'https://buy.stripe.com/test_6oUdRbbm44fx1xPchp0x200',
  annualPaymentLink: 'https://buy.stripe.com/test_4gMbJ3cq87rJa4l4OX0x201'
};

// --- Trial & access logic ---

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

function hasFullAccess() {
  if (localStorage.getItem('reset_full_access') === 'true') return true;
  return isTrialActive();
}

function isPaidUser() {
  return localStorage.getItem('reset_full_access') === 'true';
}

// --- Modal logic ---

function openSignupModal() {
  const modal = document.getElementById('signup-modal');
  if (modal) modal.style.display = 'flex';
}

function closeSignupModal() {
  const modal = document.getElementById('signup-modal');
  if (modal) modal.style.display = 'none';
}

function openUpgradeModal() {
  const modal = document.getElementById('stripe-modal');
  if (modal) modal.style.display = 'flex';
}

function closeUpgradeModal() {
  const modal = document.getElementById('stripe-modal');
  if (modal) modal.style.display = 'none';
}

function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById('signup-name')?.value?.trim();
  const email = document.getElementById('signup-email')?.value?.trim();
  if (!name || !email) return;

  startTrial(name, email);
  closeSignupModal();
  document.body.classList.add('has-full-access', 'has-trial');
  window.location.reload();
}

// --- Stripe Payment Link checkout (no backend needed) ---

function goToStripePayment(plan) {
  if (!STRIPE_CONFIG.active) {
    openUpgradeModal();
    return;
  }
  const link = plan === 'annual' ? STRIPE_CONFIG.annualPaymentLink : STRIPE_CONFIG.monthlyPaymentLink;
  window.location.href = link;
}

function unlockFullAccessAfterPayment() {
  localStorage.setItem('reset_full_access', 'true');
  document.body.classList.add('has-full-access');
}

document.addEventListener('DOMContentLoaded', () => {
  // Signup modal
  const signupForm = document.getElementById('signup-form');
  if (signupForm) signupForm.addEventListener('submit', handleSignup);
  const signupClose = document.getElementById('signup-close');
  if (signupClose) signupClose.addEventListener('click', closeSignupModal);
  const signupCancel = document.getElementById('signup-cancel-btn');
  if (signupCancel) signupCancel.addEventListener('click', closeSignupModal);

  // Upgrade modal + payment buttons
  const upgradeBtn = document.getElementById('upgrade-btn');
  const upgradeBtnExpired = document.getElementById('upgrade-btn-expired');
  const annualLink = document.getElementById('annual-link');
  const modalClose = document.getElementById('modal-close');
  const stripePayBtn = document.getElementById('stripe-pay-btn');
  const stripePayAnnual = document.getElementById('stripe-pay-annual');

  if (upgradeBtn) upgradeBtn.addEventListener('click', () => openUpgradeModal());
  if (upgradeBtnExpired) upgradeBtnExpired.addEventListener('click', () => openUpgradeModal());
  if (annualLink) annualLink.addEventListener('click', (e) => { e.preventDefault(); openUpgradeModal(); });
  if (modalClose) modalClose.addEventListener('click', closeUpgradeModal);
  if (stripePayBtn) stripePayBtn.addEventListener('click', () => goToStripePayment('monthly'));
  if (stripePayAnnual) stripePayAnnual.addEventListener('click', () => goToStripePayment('annual'));

  // Trial expired prompt
  const trial = getTrialData();
  if (trial && !isTrialActive() && !isPaidUser()) {
    const trialExpiredBar = document.getElementById('trial-expired-bar');
    if (trialExpiredBar) trialExpiredBar.style.display = 'flex';
  }

  // Payment success redirect
  const params = new URLSearchParams(window.location.search);
  if (params.get('checkout') === 'success') unlockFullAccessAfterPayment();
});

if (typeof window !== 'undefined') {
  window.STRIPE_CONFIG = STRIPE_CONFIG;
  window.TRIAL_DAYS = TRIAL_DAYS;
  window.openSignupModal = openSignupModal;
  window.closeSignupModal = closeSignupModal;
  window.openUpgradeModal = openUpgradeModal;
  window.closeUpgradeModal = closeUpgradeModal;
  window.hasFullAccess = hasFullAccess;
  window.isPaidUser = isPaidUser;
  window.isTrialActive = isTrialActive;
  window.trialDaysRemaining = trialDaysRemaining;
  window.getTrialData = getTrialData;
  window.startTrial = startTrial;
  window.goToStripePayment = goToStripePayment;
}
