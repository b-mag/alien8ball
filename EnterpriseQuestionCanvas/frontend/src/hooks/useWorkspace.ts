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
  | { type: 'failed'; message: string }
const initialState: WorkspaceState = {
  projects: [],
  selected: null,
  loadingProjects: false,
  loadingDetails: false,
  error: null,
}
/**
 * Reduces workspace state in response to a dispatched action.
 * @param state - The current workspace state
 * @param action - The action describing the state transition
 * @returns The next workspace state
 */
function reducer(state: WorkspaceState, action: Action): WorkspaceState {
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
    case 'failed':
      return {
        ...state,
        loadingProjects: false,
        loadingDetails: false,
        error: action.message,
      }
  }
}
/**
 * Hook that manages the project workspace: loading projects, selecting a
 * project's details, creating projects, and adding questions. Automatically
 * loads projects when enabled and resets state when disabled.
 * @param enabled - Whether the workspace is active and should load data
 * @returns The workspace state combined with loadProjects, selectProject, createProject, and addQuestion actions
 */
export function useWorkspace(enabled: boolean) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const detailsRequestId = useRef(0)
  /**
   * Loads the list of projects into state. Ignores abort errors and records
   * other failures in the error state.
   * @param signal - Optional AbortSignal to cancel the request
   * @returns A promise that resolves once the projects have been loaded or the request failed
   */
  const loadProjects = useCallback(async (signal?: AbortSignal) => {
    dispatch({ type: 'projectsLoading' })
    try {
      const projects = await apiFetch<ProjectSummary[]>('/api/projects', {
        signal,
      })
      dispatch({ type: 'projectsLoaded', projects })
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      dispatch({
        type: 'failed',
        message: error instanceof Error ? error.message : 'Unable to load projects.',
      })
    }
  }, [])
  /**
   * Loads the details of a single project and sets it as the selected project.
   * Uses a request id so only the latest selection updates state.
   * @param projectId - The id of the project to load
   * @returns A promise that resolves once the project details have been loaded or the request failed
   */
  const selectProject = useCallback(async (projectId: string) => {
    const requestId = ++detailsRequestId.current
    dispatch({ type: 'detailsLoading' })
    try {
      const project = await apiFetch<ProjectDetails>(
        `/api/projects/${projectId}`,
      )
      if (requestId === detailsRequestId.current) {
        dispatch({ type: 'detailsLoaded', project })
      }
    } catch (error) {
      if (requestId === detailsRequestId.current) {
        dispatch({
          type: 'failed',
          message: error instanceof Error ? error.message : 'Unable to load project.',
        })
      }
    }
  }, [])
  /**
   * Creates a new project, refreshes the project list, and selects the new project.
   * @param projectName - The name for the new project
   * @returns A promise resolving to the created project summary
   */
  const createProject = useCallback(async (projectName: string) => {
    const created = await apiFetch<ProjectSummary>('/api/projects', {
      method: 'POST',
      body: JSON.stringify({ projectName }),
    })
    await loadProjects()
    await selectProject(created.id)
    return created
  }, [loadProjects, selectProject])
  /**
   * Adds a question to a project, then refreshes the project list and details.
   * @param projectId - The id of the project to add the question to
   * @param question - The question text to add
   * @returns A promise resolving to the created question item
   */
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
    await loadProjects()
    await selectProject(projectId)
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
    addQuestion,
  }
}