// Mock auth for the lab. Stands in for Supabase Auth (username + password, then TOTP to reach AAL2).
// Kept is invite-only: accounts are created by hand, so there is no sign-up call.
// Lives in sessionStorage so a refresh mid-2FA keeps you on /login/mfa, as the v0 plan asks.

export type AuthLevel = 'aal1' | 'aal2';

export interface KeptSession {
  username: string;
  aal: AuthLevel;
}

const KEY = 'kept.lab.session';

export function getSession(): KeptSession | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as KeptSession) : null;
  } catch {
    return null;
  }
}

function setSession(session: KeptSession | null) {
  try {
    if (session) sessionStorage.setItem(KEY, JSON.stringify(session));
    else sessionStorage.removeItem(KEY);
  } catch {
    // Storage blocked (private mode); the session just won't survive a refresh.
  }
}

export async function signInWithPassword(
  username: string,
  password: string,
): Promise<{ error?: { field: 'username' | 'password'; message: string } }> {
  await new Promise((resolve) => setTimeout(resolve, 700));
  // Lab rule so the error state can be exercised: the password "incorrect" is rejected.
  if (password === 'incorrect') {
    return { error: { field: 'password', message: 'Username or password is incorrect.' } };
  }
  setSession({ username, aal: 'aal1' });
  return {};
}

export function signOut() {
  setSession(null);
}
