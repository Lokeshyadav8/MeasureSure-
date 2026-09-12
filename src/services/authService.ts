import { UserEntity, SecurityAuditReport } from '../types';

export interface RememberedProfile {
  email: string;
  phone: string;
  role: string;
  rememberedAt?: number;
}

const LOCAL_REMEMBERED_KEY = 'LEGAL_METROLOGY_REMEMBERED_V1';

// Client-side SHA-256 fallback hash with salt for defense-in-depth
export async function clientSideHash(text: string, salt: string): Promise<string> {
  try {
    const enc = new TextEncoder();
    const data = enc.encode(text + ':' + salt);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // Basic fallback if subtle crypto is unavailable
    let hash = 0;
    const str = text + salt;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(16, '0');
  }
}

export async function loginWithDatabase(
  emailOrId: string,
  password?: string,
  role?: string,
  rememberMe: boolean = false,
  phone?: string
): Promise<{ success: boolean; user?: UserEntity; message?: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emailOrId,
        password: password || '',
        role,
        rememberMe,
        phone
      })
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.error || 'Authentication failed' };
    }

    if (rememberMe && data.user) {
      saveLocalRemembered({
        email: data.user.email,
        phone: data.user.phone || phone || '',
        role: data.user.role
      });
    } else if (!rememberMe) {
      clearLocalRemembered();
    }

    return { success: true, user: data.user };
  } catch (err: any) {
    console.warn('[Auth Service] Server login endpoint unavailable, using offline fallback:', err);
    return { success: false, message: 'Server authentication currently connecting. Please try again.' };
  }
}

export async function registerWithDatabase(
  userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: UserEntity['role'];
    businessOrDepartment?: string;
    licenseNumber?: string;
  }
): Promise<{ success: boolean; user?: UserEntity; message?: string }> {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.error || 'Registration failed' };
    }

    // Remember newly registered user
    saveLocalRemembered({
      email: userData.email,
      phone: userData.phone,
      role: userData.role
    });

    return { success: true, user: data.user, message: data.message };
  } catch (err: any) {
    console.warn('[Auth Service] Server registration endpoint unavailable:', err);
    return { success: false, message: 'Connection to statutory database failed. Please retry.' };
  }
}

export async function fetchRememberedUser(): Promise<RememberedProfile | null> {
  try {
    const res = await fetch('/api/auth/remembered');
    if (res.ok) {
      const data = await res.json();
      if (data.remembered && data.remembered.email) {
        saveLocalRemembered(data.remembered);
        return data.remembered;
      }
    }
  } catch (e) {
    // ignore
  }
  return getLocalRemembered();
}

export function saveLocalRemembered(profile: RememberedProfile): void {
  try {
    localStorage.setItem(LOCAL_REMEMBERED_KEY, JSON.stringify(profile));
  } catch (e) {
    console.warn('Failed to save remembered to localStorage:', e);
  }
}

export function getLocalRemembered(): RememberedProfile | null {
  try {
    const raw = localStorage.getItem(LOCAL_REMEMBERED_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return null;
}

export function clearLocalRemembered(): void {
  try {
    localStorage.removeItem(LOCAL_REMEMBERED_KEY);
    fetch('/api/auth/remember', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clear: true })
    }).catch(() => {});
  } catch {
    // ignore
  }
}

export async function fetchSecurityAudit(): Promise<SecurityAuditReport | null> {
  try {
    const res = await fetch('/api/auth/security-audit');
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Failed to fetch security audit report:', e);
  }
  return null;
}
