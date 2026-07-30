// premium.js — passwordless auth for the premium tier, via a one-time emailed
// code (not a clickable magic link). Completely separate from access.js's
// free-tier flow (name+email, zero friction, localStorage only) — nothing
// here touches that. A real account only gets created at the moment someone
// upgrades, since paid access needs an identity that survives clearing
// browser storage and works across devices; free access deliberately
// doesn't.
//
// Deliberately code-entry, not a magic link: verified live that a link sent
// to an iCloud address came back "otp_expired" on the very first genuine
// click — Supabase's own auth log showed the sign-in had already succeeded
// moments earlier, meaning something (mail-provider link-scanning is the
// common cause) had already consumed the one-time link before the user ever
// clicked it themselves. A typed code can't be silently pre-consumed the
// same way, since nothing auto-types it. Requires the Magic Link email
// template in Supabase (Authentication → Emails) to include {{ .Token }},
// sent via a custom SMTP domain (not Supabase's default shared sender) so
// that template editing is unlocked and delivery isn't rate-limited.
//
// Client is named `premiumClient`, not `supabase`, so it never shadows the
// SDK's own global (window.supabase, set by the CDN script tag).

const premiumClient = window.supabase.createClient(
  window.SUPABASE_CONFIG.url,
  window.SUPABASE_CONFIG.publishableKey
);

// Emails a one-time code to sign in with (length isn't fixed at 6 digits —
// observed 8 digits live — so callers shouldn't assume a specific length).
// Returns { ok, error }.
async function requestPremiumCode(email) {
  const { error } = await premiumClient.auth.signInWithOtp({ email });
  return { ok: !error, error: error?.message || null };
}

// Verifies the code the user typed in from that email. Returns { ok, error }.
async function verifyPremiumCode(email, code) {
  const { error } = await premiumClient.auth.verifyOtp({ email, token: code, type: 'email' });
  return { ok: !error, error: error?.message || null };
}

async function getPremiumSession() {
  const { data, error } = await premiumClient.auth.getSession();
  if (error) return null;
  return data.session;
}

// 'free' | 'paid' | null (null = not signed in to a premium account at all —
// distinct from the free-tier access.js state, which this never overrides).
async function getPremiumTier() {
  const session = await getPremiumSession();
  if (!session) return null;
  const { data, error } = await premiumClient
    .from('profiles')
    .select('tier')
    .eq('id', session.user.id)
    .single();
  if (error) return null;
  return data.tier;
}

async function signOutPremium() {
  await premiumClient.auth.signOut();
}

if (typeof window !== 'undefined') {
  window.premiumClient = premiumClient;
  window.requestPremiumCode = requestPremiumCode;
  window.verifyPremiumCode = verifyPremiumCode;
  window.getPremiumSession = getPremiumSession;
  window.getPremiumTier = getPremiumTier;
  window.signOutPremium = signOutPremium;
}
