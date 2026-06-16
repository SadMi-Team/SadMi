export interface StoredUser {
  email: string;
  perfil: string;
}

const AUTH_STORAGE_KEY = "sadmi_auth_user";

export function getStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function setStoredUser(user: StoredUser): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredUser(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function hasProfile(allowedProfiles: string[]): boolean {
  const user = getStoredUser();
  return Boolean(user && allowedProfiles.includes(user.perfil));
}
