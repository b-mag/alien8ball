import {
  useCallback,
  useMemo,
  useState,
} from 'react'
import './App.css'
import { useAuth } from './auth/useAuth'
import { AuthPanel } from './components/AuthPanel'
import { DecryptConsole } from './components/DecryptConsole'
import { TransmitConsole } from './components/TransmitConsole'
import { useWorkspace } from './hooks/useWorkspace'

type ControlScreen = 'transmit' | 'decrypt'

/**
 * Root application shell with authentication gating and two UFO control screens.
 */
export default function App() {
  const auth = useAuth()
  const workspace = useWorkspace(auth.status === 'authenticated')
  const [activeScreen, setActiveScreen] = useState<ControlScreen>('transmit')

  const selectedQuestionText = useMemo(() => {
    if (!workspace.selected || !workspace.selectedQuestionId) return null
    return workspace.selected.questions.find(
      (item) => item.id === workspace.selectedQuestionId,
    )?.question ?? null
  }, [workspace.selected, workspace.selectedQuestionId])

  const createProject = useCallback(async (projectName: string) => {
    await workspace.createProject(projectName)
  }, [workspace])

  const transmitQuestion = useCallback(async (question: string) => {
    if (!workspace.selected) return
    await workspace.addQuestion(workspace.selected.id, question)
    setActiveScreen('decrypt')
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
          <h1>ALIEN 8 BALL</h1>
          <p>UFO Command Interface — Operator: {auth.email}</p>
        </div>
        <nav className="screen-nav" aria-label="Control screen navigation">
          <button
            type="button"
            className={activeScreen === 'transmit' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setActiveScreen('transmit')}
          >
            TRANSMISSION
          </button>
          <button
            type="button"
            className={activeScreen === 'decrypt' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setActiveScreen('decrypt')}
            disabled={!workspace.selectedQuestionId}
          >
            DECRYPTION
          </button>
          <button type="button" className="secondary" onClick={() => void auth.logout()}>
            DISCONNECT
          </button>
        </nav>
      </header>

      {workspace.error && (
        <div className="error-banner" role="alert">{workspace.error}</div>
      )}

      {activeScreen === 'transmit' ? (
        <TransmitConsole
          projects={workspace.projects}
          selected={workspace.selected}
          selectedQuestionId={workspace.selectedQuestionId}
          loadingProjects={workspace.loadingProjects}
          loadingDetails={workspace.loadingDetails}
          onCreateProject={createProject}
          onSelectProject={workspace.selectProject}
          onSelectQuestion={workspace.selectQuestion}
          onTransmit={transmitQuestion}
          onOpenDecryption={() => setActiveScreen('decrypt')}
        />
      ) : (
        <DecryptConsole
          projectId={workspace.selected?.id ?? null}
          questionId={workspace.selectedQuestionId}
          questionText={selectedQuestionText}
          onReturn={() => setActiveScreen('transmit')}
        />
      )}
    </main>
  )
}
