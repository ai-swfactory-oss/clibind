import { describe, expect, it } from 'vitest'

import { EXIT_TABLE, FAILURE_CATEGORIES } from '../src/index'

describe('the exit table', () => {
  it('the exit table gives exactly one exit code to each failure category of the closed set', () => {
    expect(FAILURE_CATEGORIES.map(category => EXIT_TABLE.filter(row => row.outcome === category).map(row => row.code))).toEqual([[1], [2]])
    expect(EXIT_TABLE.filter(row => row.outcome === 'success').map(row => row.code)).toEqual([0])
    expect(new Set(EXIT_TABLE.map(row => row.code)).size).toBe(EXIT_TABLE.length)
    expect(EXIT_TABLE).toHaveLength(FAILURE_CATEGORIES.length + 1)
  })
})
