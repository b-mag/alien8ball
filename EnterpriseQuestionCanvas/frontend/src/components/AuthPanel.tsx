import { useId, useState, type FormEvent } from 'react'
import { useAuth } from '../auth/useAuth'
type Mode = 'login' | 'register'
export function AuthPanel() {
     const auth = useAuth()
  const emailId = useId()
  const passwordId = useId()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    try {
      if (mode === 'login') {
        await auth.login(email, password)
      } else {
        await auth.register(email, password)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.')
    }
  }
  return (
    <section className="auth-card" aria-labelledby="auth-title">
      <h1 id="auth-title">Alien 8 Ball</h1>
      <p>Sign in to access your private projects and questions.</p>
      <div className="segmented" role="group" aria-label="Authentication mode">
        <button type="button" onClick={() => setMode('login')} aria-pressed={mode === 'login'}>
          Sign in
        </button>
        <button type="button" onClick={() => setMode('register')} aria-pressed={mode === 'register'}>
          Register
        </button>
      </div>
      <form onSubmit={onSubmit}>
        <label htmlFor={emailId}>Email</label>
        <input
          id={emailId}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <label htmlFor={passwordId}>Password</label>
        <input
          id={passwordId}
          type="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={12}
          required
        />
        {mode === 'register' && (
          <p className="hint">Use 12+ characters with upper/lowercase, a number, and a symbol.</p>
        )}
        {error && <p className="error" role="alert">{error}</p>}
        <button type="submit" disabled={auth.status === 'loading'}>
          {auth.status === 'loading'
            ? 'Working...'
            : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
      </form>
    </section>
  )
}