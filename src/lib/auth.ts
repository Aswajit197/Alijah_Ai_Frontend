import Cookies from 'js-cookie';

const TOKEN_COOKIE_NAME = 'elijah_company_token';
const USER_COOKIE_NAME = 'elijah_company_user';

export interface CompanyUser {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  role: {
    id: string;
    name: string;
    slug: string;
    approvalLimit: number;
    permissions: string[];
  };
}

/**
 * Checks whether a JWT token has expired by parsing its payload.
 */
export function isTokenExpired(token: string): boolean {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false;
    // Check with 10 second buffer
    return Date.now() >= (payload.exp * 1000) - 10000;
  } catch {
    return true;
  }
}

/**
 * Stores the session in secure cookies.
 */
export function setAuthSession(token: string, user: CompanyUser) {
  Cookies.set(TOKEN_COOKIE_NAME, token, {
    expires: 7, // 7 days
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  Cookies.set(USER_COOKIE_NAME, JSON.stringify(user), {
    expires: 7,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

/**
 * Retrieves the stored token, automatically verifying it hasn't expired.
 */
export function getAuthToken(): string | null {
  const token = Cookies.get(TOKEN_COOKIE_NAME);
  if (!token) return null;

  if (isTokenExpired(token)) {
    clearAuthSession();
    return null;
  }

  return token;
}

/**
 * Retrieves the stored user session.
 */
export function getAuthUser(): CompanyUser | null {
  const token = getAuthToken();
  if (!token) return null;

  const rawUser = Cookies.get(USER_COOKIE_NAME);
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser) as CompanyUser;
  } catch {
    clearAuthSession();
    return null;
  }
}

/**
 * Clears cookies and ends the session.
 */
export function clearAuthSession() {
  Cookies.remove(TOKEN_COOKIE_NAME);
  Cookies.remove(USER_COOKIE_NAME);
}

/**
 * Checks if the user is currently authenticated with a valid token.
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

