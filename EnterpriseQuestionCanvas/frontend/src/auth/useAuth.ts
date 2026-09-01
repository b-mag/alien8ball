import { useContext } from 'react'
import { AuthContext } from './AuthContext'

/**
 * Hook that returns the current authentication context value.
 * Must be used within an AuthProvider.
 * @returns The auth context value (status, email, and login/register/logout actions)
 * @throws {Error} When called outside of an AuthProvider
 */
export function useAuth() {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }

    return context
}