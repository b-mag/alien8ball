import {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useState,
    type PropsWithChildren,
} from 'react'
import { ApiError, apiFetch } from '../api/http'
import type { SessionInfo } from '../types/api'

type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

type AuthContextValue = {
    status: AuthStatus
    email: string | null
    login: (email: string, password: string) => Promise<void>
    register: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
}

/**
 * React context holding the current authentication state and actions.
 * Null until provided by an AuthProvider.
 */
export const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * Provider component that manages authentication state (status and email)
 * and exposes login, register, and logout actions to descendant components.
 * Restores any existing session on mount.
 * @param props - Standard React props; children are rendered inside the provider
 * @returns The AuthContext provider wrapping the given children
 */
export function AuthProvider({ children }: PropsWithChildren) {
    const [status, setStatus] = useState<AuthStatus>('loading')
    const [email, setEmail] = useState<string | null>(null)

    /**
     * Fetches the current session and updates status/email accordingly.
     * Sets the state to unauthenticated on a 401 response; rethrows other errors.
     * @returns A promise that resolves once the session state has been updated
     */
    const refreshSession = useCallback(async () => {
        try {
            const session = await apiFetch<SessionInfo>('/api/auth/session')
            setEmail(session.email)
            setStatus('authenticated')
        } catch (error) {
            if (error instanceof ApiError && error.status === 401) {
                setEmail(null)
                setStatus('anonymous')
                return
            }
            throw error
        }
    }, [])
 useEffect(() => {
    void refreshSession().catch((error) => {
      console.error('Unable to restore the session.', error)
      setEmail(null)
      setStatus('anonymous')
    })
  }, [refreshSession])
  /**
   * Logs the user in with the given credentials and refreshes the session.
   * @param loginEmail - The user's email address
   * @param password - The user's password
   * @returns A promise that resolves once login and session refresh complete
   * @throws Rethrows any error from the login request after resetting status
   */
  const login = useCallback(async (loginEmail: string, password: string) => {
    setStatus('loading')
    try {
      await apiFetch<void>('/api/auth/login?useCookies=true', {
        method: 'POST',
        body: JSON.stringify({ email: loginEmail, password }),
      })
      await refreshSession()
    } catch (error) {
      setStatus('anonymous')
      throw error
    }
  }, [refreshSession])
  /**
   * Registers a new account and then logs the user in with the same credentials.
   * @param registerEmail - The email address for the new account
   * @param password - The password for the new account
   * @returns A promise that resolves once registration and login complete
   */
  const register = useCallback(async (
    registerEmail: string,
    password: string,
  ) => {
    await apiFetch<void>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: registerEmail, password }),
    })
    await login(registerEmail, password)
  }, [login])
  /**
   * Logs the user out and clears the local session state.
   * @returns A promise that resolves once logout completes
   */
  const logout = useCallback(async () => {
    await apiFetch<void>('/api/auth/logout', { method: 'POST' })
    setEmail(null)
    setStatus('anonymous')
  }, [])
  const value = useMemo<AuthContextValue>(() => ({
    status,
    email,
    login,
    register,
    logout,
  }), [status, email, login, register, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>  
}