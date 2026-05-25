// Local-only auth — accounts stored in localStorage, no Firebase needed

const ACCOUNTS_KEY = 'cb_local_accounts';
const SESSION_KEY  = 'cb_local_session';

// Very simple deterministic hash (demo purposes only, not cryptographic)
function simpleHash(str: string): string {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (h * 33) ^ str.charCodeAt(i);
  }
  return (h >>> 0).toString(36);
}

export interface LocalAccount {
  uid: string;
  email: string;
  displayName: string;
  passwordHash: string;
  tier: 'basic' | 'medium' | 'premium';
  createdAt: string;
  isDemo?: boolean;
}

export interface LocalSession {
  uid: string;
  email: string;
  displayName: string;
  tier: 'basic' | 'medium' | 'premium';
  isLocal: true;
}

// ── Seed the demo account once ───────────────────────────────────────────────
function ensureDemo() {
  const accounts = getAccounts();
  if (!accounts.find(a => a.isDemo)) {
    accounts.unshift({
      uid: 'demo-user-001',
      email: 'demo@careerboost.ai',
      displayName: 'Demo User',
      passwordHash: simpleHash('Demo@1234'),
      tier: 'premium',
      createdAt: new Date().toISOString(),
      isDemo: true,
    });
    saveAccounts(accounts);
  }
}

function getAccounts(): LocalAccount[] {
  try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? '[]'); }
  catch { return []; }
}

function saveAccounts(acc: LocalAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(acc));
}

// ── Public API ───────────────────────────────────────────────────────────────

export function createLocalAccount(email: string, password: string, displayName: string): LocalAccount {
  ensureDemo();
  const accounts = getAccounts();
  if (accounts.find(a => a.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('An account with this email already exists.');
  }
  const account: LocalAccount = {
    uid: `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    email,
    displayName: displayName || email.split('@')[0],
    passwordHash: simpleHash(password),
    tier: 'premium',
    createdAt: new Date().toISOString(),
  };
  accounts.push(account);
  saveAccounts(accounts);
  return account;
}

export function loginLocalAccount(email: string, password: string): LocalAccount | null {
  ensureDemo();
  const accounts = getAccounts();
  return accounts.find(
    a => a.email.toLowerCase() === email.toLowerCase() && a.passwordHash === simpleHash(password)
  ) ?? null;
}

export function getDemoAccount(): LocalAccount {
  ensureDemo();
  return getAccounts().find(a => a.isDemo)!;
}

export function getLocalSession(): LocalSession | null {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null'); }
  catch { return null; }
}

export function setLocalSession(account: LocalAccount): LocalSession {
  const session: LocalSession = {
    uid: account.uid,
    email: account.email,
    displayName: account.displayName,
    tier: account.tier,
    isLocal: true,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function clearLocalSession() {
  localStorage.removeItem(SESSION_KEY);
}
