export type FailureCategory = 'failed' | 'unreadable-output'

export const FAILURE_CATEGORIES: readonly FailureCategory[] = ['failed', 'unreadable-output']

export type Outcome = 'success' | FailureCategory

export interface ExitRow {
  readonly code: number
  readonly outcome: Outcome
}

export const EXIT_TABLE: readonly ExitRow[] = [
  { code: 0, outcome: 'success' },
  { code: 1, outcome: 'failed' },
  { code: 2, outcome: 'unreadable-output' },
]
