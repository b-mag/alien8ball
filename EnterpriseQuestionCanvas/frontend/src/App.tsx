import {
  useCallback,
  useDeferredValue,
  useMemo,
  useState,
} from 'react'
import './App.css'
import { useAuth } from './auth/useAuth'
import { AuthPanel } from './components/AuthPanel'
import { ImageWorkspace } from './components/ImageWorkspace'
import { ProjectForm } from './components/ProjectForm'
import { QuestionForm } from './components/QuestionForm'
import { useWorkspace } from './hooks/useWorkspace'

export default function App() {
  const auth = useAuth()
  const workspace = useWorkspace(auth.status === 'authenticated')
  const [projectFilter, setProjectFilter] = useState('')
  const deferredFilter = useDeferredValue(projectFilter)
  const filteredProjects = useMemo(() => {
    const needle = deferredFilter.trim().toLocaleLowerCase()
    if (!needle) return workspace.projects
    return workspace.projects.filter((project) =>
      project.projectName.toLocaleLowerCase().includes(needle),
    )
  }, [deferredFilter, workspace.projects])
  const createProject = useCallback(async (projectName: string) => {
    await workspace.createProject(projectName)
  }, [workspace])
  const createQuestion = useCallback(async (question: string) => {
    if (!workspace.selected) return
    await workspace.addQuestion(workspace.selected.id, question)
  }, [workspace])
  if (auth.status === 'loading') {
    return <main className="centered-status">Checking session...</main>
  }
  if (auth.status === 'anonymous') {
    return (
      <main className="auth-shell">
        <AuthPanel />
      </main>
    )
  }
  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <h1>Question Canvas</h1>
          <p>Projects and questions are private to {auth.email}.</p>
        </div>
        <button type="button" className="secondary" onClick={() => void auth.logout()}>
          Sign out
        </button>
      </header>
      {workspace.error && (
        <div className="error-banner" role="alert">{workspace.error}</div>
      )}
      <div className="workspace-grid">
        <section className="panel projects-panel" aria-labelledby="projects-title">
          <div className="panel-heading">
            <div>
              <h2 id="projects-title">Projects</h2>
              <p>Each project groups multiple questions.</p>
            </div>
          </div>
          <ProjectForm onCreate={createProject} />
          <label htmlFor="project-filter">Filter projects</label>
          <input
            id="project-filter"
            value={projectFilter}
            onChange={(event) => setProjectFilter(event.target.value)}
            placeholder="Type a project name"
          />
          <div className="project-list" aria-busy={workspace.loadingProjects}>
            {filteredProjects.map((project) => (
              <button
                type="button"
                key={project.id}
                className={workspace.selected?.id === project.id ? 'project selected' : 'project'}
                onClick={() => void workspace.selectProject(project.id)}
              >
                <strong>{project.projectName}</strong>
                <span>{project.questionCount} question(s)</span>
                              </button>
            ))}
            {!workspace.loadingProjects && filteredProjects.length === 0 && (
              <p className="empty">No matching projects.</p>
            )}
          </div>
        </section>
        <section className="panel questions-panel" aria-labelledby="questions-title">
          <div className="panel-heading">
            <div>
              <h2 id="questions-title">
                {workspace.selected?.projectName ?? 'Questions'}
              </h2>
              <p>Select a project, then save one or more questions.</p>
            </div>
          </div>
          <QuestionForm
            disabled={!workspace.selected || workspace.loadingDetails}
            onCreate={createQuestion}
          />
          <div className="question-list" aria-busy={workspace.loadingDetails}>
            {workspace.selected?.questions.map((item) => (
              <article key={item.id} className="question-card">
                <p>{item.question}</p>
                <time dateTime={item.createdUtc}>
                  {new Date(item.createdUtc).toLocaleString()}
                </time>
              </article>
            ))}
            {workspace.selected && workspace.selected.questions.length === 0 && (
              <p className="empty">This project has no questions yet.</p>
            )}
          </div>
        </section>
        <ImageWorkspace />
      </div>
    </main>
  )
}