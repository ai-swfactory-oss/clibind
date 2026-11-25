import { describe, expect, it } from 'vitest'

import { EXIT_TABLE } from '../src/index'

const codesOf = (outcome: string): readonly number[] => EXIT_TABLE.filter(row => row.outcome === outcome).map(row => row.code)

describe('the exit table has usage and broken-pipe', () => {
  it('EXIT_TABLE maps usage to 64 and broken-pipe to 141 and keeps unreadable-output at 2', () => {
    expect({ usage: codesOf('usage'), brokenPipe: codesOf('broken-pipe'), unreadableOutput: codesOf('unreadable-output') }).toEqual({
      usage: [64],
      brokenPipe: [141],
      unreadableOutput: [2],
    })
  })
})
