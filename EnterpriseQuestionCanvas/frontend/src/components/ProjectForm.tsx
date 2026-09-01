import { useId, useState, type FormEvent } from 'react'

type ProjectFormProps = {
  onCreate: (projectName: string) => Promise<void>
}

/**
 * Form for initiating a new transmission session.
 */
export function ProjectForm({ onCreate }: ProjectFormProps) {
  const inputId = useId()
  const [projectName, setProjectName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await onCreate(projectName)
      setProjectName('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to initiate session.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="stack-form">
      <label htmlFor={inputId}>Session Name</label>
      <input
        id={inputId}
        value={projectName}
        onChange={(event) => setProjectName(event.target.value)}
        maxLength={120}
        placeholder="Enter session designation..."
        required
      />
      {error && <p className="error" role="alert">{error}</p>}
      <button type="submit" disabled={busy}>
        {busy ? 'INITIATING...' : 'INITIATE SESSION'}
      </button>
    </form>
  )
}
