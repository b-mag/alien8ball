import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DecryptConsole } from './DecryptConsole'

vi.mock('../hooks/useAnswerImage', () => ({
  useAnswerImage: () => ({
    imageUrl: null,
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
}))

describe('DecryptConsole', () => {
  it('renders stargate frame and cleanup sliders', () => {
    render(
      <DecryptConsole
        projectId="project-1"
        questionId="question-1"
        questionText="Test question"
        onReturn={vi.fn()}
      />,
    )

    expect(screen.getByLabelText('Stargate decryption viewport')).toBeInTheDocument()
    expect(screen.getByText('Deblur / Sharpen')).toBeInTheDocument()
    expect(screen.getByText('Noise Reduction')).toBeInTheDocument()
    expect(screen.getByText('Glow Intensity')).toBeInTheDocument()
  })

  it('fires onReturn when return button is clicked', async () => {
    const user = userEvent.setup()
    const onReturn = vi.fn()

    render(
      <DecryptConsole
        projectId="project-1"
        questionId="question-1"
        questionText="Test question"
        onReturn={onReturn}
      />,
    )

    await user.click(screen.getByRole('button', { name: /RETURN TO TRANSMISSION/i }))
    expect(onReturn).toHaveBeenCalledOnce()
  })
})
