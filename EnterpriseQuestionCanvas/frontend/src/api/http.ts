import type { ProblemDetails } from '../types/api'

/**
 * Error thrown when an API request returns a non-successful HTTP status.
 * Carries the HTTP status code and the optional parsed ProblemDetails body.
 */
export class ApiError extends Error {
  readonly status: number
  readonly problem?: ProblemDetails

  /**
   * Creates an ApiError.
   * @param status - The HTTP status code returned by the failed request
   * @param problem - The optional parsed ProblemDetails response body
   */
  constructor(status: number, problem?: ProblemDetails) {
    super(problem?.detail ?? problem?.title ?? `Request failed with ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.problem = problem
  }
}
/**
 * Performs a fetch request against the API and returns the parsed JSON body.
 * Sends credentials, defaults the Content-Type to JSON when a body is present,
 * and throws an ApiError on any non-successful response.
 * @typeParam T - The expected shape of the parsed response body
 * @param input - The request URL or path
 * @param init - Optional fetch request options (method, body, headers, signal)
 * @returns A promise resolving to the parsed response body, or undefined for empty/204 responses
 * @throws {ApiError} When the response status is not ok
 */
export async function apiFetch<T>(
  input: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  const response = await fetch(input, {
    ...init,
    headers,
    credentials: 'include',
  })
  if (!response.ok) {
    let problem: ProblemDetails | undefined
    if (response.headers.get('content-type')?.includes('json')) {
      problem = (await response.json()) as ProblemDetails
    }
    throw new ApiError(response.status, problem)
  }
  if (response.status === 204) {
    return undefined as T
  }
  const text = await response.text()
  if (!text) {
    return undefined as T
  }
  return JSON.parse(text) as T
}