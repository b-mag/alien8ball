import { describe, expect, it } from 'vitest'
import { workspaceReducer } from '../hooks/useWorkspace'
import type { ProjectDetails, ProjectSummary } from '../types/api'

const sampleProject: ProjectDetails = {
  id: 'project-1',
  projectName: 'Alpha Session',
  createdUtc: '2026-01-01T00:00:00Z',
  questions: [
    {
      id: 'question-1',
      question: 'First transmission',
      createdUtc: '2026-01-01T01:00:00Z',
    },
  ],
}

const sampleProjects: ProjectSummary[] = [
  {
    id: 'project-1',
    projectName: 'Alpha Session',
    questionCount: 1,
    createdUtc: '2026-01-01T00:00:00Z',
  },
]

describe('workspaceReducer', () => {
  it('loads projects into state', () => {
    const state = workspaceReducer(
      {
        projects: [],
        selected: null,
        selectedQuestionId: null,
        loadingProjects: true,
        loadingDetails: false,
        error: null,
      },
      { type: 'projectsLoaded', projects: sampleProjects },
    )

    expect(state.projects).toHaveLength(1)
    expect(state.loadingProjects).toBe(false)
  })

  it('selects a question id', () => {
    const state = workspaceReducer(
      {
        projects: sampleProjects,
        selected: sampleProject,
        selectedQuestionId: null,
        loadingProjects: false,
        loadingDetails: false,
        error: null,
      },
      { type: 'questionSelected', questionId: 'question-1' },
    )

    expect(state.selectedQuestionId).toBe('question-1')
  })

  it('resets to initial state', () => {
    const state = workspaceReducer(
      {
        projects: sampleProjects,
        selected: sampleProject,
        selectedQuestionId: 'question-1',
        loadingProjects: false,
        loadingDetails: false,
        error: null,
      },
      { type: 'reset' },
    )

    expect(state.projects).toHaveLength(0)
    expect(state.selected).toBeNull()
    expect(state.selectedQuestionId).toBeNull()
  })
})
