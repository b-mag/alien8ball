import { useCallback, useEffect, useRef, useState } from 'react'

type AnswerImageState = {
  imageUrl: string | null
  loading: boolean
  error: string | null
}

/**
 * Fetches the deterministic alien answer PNG for a selected question.
 */
export function useAnswerImage(
  projectId: string | null,
  questionId: string | null,
) {
  const [state, setState] = useState<AnswerImageState>({
    imageUrl: null,
    loading: false,
    error: null,
  })
  const objectUrlRef = useRef<string | null>(null)

  const revokeObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
  }, [])

  const fetchAnswerImage = useCallback(async (
    activeProjectId: string,
    activeQuestionId: string,
    signal?: AbortSignal,
  ) => {
    setState({ imageUrl: null, loading: true, error: null })
    try {
      const response = await fetch(
        `/api/projects/${activeProjectId}/questions/${activeQuestionId}/answer-image`,
        { credentials: 'include', signal },
      )
      if (!response.ok) {
        throw new Error('Unable to retrieve alien signal.')
      }
      const blob = await response.blob()
      revokeObjectUrl()
      const url = URL.createObjectURL(blob)
      objectUrlRef.current = url
      setState({ imageUrl: url, loading: false, error: null })
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setState({
        imageUrl: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unable to retrieve alien signal.',
      })
    }
  }, [revokeObjectUrl])

  useEffect(() => {
  if (!projectId || !questionId) {
      revokeObjectUrl()
      setState({ imageUrl: null, loading: false, error: null })
      return
    }

    const controller = new AbortController()
    void fetchAnswerImage(projectId, questionId, controller.signal)
    return () => {
      controller.abort()
      revokeObjectUrl()
    }
  }, [projectId, questionId, fetchAnswerImage, revokeObjectUrl])

  return {
    ...state,
    refetch: () => {
      if (projectId && questionId) {
        void fetchAnswerImage(projectId, questionId)
      }
    },
  }
}
