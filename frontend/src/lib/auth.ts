export const AUTH_TOKEN_KEY = 'goodminton_token'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function removeToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

export function logout(): void {
  removeToken()
}

export function isAuthenticated(): boolean {
  return !!getToken()
}
