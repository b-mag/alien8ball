import { useId, useState, type FormEvent } from 'react'
export function ProjectForm({
  onCreate,
}: {
  onCreate: (projectName: string) => Promise<void>
}) {
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
      setError(err instanceof Error ? err.message : 'Unable to create project.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <form onSubmit={onSubmit} className="stack-form">
      <label htmlFor={inputId}>Project Name</label>
      <input
        id={inputId}
        value={projectName}
        onChange={(event) => setProjectName(event.target.value)}
        maxLength={120}
        required
      />
      {error && <p className="error" role="alert">{error}</p>}
      <button type="submit" disabled={busy}>
        {busy ? 'Saving...' : 'Create project'}
      </button>
    </form>
  )
}