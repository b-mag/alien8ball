import { useId, useState, type FormEvent } from 'react'
export function QuestionForm({
  disabled,
  onCreate,
}: {
  disabled: boolean
  onCreate: (question: string) => Promise<void>
}) {
  const inputId = useId()
  const [question, setQuestion] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await onCreate(question)
      setQuestion('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save question.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <form onSubmit={onSubmit} className="stack-form">
      <label htmlFor={inputId}>Question</label>
      <textarea
        id={inputId}
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        maxLength={2000}
        rows={5}
        disabled={disabled}
        required
      />
      <div className="form-meta">{question.length}/2000</div>
      {error && <p className="error" role="alert">{error}</p>}
      <button type="submit" disabled={disabled || busy}>
        {busy ? 'Saving...' : 'Save question'}
      </button>
    </form>
  )
}