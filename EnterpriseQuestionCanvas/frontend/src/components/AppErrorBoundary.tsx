import { Component, type ErrorInfo, type PropsWithChildren } from 'react'
type State = { hasError: boolean }
export class AppErrorBoundary extends Component<PropsWithChildren, State> {
  state: State = { hasError: false }
  static getDerivedStateFromError(): State {
    return { hasError: true }
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled React render error', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <main className="fatal-error">
          <h1>Question Canvas could not render.</h1>
          <p>Refresh the page. If the problem continues, check the browser console.</p>
        </main>
      )
    }
    return this.props.children
  }
}