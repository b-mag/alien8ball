import { useId, useState, type FormEvent } from 'react'

type QuestionFormProps = {
  disabled: boolean
  onCreate: (question: string) => Promise<void>
}

/**
 * Form for transmitting a question to the alien signal network.
 */
export function QuestionForm({ disabled, onCreate }: QuestionFormProps) {
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
      setError(err instanceof Error ? err.message : 'Transmission failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="stack-form">
      <label htmlFor={inputId}>TRANSMIT QUESTION</label>
      <textarea
        id={inputId}
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        maxLength={2000}
        rows={5}
        disabled={disabled}
        placeholder="Transmit Question..."
        required
      />
      <div className="form-meta">{question.length}/2000</div>
      {error && <p className="error" role="alert">{error}</p>}
      <button type="submit" className="transmit-btn" disabled={disabled || busy}>
        {busy ? 'TRANSMITTING...' : 'TRANSMIT'}
      </button>
    </form>
  )
}
