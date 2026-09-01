import { useCallback, useEffect, useReducer, useRef } from 'react'
import { apiFetch } from '../api/http'
import type {
  ProjectDetails,
  ProjectSummary,
  QuestionItem,
} from '../types/api'

type WorkspaceState = {
  projects: ProjectSummary[]
  selected: ProjectDetails | null
  selectedQuestionId: string | null
  loadingProjects: boolean
  loadingDetails: boolean
  error: string | null
}

type Action =
  | { type: 'reset' }
  | { type: 'projectsLoading' }
  | { type: 'projectsLoaded'; projects: ProjectSummary[] }
  | { type: 'detailsLoading' }
  | { type: 'detailsLoaded'; project: ProjectDetails | null }
  | { type: 'questionSelected'; questionId: string | null }
  | { type: 'failed'; message: string }

const initialState: WorkspaceState = {
  projects: [],
  selected: null,
  selectedQuestionId: null,
  loadingProjects: false,
  loadingDetails: false,
  error: null,
}

/**
 * Reduces workspace state in response to a dispatched action.
 */
export function workspaceReducer(state: WorkspaceState, action: Action): WorkspaceState {
  switch (action.type) {
    case 'reset':
      return initialState
    case 'projectsLoading':
      return { ...state, loadingProjects: true, error: null }
    case 'projectsLoaded':
      return { ...state, projects: action.projects, loadingProjects: false }
    case 'detailsLoading':
      return { ...state, loadingDetails: true, error: null }
    case 'detailsLoaded':
      return { ...state, selected: action.project, loadingDetails: false }
    case 'questionSelected':
      return { ...state, selectedQuestionId: action.questionId }
    case 'failed':
      return {
        ...state,
        loadingProjects: false,
        loadingDetails: false,
        error: action.message,
      }
    default:
      return state
  }
}

/**
 * Hook that manages sessions (projects), questions, and selected transmission state.
 */
export function useWorkspace(enabled: boolean) {
  const [state, dispatch] = useReducer(workspaceReducer, initialState)
  const detailsRequestId = useRef(0)

  const loadProjects = useCallback(async (signal?: AbortSignal) => {
    dispatch({ type: 'projectsLoading' })
    try {
      const projects = await apiFetch<ProjectSummary[]>('/api/projects', { signal })
      dispatch({ type: 'projectsLoaded', projects })
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      dispatch({
        type: 'failed',
        message: error instanceof Error ? error.message : 'Unable to load sessions.',
      })
    }
  }, [])

  const selectProject = useCallback(async (projectId: string) => {
    const requestId = ++detailsRequestId.current
    dispatch({ type: 'detailsLoading' })
    dispatch({ type: 'questionSelected', questionId: null })
    try {
      const project = await apiFetch<ProjectDetails>(`/api/projects/${projectId}`)
      if (requestId === detailsRequestId.current) {
        dispatch({ type: 'detailsLoaded', project })
      }
    } catch (error) {
      if (requestId === detailsRequestId.current) {
        dispatch({
          type: 'failed',
          message: error instanceof Error ? error.message : 'Unable to load session.',
        })
      }
    }
  }, [])

  const createProject = useCallback(async (projectName: string) => {
    const created = await apiFetch<ProjectSummary>('/api/projects', {
      method: 'POST',
      body: JSON.stringify({ projectName }),
    })
    await loadProjects()
    await selectProject(created.id)
    return created
  }, [loadProjects, selectProject])

  const selectQuestion = useCallback((questionId: string | null) => {
    dispatch({ type: 'questionSelected', questionId })
  }, [])

  const addQuestion = useCallback(async (
    projectId: string,
    question: string,
  ): Promise<QuestionItem> => {
    const created = await apiFetch<QuestionItem>(
      `/api/projects/${projectId}/questions`,
      {
        method: 'POST',
        body: JSON.stringify({ question }),
      },
    )
    dispatch({ type: 'questionSelected', questionId: created.id })
    await loadProjects()
    await selectProject(projectId)
    dispatch({ type: 'questionSelected', questionId: created.id })
    return created
  }, [loadProjects, selectProject])

  useEffect(() => {
    if (!enabled) {
      dispatch({ type: 'reset' })
      return
    }
    const controller = new AbortController()
    void loadProjects(controller.signal)
    return () => controller.abort()
  }, [enabled, loadProjects])

  return {
    ...state,
    loadProjects,
    selectProject,
    createProject,
    selectQuestion,
    addQuestion,
  }
}
