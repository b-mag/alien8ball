import { useDeferredValue, useMemo, useState } from 'react'
import { ProjectForm } from './ProjectForm'
import { QuestionForm } from './QuestionForm'
import type { ProjectDetails, ProjectSummary } from '../types/api'

type TransmitConsoleProps = {
  projects: ProjectSummary[]
  selected: ProjectDetails | null
  selectedQuestionId: string | null
  loadingProjects: boolean
  loadingDetails: boolean
  onCreateProject: (name: string) => Promise<void>
  onSelectProject: (id: string) => Promise<void>
  onSelectQuestion: (id: string) => void
  onTransmit: (question: string) => Promise<void>
  onOpenDecryption: () => void
}

/**
 * Transmission console for selecting sessions and transmitting questions to the alien signal.
 */
export function TransmitConsole({
  projects,
  selected,
  selectedQuestionId,
  loadingProjects,
  loadingDetails,
  onCreateProject,
  onSelectProject,
  onSelectQuestion,
  onTransmit,
  onOpenDecryption,
}: TransmitConsoleProps) {
  const [sessionFilter, setSessionFilter] = useState('')
  const deferredFilter = useDeferredValue(sessionFilter)

  const filteredProjects = useMemo(() => {
    const needle = deferredFilter.trim().toLocaleLowerCase()
    if (!needle) return projects
    return projects.filter((project) =>
      project.projectName.toLocaleLowerCase().includes(needle),
    )
  }, [deferredFilter, projects])

  return (
    <div className="console-grid transmit-console">
      <section className="panel sessions-panel" aria-labelledby="sessions-title">
        <div className="panel-heading">
          <div>
            <h2 id="sessions-title">SESSIONS</h2>
            <p>Select or initiate a transmission session.</p>
          </div>
        </div>
        <ProjectForm onCreate={onCreateProject} />
        <label htmlFor="session-filter">SCAN SESSIONS</label>
        <input
          id="session-filter"
          value={sessionFilter}
          onChange={(event) => setSessionFilter(event.target.value)}
          placeholder="Filter session name..."
        />
        <div className="session-list" aria-busy={loadingProjects}>
          {filteredProjects.map((project) => (
            <button
              type="button"
              key={project.id}
              className={selected?.id === project.id ? 'session selected' : 'session'}
              onClick={() => void onSelectProject(project.id)}
            >
              <strong>{project.projectName}</strong>
              <span>{project.questionCount} transmission(s)</span>
            </button>
          ))}
          {!loadingProjects && filteredProjects.length === 0 && (
            <p className="empty">No matching sessions.</p>
          )}
        </div>
      </section>

      <section className="panel transmit-panel" aria-labelledby="transmit-title">
        <div className="panel-heading">
          <div>
            <h2 id="transmit-title">
              {selected?.projectName ?? 'TRANSMISSION'}
            </h2>
            <p>Encode and transmit a question to receive an alien response.</p>
          </div>
        </div>
        {selected ? (
          <>
            <QuestionForm
              disabled={loadingDetails}
              onCreate={onTransmit}
            />
            <div className="transmission-list" aria-busy={loadingDetails}>
              <h3 className="subheading">Past Transmissions</h3>
              {selected.questions.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={
                    selectedQuestionId === item.id
                      ? 'transmission-card selected'
                      : 'transmission-card'
                  }
                  onClick={() => {
                    onSelectQuestion(item.id)
                    onOpenDecryption()
                  }}
                >
                  <p>{item.question}</p>
                  <time dateTime={item.createdUtc}>
                    {new Date(item.createdUtc).toLocaleString()}
                  </time>
                </button>
              ))}
              {selected.questions.length === 0 && (
                <p className="empty">No transmissions in this session yet.</p>
              )}
            </div>
          </>
        ) : (
          <p className="empty">Initiate or select a session to begin transmission.</p>
        )}
      </section>
    </div>
  )
}
