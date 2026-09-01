export type ProjectSummary = {
  id: string
  projectName: string
    questionCount: number
  createdUtc: string
}
export type QuestionItem = {
  id: string
  question: string
  createdUtc: string
}
export type ProjectDetails = {
  id: string
  projectName: string
  createdUtc: string
  questions: QuestionItem[]
}
export type SessionInfo = {
  email: string | null
}
export type ProblemDetails = {
  type?: string
  title?: string
  status?: number
  detail?: string
  instance?: string
  traceId?: string
  errors?: Record<string, string[]>
}