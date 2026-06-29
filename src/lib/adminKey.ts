const ADMIN_KEY_STORAGE = 'jobpilot_admin_key'

export function getAdminKey(): string | null {
  return sessionStorage.getItem(ADMIN_KEY_STORAGE)
}

export function setAdminKey(key: string): void {
  sessionStorage.setItem(ADMIN_KEY_STORAGE, key)
}

export function clearAdminKey(): void {
  sessionStorage.removeItem(ADMIN_KEY_STORAGE)
}

export function isAdminAuthenticated(): boolean {
  return Boolean(getAdminKey()?.trim())
}
