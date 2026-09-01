import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { QuestionForm } from './QuestionForm'

describe('QuestionForm', () => {
  it('renders TRANSMIT button and placeholder', () => {
    render(<QuestionForm disabled={false} onCreate={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'TRANSMIT' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Transmit Question...')).toBeInTheDocument()
  })

  it('disables controls when disabled prop is true', () => {
    render(<QuestionForm disabled onCreate={vi.fn()} />)

    expect(screen.getByPlaceholderText('Transmit Question...')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'TRANSMIT' })).toBeDisabled()
  })

  it('calls onCreate with question text on submit', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn().mockResolvedValue(undefined)

    render(<QuestionForm disabled={false} onCreate={onCreate} />)

    await user.type(screen.getByPlaceholderText('Transmit Question...'), 'Are we alone?')
    await user.click(screen.getByRole('button', { name: 'TRANSMIT' }))

    expect(onCreate).toHaveBeenCalledWith('Are we alone?')
  })
})
