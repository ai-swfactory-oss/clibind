import { describe, expect, it } from 'vitest'

import { CALLS_BINDING } from './fixtures/calls-binding'
import { runCalls } from './fixtures/calls-run'

describe('a rejected operation exits 1', () => {
  it('an operation that rejects writes its message to stderr and exits 1', async () => {
    const run = await runCalls(CALLS_BINDING, ['calls', 'get', 'call-404'], { CALLS_ACCOUNT: 'acme' }, [])

    expect({ exitCode: run.exitCode, output: run.output }).toEqual({
      exitCode: 1,
      output: [{ stream: 'stderr', text: "no call 'call-404'\n" }],
    })
  })
})
